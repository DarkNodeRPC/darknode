import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

// The cost in $DNODE tokens for a monthly subscription
export const SUBSCRIPTION_COST = 10000;

// The recipient address for token transfers
export const RECIPIENT_ADDRESS = 'bidErSQzKtUihyTQ2PqLeY6Mb2uaGQSUqPf85uX5VZr';

// Function to transfer tokens for subscription
export async function burnTokensForSubscription(
  connection: Connection,
  wallet: Record<string, any>, // This will be the wallet adapter
  amount: number = SUBSCRIPTION_COST
): Promise<boolean> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    console.log('Transferring tokens from wallet:', wallet.publicKey.toString());
    console.log('Amount:', amount, '$DNODE tokens to', RECIPIENT_ADDRESS);
    
    // Get the token mint address from environment variables
    const tokenMintAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '8CVioDSY3pyqdiEfhztU15vsAcZn8uFboRGJ9pWkP25h';
    const tokenMint = new PublicKey(tokenMintAddress);
    
    // Get the recipient's public key
    const recipientPublicKey = new PublicKey(RECIPIENT_ADDRESS);

    // Get the associated token account for the user's wallet (source)
    const sourceTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey
    );
    
    // Get the associated token account for the recipient (destination)
    const destinationTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      recipientPublicKey
    );

    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
      sourceTokenAccount,
      destinationTokenAccount,
      wallet.publicKey,
      amount
    );

    // Create a new transaction and add the transfer instruction
    const transaction = new Transaction().add(transferInstruction);

    // Set the recent blockhash and fee payer
    transaction.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign and send the transaction
    const signature = await wallet.sendTransaction(transaction, connection);
    
    // Confirm the transaction
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log('Token transfer successful:', signature);
    return true;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    return false;
  }
}

// Function to check if user has enough tokens for subscription
export async function hasEnoughTokens(
  connection: Connection,
  walletAddress: PublicKey | null,
  amount: number = SUBSCRIPTION_COST
): Promise<boolean> {
  try {
    if (!walletAddress) {
      return false;
    }
    
    console.log('Checking token balance for wallet:', walletAddress.toString());
    console.log('Required amount:', amount, '$DNODE tokens');
    
    // Get the token mint address from environment variables
    const tokenMintAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '8CVioDSY3pyqdiEfhztU15vsAcZn8uFboRGJ9pWkP25h';
    const tokenMint = new PublicKey(tokenMintAddress);

    // Get the associated token account for the user's wallet
    const associatedTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      walletAddress
    );

    try {
      // Get the token account balance
      const tokenBalance = await connection.getTokenAccountBalance(associatedTokenAccount);
      
      // Check if the balance is enough
      const hasEnough = Number(tokenBalance.value.amount) >= amount;
      console.log('User has enough tokens:', hasEnough);
      return hasEnough;
    } catch (_err) {
      // If the token account doesn't exist, the user doesn't have any tokens
      console.log('Token account not found or error getting balance');
      return false;
    }
  } catch (error) {
    console.error('Error checking token balance:', error);
    return false;
  }
}
