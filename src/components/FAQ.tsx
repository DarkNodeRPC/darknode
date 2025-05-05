"use client";

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'What is DarkNode?',
    answer:
      'DarkNode is a privacy-focused RPC (Remote Procedure Call) solution for Solana blockchain. It routes your transactions through our native RPC, preventing data logging and protecting your privacy.',
  },
  {
    question: 'How does DarkNode protect my privacy?',
    answer:
      'DarkNode acts as an intermediary between you and the blockchain. When you use a standard RPC provider, they can log your IP address and transaction data. DarkNode prevents this by routing your transactions through our secure infrastructure, ensuring your activities remain private.',
  },
  {
    question: 'What are the requirements to use DarkNode?',
    answer:
      'To use DarkNode, you need to hold at least 10,000 $DNODE tokens in your wallet. As long as you maintain this balance, you can continue to use our service with unlimited transactions and full access to all features.',
  },
  {
    question: 'How do I get $DNODE tokens?',
    answer:
      'You can acquire $DNODE tokens on various Solana DEXes. The token address is 8CVioDSY3pyqdiEfhztU15vsAcZn8uFboRGJ9pWkP25h.',
  },
  {
    question: 'Is DarkNode compatible with all Solana wallets and dApps?',
    answer:
      'Yes, DarkNode is fully compatible with all Solana wallets and decentralized applications. You simply replace your current RPC URL with the DarkNode RPC URL provided after subscription.',
  },
  {
    question: 'Can I use multiple RPCs with DarkNode?',
    answer:
      'Yes, you can convert multiple RPC URLs to DarkNode RPCs as long as you hold the required 10,000 $DNODE tokens in your wallet.',
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700">
      <button
        className="flex justify-between items-center w-full py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? (
            <ChevronUpIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="pb-6">
          <p className="text-base text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  );
};

export const FAQ: React.FC = () => {
  return (
    <div className="bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto divide-y-2 divide-gray-800">
          <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6 divide-y divide-gray-800">
            {faqs.map((faq) => (
              <div key={faq.question} className="pt-6">
                <FAQItem question={faq.question} answer={faq.answer} />
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
