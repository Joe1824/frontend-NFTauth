/**
 * API Integration for Backend Communication
 * Handles authentication payload submission
 */

import axios, { AxiosInstance, AxiosError } from "axios";

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error("❌ Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface AuthPayload {
  walletAddress: string;
  signature: string;
  message: string;
  embedding: number[];
  requireProfile: boolean;
}

export interface AuthResponse {
  authenticated: boolean;
  profile?: {
    [key: string]: unknown;
  };
}

// Submit authentication payload to backend
export const authenticateUser = async (
  payload: AuthPayload
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      "http://localhost:5000/api/verify",
      payload
    );
    return response.data;
  } catch (error: unknown) {
    // Handle different error scenarios
    if (axios.isAxiosError(error) && error.response) {
      // Server responded with error
      return {
        authenticated: false,
      };
    } else if (axios.isAxiosError(error) && error.request) {
      // Request made but no response
      return {
        authenticated: false,
      };
    } else if (error instanceof Error) {
      // Something else happened
      return {
        authenticated: false,
      };
    }
    return {
      authenticated: false,
    };
  }
};

// Verify authentication payload with backend
export const verifyAuth = async (
  payload: AuthPayload
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/api/verify", payload);
    return response.data;
  } catch (error: unknown) {
    // Handle different error scenarios
    if (axios.isAxiosError(error) && error.response) {
      // Server responded with error
      return {
        authenticated: false,
      };
    } else if (axios.isAxiosError(error) && error.request) {
      // Request made but no response
      return {
        authenticated: false,
      };
    } else if (error instanceof Error) {
      // Something else happened
      return {
        authenticated: false,
      };
    }
    return {
      authenticated: false,
    };
  }
};

export default api;
