import { Redis } from '@upstash/redis';

// Initialize Redis client with environment variables
// Use NEXT_PUBLIC_ prefix for client-side access
const redis = new Redis({
  url: process.env.KV_REST_API_URL || 'https://humane-raptor-21568.upstash.io',
  token: process.env.KV_REST_API_TOKEN || 'AVRAAAIjcDE0NjlhMjEzYjdlODM0MzU2YWNjMWI5ODhlNjc5MjE5Y3AxMA',
});

// User-related functions
export async function createUser(walletAddress: string) {
  const userData = {
    walletAddress,
    membershipStatus: 'inactive',
    subscriptionExpiration: null,
    apiKey: null,
    rpcEndpoints: [],
  };

  await redis.set(`user:${walletAddress}`, JSON.stringify(userData));
  return userData;
}

export async function getUser(walletAddress: string) {
  try {
    const userData = await redis.get(`user:${walletAddress}`);
    
    if (!userData) {
      return null;
    }
    
    // If userData is already an object, return it directly
    if (typeof userData === 'object') {
      return userData;
    }
    
    // Otherwise, parse it as JSON
    return JSON.parse(userData as string);
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function getUserByApiKey(apiKey: string) {
  const walletAddress = await redis.get(`apikey:${apiKey}`);
  if (!walletAddress) return null;
  return getUser(walletAddress as string);
}

// Membership and subscription functions
export async function activateSubscription(walletAddress: string) {
  // Set expiration to 30 days from now
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  
  const user = await getUser(walletAddress);
  if (!user) return null;
  
  // Generate API key if not exists
  let apiKey = user.apiKey;
  if (!apiKey) {
    apiKey = generateApiKey();
    await redis.set(`apikey:${apiKey}`, walletAddress);
  }
  
  const updatedUser = {
    ...user,
    membershipStatus: 'active',
    subscriptionExpiration: expirationDate.toISOString(),
    apiKey,
  };
  
  await redis.set(`user:${walletAddress}`, JSON.stringify(updatedUser));
  return updatedUser;
}

// RPC management functions
export async function storeRpcMapping(walletAddress: string, originalRpc: string, httpsRpc: string, wssRpc: string) {
  const user = await getUser(walletAddress);
  if (!user) {
    // Create a new user if they don't exist
    await createUser(walletAddress);
    const newUser = await getUser(walletAddress);
    if (!newUser) return null;
    
    // Add the new RPC mapping to the user's list
    const rpcEndpoints = [];
    rpcEndpoints.push({
      originalRpc,
      httpsRpc,
      wssRpc,
      createdAt: new Date().toISOString(),
    });
    
    const updatedUser = {
      ...newUser,
      rpcEndpoints,
    };
    
    await redis.set(`user:${walletAddress}`, JSON.stringify(updatedUser));
    return updatedUser;
  }
  
  // Add the new RPC mapping to the user's list
  const rpcEndpoints = user.rpcEndpoints || [];
  rpcEndpoints.push({
    originalRpc,
    httpsRpc,
    wssRpc,
    createdAt: new Date().toISOString(),
  });
  
  const updatedUser = {
    ...user,
    rpcEndpoints,
  };
  
  await redis.set(`user:${walletAddress}`, JSON.stringify(updatedUser));
  return updatedUser;
}

// Get user's RPC endpoints
export async function getUserRpcEndpoints(walletAddress: string) {
  const user = await getUser(walletAddress);
  if (!user) return [];
  
  return user.rpcEndpoints || [];
}

// API key management
export function generateApiKey() {
  // Generate a random string for API key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = '';
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return apiKey;
}

export async function regenerateApiKey(walletAddress: string) {
  const user = await getUser(walletAddress);
  if (!user) return null;
  
  // Delete old API key mapping if exists
  if (user.apiKey) {
    await redis.del(`apikey:${user.apiKey}`);
  }
  
  // Generate new API key
  const newApiKey = generateApiKey();
  await redis.set(`apikey:${newApiKey}`, walletAddress);
  
  const updatedUser = {
    ...user,
    apiKey: newApiKey,
  };
  
  await redis.set(`user:${walletAddress}`, JSON.stringify(updatedUser));
  return updatedUser;
}

// Utility function to generate DarkNode RPC URLs
export function generateDarkNodeRpcUrls(apiKey: string) {
  // Generate a random string for the RPC subdomain
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 8; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return {
    https: `https://rpc-${randomString}.darknode.pro/?api_key=${apiKey}`,
    wss: `wss://rpc-${randomString}.darknode.pro/?api_key=${apiKey}`,
  };
}
