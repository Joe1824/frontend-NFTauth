// Improved LivenessCheck.tsx — modern clean UI, added debug logs, safer handling

import React, { useState, useEffect } from "react";
import { Camera as CameraIcon, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";

interface LivenessCheckProps {
  embedding: number[] | null;
  onEmbeddingGenerated: (embedding: number[]) => void;
  disabled: boolean;
}

type CheckStep = "idle" | "processing" | "complete";

export default function LivenessCheck({ embedding, onEmbeddingGenerated, disabled }: LivenessCheckProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const startLivenessCheck = async () => {
    console.log("[Liveness] Starting API call...");

    try {
      setIsChecking(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_BIOMETRIC_API_URL}/start-liveness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status}`);

      const data = await response.json();
      console.log("[Liveness] API Response:", data);

      if (!data.success) throw new Error("API returned success: false");

      const verdict: string = data.result?.verdict || "";
      const meta = data.result?.meta;

      if (!meta) throw new Error("Something went wrong! Please Try again later.");

      if (/live/i.test(verdict)) {
        const realEmbedding = Array.isArray(meta.embedding) ? meta.embedding : [];

        console.log("[Liveness] Live verified. Embedding length:", realEmbedding.length);

        onEmbeddingGenerated(realEmbedding);

        const { updateRegistrationData } = useNFTRegistrationStore.getState();
        updateRegistrationData({
          biometricData: {
            embeddings: realEmbedding,
            confidence: data.result.avg_live,
            timestamp: meta.timestamp,
          },
        });

        setCurrentStep("complete");
      } else if (/spoof/i.test(verdict)) {
        console.warn("[Liveness] Spoof detected");
        setError("Spoof detected. Please try again with a real face.");
        setCurrentStep("idle");
      } else {
        throw new Error("Something went wrong! Try again later.");
      }
    } catch (err) {
      console.error("[Liveness] Error:", err);
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
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
        className={`rounded-3xl p-8 border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl border ${
              disabled ? "bg-neutral-100 border-neutral-200" : "bg-emerald-50 border-emerald-200"
            }`}
          >
            <CameraIcon className={`w-6 h-6 ${disabled ? "text-neutral-400" : "text-emerald-600"}`} />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900">Liveness Check</h2>
            <p className="text-sm text-neutral-500">Step 3 of 4</p>
          </div>

          {embedding && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {/* Embedding View */}
        {embedding ? (
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wide">Biometric Embedding</p>
            <p className="font-mono text-sm text-neutral-800">[...]</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video bg-neutral-100 rounded-2xl border border-neutral-200 flex items-center justify-center">
              <div className="text-center">
                <CameraIcon className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                <p className="text-neutral-600">We'll verify your identity using your device camera</p>
              </div>
            </div>

            <Button
              onClick={startLivenessCheck}
              disabled={disabled || isChecking}
              className="w-full h-12 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CameraIcon className="w-5 h-5 mr-2" /> Capture
                </>
              )}
            </Button>

            {/* Recapture Button */}
            <Button
              onClick={() => {
                console.log("[Liveness] User clicked Re‑capture");
                setError(null);
                setCurrentStep("idle");
                onEmbeddingGenerated([]);
              }}
              disabled={isChecking || disabled}
              className="w-full h-12 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-2xl transition-all duration-200 hover:shadow-md hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Re‑capture
            </Button>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {disabled && <p className="text-xs text-center text-neutral-400">Complete step 2 first</p>}
          </div>
        )}
      </div>
    </div>
  );
}
