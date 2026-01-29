"use client";

import { motion } from "framer-motion";
import { Users, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Building2, Layers } from "lucide-react";
import { useState } from "react";

interface CounterpartyInteraction {
    address: string;
    label?: string;
    numTransactions: number;
    totalValueSentUSD: number;
    totalValueReceivedUSD: number;
    firstInteractionTimestamp: number;
    lastInteractionTimestamp: number;
    interactionType: 'mostly_sent' | 'mostly_received' | 'balanced';
}

interface CounterpartyAnalysisData {
    address: string;
    chain?: string;
    timeframeStart: number;
    timeframeEnd: number;
    topCounterparties: CounterpartyInteraction[];
    totalUniqueCounterparties: number;
    knownExchanges: CounterpartyInteraction[];
    knownDeFiProtocols: CounterpartyInteraction[];
    unknownAddresses: CounterpartyInteraction[];
}

interface CounterpartyCardProps {
    data: CounterpartyAnalysisData;
}

export function CounterpartyCard({ data }: CounterpartyCardProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'exchanges' | 'defi' | 'unknown'>('all');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val);

    const formatAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        if (seconds < 86400) return 'Today';
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
        return `${Math.floor(seconds / 2592000)}mo ago`;
    };

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'mostly_sent': return <ArrowUpRight className="w-3 h-3 text-red-500" />;
            case 'mostly_received': return <ArrowDownLeft className="w-3 h-3 text-green-500" />;
            default: return <ArrowLeftRight className="w-3 h-3 text-purple-500" />;
        }
    };

    const getInteractionBadge = (type: string) => {
        switch (type) {
            case 'mostly_sent':
                return <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full">Mostly Sent</span>;
            case 'mostly_received':
                return <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-[10px] rounded-full">Mostly Received</span>;
            default:
                return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] rounded-full">Balanced</span>;
        }
    };

    const getActiveList = () => {
        switch (activeTab) {
            case 'exchanges': return data.knownExchanges;
            case 'defi': return data.knownDeFiProtocols;
            case 'unknown': return data.unknownAddresses;
            default: return data.topCounterparties;
        }
    };

    const tabs = [
        { id: 'all', label: 'Top', count: data.topCounterparties.length },
        { id: 'exchanges', label: 'Exchanges', count: data.knownExchanges.length, icon: Building2 },
        { id: 'defi', label: 'DeFi', count: data.knownDeFiProtocols.length, icon: Layers },
        { id: 'unknown', label: 'Unknown', count: data.unknownAddresses.length },
    ];

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
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Counterparty Analysis</h3>
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

            {/* Stats */}
            <div className="p-4 grid grid-cols-3 gap-2">
                <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-purple-600">{data.totalUniqueCounterparties}</div>
                    <div className="text-xs text-gray-500">Unique Addresses</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-xl font-bold text-blue-600">{data.knownExchanges.length}</div>
                    <div className="text-xs text-gray-500">Known Exchanges</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-xl font-bold text-green-600">{data.knownDeFiProtocols.length}</div>
                    <div className="text-xs text-gray-500">DeFi Protocols</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 flex gap-1 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                            ${activeTab === tab.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Counterparty List */}
            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                {getActiveList().length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                        No {activeTab === 'all' ? 'counterparties' : activeTab} found
                    </div>
                ) : (
                    getActiveList().slice(0, 8).map((cp, idx) => (
                        <div key={cp.address || idx} className="bg-white rounded-xl p-3 border border-gray-100">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getInteractionIcon(cp.interactionType)}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-gray-800">{formatAddress(cp.address)}</span>
                                            {cp.label && (
                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">
                                                    {cp.label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            {cp.numTransactions} txs • Last: {timeAgo(cp.lastInteractionTimestamp)}
                                        </div>
                                    </div>
                                </div>
                                {getInteractionBadge(cp.interactionType)}
                            </div>

                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3 text-red-400" />
                                    <span className="text-gray-600">Sent:</span>
                                    <span className="font-medium text-red-500">{formatCurrency(cp.totalValueSentUSD)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ArrowDownLeft className="w-3 h-3 text-green-400" />
                                    <span className="text-gray-600">Received:</span>
                                    <span className="font-medium text-green-600">{formatCurrency(cp.totalValueReceivedUSD)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
