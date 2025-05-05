"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Card from './Card';
import { getUserRpcEndpoints } from '../lib/db';

interface RpcEndpoint {
  originalRpc: string;
  httpsRpc: string;
  wssRpc: string;
  createdAt: string;
}

export const ActiveSubscriptions: React.FC = () => {
  const { publicKey, connected, wallet } = useWallet();
  const [rpcEndpoints, setRpcEndpoints] = useState<RpcEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRpcEndpoints = async () => {
      if (connected && publicKey) {
        setIsLoading(true);
        try {
          const endpoints = await getUserRpcEndpoints(publicKey.toString());
          setRpcEndpoints(endpoints);
        } catch (error) {
          console.error('Error fetching RPC endpoints:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRpcEndpoints();
  }, [connected, publicKey]);

  return (
    <Card title="Your Active Subscriptions">
      {connected && publicKey ? (
        <div className="text-gray-300 space-y-4">
          <p className="mb-4">
            Wallet connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
            <br />
            <span className="text-sm text-green-400">
              Status: {connected ? 'Connected' : 'Disconnected'} 
              {wallet?.adapter?.name ? ` (${wallet.adapter.name})` : ''}
            </span>
          </p>
          
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-300">Loading your subscriptions...</p>
            </div>
          ) : rpcEndpoints.length > 0 ? (
            <div className="space-y-4">
              {rpcEndpoints.map((endpoint, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">RPC Subscription</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">Original RPC: {endpoint.originalRpc}</div>
                  <div className="text-sm text-gray-400 mb-1">HTTPS RPC: {endpoint.httpsRpc}</div>
                  <div className="text-sm text-gray-400 mb-1">WSS RPC: {endpoint.wssRpc}</div>
                  <div className="text-sm text-gray-400">Created: {new Date(endpoint.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-300">You don't have any active subscriptions yet.</p>
              <p className="text-gray-400 text-sm mt-2">Convert an RPC URL to get started.</p>
            </div>
          )}
          
          <p className="text-sm text-gray-400">
            Your subscription will remain active as long as you continue to hold at least 10,000 $DNODE tokens in your wallet.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-300">
            Connect your wallet to view your active subscriptions.
          </p>
        </div>
      )}
    </Card>
  );
};

export default ActiveSubscriptions;
