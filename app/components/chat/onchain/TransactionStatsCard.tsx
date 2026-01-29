"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, Fuel, Activity, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";

interface TransactionStatsData {
    address: string;
    chain?: string;
    timeframeStart: number;
    timeframeEnd: number;
    totalTransactions: number;
    ethTransactions: number;
    erc20Transactions: number;
    transactionsSent: number;
    transactionsReceived: number;
    totalGasSpentUSD: number;
    averageGasPerTxUSD: number;
    firstTransactionTimestamp: number;
    lastTransactionTimestamp: number;
    accountAgeBlocks: number;
    accountAgeDays: number;
    activityFrequency: 'very_active' | 'active' | 'moderate' | 'low';
}

interface TransactionStatsCardProps {
    data: TransactionStatsData;
}

export function TransactionStatsCard({ data }: TransactionStatsCardProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val);

    const formatAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getActivityBadge = (freq: string) => {
        switch (freq) {
            case 'very_active':
                return { bg: 'bg-green-100', text: 'text-green-700', label: '🔥 Very Active' };
            case 'active':
                return { bg: 'bg-blue-100', text: 'text-blue-700', label: '✨ Active' };
            case 'moderate':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⚡ Moderate' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-600', label: '💤 Low Activity' };
        }
    };

    const activityBadge = getActivityBadge(data.activityFrequency);
    const sentPercent = data.totalTransactions > 0 ? (data.transactionsSent / data.totalTransactions) * 100 : 0;

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
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Transaction Stats</h3>
                            <p className="text-xs text-gray-500 font-mono">{formatAddress(data.address)}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 ${activityBadge.bg} ${activityBadge.text} text-xs font-medium rounded-full`}>
                        {activityBadge.label}
                    </span>
                </div>
            </div>

            <div className="p-4">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Activity className="w-3 h-3" />
                            Total Transactions
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{data.totalTransactions}</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Fuel className="w-3 h-3" />
                            Gas Spent
                        </div>
                        <div className="text-2xl font-bold text-orange-500">{formatCurrency(data.totalGasSpentUSD)}</div>
                    </div>
                </div>

                {/* Transaction Breakdown */}
                <div className="bg-white rounded-xl p-3 border border-gray-100 mb-4">
                    <div className="text-xs text-gray-500 mb-3">Transaction Breakdown</div>

                    {/* Sent vs Received Bar */}
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-red-500 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                Sent: {data.transactionsSent}
                            </span>
                            <span className="text-green-600 flex items-center gap-1">
                                Received: {data.transactionsReceived}
                                <ArrowDownLeft className="w-3 h-3" />
                            </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                            <div
                                className="bg-gradient-to-r from-red-400 to-red-500 transition-all"
                                style={{ width: `${sentPercent}%` }}
                            />
                            <div
                                className="bg-gradient-to-r from-green-400 to-green-500 transition-all"
                                style={{ width: `${100 - sentPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Type Breakdown */}
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-400"></div>
                            <span className="text-gray-600">Native: <strong>{data.ethTransactions}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-400"></div>
                            <span className="text-gray-600">ERC20: <strong>{data.erc20Transactions}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Clock className="w-3 h-3" />
                            Account Age
                        </div>
                        <div className="text-lg font-bold text-gray-800">{data.accountAgeDays} days</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Fuel className="w-3 h-3" />
                            Avg Gas/Tx
                        </div>
                        <div className="text-lg font-bold text-gray-800">{formatCurrency(data.averageGasPerTxUSD)}</div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Calendar className="w-3 h-3" />
                        Activity Timeline
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <div className="text-[10px] text-gray-400">First Tx</div>
                            <div className="font-medium text-gray-700">{formatDate(data.firstTransactionTimestamp)}</div>
                        </div>
                        <div className="flex-1 mx-4 h-0.5 bg-gradient-to-r from-purple-300 to-purple-500 rounded"></div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-400">Last Tx</div>
                            <div className="font-medium text-gray-700">{formatDate(data.lastTransactionTimestamp)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
