import React from 'react';
import Button from './Button';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-900/0"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-base font-semibold text-purple-400 tracking-wide uppercase">
                Introducing DarkNode
              </span>
              <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                <span className="block text-white">The VPN for your</span>
                <span className="block text-purple-400">RPC Connections</span>
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              DarkNode is the VPN of RPC services, routing your transactions through our secure infrastructure with 
              <span className="font-bold"> zero logs</span> and <span className="font-bold">complete privacy</span>. 
              Convert your existing RPC to a DarkNode RPC and shield your blockchain activity from surveillance.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <Link href="/dashboard">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">Learn More</Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Secure your transactions by holding just 10,000 $DNODE tokens.
              </p>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-gray-800 rounded-lg overflow-hidden p-8">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-full p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">No IP Logging</h3>
                      <p className="mt-1 text-sm text-gray-300">Your IP address remains private</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-full p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">End-to-End Privacy</h3>
                      <p className="mt-1 text-sm text-gray-300">Your transactions stay confidential</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-full p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Lightning Fast</h3>
                      <p className="mt-1 text-sm text-gray-300">No compromise on performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
