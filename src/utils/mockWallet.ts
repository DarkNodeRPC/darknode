import { PublicKey } from '@solana/web3.js';

// Create a mock wallet for testing purposes
export const createMockWallet = () => {
  const publicKey = new PublicKey('4xgQT7q2tD7r6BCuRs6Hnp2nh5R1BXQMonnfpUrb5f8t');
  
  return {
    publicKey,
    connected: true,
    connecting: false,
    disconnecting: false,
    
    connect: async () => {
      console.log('Mock wallet connected');
      return;
    },
    
    disconnect: async () => {
      console.log('Mock wallet disconnected');
      return;
    },
    
    sendTransaction: async (transaction: unknown) => {
      console.log('Mock wallet sending transaction', transaction);
      // Return a mock transaction signature
      return 'MOCK_TRANSACTION_SIGNATURE';
    },
    
    signTransaction: async (transaction: unknown) => {
      console.log('Mock wallet signing transaction', transaction);
      return transaction;
    },
    
    signAllTransactions: async (transactions: unknown[]) => {
      console.log('Mock wallet signing all transactions', transactions);
      return transactions;
    },
    
    signMessage: async (message: Uint8Array) => {
      console.log('Mock wallet signing message', message);
      return message;
    }
  };
};
