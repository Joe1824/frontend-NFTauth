/**
 * Sign Message Card Component
 * Handles message signing with MetaMask
 */

import { PenLine, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignMessageCardProps {
  message: string;
  signature: string | null;
  isSigning: boolean;
  error: string | null;
  onSign: () => void;
  disabled: boolean;
}

export default function SignMessageCard({
  message,
  signature,
  isSigning,
  error,
  onSign,
  disabled,
}: SignMessageCardProps) {
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
                : "bg-blue-50/80 border-blue-200/50"
            }`}
          >
            <PenLine
              className={`w-6 h-6 ${
                disabled ? "text-slate-400" : "text-blue-600"
              }`}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-slate-800">Sign Message</h2>
            <p className="text-sm text-slate-500">Step 2 of 4</p>
          </div>
          {signature && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {signature ? (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Signature
            </p>
            <p className="font-mono text-sm font-medium text-slate-800 truncate">
              {signature.substring(0, 40)}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                Message
              </p>
              <p className="font-mono text-sm text-slate-700 break-all leading-relaxed">
                {message}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50/80 border border-red-200/50">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              onClick={onSign}
              disabled={disabled || isSigning}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-200/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSigning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <PenLine className="w-5 h-5 mr-2" />
                  Sign with MetaMask
                </>
              )}
            </Button>

            {disabled && (
              <p className="text-xs text-center text-slate-400">
                Complete step 1 first
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
