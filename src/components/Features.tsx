import React from 'react';
import { ShieldCheckIcon, LockClosedIcon, CogIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'No-Log Policy',
    description:
      'Just like a premium VPN, DarkNode maintains a strict no-log policy. Your IP address and transaction data are never stored or monitored.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Encrypted Tunneling',
    description:
      'All transactions are routed through our secure infrastructure, creating an encrypted tunnel between you and the blockchain.',
    icon: LockClosedIcon,
  },
  {
    name: 'One-Click Protection',
    description:
      'Simply convert your existing RPC URL to a DarkNode RPC URL. No complex setup or configuration required - just like using a VPN.',
    icon: CogIcon,
  },
  {
    name: 'Full Compatibility',
    description:
      'Works seamlessly with all Solana dApps and wallets. Your applications will never know you\'re using DarkNode - only your privacy will improve.',
    icon: SparklesIcon,
  },
];

export const Features: React.FC = () => {
  return (
    <div className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-purple-400 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            The VPN for RPC Services
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
            DarkNode acts as a secure tunnel for your blockchain interactions, ensuring complete privacy and zero data logging.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-white">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-300">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features;
