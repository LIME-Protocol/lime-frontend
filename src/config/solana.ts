export type SolanaNetwork = 'devnet' | 'mainnet-beta' | 'localnet';

export interface FrontendSolanaConfig {
  enabled: boolean;
  missing: string[];
  network: SolanaNetwork;
  rpcUrl: string;
  usdcMint: string;
  marketProgramId: string;
  vaultProgramId: string;
  settlementProgramId: string;
}

const REQUIRED_KEYS = [
  'VITE_SOLANA_RPC_URL',
  'VITE_SOLANA_USDC_MINT',
  'VITE_LIME_MARKET_PROGRAM_ID',
  'VITE_LIME_VAULT_PROGRAM_ID',
  'VITE_LIME_SETTLEMENT_PROGRAM_ID',
] as const;

type SolanaEnv = Partial<Record<(typeof REQUIRED_KEYS)[number], string>>;

function inferNetwork(rpcUrl: string): SolanaNetwork {
  if (/mainnet/i.test(rpcUrl)) return 'mainnet-beta';
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(rpcUrl)) return 'localnet';
  return 'devnet';
}

export function readSolanaConfig(env: SolanaEnv): FrontendSolanaConfig {
  const missing = REQUIRED_KEYS.filter((key) => !env[key]);
  const rpcUrl = env.VITE_SOLANA_RPC_URL ?? '';

  return {
    enabled: missing.length === 0,
    missing,
    network: inferNetwork(rpcUrl),
    rpcUrl,
    usdcMint: env.VITE_SOLANA_USDC_MINT ?? '',
    marketProgramId: env.VITE_LIME_MARKET_PROGRAM_ID ?? '',
    vaultProgramId: env.VITE_LIME_VAULT_PROGRAM_ID ?? '',
    settlementProgramId: env.VITE_LIME_SETTLEMENT_PROGRAM_ID ?? '',
  };
}

export function requireSolanaConfig(env: SolanaEnv = import.meta.env): FrontendSolanaConfig {
  const config = readSolanaConfig(env);
  if (!config.enabled) {
    throw new Error(`Missing Solana configuration: ${config.missing.join(', ')}`);
  }
  return config;
}

export const solanaConfig = readSolanaConfig(import.meta.env);
