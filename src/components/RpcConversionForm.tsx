"use client";

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { isValidRpcUrl, testRpcUrl } from '../utils/rpc';
import { hasEnoughTokens, SUBSCRIPTION_COST } from '../utils/token';
import { generateDarkNodeRpcUrls, generateApiKey, storeRpcMapping } from '../lib/db';

interface RpcConversionFormProps {
  onSuccess?: (httpsUrl: string, wssUrl: string) => void;
}

export const RpcConversionForm: React.FC<RpcConversionFormProps> = ({ onSuccess }) => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [rpcUrl, setRpcUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<{ https: string; wss: string } | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setGeneratedUrls(null);
    
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!rpcUrl) {
      setError('Please enter an RPC URL');
      return;
    }
    
    if (!isValidRpcUrl(rpcUrl)) {
      setError('Please enter a valid RPC URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Test if the RPC URL is valid
      const isValid = await testRpcUrl(rpcUrl);
      if (!isValid) {
        setError('The RPC URL is not valid or not responding');
        setIsLoading(false);
        return;
      }
      
      // Check if the user has enough tokens
      const hasTokens = await hasEnoughTokens(connection, publicKey);
      if (!hasTokens) {
        setError(`You need at least ${SUBSCRIPTION_COST} $DNODE tokens to convert your RPC`);
        setIsLoading(false);
        return;
      }
      
      // No need to transfer tokens, just verify the user has enough tokens
      console.log('User has enough tokens, generating RPC URLs');
      
      // Generate DarkNode RPC URLs
      const apiKey = generateApiKey();
      const urls = generateDarkNodeRpcUrls(apiKey);
      
      // Store the RPC mapping in the database
      if (publicKey) {
        await storeRpcMapping(publicKey.toString(), rpcUrl, urls.https, urls.wss);
      }
      
      setGeneratedUrls(urls);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(urls.https, urls.wss);
      }
    } catch (err) {
      console.error('Error converting RPC:', err);
      setError('An error occurred while converting your RPC. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card title="Convert Your RPC" className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your RPC URL"
          placeholder="https://your-rpc-url.com"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          fullWidth
          disabled={isLoading || success}
          error={error || undefined}
        />
        
        <div className="text-sm text-gray-400">
          Requirement: Hold at least {SUBSCRIPTION_COST} $DNODE tokens to use our service
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={!connected || isLoading || success}
        >
          {connected ? 'Convert RPC' : 'Connect Wallet to Continue'}
        </Button>
        
        {success && generatedUrls && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Your DarkNode RPC URLs</h3>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-400">HTTPS RPC:</div>
                <div className="text-sm text-white break-all bg-gray-700 p-2 rounded">
                  {generatedUrls.https}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">WSS:</div>
                <div className="text-sm text-white break-all bg-gray-700 p-2 rounded">
                  {generatedUrls.wss}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Your subscription is active for 30 days. You can manage your RPCs in your dashboard.
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};

export default RpcConversionForm;
