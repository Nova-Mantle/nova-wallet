"use client";

import { motion } from "framer-motion";
import { Fish, ArrowUpRight, ArrowDownLeft, ExternalLink, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useState } from "react";

interface WhaleTransaction {
    hash: string;
    timestamp: number;
    from: string;
    to: string;
    valueUSD: number;
    valueNative: number;
    tokenSymbol?: string;
    type: 'ETH' | 'ERC20';
    direction: 'sent' | 'received';
    destinationLabel?: string;
}

interface WhaleAnalysisData {
    address: string;
    chain?: string;
    timeframeStart: number;
    timeframeEnd: number;
    whaleThresholdUSD: number;
    whaleTransactions: WhaleTransaction[];
    totalWhaleValueUSD: number;
    largestTransaction: WhaleTransaction | null;
    numWhaleTransactions: number;
    averageWhaleTransactionUSD: number;
    exchangeFlows: {
        sentToExchanges: number;
        receivedFromExchanges: number;
        netExchangeFlow: number;
    };
}

interface WhaleAnalysisCardProps {
    data: WhaleAnalysisData;
}

export function WhaleAnalysisCard({ data }: WhaleAnalysisCardProps) {
    const [showTransactions, setShowTransactions] = useState(false);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val);

    const formatAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const netFlow = data.exchangeFlows.netExchangeFlow;
    const flowType = netFlow > 0 ? 'accumulating' : netFlow < 0 ? 'distributing' : 'neutral';

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
                            <Fish className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Whale Analysis</h3>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-4">
                <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.numWhaleTransactions}</div>
                    <div className="text-xs text-gray-500">Whale Txs</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-lg font-bold text-purple-600">{formatCurrency(data.totalWhaleValueUSD)}</div>
                    <div className="text-xs text-gray-500">Total Value</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-lg font-bold text-gray-700">{formatCurrency(data.averageWhaleTransactionUSD)}</div>
                    <div className="text-xs text-gray-500">Avg/Tx</div>
                </div>
            </div>

            {/* Largest Transaction */}
            {data.largestTransaction && (
                <div className="mx-4 mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Largest Transaction
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-lg font-bold ${data.largestTransaction.direction === 'received' ? 'text-green-600' : 'text-red-500'}`}>
                                {data.largestTransaction.direction === 'received' ? '+' : '-'}{formatCurrency(data.largestTransaction.valueUSD)}
                            </span>
                            <span className="text-xs text-gray-400">{timeAgo(data.largestTransaction.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            {data.largestTransaction.direction === 'received' ? (
                                <ArrowDownLeft className="w-3 h-3 text-green-500" />
                            ) : (
                                <ArrowUpRight className="w-3 h-3 text-red-500" />
                            )}
                            <span className="font-mono">{formatAddress(data.largestTransaction.direction === 'received' ? data.largestTransaction.from : data.largestTransaction.to)}</span>
                            {data.largestTransaction.destinationLabel && (
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                                    {data.largestTransaction.destinationLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Exchange Flow */}
            <div className="mx-4 mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-2">Exchange Flow</div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600">Sent to Exchanges</span>
                        </div>
                        <span className="font-semibold text-red-500">{formatCurrency(data.exchangeFlows.sentToExchanges)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">From Exchanges</span>
                        </div>
                        <span className="font-semibold text-green-600">{formatCurrency(data.exchangeFlows.receivedFromExchanges)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {flowType === 'accumulating' ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : flowType === 'distributing' ? (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                                <Activity className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Net Flow</span>
                        </div>
                        <div className="text-right">
                            <span className={`font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                            </span>
                            <div className={`text-[10px] ${flowType === 'accumulating' ? 'text-green-600' : flowType === 'distributing' ? 'text-red-500' : 'text-gray-400'}`}>
                                {flowType === 'accumulating' ? '📈 Accumulating' : flowType === 'distributing' ? '📉 Selling Pressure' : '➡️ Neutral'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Toggle */}
            {data.whaleTransactions.length > 0 && (
                <div className="px-4 pb-4">
                    <button
                        onClick={() => setShowTransactions(!showTransactions)}
                        className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                        {showTransactions ? 'Hide' : 'Show'} {data.whaleTransactions.length} Whale Transactions
                    </button>

                    {showTransactions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 space-y-2 max-h-48 overflow-y-auto"
                        >
                            {data.whaleTransactions.slice(0, 5).map((tx, idx) => (
                                <div key={tx.hash || idx} className="bg-gray-50 rounded-lg p-2 text-xs flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {tx.direction === 'received' ? (
                                            <ArrowDownLeft className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <ArrowUpRight className="w-3 h-3 text-red-500" />
                                        )}
                                        <span className={`font-semibold ${tx.direction === 'received' ? 'text-green-600' : 'text-red-500'}`}>
                                            {formatCurrency(tx.valueUSD)}
                                        </span>
                                    </div>
                                    <span className="text-gray-400">{timeAgo(tx.timestamp)}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="px-4 pb-4">
                <div className="text-[10px] text-gray-400 text-center">
                    Whale threshold: {formatCurrency(data.whaleThresholdUSD)} • {formatDate(data.timeframeStart)} - {formatDate(data.timeframeEnd)}
                </div>
            </div>
        </motion.div>
    );
}
