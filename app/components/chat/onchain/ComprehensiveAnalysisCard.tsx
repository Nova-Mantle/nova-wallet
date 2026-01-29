"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Wallet, TrendingUp, TrendingDown, Users, Activity,
    Fuel, ChevronDown, ChevronUp, Coins, ArrowUpRight,
    ArrowDownRight, BarChart3, Calendar
} from "lucide-react";

interface ComprehensiveAnalysisProps {
    data: {
        address: string;
        chain: string;
        portfolio: {
            totalPortfolioValueUSD: number;
            numTokens: number;
            nativeBalance: number;
            nativeValueUSD: number;
            tokenHoldings?: any[];
        };
        whale: {
            numWhaleTransactions: number;
            totalWhaleValueUSD: number;
            averageWhaleTransactionUSD: number;
            largestTransaction?: {
                valueUSD: number;
                direction: string;
                timestamp: number;
            };
            exchangeFlows: {
                sentToExchanges: number;
                receivedFromExchanges: number;
                netExchangeFlow: number;
            };
        };
        counterparty: {
            totalUniqueCounterparties: number;
            knownExchanges: any[];
            knownDeFiProtocols: any[];
            unknownAddresses: any[];
        };
        stats: {
            totalTransactions: number;
            transactionsSent: number;
            transactionsReceived: number;
            totalGasSpentUSD: number;
            accountAgeDays: number;
            activityFrequency: string;
        };
        tokenActivity: {
            summary: {
                totalPnLPercentage: number;
                totalPnL: number;
                numTokensBought: number;
                numTokensSold: number;
            };
        };
    };
}

export function ComprehensiveAnalysisCard({ data }: ComprehensiveAnalysisProps) {
    const [expanded, setExpanded] = useState(false);

    const { portfolio, whale, counterparty, stats, tokenActivity } = data;
    const pnl = tokenActivity?.summary?.totalPnLPercentage || 0;
    const isPnLPositive = pnl >= 0;

    const formatUSD = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 via-violet-50/50 to-white rounded-2xl border border-purple-200/50 shadow-lg overflow-hidden max-w-lg"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Comprehensive Analysis</h3>
                            <p className="text-purple-100 text-sm">{data.chain}</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPnLPositive
                            ? 'bg-green-500/20 text-green-200'
                            : 'bg-red-500/20 text-red-200'
                        }`}>
                        {isPnLPositive ? '+' : ''}{pnl.toFixed(2)}%
                    </div>
                </div>
                <p className="text-purple-100 text-xs mt-2 font-mono">
                    {formatAddress(data.address)}
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
                {/* Portfolio Value */}
                <div className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-medium">Portfolio</span>
                    </div>
                    <p className="font-bold text-gray-900">
                        {formatUSD(portfolio?.totalPortfolioValueUSD || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {portfolio?.numTokens || 0} tokens
                    </p>
                </div>

                {/* Whale Activity */}
                <div className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Whale Txs</span>
                    </div>
                    <p className="font-bold text-gray-900">
                        {whale?.numWhaleTransactions || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatUSD(whale?.totalWhaleValueUSD || 0)}
                    </p>
                </div>

                {/* Interactions */}
                <div className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">Interactions</span>
                    </div>
                    <p className="font-bold text-gray-900">
                        {counterparty?.totalUniqueCounterparties || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                        unique addresses
                    </p>
                </div>

                {/* Gas Spent */}
                <div className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <Fuel className="w-4 h-4" />
                        <span className="text-xs font-medium">Gas Spent</span>
                    </div>
                    <p className="font-bold text-gray-900">
                        {formatUSD(stats?.totalGasSpentUSD || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {stats?.totalTransactions || 0} txs
                    </p>
                </div>
            </div>

            {/* Exchange Flow Bar */}
            {whale && (
                <div className="px-4 pb-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Exchange Flow</p>
                        <div className="flex items-center gap-2">
                            <ArrowUpRight className={`w-4 h-4 ${whale.exchangeFlows.netExchangeFlow > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${whale.exchangeFlows.netExchangeFlow > 0
                                            ? 'bg-gradient-to-r from-red-400 to-red-500'
                                            : 'bg-gradient-to-r from-green-400 to-green-500'
                                        }`}
                                    style={{
                                        width: `${Math.min(100, Math.abs(whale.exchangeFlows.netExchangeFlow) /
                                            (Math.abs(whale.exchangeFlows.sentToExchanges) + Math.abs(whale.exchangeFlows.receivedFromExchanges) + 1) * 100)}%`
                                    }}
                                />
                            </div>
                            <ArrowDownRight className={`w-4 h-4 ${whale.exchangeFlows.netExchangeFlow < 0 ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            {whale.exchangeFlows.netExchangeFlow > 0
                                ? `Net outflow: ${formatUSD(whale.exchangeFlows.netExchangeFlow)}`
                                : `Net inflow: ${formatUSD(Math.abs(whale.exchangeFlows.netExchangeFlow))}`
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Expanded Section */}
            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 space-y-3"
                >
                    {/* Counterparty Summary */}
                    {counterparty && (
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Counterparties</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="font-bold text-purple-600">{counterparty.knownExchanges?.length || 0}</p>
                                    <p className="text-xs text-gray-500">Exchanges</p>
                                </div>
                                <div>
                                    <p className="font-bold text-blue-600">{counterparty.knownDeFiProtocols?.length || 0}</p>
                                    <p className="text-xs text-gray-500">DeFi</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-600">{counterparty.unknownAddresses?.length || 0}</p>
                                    <p className="text-xs text-gray-500">Unknown</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trading Activity */}
                    {tokenActivity?.summary && (
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Trading Activity</p>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{tokenActivity.summary.numTokensBought} bought</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{tokenActivity.summary.numTokensSold} sold</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Info */}
                    {stats && (
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {stats.accountAgeDays} days old
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Activity className="w-3 h-3" />
                                {stats.activityFrequency}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full py-2 flex items-center justify-center gap-1 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
            >
                {expanded ? (
                    <>
                        <ChevronUp className="w-4 h-4" />
                        Show less
                    </>
                ) : (
                    <>
                        <ChevronDown className="w-4 h-4" />
                        Show more
                    </>
                )}
            </button>
        </motion.div>
    );
}
