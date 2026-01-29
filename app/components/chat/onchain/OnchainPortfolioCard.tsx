"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, PieChart, Gem } from "lucide-react";
import { useState } from "react";

interface PortfolioHolding {
    tokenSymbol: string;
    tokenAddress: string;
    tokenName?: string;
    balance: number;
    currentValueUSD: number;
    averageBuyPriceUSD: number;
    currentPriceUSD: number;
    pnl: number;
    pnlPercentage: number;
    percentOfPortfolio: number;
    totalInvestedUSD: number;
}

interface OnchainPortfolioData {
    address: string;
    chain?: string;
    nativeBalance: number;
    nativeValueUSD: number;
    tokenHoldings: PortfolioHolding[];
    totalPortfolioValueUSD: number;
    totalInvestedUSD: number;
    totalPnL: number;
    totalPnLPercentage: number;
    numTokens: number;
    topHoldingByValue?: PortfolioHolding;
    mostProfitableHolding?: PortfolioHolding;
}

interface OnchainPortfolioCardProps {
    data: OnchainPortfolioData;
}

export function OnchainPortfolioCard({ data }: OnchainPortfolioCardProps) {
    const [showAllHoldings, setShowAllHoldings] = useState(false);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: val < 1 ? 4 : 0
        }).format(val);

    const formatNumber = (val: number) =>
        val < 0.0001 ? val.toExponential(2) :
            val < 1 ? val.toFixed(6) :
                val.toLocaleString(undefined, { maximumFractionDigits: 4 });

    const formatAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const formatPercent = (val: number) =>
        `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

    const isProfitable = data.totalPnL >= 0;

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
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Portfolio Analysis</h3>
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

            {/* Net Worth */}
            <div className="p-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center mb-4">
                    <div className="text-xs text-gray-500 mb-1">Total Net Worth</div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatCurrency(data.totalPortfolioValueUSD)}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium
                        ${isProfitable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {formatPercent(data.totalPnLPercentage)} ({formatCurrency(data.totalPnL)})
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-xs text-gray-500">Invested</div>
                        <div className="font-semibold text-gray-800">{formatCurrency(data.totalInvestedUSD)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-xs text-gray-500">Tokens Held</div>
                        <div className="font-semibold text-purple-600">{data.numTokens}</div>
                    </div>
                </div>

                {/* Top Holding */}
                {data.topHoldingByValue && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 border border-amber-200/50 mb-4">
                        <div className="flex items-center gap-2 text-xs text-amber-700 mb-2">
                            <Gem className="w-3 h-3" />
                            <span className="font-semibold">Largest Holding</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-bold text-gray-900">{data.topHoldingByValue.tokenSymbol}</span>
                                <div className="text-xs text-gray-500">
                                    {formatNumber(data.topHoldingByValue.balance)} tokens
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900">{formatCurrency(data.topHoldingByValue.currentValueUSD)}</div>
                                <div className={`text-xs ${data.topHoldingByValue.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {formatPercent(data.topHoldingByValue.pnlPercentage)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Holdings List */}
                {data.tokenHoldings.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                <PieChart className="w-3 h-3" />
                                Holdings Breakdown
                            </span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(showAllHoldings ? data.tokenHoldings : data.tokenHoldings.slice(0, 4)).map((holding, idx) => (
                                <div key={holding.tokenAddress || idx} className="bg-white rounded-lg p-2 border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                                            {holding.tokenSymbol.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">{holding.tokenSymbol}</div>
                                            <div className="text-[10px] text-gray-400">{holding.percentOfPortfolio.toFixed(1)}% of portfolio</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-sm text-gray-900">{formatCurrency(holding.currentValueUSD)}</div>
                                        <div className={`text-[10px] ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {formatPercent(holding.pnlPercentage)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {data.tokenHoldings.length > 4 && (
                            <button
                                onClick={() => setShowAllHoldings(!showAllHoldings)}
                                className="w-full mt-2 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                                {showAllHoldings ? 'Show less' : `Show all ${data.tokenHoldings.length} holdings`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
