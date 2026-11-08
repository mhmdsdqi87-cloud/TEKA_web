"use client";

/**
 * Wallet panel — honest Web3 UX.
 * - Connects via EIP-1193 (MetaMask & compatible injected providers)
 * - Handles: no provider, user rejection, unsupported chains
 * - Always labels the published contract as TESTNET (Sepolia)
 * - Never claims a mainnet deployment (none exists)
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { TOKEN } from "@/lib/teka/config";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Copy, Check, Wallet, Unplug, TriangleAlert, Network, BadgeCheck, ExternalLink, Coins } from "lucide-react";

type WalletState = {
  address: string | null;
  chainId: string | null;
  connecting: boolean;
};

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  return eth ?? null;
}

/** Read injected-provider availability as an external system (SSR-safe, no effect setState). */
function subscribeToProvider(_onChange: () => void) {
  // Provider injection can happen after load; re-check on window load + focus.
  const handler = () => _onChange();
  window.addEventListener("load", handler);
  window.addEventListener("focus", handler);
  return () => {
    window.removeEventListener("load", handler);
    window.removeEventListener("focus", handler);
  };
}

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletPanel() {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletState>({ address: null, chainId: null, connecting: false });
  const [copied, setCopied] = useState(false);
  const hasProvider = useSyncExternalStore(subscribeToProvider, () => !!getProvider(), () => null);

  const isSepolia = wallet.chainId === TOKEN.testnet.chainIdHex.toLowerCase();

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    // Silent initial read (no popup)
    provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list?.length) setWallet((w) => ({ ...w, address: list[0] }));
      })
      .catch(() => undefined);
    provider
      .request({ method: "eth_chainId" })
      .then((chainId) => setWallet((w) => ({ ...w, chainId: String(chainId) })))
      .catch(() => undefined);

    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      setWallet((w) => ({ ...w, address: accounts?.[0] ?? null }));
    };
    const onChainChanged = (...args: unknown[]) => {
      setWallet((w) => ({ ...w, chainId: String(args[0]) }));
    };
    provider.on?.("accountsChanged", onAccountsChanged);
    provider.on?.("chainChanged", onChainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      toast({
        title: "No wallet detected",
        description: "Install MetaMask or another EIP-1193 wallet to connect.",
      });
      return;
    }
    setWallet((w) => ({ ...w, connecting: true }));
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const chainId = String(await provider.request({ method: "eth_chainId" }));
      setWallet({ address: accounts?.[0] ?? null, chainId, connecting: false });
      toast({ title: "Wallet connected", description: accounts?.[0] ? shorten(accounts[0]) : undefined });
    } catch (err) {
      setWallet((w) => ({ ...w, connecting: false }));
      const code = (err as { code?: number })?.code;
      if (code === 4001) {
        toast({ title: "Connection rejected", description: "You declined the connection request in your wallet." });
      } else {
        toast({ title: "Connection failed", description: "The wallet request could not be completed." });
      }
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setWallet({ address: null, chainId: null, connecting: false });
  }, []);

  const switchToSepolia = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TOKEN.testnet.chainIdHex }],
      });
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: TOKEN.testnet.chainIdHex,
                chainName: "Sepolia Testnet",
                nativeCurrency: { name: "Sepolia ETH", symbol: "sepETH", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: [TOKEN.testnet.explorer],
              },
            ],
          });
        } catch {
          toast({ title: "Could not add network", description: "Add the Sepolia network manually in your wallet." });
        }
      } else if (code === 4001) {
        toast({ title: "Network switch rejected", description: "You declined the switch in your wallet." });
      } else {
        toast({ title: "Network switch failed", description: "Your wallet could not switch networks." });
      }
    }
  }, [toast]);

  const addToken = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;
    try {
      const added = await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: TOKEN.testnet.address,
            symbol: TOKEN.symbol,
            decimals: TOKEN.decimals,
            image: `${window.location.origin}/logo.png`,
          },
        } as unknown as Record<string, unknown>,
      });
      if (added) toast({ title: "Token added", description: `TEKA (testnet) is now visible in your wallet.` });
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 4001) {
        toast({ title: "Rejected", description: "You declined the token import." });
      } else {
        toast({ title: "Could not add token", description: "Your wallet refused the watchAsset request." });
      }
    }
  }, [toast]);

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(TOKEN.testnet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    toast({ title: "Contract address copied", description: "Sepolia testnet contract — not a production token." });
  }, [toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="glass-gold rounded-3xl p-6 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gold" aria-hidden /> Wallet Connection
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
            Connect an EIP-1193 wallet (MetaMask & compatible) to view the testnet contract in your
            wallet. Connection is read-only — TEKA never requests transactions or signatures.
          </p>
        </div>
        {hasProvider === false && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] text-amber-300">
            <TriangleAlert className="h-3 w-3" aria-hidden /> No wallet detected
          </span>
        )}
      </div>

      {/* Contract — always visible, always labeled testnet */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="mono-label text-amber-300/90 flex items-center gap-1.5">
              <Network className="h-3 w-3" aria-hidden /> Smart Contract — {TOKEN.testnet.network}
            </p>
            <p className="mt-1.5 truncate font-mono text-xs sm:text-sm text-foreground/90">{TOKEN.testnet.address}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={copyAddress}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold-bright"
              aria-label="Copy testnet contract address"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
            </button>
            <a
              href={`${TOKEN.testnet.explorer}/token/${TOKEN.testnet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold-bright"
              aria-label="View contract on Sepolia Etherscan"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-muted-foreground">
          Whitepaper v1.0 §5: this is a <span className="text-amber-300">testnet implementation</span>, explicitly
          &ldquo;not a production-market deployment.&rdquo; Mainnet contract:{" "}
          <span className="text-foreground">none deployed</span>. TEKA is not tradeable — beware of imitations.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {!wallet.address ? (
          <button
            onClick={connect}
            disabled={wallet.connecting}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            <Wallet className="h-4 w-4" aria-hidden />
            {wallet.connecting ? "Connecting…" : hasProvider === false ? "Install MetaMask" : "Connect Wallet"}
          </button>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              {shorten(wallet.address)}
            </span>
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-300"
            >
              <Unplug className="h-4 w-4" aria-hidden /> Disconnect
            </button>
          </>
        )}

        {wallet.address && !isSepolia && (
          <button
            onClick={switchToSepolia}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-300 transition-colors hover:bg-amber-400/20"
          >
            <TriangleAlert className="h-4 w-4" aria-hidden /> Wrong network — switch to Sepolia
          </button>
        )}

        {wallet.address && isSepolia && (
          <button
            onClick={addToken}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold-bright transition-colors hover:bg-gold/20"
          >
            <Coins className="h-4 w-4" aria-hidden /> Add TEKA (testnet) to wallet
          </button>
        )}
      </div>

      {wallet.address && !isSepolia && (
        <p className={cn("mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-200/90")}>
          Your wallet is on chain {wallet.chainId}. The only TEKA contract lives on Sepolia (chain 11155111) —
          any &ldquo;TEKA&rdquo; token on other chains is not issued by TEKA.
        </p>
      )}
    </motion.div>
  );
}
