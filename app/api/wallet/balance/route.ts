import { NextResponse } from "next/server";
import {
    createPublicClient,
    formatEther,
    http,
    isAddress,
    type Hex,
} from "viem";
import type { Chain } from "viem/chains";
import {
    mantle,
    mantleSepoliaTestnet,
    mainnet,
} from "viem/chains";

type BalanceRequestBody = {
    address: Hex;
    chainId: number;
};

const supportedChains: Chain[] = [
    mantle,
    mantleSepoliaTestnet,
    mainnet,
];

const chainMap: Record<number, Chain> = supportedChains.reduce(
    (acc, chain) => {
        acc[chain.id] = chain;
        return acc;
    },
    {} as Record<number, Chain>,
);

const rpcOverride: Record<number, string | undefined> = {
    [mainnet.id]:
        process.env.NEXT_PUBLIC_MAINNET_RPC ?? process.env.MAINNET_RPC,
    [mantle.id]:
        process.env.NEXT_PUBLIC_MANTLE_RPC ?? process.env.MANTLE_RPC,
    [mantleSepoliaTestnet.id]:
        process.env.NEXT_PUBLIC_MANTLE_SEPOLIA_RPC ?? process.env.MANTLE_SEPOLIA_RPC,
};

const getChain = (chainId: number) => chainMap[chainId];

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Partial<BalanceRequestBody>;

        if (!body?.address || !isAddress(body.address)) {
            return NextResponse.json(
                { error: "Alamat wallet tidak valid." },
                { status: 400 },
            );
        }

        if (typeof body.chainId !== "number") {
            return NextResponse.json(
                { error: "chainId wajib berupa angka." },
                { status: 400 },
            );
        }

        const chain = getChain(body.chainId);

        if (!chain) {
            return NextResponse.json(
                {
                    error: `Chain ${body.chainId} belum didukung.`,
                    supportedChains: supportedChains.map(c => ({ id: c.id, name: c.name }))
                },
                { status: 400 },
            );
        }

        // Gunakan RPC override kalau ada, kalau tidak pakai default dari chain
        const rpcUrl = rpcOverride[chain.id];

        console.log(`[wallet/balance] Checking balance for chain ${chain.id} (${chain.name}), RPC: ${rpcUrl || 'default'}`);

        const client = createPublicClient({
            chain,
            transport: rpcUrl ? http(rpcUrl) : http(), // Biarkan viem pilih default
        });

        const balanceWei = await client.getBalance({
            address: body.address,
        });

        const balanceEth = formatEther(balanceWei);

        // Determine token symbol based on chain
        const isMantle = chain.id === mantle.id || chain.id === mantleSepoliaTestnet.id;
        const tokenSymbol = isMantle ? "MNT" : "ETH";
        const tokenName = isMantle
            ? "MNT (Mantle native token)"
            : "ETH (Ethereum native token)";

        return NextResponse.json({
            address: body.address,
            chainId: chain.id,
            formattedChainName: chain.name,
            balanceWei: balanceWei.toString(),
            balanceEth, // Tetap pakai format ETH untuk kompatibilitas
            tokenSymbol, // Symbol yang benar (ETH atau MNT)
            tokenName, // Nama lengkap token
        });
    } catch (error) {
        console.error("[wallet/balance] error", error);
        return NextResponse.json(
            {
                error: "Terjadi kesalahan saat mengambil saldo.",
            },
            { status: 500 },
        );
    }
}
