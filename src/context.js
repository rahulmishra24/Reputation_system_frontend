import { createContext } from 'react';

export const WalletAddressContext = createContext({
    walletAddress: '"en"',
    setWalletAddress: () => {}
  });