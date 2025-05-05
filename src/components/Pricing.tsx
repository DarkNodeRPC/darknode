import React from 'react';
import Button from './Button';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';

const features = [
  'Private RPC endpoints',
  'No IP logging',
  'No transaction data collection',
  'Unlimited transactions',
  'Solana blockchain support',
  'Technical support',
];

export const Pricing: React.FC = () => {
  return (
    <div className="bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h2 className="text-base font-semibold text-purple-400 tracking-wide uppercase text-center">Pricing</h2>
          <p className="mt-2 text-3xl font-extrabold text-white text-center sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-4 text-xl text-gray-300 text-center">
            Pay only for what you need with our straightforward pricing plan.
          </p>
        </div>
        
        <div className="mt-12 flex justify-center">
          <div className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden lg:w-1/2">
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="flex items-center justify-center">
                <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-purple-900 text-purple-300">
                  Token Requirement
                </h3>
              </div>
              <div className="mt-4 flex items-baseline text-6xl font-extrabold text-white justify-center">
                <span>10,000</span>
                <span className="ml-1 text-2xl font-medium text-gray-400">$DNODE</span>
              </div>
              <p className="mt-5 text-lg text-gray-300 text-center">
                minimum tokens to hold in your wallet
              </p>
            </div>
            <div className="px-6 pt-6 pb-8 bg-gray-700 sm:p-10">
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                    </div>
                    <p className="ml-3 text-base text-gray-300">{feature}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/dashboard">
                  <Button fullWidth size="lg">
                    Get Started Now
                  </Button>
                </Link>
              </div>
              <div className="mt-4 text-sm text-gray-400 text-center">
                Access continues as long as you hold the required tokens.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
