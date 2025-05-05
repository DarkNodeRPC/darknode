"use client";

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletButtonProps {
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ className = '' }) => {
  const { connected } = useWallet();

  return (
    <WalletMultiButton 
      className={`wallet-adapter-button-custom ${className}`}
      style={{
        backgroundColor: connected ? '#4c1d95' : '#7c3aed',
        color: 'white',
        borderRadius: '9999px',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

export default WalletButton;
