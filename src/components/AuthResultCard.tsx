/**
 * Authentication Result Display Component
 * Shows success/error state after backend verification
 */

import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  User,
  ArrowRight,
  Loader2,
  Server,
} from "lucide-react";
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
  if (isSubmitting) {
    return (
      <div className="w-full">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/20 shadow-xl shadow-slate-200/20">
          <Loader2 className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-medium text-slate-800 mb-2">
            Verifying...
          </h2>
          <p className="text-sm text-slate-500">Authenticating with backend</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isSuccess = result.authenticated;
  const hasProfile = result.profile && Object.keys(result.profile).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div
        className={`bg-white/70 backdrop-blur-xl rounded-3xl p-8 text-center border shadow-xl shadow-slate-200/20 ${
          isSuccess ? "border-emerald-200/50" : "border-red-200/50"
        }`}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isSuccess
              ? "bg-emerald-100 border border-emerald-200"
              : "bg-red-100 border border-red-200"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </motion.div>

        {/* Title & Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className={`text-2xl font-bold mb-2 ${
              isSuccess ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {isSuccess ? "Authentication Successful" : "Authentication Failed"}
          </h2>

          {isSuccess ? (
            <p className="text-slate-600 mb-6">
              Your identity has been verified
            </p>
          ) : (
            <div className="space-y-3 mb-6">
              <p className="text-red-700">Authentication failed</p>

              {/* Backend setup hint */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 text-left">
                <div className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-slate-800 mb-1">
                      Backend Not Running
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      The authentication backend server is not available at{" "}
                      
                      <br />
                      Please start the backend server to complete
                      authentication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Profile Data (if available) */}
        {isSuccess && hasProfile && result.profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-slate-600" />
                <h3 className="font-medium text-sm text-slate-800">
                  Profile Shared
                </h3>
              </div>
              <div className="space-y-2 text-left text-sm">
                {Object.entries(result.profile).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-slate-600 capitalize">{key}:</span>
                    <span className="font-medium text-slate-800">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        {isSuccess && redirectUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={onReturnToApp}
              className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.02]"
            >
              Return to App
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
