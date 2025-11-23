/**
 * Wallet Connection and Signing Utilities
 * Handles MetaMask integration via ethers.js
 */

import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  try {
    // Request account access
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request.');
    }
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
};

// Get current connected account
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Sign a message with MetaMask
export const signMessage = async (message: string, walletAddress: string): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.');
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer: JsonRpcSigner = await provider.getSigner();
    
    // Verify the signer address matches
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Connected wallet address mismatch.');
    }

    // Sign the message
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error('User rejected the signature request.');
    }
    throw new Error(`Failed to sign message: ${error.message}`);
  }
};

// Format wallet address for display (0x1234...5678)
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Listen to account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// Listen to chain changes
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
  }
};

// Remove listeners
export const removeListeners = (): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
