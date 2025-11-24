import { motion } from "framer-motion";
import { CheckCircle, XCircle, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthResponse } from "@/utils/api";

interface AuthResultCardProps {
  result: AuthResponse | null;
  isSubmitting: boolean;
  redirectUrl: string | null;
  onReturnToApp: () => void;
}

export default function AuthResultCard({
  result,
  isSubmitting,
  redirectUrl,
  onReturnToApp,
}: AuthResultCardProps) {
  console.log("[AuthResultCard] render", { result, isSubmitting, redirectUrl });

  if (isSubmitting) {
    return (
      <div className="w-full">
        <div className="card text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-neutral-700" />
          <h3 className="text-lg font-semibold">Verifying…</h3>
          <p className="small-muted">Authenticating with backend</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isSuccess = Boolean(result.authenticated);
  const hasProfile = Boolean(result.profile && Object.keys(result.profile).length > 0);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <div className={`card text-center ${isSuccess ? "" : ""}`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isSuccess ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
          {isSuccess ? <CheckCircle className="w-8 h-8 text-emerald-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
        </div>

        <h3 className={`text-xl font-semibold mb-2 ${isSuccess ? "text-emerald-700" : "text-red-700"}`}>
          {isSuccess ? "Authentication Successful" : "Authentication Failed"}
        </h3>

        {isSuccess ? <p className="small-muted mb-4">Your identity has been verified.</p> : <p className="small-muted text-red-600 mb-4">Unable to verify identity.</p>}

        {isSuccess && hasProfile && result.profile && (
          <div className="card-ghost mb-4 text-left">
            <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-neutral-700" /><div className="font-medium text-sm">Profile Shared</div></div>
            <div className="space-y-2 text-sm">
              {Object.entries(result.profile).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-neutral-600 capitalize">{k}</span>
                  <span className="font-medium text-neutral-900">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSuccess && redirectUrl && (
          <Button onClick={() => { console.log("[AuthResultCard] return to app"); onReturnToApp(); }} className="btn-primary w-full">
            Return to App <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
