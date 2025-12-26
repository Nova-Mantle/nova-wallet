import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygonAmoy, arbitrumSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Nova Wallet',
  projectId: 'nova-wallet-demo', // Replace with real WalletConnect project ID for production
  chains: [sepolia, polygonAmoy, arbitrumSepolia],
  ssr: false,
});

export const supportedChains = [
  { id: sepolia.id, name: 'Ethereum Sepolia', symbol: 'ETH' },
  { id: polygonAmoy.id, name: 'Polygon Amoy', symbol: 'MATIC' },
  { id: arbitrumSepolia.id, name: 'Arbitrum Sepolia', symbol: 'ETH' },
];
