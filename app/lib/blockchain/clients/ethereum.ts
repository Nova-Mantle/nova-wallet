// app/lib/blockchain/clients/ethereum.ts
// OPTIMIZED VERSION: Batch price fetching, better caching, faster analysis

import {
    BlockchainClient,
    Transaction,
    TokenInfo,
    TokenPrice,
    FetchOptions,
    APIError,
    InvalidAddressError
} from '@/lib/blockchain/clients/base';
import { httpClient } from '@/lib/blockchain/utils/http';
import { tokenInfoCache, priceCache, failedTokenCache, CACHE_TTL } from '@/lib/blockchain/utils/cache';

interface EtherscanResponse<T> {
    status: string;
    message: string;
    result: T;
}

interface MoralisTokenMetadata {
    symbol: string;
    decimals: string;
    name?: string;
}

interface CryptoCompareResponse {
    [symbol: string]: {
        [currency: string]: number;
    };
}

interface DefiLlamaResponse {
    coins: {
        [key: string]: {
            price: number;
            symbol?: string;
            timestamp?: number;
        };
    };
}

interface MoralisPrice {
    usdPrice: number;
    nativePrice?: {
        value: string;
        decimals: number;
    };
}

interface EthereumClientConfig {
    etherscanApiKey: string;
    moralisApiKey?: string;
    cryptocompareApiKey: string;
    maxTransactionsPerAddress?: number;
    etherscanMaxRecords?: number;
}

export class EthereumClient implements BlockchainClient {
    readonly chainName = 'Ethereum';
    readonly nativeToken = 'ETH';
    readonly apiUrl = 'https://api.etherscan.io/v2/api';
    readonly blockTimeSeconds = 12;

    private readonly moralisMetadataUrl = 'https://deep-index.moralis.io/api/v2.2/erc20/metadata';
    private readonly moralisPriceUrl = 'https://deep-index.moralis.io/api/v2.2/erc20';
    private readonly cryptocompareUrl = 'https://min-api.cryptocompare.com/data/pricehistorical';
    private readonly defillamaUrl = 'https://coins.llama.fi/prices/historical';

    private readonly config: EthereumClientConfig & {
        maxTransactionsPerAddress: number;
        etherscanMaxRecords: number;
    };

    private readonly WEI_TO_ETH = 1_000_000_000_000_000_000;

