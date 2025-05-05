"use client";

import React, { ReactNode, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createMockWallet } from '../utils/mockWallet';

interface MockWalletConnectorProps {
  children: ReactNode;
  mockConnected: boolean;
}

export const MockWalletConnector: React.FC<MockWalletConnectorProps> = ({ 
  children, 
  mockConnected 
}) => {
  const wallet = useWallet();
  
  // When mockConnected changes to true, simulate a wallet connection
  useEffect(() => {
    if (mockConnected && !wallet.connected) {
      // Create a mock wallet
      const mockWallet = createMockWallet();
      
      // Simulate setting the wallet in the adapter
      // This is a hack for demo purposes only
      // In a real app, the wallet would be connected properly through the wallet adapter
      if (wallet.wallet) {
        // @ts-ignore - This is a hack for demo purposes
        wallet.wallet.adapter = mockWallet;
        // @ts-ignore - This is a hack for demo purposes
        wallet.publicKey = mockWallet.publicKey;
        // @ts-ignore - This is a hack for demo purposes
        wallet.connected = true;
        
        console.log('Mock wallet connected with public key:', mockWallet.publicKey.toString());
      }
    }
  }, [mockConnected, wallet]);
  
  return <>{children}</>;
};

export default MockWalletConnector;
