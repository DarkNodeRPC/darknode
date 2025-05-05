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
        // Hack for demo purposes - not type-safe but works for demonstration
        wallet.wallet.adapter = mockWallet as any;
        wallet.publicKey = mockWallet.publicKey;
        wallet.connected = true;
        
        console.log('Mock wallet connected with public key:', mockWallet.publicKey.toString());
      }
    }
  }, [mockConnected, wallet]);
  
  return <>{children}</>;
};

export default MockWalletConnector;
