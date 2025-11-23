/**
 * Submit Authentication Card
 * Final step to submit authentication payload to backend
 */

import { Send, Loader2, Info } from "lucide-react";
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

  // Prepare full backend payload with all data including embedding
  const payload = {
    walletAddress: registrationData.walletAddress,
    message: registrationData.message,
    signature: registrationData.signature,
    embedding: registrationData.biometricData?.embeddings,
    requireProfile: requireProfile,
  };

  const allStepsComplete =
    payload.walletAddress &&
    payload.signature &&
    payload.message &&
    payload.embedding;

  const handleFinalSubmit = async () => {
    setError(null);
    if (!allStepsComplete) {
      setError("Some steps are incomplete. Please verify all sections first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyAuth(payload as AuthPayload);
      onVerificationComplete(response);
    } catch (err) {
      console.error("❌ Verification Error:", err);
      setError("Failed to verify authentication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full">
      <div className="bg-emerald-50/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-200/50 shadow-xl shadow-emerald-200/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200/50">
            <Send className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-slate-800">
              Ready to Submit
            </h2>
            <p className="text-sm text-slate-500">Step 4 of 4</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/50">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">
              All steps completed. Submit to authenticate with the backend
              server.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/50 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Wallet</span>
              <span className="text-emerald-600 font-medium">
                {registrationData.walletAddress
                  ? "✓ Connected"
                  : "not connected"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Signature</span>
              <span className="text-emerald-600 font-medium">
                {registrationData.signature ? "✓ Signed" : "not signed"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Biometric</span>
              <span className="text-emerald-600 font-medium">
                {registrationData.biometricData &&
                registrationData.biometricData.embeddings
                  ? "✓ generated"
                  : "not generated"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Profile</span>
              <span className="text-slate-700 font-medium">
                {requireProfile ? "Required" : "Not Required"}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive text-center mt-2">
              {error}
            </div>
          )}

          <Button
            onClick={handleFinalSubmit}
            disabled={isSubmitting || !allStepsComplete}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Authentication
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
