import React from 'react';
import RpcConversionForm from '../../components/RpcConversionForm';
import Card from '../../components/Card';
import ActiveSubscriptions from '../../components/ActiveSubscriptions';

export const metadata = {
  title: 'Dashboard - DarkNode',
  description: 'Convert your RPC URLs to DarkNode RPCs for enhanced privacy.',
  openGraph: {
    title: 'Dashboard - DarkNode',
    description: 'Convert your RPC URLs to DarkNode RPCs for enhanced privacy and security.',
    images: [
      {
        url: 'https://raw.githubusercontent.com/DarkNodeRPC/darknode/master/public/preview.png',
        width: 1200,
        height: 630,
        alt: 'DarkNode - Privacy for Crypto Transactions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - DarkNode',
    description: 'Convert your RPC URLs to DarkNode RPCs for enhanced privacy and security.',
    images: ['https://raw.githubusercontent.com/DarkNodeRPC/darknode/master/public/preview.png'],
    creator: '@darknoderpc',
  },
};

export default function Dashboard() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-4">
            Convert your RPC URLs to DarkNode RPCs for enhanced privacy.
          </p>
        </div>

        <div className="mt-10">
          <RpcConversionForm />
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card title="How It Works">
            <div className="text-gray-300 space-y-4">
              <p>
                DarkNode routes your transactions through our secure infrastructure, preventing RPC providers from logging your IP and transaction data.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Connect your wallet holding at least 10,000 $DNODE tokens</li>
                <li>Enter your current RPC URL</li>
                <li>Receive your new DarkNode RPC URLs (HTTPS and WSS)</li>
                <li>Replace your current RPC URLs with the DarkNode URLs</li>
              </ol>
              <p className="text-sm text-gray-400 mt-4">
                Your subscription will be active for 30 days as long as you continue to hold at least 10,000 $DNODE tokens.
              </p>
            </div>
          </Card>

          <ActiveSubscriptions />
        </div>
      </div>
    </div>
  );
}
