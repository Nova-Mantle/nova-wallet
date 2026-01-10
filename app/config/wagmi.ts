import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { configuredChains } from './chains';

export const config = getDefaultConfig({
  appName: 'Nova Wallet',
  projectId: '3a8170812b534d0ff9d794f19a901d64', // Replace with real WalletConnect project ID for production
  chains: configuredChains,
  ssr: false,
});

