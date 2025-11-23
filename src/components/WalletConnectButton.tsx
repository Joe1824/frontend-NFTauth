/**
 * Wallet Connect Button Component
 * Handles MetaMask wallet connection with clean UI
 */

import { Wallet, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/utils/walletUtils";

interface WalletConnectButtonProps {
  walletAddress: string | null;
  isConnecting: boolean;
  onConnect: () => void;
}

export default function WalletConnectButton({
  walletAddress,
  isConnecting,
  onConnect,
}: WalletConnectButtonProps) {
  return (
    <div className="w-full">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100/80 border border-slate-200/50">
            <Wallet className="w-6 h-6 text-slate-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-slate-800">
              Connect Wallet
            </h2>
            <p className="text-sm text-slate-500">Step 1 of 4</p>
          </div>
          {walletAddress && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {walletAddress ? (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Connected Address
            </p>
            <p className="font-mono text-sm font-medium text-slate-800">
              {formatAddress(walletAddress)}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              Connect your MetaMask wallet to begin authentication
            </p>
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
