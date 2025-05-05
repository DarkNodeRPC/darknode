import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../../components/Button';

export const metadata = {
  title: 'About - DarkNode',
  description: 'Learn more about DarkNode and our mission to protect your privacy in crypto transactions.',
  openGraph: {
    title: 'About DarkNode - The VPN for RPC Services',
    description: 'Learn more about DarkNode and our mission to protect your privacy in crypto transactions.',
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
    title: 'About DarkNode - The VPN for RPC Services',
    description: 'Learn more about DarkNode and our mission to protect your privacy in crypto transactions.',
    images: ['https://raw.githubusercontent.com/DarkNodeRPC/darknode/master/public/preview.png'],
    creator: '@darknoderpc',
  },
};

export default function About() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            About DarkNode
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-4">
            Our mission is to protect your privacy in the blockchain space.
          </p>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 mb-4">
              DarkNode was created to address a critical privacy issue in the blockchain space: RPC providers logging user IPs and transaction data. We believe that privacy is a fundamental right, and your crypto transactions should remain private.
            </p>
            <p className="text-gray-300 mb-4">
              By routing your transactions through our native RPC, DarkNode prevents data logging and protects your privacy, ensuring that your blockchain activities remain confidential.
            </p>
            <p className="text-gray-300">
              Our goal is to create a more private and secure blockchain ecosystem where users have control over their data and can transact without surveillance.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="DarkNode Logo"
                width={300}
                height={300}
                className="object-contain"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">How DarkNode Works</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                DarkNode acts as an intermediary between you and the blockchain. When you use a standard RPC provider, they can log your IP address and transaction data. DarkNode prevents this by routing your transactions through our secure infrastructure.
              </p>
              <p>
                This is how it works:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>You connect to DarkNode's RPC endpoint instead of a standard RPC</li>
                <li>Your transaction is routed through our secure infrastructure</li>
                <li>We forward your transaction to the blockchain without logging your IP or transaction data</li>
                <li>The transaction is processed on the blockchain as normal</li>
              </ol>
              <p>
                This process ensures that your privacy is protected while maintaining full functionality with the Solana blockchain.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">$DNODE Token</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                The $DNODE token is the native utility token of the DarkNode ecosystem. It is used to pay for subscriptions to our privacy-focused RPC service.
              </p>
              <p>
                Token details:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Token Address: 8CVioDSY3pyqdiEfhztU15vsAcZn8uFboRGJ9pWkP25h</li>
                <li>Blockchain: Solana</li>
                <li>Requirement: Hold at least 10,000 $DNODE tokens</li>
              </ul>
              <p>
                To use DarkNode, you need to hold at least 10,000 $DNODE tokens in your wallet. This token requirement ensures that our service is used by committed members of our community.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Protect Your Privacy?</h2>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button size="lg">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