    private readonly KNOWN_TOKENS: Map<string, TokenInfo> = new Map([
        ['0xdac17f958d2ee523a2206206994597c13d831ec7', { symbol: 'USDT', decimals: 6, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' }],
        ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', { symbol: 'USDC', decimals: 6, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }],
        ['0x6b175474e89094c44da98b954eedeac495271d0f', { symbol: 'DAI', decimals: 18, address: '0x6b175474e89094c44da98b954eedeac495271d0f' }],
        ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', { symbol: 'WETH', decimals: 18, address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' }],
        ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', { symbol: 'WBTC', decimals: 8, address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' }],
    ]);

    constructor(config: EthereumClientConfig) {
        this.config = {
            ...config,
            maxTransactionsPerAddress: config.maxTransactionsPerAddress ?? 50000,
            etherscanMaxRecords: config.etherscanMaxRecords ?? 10000
        };
    }

    private validateAddress(address: string): void {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            throw new InvalidAddressError(this.chainName, address);
        }
    }

    async getTransactions(address: string, options?: FetchOptions): Promise<Transaction[]> {
        this.validateAddress(address);
        const lowerAddress = address.toLowerCase();

        console.log(`[Ethereum] 🔍 Fetching transactions...`);
        console.log(`[Ethereum] ⚠️  Note: Large addresses may take several minutes`);

        // ✅ OPTIMIZATION: Fetch both in parallel
        const [ethTxsResult, erc20TxsResult] = await Promise.allSettled([
            this.fetchAllPages('txlist', lowerAddress, options),
            this.fetchAllPages('tokentx', lowerAddress, options)
        ]);

        const ethTxs = ethTxsResult.status === 'fulfilled' ? ethTxsResult.value : [];
        const erc20Txs = erc20TxsResult.status === 'fulfilled' ? erc20TxsResult.value : [];

        console.log(`[Ethereum] Found ${ethTxs.length} ETH | ${erc20Txs.length} ERC-20 transactions.`);

        const ethTxMap = new Map<string, Transaction>();
        for (const tx of ethTxs) {
            ethTxMap.set(tx.hash, tx);
        }

        const allTxs: Transaction[] = [];
        const erc20ParentHashes = new Set<string>();

        for (const tx of erc20Txs) {
            tx.txType = 'ERC20';
            erc20ParentHashes.add(tx.hash);

            const parentTx = ethTxMap.get(tx.hash);
            if (parentTx) {
                tx.gasUsed = parentTx.gasUsed;
                tx.gasPrice = parentTx.gasPrice;
            }

            allTxs.push(tx);
        }

        for (const tx of ethTxs) {
            if (!erc20ParentHashes.has(tx.hash)) {
                tx.txType = 'ETH';
                allTxs.push(tx);
            }
        }

        allTxs.sort((a, b) => {
            const timeA = parseInt(a.timeStamp) || 0;
            const timeB = parseInt(b.timeStamp) || 0;
            return timeA - timeB;
        });

        if (allTxs.length > this.config.maxTransactionsPerAddress) {
            console.warn(
                `[Ethereum] ⚠️ Limiting to ${this.config.maxTransactionsPerAddress} transactions (found ${allTxs.length}).`
            );
            return allTxs.slice(0, this.config.maxTransactionsPerAddress);
        }

        return allTxs;
    }

    private async getCurrentBlockNumber(): Promise<number> {
        try {
            const url = `${this.apiUrl}?chainid=1&module=proxy&action=eth_blockNumber&apikey=${this.config.etherscanApiKey}`;
            const response = await httpClient.get<EtherscanResponse<string>>(url);

            if (response.result) {
                const blockNum = parseInt(response.result, 16);

                if (blockNum > 15000000 && blockNum < 30000000) {
                    console.log(`[Ethereum]    -> Current block: ${blockNum}`);
                    return blockNum;
                }
            }
        } catch (error) {
            console.warn(`[Ethereum]    -> Block number API failed, using estimate`);
        }

        // Fallback calculation
        const REFERENCE_BLOCK = 21000000;
        const REFERENCE_TIMESTAMP = 1730000000;
        const AVERAGE_BLOCK_TIME = 12.05;

        const now = Math.floor(Date.now() / 1000);
        const secondsSinceReference = now - REFERENCE_TIMESTAMP;
        const blocksSinceReference = Math.floor(secondsSinceReference / AVERAGE_BLOCK_TIME);
        const estimatedBlock = REFERENCE_BLOCK + blocksSinceReference;

        console.log(`[Ethereum]    -> Estimated block: ${estimatedBlock}`);
        return estimatedBlock;
    }

    private async fetchAllPages(
        action: 'txlist' | 'tokentx',
        address: string,
        options?: FetchOptions
    ): Promise<Transaction[]> {
        const allResults: Transaction[] = [];

        let startBlock = options?.startBlock ?? 0;
        if (options?.timeframe?.start && !options.startBlock) {
            const now = Math.floor(Date.now() / 1000);
            const blocksSinceStart = Math.floor((now - options.timeframe.start) / this.blockTimeSeconds);
            const currentBlock = await this.getCurrentBlockNumber();
            startBlock = Math.max(0, currentBlock - blocksSinceStart);
            console.log(`[Ethereum]    -> Start block: ${startBlock} (for timeframe)`);
        }

        const endBlock = options?.endBlock ?? 99999999;

        let consecutiveEmptyPages = 0;
        const MAX_CONSECUTIVE_EMPTY = 2;

        while (true) {
            console.log(`[Ethereum]    Fetching ${action} page from block ${startBlock}...`);

            const pageResults = await this.fetchPage(action, address, startBlock, endBlock);

            if (pageResults.length === 0) {
                consecutiveEmptyPages++;

                // ✅ Break after multiple consecutive empty pages
                if (consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY) {
                    console.log(`[Ethereum]    -> ${MAX_CONSECUTIVE_EMPTY} consecutive empty pages, stopping pagination`);
                    break;
                }

                // Don't break immediately on first empty page in case of pagination
                if (allResults.length === 0) {
                    // First page is empty - likely no transactions
                    break;
                }
            } else {
                consecutiveEmptyPages = 0; // Reset counter
            }

            const pageLen = pageResults.length;
            allResults.push(...pageResults);

            // Small delay to avoid rate limiting on subsequent pages
            if (pageResults.length === this.config.etherscanMaxRecords) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (
                allResults.length >= this.config.maxTransactionsPerAddress ||
                pageLen < this.config.etherscanMaxRecords
            ) {
                break;
            }

            const lastTx = allResults[allResults.length - 1];
            const lastBlock = parseInt(lastTx.blockNumber) || 0;
            startBlock = lastBlock + 1;

            if (startBlock > endBlock) break;
        }

        if (options?.timeframe) {
            return allResults.filter(tx => {
                const timestamp = parseInt(tx.timeStamp) || 0;
                return timestamp >= options.timeframe!.start && timestamp <= options.timeframe!.end;
            });
        }

        return allResults;
    }

    private async fetchPage(
        action: 'txlist' | 'tokentx',
        address: string,
        startBlock: number,
        endBlock: number,
        retryCount: number = 0
    ): Promise<Transaction[]> {
        const MAX_RETRIES = 3;
        const BASE_DELAY_MS = 2000;

        const url = `${this.apiUrl}?chainid=1&module=account&action=${action}&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${this.config.etherscanApiKey}`;

        try {
            const response = await httpClient.get<EtherscanResponse<Transaction[]>>(url);

            // 🐛 DEBUG: Log the actual response
            console.log(`[Ethereum]    📡 Response: status="${response.status}", message="${response.message}", results=${(response.result || []).length}`);

            if (response.status === '1') {
                const results = response.result || [];

                // ✅ CRITICAL FIX: Detect suspicious empty responses
                // If we're querying from an early block (< 23M) and get 0 results,
                // this might be rate limiting rather than "no transactions"
                const isSuspiciousEmpty = results.length === 0 &&
                    startBlock < 23000000 &&
                    retryCount < MAX_RETRIES;

                // 🐛 DEBUG: Log the check
                console.log(`[Ethereum]    🔍 Empty check: results=${results.length}, startBlock=${startBlock}, retry=${retryCount}, suspicious=${isSuspiciousEmpty}`);

                if (isSuspiciousEmpty) {
                    const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
                    console.warn(
                        `[Ethereum] ⚠️ Empty response for ${action} from block ${startBlock}. ` +
                        `Possible rate limit. Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms...`
                    );

                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.fetchPage(action, address, startBlock, endBlock, retryCount + 1);
                }

                if (results.length > 0) {
                    console.log(`[Ethereum]    ✅ Got ${results.length} ${action} results`);
                } else if (retryCount > 0) {
                    console.log(`[Ethereum]    ℹ️ Empty result confirmed after ${retryCount} retries`);
                }

                return results;
            } else if (response.status === '0' && response.message === 'NOTOK') {
                // ✅ NEW: Handle NOTOK responses (often rate limiting or temporary API issues)
                if (retryCount < MAX_RETRIES) {
                    const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
                    console.warn(`[Ethereum] ⚠️ Got NOTOK response for ${action}. Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.fetchPage(action, address, startBlock, endBlock, retryCount + 1);
                }
                console.warn(`[Ethereum] ⚠️ NOTOK response persisted after ${MAX_RETRIES} retries, returning empty`);
                return []; // Return empty after retries
            } else if (response.message.includes('No transactions found')) {
                return [];
            } else if (response.message.toLowerCase().includes('rate limit')) {
                // Explicit rate limit message
                if (retryCount < MAX_RETRIES) {
                    const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
                    console.warn(`[Ethereum] 🚫 Rate limit: ${response.message}. Retry in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.fetchPage(action, address, startBlock, endBlock, retryCount + 1);
                }
                throw new APIError(this.chainName, `Rate limit exceeded: ${response.message}`);
            } else {
                throw new APIError(this.chainName, `Etherscan API error: ${response.message}`);
            }
        } catch (error) {
            if (error instanceof APIError) throw error;

            // Network errors might also be rate limiting
            if (retryCount < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
                console.warn(`[Ethereum] ⚠️ Network error, retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchPage(action, address, startBlock, endBlock, retryCount + 1);
            }

            throw new APIError(
                this.chainName,
                error instanceof Error ? error.message : 'Unknown error fetching transactions'
            );
        }
    }

    async getTokenMetadata(tokenAddress: string): Promise<TokenInfo> {
        const lowerAddress = tokenAddress.toLowerCase();

        const cached = tokenInfoCache.get<TokenInfo>(`token_info_${lowerAddress}`);
        if (cached) return cached;

        const known = this.KNOWN_TOKENS.get(lowerAddress);
        if (known) {
            tokenInfoCache.set(`token_info_${lowerAddress}`, known, CACHE_TTL.TOKEN_INFO);
            return known;
        }

        // ✅ OPTIMIZED: Skip Moralis if rate limited (check failedTokenCache)
        if (this.config.moralisApiKey && !failedTokenCache.has('moralis_metadata_rate_limit')) {
            try {
                const url = `${this.moralisMetadataUrl}?chain=eth&addresses=${lowerAddress}`;
                const response = await httpClient.get<MoralisTokenMetadata[]>(url, {
                    headers: {
                        'accept': 'application/json',
                        'X-API-Key': this.config.moralisApiKey
                    }
                });

                if (response && response.length > 0) {
                    const metadata = response[0];
                    const decimals = parseInt(metadata.decimals) || 18;
                    const symbol = metadata.symbol.toUpperCase();

                    const tokenInfo: TokenInfo = {
                        symbol,
                        decimals,
                        name: metadata.name,
                        address: lowerAddress
                    };

                    tokenInfoCache.set(`token_info_${lowerAddress}`, tokenInfo, CACHE_TTL.TOKEN_INFO);
                    return tokenInfo;
                }
            } catch (error: any) {
                if (error.response?.status === 401) {
                    console.log('[Ethereum] ⚠️ Moralis rate limit - using fallback for all future requests');
                    failedTokenCache.set('moralis_metadata_rate_limit', true, 3600000); // 1 hour
                }
            }
        }

        const fallback: TokenInfo = {
            symbol: 'UNKNOWN',
            decimals: 18,
            address: lowerAddress
        };

        tokenInfoCache.set(`token_info_${lowerAddress}`, fallback, CACHE_TTL.TOKEN_INFO);
        return fallback;
    }

    async getHistoricalPrice(tokenAddress: string, timestamp: number): Promise<TokenPrice> {
        const tokenInfo = await this.getTokenMetadata(tokenAddress);
        const tokenSymbol = tokenInfo.symbol;

        const failKey = `failed_${tokenAddress}`;
        if (failedTokenCache.has(failKey)) {
            return { priceUSD: 0, priceNative: 0, timestamp };
        }

        if (tokenSymbol === 'WETH') {
            const ethUSD = await this.getNativeTokenPrice(timestamp);
            return { priceUSD: ethUSD, priceNative: 1.0, timestamp };
        }

        const date = new Date(timestamp * 1000);
        const monthlyKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        const cacheKey = `${tokenSymbol}_${monthlyKey}_${tokenAddress}`;

        const cachedPrice = priceCache.get<number>(cacheKey);
        if (cachedPrice !== null && cachedPrice !== undefined) {
            return { priceUSD: cachedPrice, priceNative: 0, timestamp };
        }

        if (['USDT', 'USDC', 'DAI'].includes(tokenSymbol)) {
            const ethUSD = await this.getNativeTokenPrice(timestamp);
            const stablecoinETH = ethUSD > 0 ? 1.0 / ethUSD : 0;

            const price: TokenPrice = {
                priceUSD: 1.0,
                priceNative: stablecoinETH,
                timestamp
            };

            priceCache.set(cacheKey, 1.0, CACHE_TTL.PRICE_MONTHLY);
            return price;
        }

        // ✅ OPTIMIZED: Faster price fetching
        const priceETH = await this.fetchTokenPriceFromAPIs(tokenSymbol, tokenAddress, timestamp);

        if (priceETH > 0) {
            const ethUSD = await this.getNativeTokenPrice(timestamp);
            const priceUSD = priceETH * ethUSD;

            const price: TokenPrice = { priceUSD, priceNative: priceETH, timestamp };
            priceCache.set(cacheKey, priceUSD, CACHE_TTL.PRICE_MONTHLY);
            return price;
        }

        failedTokenCache.set(failKey, true, CACHE_TTL.FAILED_TOKEN);
        return { priceUSD: 0, priceNative: 0, timestamp };
    }

    /**
 * Get CURRENT token price (more reliable for portfolio)
 */
    async getCurrentTokenPrice(tokenAddress: string): Promise<number> {
        const lowerAddress = tokenAddress.toLowerCase();

        console.log(`   🔍 getCurrentTokenPrice called for: ${lowerAddress.substring(0, 10)}...`);

        // Check cache (5 min)
        const cacheKey = `current_price_${lowerAddress}`;
        const cached = priceCache.get<number>(cacheKey);
        if (cached !== null && cached !== undefined) {
            console.log(`   📦 Using cached price: $${cached.toFixed(2)}`);
            return cached;
        }

        // ✅ REMOVED: Don't check failed cache for current prices
        // Let's always try to fetch current prices since they change frequently
        // if (failedTokenCache.has(`failed_${lowerAddress}`)) {
        //     console.log(`   ⚠️ Token in failed cache, returning 0`);
        //     return 0;
        // }

        try {
            // DeFiLlama current price
            const llamaAddress = `ethereum:${lowerAddress}`;
            const url = `https://coins.llama.fi/prices/current/${llamaAddress}`;

            console.log(`   📡 Fetching from DeFiLlama...`);
            const response = await httpClient.get<DefiLlamaResponse>(url);

            if (response?.coins?.[llamaAddress]?.price) {
                const priceUSD = response.coins[llamaAddress].price;
                console.log(`   💰 Current price: $${priceUSD.toFixed(2)}`);
                priceCache.set(cacheKey, priceUSD, 300000); // 5 min
                return priceUSD;
            } else {
                console.log(`   ❌ No price in DeFiLlama response`);
            }
        } catch (error) {
            console.error(`   🚨 Price fetch error:`, error);
        }

        // ✅ CHANGED: Don't mark as permanently failed for current prices
        // Just return 0 this time, but allow retry next time
        console.log(`   ⚠️ Price not found, returning 0 (will retry next time)`);
        return 0;
    }

    async getNativeTokenPrice(timestamp: number): Promise<number> {
        const date = new Date(timestamp * 1000);
        const monthlyKey = `ETH_USD_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

        const cached = priceCache.get<number>(monthlyKey);
        if (cached !== null && cached !== undefined) return cached;

        const monthlyDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthlyTs = Math.floor(monthlyDate.getTime() / 1000);

        try {
            const url = `${this.cryptocompareUrl}?fsym=ETH&tsyms=USD&ts=${monthlyTs}&api_key=${this.config.cryptocompareApiKey}`;
            const response = await httpClient.get<CryptoCompareResponse>(url);

            const price = response?.ETH?.USD || 0;

            if (price > 0) {
                priceCache.set(monthlyKey, price, CACHE_TTL.PRICE_MONTHLY);
                return price;
            }
        } catch (error) {
            // Silent fail
        }

        priceCache.set(monthlyKey, 0, CACHE_TTL.PRICE_MONTHLY);
        return 0;
    }

    /**
 * Get CURRENT ETH price (not monthly average)
 */
    async getCurrentNativeTokenPrice(): Promise<number> {
        const cacheKey = 'ETH_USD_CURRENT';
        const cached = priceCache.get<number>(cacheKey);

        if (cached !== null && cached !== undefined) {
            return cached;
        }

        try {
            // Use CoinGecko for current price
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`;
            const response = await httpClient.get<{ ethereum: { usd: number } }>(url);
            const price = response?.ethereum?.usd || 0;

            if (price > 0) {
                priceCache.set(cacheKey, price, 300); // Cache for 5 minutes
                return price;
            }
        } catch (error) {
            console.error('Failed to fetch current ETH price:', error);
        }

        // Fallback to monthly price
        return this.getNativeTokenPrice(Math.floor(Date.now() / 1000));
    }

    private async fetchTokenPriceFromAPIs(
        tokenSymbol: string,
        tokenAddress: string,
        timestamp: number
    ): Promise<number> {
        // ✅ Try DeFiLlama first (fastest, no rate limits)
        try {
            const price = await this.fetchFromDeFiLlama(tokenAddress, timestamp);
            if (price > 0) return price;
        } catch (error) {
            // Silent fail
        }

        // Try CryptoCompare if symbol is known
        if (tokenSymbol !== 'UNKNOWN') {
            try {
                const date = new Date(timestamp * 1000);
                const monthlyDate = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthlyTs = Math.floor(monthlyDate.getTime() / 1000);

                const url = `${this.cryptocompareUrl}?fsym=${tokenSymbol}&tsyms=ETH&ts=${monthlyTs}&api_key=${this.config.cryptocompareApiKey}`;
                const response = await httpClient.get<CryptoCompareResponse>(url);

                const price = response?.[tokenSymbol]?.ETH || 0;
                if (price > 0) return price;
            } catch (error) {
                // Silent fail
            }
        }

        return 0;
    }

    private async fetchFromDeFiLlama(tokenAddress: string, timestamp: number): Promise<number> {
        const llamaAddress = `ethereum:${tokenAddress}`;
        const url = `${this.defillamaUrl}/${timestamp}/${llamaAddress}`;

        try {
            const response = await httpClient.get<DefiLlamaResponse>(url);

            const coinData = response?.coins?.[llamaAddress];
            if (coinData?.price) {
                const tokenUSD = coinData.price;
                const ethUSD = await this.getNativeTokenPrice(timestamp);

                if (ethUSD > 0) {
                    return tokenUSD / ethUSD;
                }
            }
        } catch (error) {
            // Silent fail
        }

        return 0;
    }

    // ✅ NEW: Batch fetch token prices (MAJOR OPTIMIZATION)
    async batchGetTokenPrices(tokenAddresses: string[]): Promise<Map<string, number>> {
        const priceMap = new Map<string, number>();

        if (tokenAddresses.length === 0) return priceMap;

        console.log(`[Ethereum] 📦 Batch fetching ${tokenAddresses.length} token prices...`);

        try {
            // DeFiLlama supports batch queries
            const addresses = tokenAddresses
                .map(addr => `ethereum:${addr.toLowerCase()}`)
                .join(',');

            const url = `https://coins.llama.fi/prices/current/${addresses}`;
            const response = await httpClient.get<DefiLlamaResponse>(url);

            if (response.coins) {
                for (const [key, data] of Object.entries(response.coins)) {
                    const address = key.replace('ethereum:', '').toLowerCase();
                    priceMap.set(address, data.price || 0);
                }
            }

            console.log(`[Ethereum] ✅ Fetched ${priceMap.size} prices in one request!`);
        } catch (error) {
            console.error('[Ethereum] Batch price fetch failed:', error);
        }

        return priceMap;
    }
}