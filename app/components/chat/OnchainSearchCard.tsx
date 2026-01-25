"use client";

import { ExternalLink, Check, Clock, AlertCircle, TrendingUp, Users, Coins } from "lucide-react";

interface OnchainSearchCardProps {
    searchType: 'address' | 'transaction' | 'token' | 'block';
    query: string;
    network: string;
    data: any;
}

export const OnchainSearchCard = ({ searchType, query, network, data }: OnchainSearchCardProps) => {
    // Format network name for display
    const networkDisplay = network.charAt(0).toUpperCase() + network.slice(1);

    // Render based on search type
    const renderContent = () => {
        switch (searchType) {
            case 'address':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-violet-50/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Balance</div>
                                <div className="text-base font-semibold text-violet-600">
                                    {data.balance || '0.00'} ETH
                                </div>
                            </div>
                            <div className="bg-fuchsia-50/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Transactions</div>
                                <div className="text-base font-semibold text-fuchsia-600">
                                    {data.txCount || 0}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Token Holdings</span>
                            <span className="font-medium text-slate-700">{data.tokenCount || 0} tokens</span>
                        </div>
                    </div>
                );

            case 'transaction':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-violet-100">
                            {data.status === 'success' ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${data.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {data.status === 'success' ? 'Success' : 'Failed'}
                            </span>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">From</span>
                                <span className="font-mono text-slate-700">{data.from?.slice(0, 10)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">To</span>
                                <span className="font-mono text-slate-700">{data.to?.slice(0, 10)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Value</span>
                                <span className="font-semibold text-violet-600">{data.value || '0'} ETH</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Gas</span>
                                <span className="text-slate-700">{data.gas || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'token':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 pb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center">
                                <Coins className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-800">{data.name || 'Unknown Token'}</div>
                                <div className="text-xs text-slate-500">{data.symbol || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-violet-50/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Price</div>
                                <div className="text-sm font-semibold text-violet-600">
                                    ${data.price || '0.00'}
                                </div>
                            </div>
                            <div className="bg-fuchsia-50/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Market Cap</div>
                                <div className="text-sm font-semibold text-fuchsia-600">
                                    ${data.marketCap || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500">
                            <span className="font-mono">{data.contract?.slice(0, 20)}...</span>
                        </div>
                    </div>
                );

            case 'block':
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-violet-50/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Block Number</div>
                                <div className="text-base font-semibold text-violet-600">
                                    #{data.number || query}
                                </div>
                            </div>
                            <div className="bg-fuchsia-50/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Transactions</div>
                                <div className="text-base font-semibold text-fuchsia-600">
                                    {data.txCount || 0}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    Timestamp
                                </div>
                                <span className="text-slate-700">{data.timestamp || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Gas Used</span>
                                <span className="text-slate-700">{data.gasUsed || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 border border-violet-100 rounded-2xl p-5 max-w-md w-full shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent capitalize">
                            {searchType} Details
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">
                            {networkDisplay}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                        {query.length > 20 ? `${query.slice(0, 20)}...` : query}
                    </p>
                </div>
                <a
                    href={`https://etherscan.io/${searchType}/${query}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
                >
                    <ExternalLink className="w-4 h-4 text-violet-500" />
                </a>
            </div>

            {/* Content */}
            {renderContent()}

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-violet-100">
                <button className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                    View Full Details
                    <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
