import { Connection, PublicKey } from '@solana/web3.js';

// Function to test if an RPC URL is valid by fetching token information
export async function testRpcUrl(rpcUrl: string): Promise<boolean> {
  try {
    console.log('Testing RPC URL:', rpcUrl);
    
    // Create a connection to the RPC
    const connection = new Connection(rpcUrl);
    
    // Try to get the token account balance using the token address from our env
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '8CVioDSY3pyqdiEfhztU15vsAcZn8uFboRGJ9pWkP25h';
    const tokenPublicKey = new PublicKey(tokenAddress);
    
    // Attempt to get token supply or recent blockhash to test the RPC
    try {
      await connection.getTokenSupply(tokenPublicKey);
      console.log('RPC test successful: Token supply retrieved');
      return true;
    } catch (_err) {
      // If getting token supply fails, try getting recent blockhash as a fallback
      console.log('Failed to get token supply, trying recent blockhash');
      const { blockhash } = await connection.getLatestBlockhash();
      console.log('RPC test successful: Recent blockhash retrieved', blockhash);
      return true;
    }
  } catch (_error) {
    console.error('Error testing RPC URL:');
    return false;
  }
}

// Function to get a recent transaction from the RPC
export async function getRecentTransaction(rpcUrl: string): Promise<string | null> {
  try {
    // Create a connection to the RPC
    const connection = new Connection(rpcUrl);
    
    // Get recent block hash
    const { blockhash } = await connection.getLatestBlockhash();
    
    // If we get here, the RPC is working
    return blockhash;
  } catch (_error) {
    console.error('Error getting recent transaction:');
    return null;
  }
}

// Function to validate RPC URL format
export function isValidRpcUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.protocol === 'http:' || 
       parsedUrl.protocol === 'https:' || 
       parsedUrl.protocol === 'ws:' || 
       parsedUrl.protocol === 'wss:') &&
      !!parsedUrl.hostname
    );
  } catch (_error) {
    return false;
  }
}
