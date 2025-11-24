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
  console.log("[SignMessageCard] render", { signature, isSigning, disabled, error });

  const handleSign = () => {
    console.log("[SignMessageCard] sign clicked");
    try {
      onSign();
    } catch (err) {
      console.error("[SignMessageCard] onSign error:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${disabled ? "bg-neutral-50 border-neutral-100" : "bg-white border-neutral-200"}`}>
            <PenLine className="w-6 h-6 text-neutral-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Sign Message</h3>
            <p className="small-muted">Step 2 of 4</p>
          </div>
          {signature && (
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {signature ? (
          <div className="card-ghost">
            <div className="small-muted uppercase text-xs mb-1">Signature</div>
            <div className="mono text-sm text-neutral-900 truncate">{signature.slice(0, 60)}{signature.length > 60 ? "…" : ""}</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="card-ghost">
              <div className="small-muted uppercase text-xs mb-1">Message</div>
              <div className="mono text-sm text-neutral-800 break-words">{message}</div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            <Button onClick={handleSign} disabled={disabled || isSigning} className="btn-primary w-full">
              {isSigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <PenLine className="w-4 h-4 mr-2" />
                  Sign with MetaMask
                </>
              )}
            </Button>

            {disabled && <div className="small-muted text-center">Connect wallet first</div>}
          </div>
        )}
      </div>
    </div>
  );
}
