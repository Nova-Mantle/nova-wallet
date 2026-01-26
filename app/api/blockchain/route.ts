import { NextRequest, NextResponse } from 'next/server';
import {
    getPortfolioAnalysis,
    getTokenActivity,
    getTransactionStats,
    getCounterpartyAnalysis,
    getWhaleActivity,
    getComprehensiveAnalysis // 👈 Import the new function
} from '@/lib/blockchainAgentWrapper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, address, chainId, timeframeDays, whaleThresholdUSD } = body;

        if (!address || !chainId) {
            return NextResponse.json({ error: 'Address and chainId required' }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'portfolio':
                result = await getPortfolioAnalysis(address, chainId);
                break;
            case 'token_activity':
                result = await getTokenActivity(address, chainId, timeframeDays);
                break;
            case 'transaction_stats':
                result = await getTransactionStats(address, chainId);
                break;
            case 'counterparty':
                result = await getCounterpartyAnalysis(address, chainId, timeframeDays);
                break;
            case 'whale':
                result = await getWhaleActivity(address, chainId, timeframeDays, whaleThresholdUSD);
                break;

            // ✅ NEW: Comprehensive Case
            case 'comprehensive':
                console.log(`\n🚀 Triggering COMPREHENSIVE Analysis for ${address}...`);
                result = await getComprehensiveAnalysis(address, chainId, timeframeDays, whaleThresholdUSD);
                break;

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('[Blockchain API Error]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}