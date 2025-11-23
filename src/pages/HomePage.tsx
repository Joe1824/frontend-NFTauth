/**
 * NFTAuth - Decentralized Identity Authentication Gateway
 * Main authentication flow orchestration
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import WalletConnectButton from "@/components/WalletConnectButton";
import SignMessageCard from "@/components/SignMessageCard";
import LivenessCheck from "@/components/LivenessCheck";
import SubmitAuthCard from "@/components/SubmitAuthCard";
import AuthResultCard from "@/components/AuthResultCard";
import {
  connectWallet,
  signMessage,
  onAccountsChanged,
  removeListeners,
} from "@/utils/walletUtils";

import { generateNonce, createAuthMessage } from "@/utils/embeddingMock";
import { useToast } from "@/hooks/use-toast";
import { AuthResponse } from "@/utils/api";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";

export default function HomePage() {
  // URL Query Parameters
  const [requireProfile, setRequireProfile] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Authentication State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [authResult, setAuthResult] = useState<AuthResponse | null>(null);

  // Loading States
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors
  const [signError, setSignError] = useState<string | null>(null);

  const { toast } = useToast();

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profileParam = params.get("requireProfile");
    const redirectParam = params.get("redirect");

    setRequireProfile(profileParam === "true");
    setRedirectUrl(redirectParam);

    console.log("🔗 NFTAuth initialized:", {
      requireProfile: profileParam === "true",
      redirectUrl: redirectParam,
    });
  }, []);

  // Listen to wallet account changes
  useEffect(() => {
    onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        setWalletAddress(null);
        setSignature(null);
        setEmbedding(null);
        toast({
          title: "Wallet Disconnected",
          description: "Please reconnect your wallet",
          variant: "destructive",
        });
      } else if (accounts[0] !== walletAddress) {
        setWalletAddress(accounts[0]);
        setSignature(null);
        setEmbedding(null);
      }
    });

    return () => removeListeners();
  }, [walletAddress, toast]);

  // Generate message when wallet connects
  useEffect(() => {
    if (walletAddress && !message) {
      const nonce = generateNonce();
      const authMessage = createAuthMessage(nonce);
      setMessage(authMessage);

      // Store message in global state
      const { updateRegistrationData } = useNFTRegistrationStore.getState();
      updateRegistrationData({ message: authMessage });
    }
  }, [walletAddress, message]);

  // Auto-submit disabled - user must click submit button manually
  // This prevents immediate network errors and gives users control

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setSignError(null);

    try {
      const address = await connectWallet();
      setWalletAddress(address);

      // Store in global state
      const { updateRegistrationData } = useNFTRegistrationStore.getState();
      updateRegistrationData({ walletAddress: address });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(
          0,
          6
        )}...${address.substring(address.length - 4)}`,
      });
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle message signing
  const handleSignMessage = async () => {
    if (!walletAddress || !message) return;

    setIsSigning(true);
    setSignError(null);

    try {
      const sig = await signMessage(message, walletAddress);
      setSignature(sig);

      // Store signature in global state
      const { updateRegistrationData } = useNFTRegistrationStore.getState();
      updateRegistrationData({ signature: sig });

      toast({
        title: "Message Signed",
        description: "Signature captured successfully",
      });
    } catch (error: unknown) {
      console.error("Signing error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setSignError(errorMessage);
      toast({
        title: "Signing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  // Handle embedding generation
  const handleEmbeddingGenerated = (embeddingData: number[]) => {
    setEmbedding(embeddingData);

    // Store embedding in global state (already done in LivenessCheck component)
    // But ensure it's updated here as well if needed

    toast({
      title: "Biometric Captured",
      description: "Liveness verification successful",
    });
  };

  // Handle verification complete from SubmitAuthCard
  const handleVerificationComplete = (response: AuthResponse) => {
    setAuthResult(response);

    if (response.authenticated) {
      toast({
        title: "Verification Successful",
        description: "Your identity has been verified",
      });

      // Redirect to URL with response data
      if (redirectUrl) {
        const url = new URL(redirectUrl);
        url.searchParams.set("authenticate", response.authenticated.toString());
        if (response.profile) {
          url.searchParams.set("profile", JSON.stringify(response.profile));
        }
        if(walletAddress) {
          url.searchParams.set("walletAddress", walletAddress);
        }

        window.location.href = url.toString();
      }
    } else {
      toast({
        title: "Verification Failed",
        description: "Verification failed",
        variant: "destructive",
      });
    }
  };

  // Handle return to app
  const handleReturnToApp = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.03),rgba(255,255,255,0))]" />

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg shadow-slate-200/50 mb-6">
            <Shield className="w-10 h-10 text-slate-700" />
          </div>

          <h1 className="text-5xl md:text-7xl font-light mb-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            NFTAuth
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            Decentralized Identity Authentication
          </p>

          {requireProfile && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/20 rounded-full text-sm text-slate-700 font-medium shadow-sm">
              <Sparkles className="w-4 h-4" />
              Profile verification required
            </div>
          )}
        </motion.div>

        {/* Authentication Flow */}
        <div className="max-w-3xl mx-auto space-y-8">
          {!authResult && (
            <>
              <WalletConnectButton
                walletAddress={walletAddress}
                isConnecting={isConnecting}
                onConnect={handleConnectWallet}
              />

              <SignMessageCard
                message={message}
                signature={signature}
                isSigning={isSigning}
                error={signError}
                onSign={handleSignMessage}
                disabled={!walletAddress}
              />

              <LivenessCheck
                embedding={embedding}
                onEmbeddingGenerated={handleEmbeddingGenerated}
                disabled={!signature}
              />

              {walletAddress && message && signature && embedding && (
                <SubmitAuthCard
                  isSubmitting={isSubmitting}
                  onVerificationComplete={handleVerificationComplete}
                  requireProfile={requireProfile}
                  setIsSubmitting={setIsSubmitting}
                />
              )}
            </>
          )}

          {authResult && (
            <AuthResultCard
              result={authResult}
              isSubmitting={false}
              redirectUrl={redirectUrl}
              onReturnToApp={handleReturnToApp}
            />
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16 text-sm text-slate-500"
        >
          <p>Powered by Blockchain • Secured by Biometrics</p>
        </motion.div>
      </div>
    </div>
  );
}
