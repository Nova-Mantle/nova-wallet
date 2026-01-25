"use client";

import { useState } from "react";
import { Search, ArrowRight, Link2 } from "lucide-react";
import { useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";

interface OnchainSearchFormProps {
    onSubmit?: (data: { searchType: string; query: string; network: string }) => void;
    defaultValues?: {
        searchType?: 'address' | 'transaction' | 'token' | 'block';
        query?: string;
        network?: string;
    };
}

export const OnchainSearchForm = ({ onSubmit, defaultValues = {} }: OnchainSearchFormProps) => {
    const { appendMessage } = useCopilotChat(); // Get appendMessage directly
    const [searchType, setSearchType] = useState<'address' | 'transaction' | 'token' | 'block'>(
        defaultValues?.searchType || 'address'
    );
    const [query, setQuery] = useState(defaultValues?.query || '');
    const [network, setNetwork] = useState(defaultValues?.network || 'ethereum');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!query) return;
        
        console.log("🔥 ONCHAIN SEARCH FORM SUBMITTED!", { searchType, query, network });
        
        const data = { searchType, query, network };
        
        // Build natural language message based on search type
        let message = '';
        switch (searchType) {
            case 'address':
                message = `Search address ${query} on ${network}`;
                break;
            case 'transaction':
                message = `Search transaction ${query} on ${network}`;
                break;
            case 'token':
                message = `Search token ${query} on ${network}`;
                break;
            case 'block':
                message = `Search block ${query} on ${network}`;
                break;
        }
        
        console.log("📤 Sending message:", message);
        
        // Send message to AI directly from form
        try {
            appendMessage(
                new TextMessage({
                    role: MessageRole.User,
                    content: message
                })
            );
            console.log("✅ Message sent successfully!");
        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
        
        // Also call onSubmit callback if provided (for backwards compatibility)
        if (onSubmit) {
            onSubmit(data);
        }
    };

    // Get placeholder text based on search type
    const getPlaceholder = () => {
        switch (searchType) {
            case 'address':
                return '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
            case 'transaction':
                return '0xabc123...';
            case 'token':
                return 'USDT or 0x...';
            case 'block':
                return '12345678';
            default:
                return 'Enter search query';
        }
    };

    return (
        <div className="bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 border border-violet-100/50 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg">
                    <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                        Search Onchain Data
                    </h3>
                    <p className="text-xs text-slate-600">Explore blockchain activity</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Search Type Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 ml-1">Search Type</label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['address', 'transaction', 'token', 'block'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSearchType(type)}
                                className={`py-2 px-3 text-xs font-medium rounded-xl transition-all capitalize ${
                                    searchType === type
                                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                                        : 'bg-white/50 text-slate-600 hover:bg-white border border-violet-100'
                                }`}
                            >
                                {type === 'transaction' ? 'Tx' : type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Query Input */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 ml-1">Search Query</label>
                    <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={getPlaceholder()}
                            className="w-full pl-9 pr-3 py-2.5 bg-white/70 border border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                            required
                        />
                    </div>
                </div>

                {/* Network Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 ml-1">Network</label>
                    <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/70 border border-violet-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    >
                        <option value="ethereum">Ethereum</option>
                        <option value="mantle">Mantle</option>
                        <option value="lisk">Lisk</option>
                        <option value="base">Base</option>
                        <option value="arbitrum">Arbitrum</option>
                        <option value="optimism">Optimism</option>
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-2.5 rounded-xl text-sm font-medium shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    Search Blockchain
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};
