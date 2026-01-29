"use client";

import { motion } from "framer-motion";
import { LineChart, TrendingUp, TrendingDown, Trophy, Skull, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useState } from "react";

interface TokenPurchaseSummary {
    tokenSymbol: string;
    tokenAddress: string;
    tokenName?: string;
    totalAmount: number;
    totalSpentUSD: number;
    currentValueUSD: number;
    pnl: number;
    pnlPercentage: number;
    firstPurchaseTimestamp: number;
    lastPurchaseTimestamp: number;
    numPurchases: number;
    averagePriceUSD: number;
    currentPriceUSD: number;
}

interface TokenSaleSummary {
    tokenSymbol: string;
    tokenAddress: string;
    tokenName?: string;
    totalAmount: number;
    totalReceivedUSD: number;
    numSales: number;
    averagePriceUSD: number;
    firstSaleTimestamp: number;
    lastSaleTimestamp: number;
}

interface TokenActivitySummary {
    totalInvestedUSD: number;
    currentPortfolioValueUSD: number;
    totalPnL: number;
    totalPnLPercentage: number;
    numTokensBought: number;
    numTokensSold: number;
    numUniqueTokens: number;
    mostProfitableToken?: TokenPurchaseSummary;
    biggestLoserToken?: TokenPurchaseSummary;
}

interface TokenActivityData {
    address: string;
    chain?: string;
    timeframeStart: number;
    timeframeEnd: number;
    tokensBought: TokenPurchaseSummary[];
    tokensSold: TokenSaleSummary[];
    summary: TokenActivitySummary;
}

interface TokenActivityCardProps {
    data: TokenActivityData;
}

export function TokenActivityCard({ data }: TokenActivityCardProps) {
    const [activeTab, setActiveTab] = useState<'bought' | 'sold'>('bought');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: val < 1 ? 4 : 0
        }).format(val);

    const formatAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const formatPercent = (val: number) =>
        `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const { summary } = data;
    const isProfitable = summary.totalPnL >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent border border-purple-200/50 shadow-lg shadow-purple-500/10"
        >
            {/* Header */}
            <div className="p-4 border-b border-purple-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md">
                            <LineChart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Token Activity</h3>
                            <p className="text-xs text-gray-500 font-mono">{formatAddress(data.address)}</p>
                        </div>
                    </div>
                    {data.chain && (
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {data.chain}
                        </span>
                    )}
                </div>
            </div>

            {/* PnL Summary */}
            <div className="p-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-xs text-gray-500">Total Invested</div>
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalInvestedUSD)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Current Value</div>
                            <div className="text-lg font-bold text-purple-600">{formatCurrency(summary.currentPortfolioValueUSD)}</div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-center gap-2 p-2 rounded-lg
                        ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
                        {isProfitable ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                        <span className={`text-lg font-bold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                            {formatPercent(summary.totalPnLPercentage)}
                        </span>
                        <span className={`text-sm ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                            ({formatCurrency(summary.totalPnL)})
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                        <div className="text-lg font-bold text-purple-600">{summary.numUniqueTokens}</div>
                        <div className="text-[10px] text-gray-500">Tokens</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                        <div className="text-lg font-bold text-green-600">{summary.numTokensBought}</div>
                        <div className="text-[10px] text-gray-500">Bought</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                        <div className="text-lg font-bold text-red-500">{summary.numTokensSold}</div>
                        <div className="text-[10px] text-gray-500">Sold</div>
                    </div>
                </div>

                {/* Best & Worst */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {summary.mostProfitableToken && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200/50">
                            <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                                <Trophy className="w-3 h-3" />
                                <span className="font-semibold">Best Performer</span>
                            </div>
                            <div className="font-bold text-gray-900">{summary.mostProfitableToken.tokenSymbol}</div>
                            <div className="text-sm text-green-600 font-semibold">
                                {formatPercent(summary.mostProfitableToken.pnlPercentage)}
                            </div>
                        </div>
                    )}
                    {summary.biggestLoserToken && (
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-200/50">
                            <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                                <Skull className="w-3 h-3" />
                                <span className="font-semibold">Worst Performer</span>
                            </div>
                            <div className="font-bold text-gray-900">{summary.biggestLoserToken.tokenSymbol}</div>
                            <div className="text-sm text-red-500 font-semibold">
                                {formatPercent(summary.biggestLoserToken.pnlPercentage)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-3">
                    <button
                        onClick={() => setActiveTab('bought')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors
                            ${activeTab === 'bought' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        <ArrowUpCircle className="w-4 h-4" />
                        Bought ({data.tokensBought.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sold')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors
                            ${activeTab === 'sold' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                    >
                        <ArrowDownCircle className="w-4 h-4" />
                        Sold ({data.tokensSold.length})
                    </button>
                </div>

                {/* Token List */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activeTab === 'bought' ? (
                        data.tokensBought.slice(0, 5).map((token, idx) => (
                            <div key={token.tokenAddress || idx} className="bg-white rounded-lg p-2 border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                                        {token.tokenSymbol.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{token.tokenSymbol}</div>
                                        <div className="text-[10px] text-gray-400">{token.numPurchases} buys</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-sm">{formatCurrency(token.totalSpentUSD)}</div>
                                    <div className={`text-[10px] ${token.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {formatPercent(token.pnlPercentage)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        data.tokensSold.slice(0, 5).map((token, idx) => (
                            <div key={token.tokenAddress || idx} className="bg-white rounded-lg p-2 border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-500">
                                        {token.tokenSymbol.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{token.tokenSymbol}</div>
                                        <div className="text-[10px] text-gray-400">{token.numSales} sales</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-sm text-green-600">+{formatCurrency(token.totalReceivedUSD)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
                <div className="text-[10px] text-gray-400 text-center">
                    {formatDate(data.timeframeStart)} - {formatDate(data.timeframeEnd)}
                </div>
            </div>
        </motion.div>
    );
}
