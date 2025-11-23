import { create } from "zustand";

interface BiometricData {
  embeddings: number[];
  confidence: number; // Added confidence
  timestamp: number; // Added timestamp
}

interface ProfileData {
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  [key: string]: unknown; // Changed 'any' to 'unknown'
}

interface VerificationResult {
  authenticate: boolean;
  profile?: ProfileData;
  timestamp: number;
}

interface NFTRegistrationState {
  registrationData: {
    walletAddress: string | null;
    message: string | null;
    signature: string | null;
    biometricData: BiometricData | null;
    profile: ProfileData | null;
    verificationResult: VerificationResult | null; // Added verificationResult
  };
  updateRegistrationData: (
    data: Partial<NFTRegistrationState["registrationData"]>
  ) => void;
  resetRegistrationData: () => void;
}

export const useNFTRegistrationStore = create<NFTRegistrationState>((set) => ({
  registrationData: {
    walletAddress: null,
    message: null,
    signature: null,
    biometricData: null,
    profile: null,
    verificationResult: null, // Initialize verificationResult
  },
  updateRegistrationData: (data) =>
    set((state) => ({
      registrationData: { ...state.registrationData, ...data },
    })),
  resetRegistrationData: () =>
    set(() => ({
      registrationData: {
        walletAddress: null,
        message: null,
        signature: null,
        biometricData: null,
        profile: null,
        verificationResult: null, // Reset verificationResult
      },
    })),
}));
