import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";
import { verifyAuth, AuthPayload, AuthResponse } from "@/utils/api";
import { useState } from "react";

interface SubmitAuthCardProps {
  isSubmitting: boolean;
  onVerificationComplete: (result: AuthResponse) => void;
  requireProfile: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export default function SubmitAuthCard({
  isSubmitting,
  onVerificationComplete,
  requireProfile,
  setIsSubmitting,
}: SubmitAuthCardProps) {
  const { registrationData } = useNFTRegistrationStore();
  const [error, setError] = useState<string | null>(null);

  const payload = {
    walletAddress: registrationData.walletAddress,
    message: registrationData.message,
    signature: registrationData.signature,
    embedding: registrationData.biometricData?.embeddings,
    requireProfile: requireProfile,
  };

  console.log("[SubmitAuthCard] payload preview:", {
    wallet: payload.walletAddress,
    hasSignature: Boolean(payload.signature),
    embeddingLen: Array.isArray(payload.embedding) ? payload.embedding.length : 0,
    requireProfile,
  });

  const allStepsComplete =
    Boolean(payload.walletAddress) &&
    Boolean(payload.signature) &&
    Boolean(payload.message) &&
    Array.isArray(payload.embedding) &&
    payload.embedding.length > 0;

  const handleFinalSubmit = async () => {
    setError(null);
    if (!allStepsComplete) {
      setError("Some steps are incomplete. Please complete all steps first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyAuth(payload as AuthPayload);
      console.log("[SubmitAuthCard] verifyAuth response:", response);
      onVerificationComplete(response);
    } catch (err) {
      console.error("[SubmitAuthCard] verification failed:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Send className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Ready to Submit</h3>
            <p className="small-muted">Step 4 of 4</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <p className="small-muted">All steps completed — submit to authenticate with backend</p>
          </div>

          <div className="card-ghost space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-700">Wallet</span>
              <span className="text-emerald-600 font-medium">{registrationData.walletAddress ? "✓ Connected" : "Not connected"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-700">Signature</span>
              <span className="text-emerald-600 font-medium">{registrationData.signature ? "✓ Signed" : "Not signed"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-700">Biometric</span>
              <span className="text-emerald-600 font-medium">{registrationData.biometricData?.embeddings ? "✓ Generated" : "Not generated"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-700">Profile</span>
              <span className="text-neutral-800 font-medium">{requireProfile ? "Required" : "Not required"}</span>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 text-center">{error}</div>}

          <Button onClick={handleFinalSubmit} disabled={isSubmitting || !allStepsComplete} className="btn-primary w-full">
            {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>) : (<><Send className="w-4 h-4 mr-2" /> Submit Authentication</>)}
          </Button>
        </div>
      </div>
    </div>
  );
}
