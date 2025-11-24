/**
 * AI Liveness Check Component
 * Real biometric verification via API
 */

import React, { useState, useEffect } from "react";
import { Camera as CameraIcon, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";

interface LivenessCheckProps {
  embedding: number[] | null;
  onEmbeddingGenerated: (embedding: number[]) => void;
  disabled: boolean;
}

type CheckStep = "idle" | "processing" | "complete";

export default function LivenessCheck({
  embedding,
  onEmbeddingGenerated,
  disabled,
}: LivenessCheckProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const startLivenessCheck = async () => {
    try {
      setIsChecking(true);

      setError(null);

      // Call the API
      const response = await fetch(
        `${import.meta.env.VITE_BIOMETRIC_API_URL}/start-liveness`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (/live.*verified/i.test(data.result.verdict)) {
          // Successful liveness
          const realEmbedding = data.result.meta.embedding;
          onEmbeddingGenerated(realEmbedding);

          // Store embedding in global state
          const { updateRegistrationData } = useNFTRegistrationStore.getState();
          updateRegistrationData({
            biometricData: {
              embeddings: realEmbedding,
              confidence: data.result.avg_live,
              timestamp: data.result.meta.timestamp,
            },
          });

          setCurrentStep("complete");
        } else if (/spoof/i.test(data.result.verdict)) {
          // Spoof detected
          setError("Spoof detected. Please try again with a real face.");
          setCurrentStep("idle");
        } else {
          throw new Error("Unexpected verdict from API");
        }
      } else {
        throw new Error("API returned success: false");
      }
    } catch (err) {
      console.error("Liveness check failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during liveness check."
      );
      setCurrentStep("idle");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (currentStep === "complete") {
      const timer = setTimeout(() => setCurrentStep("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="w-full">
      <div
        className={`bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-slate-200/20 transition-all duration-300 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-colors ${
              disabled
                ? "bg-slate-100/50 border-slate-200/30"
                : "bg-emerald-50/80 border-emerald-200/50"
            }`}
          >
            <CameraIcon
              className={`w-6 h-6 ${
                disabled ? "text-slate-400" : "text-emerald-600"
              }`}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-slate-800">
              Liveness Check
            </h2>
            <p className="text-sm text-slate-500">Step 3 of 4</p>
          </div>
          {embedding && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {embedding ? (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Biometric Embedding
            </p>
            <p className="font-mono text-sm font-medium text-slate-800">
              [...]
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Static Camera Card */}
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/50 flex items-center justify-center">
              <div className="text-center">
                <CameraIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 leading-relaxed">
                  We'll verify your identity using your device camera
                </p>
              </div>
            </div>

            <Button
              onClick={startLivenessCheck}
              disabled={disabled || isChecking}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CameraIcon className="w-5 h-5 mr-2" />
                  Capture
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {disabled && (
              <p className="text-xs text-center text-slate-400">
                Complete step 2 first
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
