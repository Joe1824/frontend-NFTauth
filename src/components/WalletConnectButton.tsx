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
  console.log("[WalletConnectButton] render", { walletAddress, isConnecting });

  const handleConnect = () => {
    console.log("[WalletConnectButton] connect clicked");
    try {
      onConnect();
    } catch (err) {
      console.error("[WalletConnectButton] onConnect threw:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
            <Wallet className="w-6 h-6 text-neutral-700" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold">Connect Wallet</h3>
            <p className="small-muted">Step 1 of 4</p>
          </div>

          {walletAddress && (
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {walletAddress ? (
          <div className="card-ghost">
            <div className="small-muted uppercase text-xs mb-1">Connected</div>
            <div className="flex items-center justify-between">
              <div className="mono text-sm text-neutral-900">{formatAddress(walletAddress)}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-neutral-700">
              Use MetaMask to connect — we only read your wallet address for authentication.
            </p>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn-primary w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
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
