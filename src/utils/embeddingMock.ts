/**
 * Mock Biometric Embedding Generator
 * In production, this will be replaced with actual AI model endpoint
 */

// Generate a mock facial embedding array (512 dimensions typical for face recognition)
export const generateMockEmbedding = (): number[] => {
  const dimensions = 128; // Using 128 dimensions for mock (real models use 128-512)
  const embedding: number[] = [];
  
  for (let i = 0; i < dimensions; i++) {
    // Generate random float between -1 and 1 (typical embedding range)
    embedding.push(Math.random() * 2 - 1);
  }
  
  return embedding;
};

// Simulate AI liveness check delay
export const simulateLivenessCheck = async (durationMs: number = 3000): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% success rate for mock
      const success = Math.random() > 0.05;
      resolve(success);
    }, durationMs);
  });
};

// Generate unique nonce for message signing
export const generateNonce = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Create authentication message
export const createAuthMessage = (nonce: string): string => {
  const timestamp = new Date().toISOString();
  return `Authenticating with NFTAuth: nonce:${nonce}:${timestamp}`;
};
