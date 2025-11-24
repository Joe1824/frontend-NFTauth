// HomePage.tsx (FINAL UPDATED – All props fixed, no TS errors)

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

// Redirect whitelist (security rule)
const REDIRECT_WHITELIST = [
  window.location.origin,
  "https://web3-app-demo.vercel.app",
];

const isRedirectAllowed = (raw: string | null) => {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return REDIRECT_WHITELIST.includes(u.origin);
  } catch {
    return false;
  }
};

// debug hash helper
const shortHash = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h).toString(36).slice(0, 8)}`;
};

export default function HomePage() {
  const [requireProfile, setRequireProfile] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);
  const [embedding, setEmbedding] = useState<number[] | null>(null);

  const [authResult, setAuthResult] = useState<AuthResponse | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [signError, setSignError] = useState<string | null>(null);

  const { toast } = useToast();

  // Read URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const profileParam = params.get("requireProfile");
    const redirectParam = params.get("redirect");

    setRequireProfile(profileParam === "true");
    setRedirectUrl(redirectParam);

    console.log("[HomePage] init:", {
      requireProfile: profileParam,
      redirectParam,
    });

    if (redirectParam && !isRedirectAllowed(redirectParam)) {
      console.warn(
        "[HomePage] redirect blocked (not whitelisted):",
        redirectParam
      );
    }
  }, []);

  // Wallet account change listener
  useEffect(() => {
    onAccountsChanged((accounts) => {
      console.log("[HomePage] accounts changed:", accounts);

      if (accounts.length === 0) {
        setWalletAddress(null);
        setSignature(null);
        setEmbedding(null);
        toast({
          title: "Wallet Disconnected",
          description: "Reconnect your wallet",
          variant: "destructive",
        });
      } else if (accounts[0] !== walletAddress) {
        setWalletAddress(accounts[0]);
        setSignature(null);
        setEmbedding(null);
      }
    });

    return () => removeListeners();
  }, [walletAddress]);

  // Generate message when wallet connects
  useEffect(() => {
    if (walletAddress && !message) {
      const nonce = generateNonce();
      const authMessage = createAuthMessage(nonce);

      setMessage(authMessage);

      sessionStorage.setItem("nftauth_nonce", nonce);
      sessionStorage.setItem("nftauth_message", authMessage);

      const { updateRegistrationData } = useNFTRegistrationStore.getState();
      updateRegistrationData({ message: authMessage });

      console.log("[HomePage] Message generated:", shortHash(authMessage));
    }
  }, [walletAddress, message]);

  // Connect wallet
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setSignError(null);

    try {
      const address = await connectWallet();
      const normalized = address?.toLowerCase() ?? null;
      setWalletAddress(normalized);

      useNFTRegistrationStore.getState().updateRegistrationData({
        walletAddress: normalized,
      });

      toast({
        title: "Wallet Connected",
        description: `${normalized?.slice(0, 6)}...${normalized?.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign message
  const handleSignMessage = async () => {
    if (!walletAddress || !message) return;

    setIsSigning(true);
    setSignError(null);

    try {
      const sig = await signMessage(message, walletAddress);
      setSignature(sig);

      useNFTRegistrationStore.getState().updateRegistrationData({
        signature: sig,
      });

      toast({
        title: "Message Signed",
        description: "Successfully signed",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setSignError(errorMessage);
      toast({
        title: "Sign Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  // Embedding generated from liveness
  const handleEmbeddingGenerated = (embeddingData: number[]) => {
    setEmbedding(embeddingData);

    const hash = shortHash(JSON.stringify(embeddingData.slice(0, 8)));

    console.log(
      `[HomePage] embedding generated -> len=${embeddingData.length}, hash=${hash}`
    );

    toast({
      title: "Biometric Captured",
      description: "Liveness verification successful",
    });
  };

  // Verification completion
  const handleVerificationComplete = (response: AuthResponse) => {
    setAuthResult(response);

    // Update store with verification result
    const { updateRegistrationData } = useNFTRegistrationStore.getState();
    updateRegistrationData({
      verificationResult: {
        authenticate: response.authenticated,
        profile: response.profile,
        timestamp: Date.now(),
      },
    });

    if (response.authenticated) {
      toast({ title: "Success", description: "Identity verified" });

      if (redirectUrl && isRedirectAllowed(redirectUrl)) {
        const url = new URL(redirectUrl);

        url.searchParams.set("authenticate", "true");
        if (walletAddress) url.searchParams.set("walletAddress", walletAddress);

        if (response.profile) {
          const safeProfile: Record<string, unknown> = {};
          ["name", "gender", "dob", "mobile"].forEach((k) => {
            if (response.profile[k]) safeProfile[k] = response.profile[k];
          });

          url.searchParams.set(
            "profile",
            encodeURIComponent(JSON.stringify(safeProfile))
          );
        }

        console.log("[HomePage] Redirecting to:", url.toString());
        window.location.href = url.toString();
      }
    } else {
      toast({
        title: "Verification Failed",
        description: "Identity verification failed",
        variant: "destructive",
      });
    }
  };

  // Return to app
  const handleReturnToApp = () => {
    if (redirectUrl && isRedirectAllowed(redirectUrl)) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 to-transparent opacity-60" />
      </div>

      <div className="relative container mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-sm mb-6">
            <Shield className="w-10 h-10 text-slate-700" />
          </div>

          <h1 className="text-4xl md:text-6xl font-extralight text-slate-800">
            NFTAuth
          </h1>

          <p className="text-lg text-slate-600 mt-2">
            Decentralized identity authentication — secure, simple, private.
          </p>

          {requireProfile && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-full mt-4 text-sm text-slate-700 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Profile verification required
            </div>
          )}
        </motion.div>

        {/* Flow */}
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
                  requireProfile={requireProfile}
                  onVerificationComplete={handleVerificationComplete}
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

        <div className="text-center mt-16 text-sm text-slate-500">
          Powered by Blockchain • Secured by Biometrics
        </div>
      </div>
    </div>
  );
}
