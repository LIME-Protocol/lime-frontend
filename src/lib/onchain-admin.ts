import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { PublicKey, Transaction, type Connection } from '@solana/web3.js';
import type { AnchorWalletLike, MarketInput } from '@lime/solana';

interface BuildOnchainMarketInputParams {
  marketId: number;
  lowerBound: number;
  upperBound: number;
  resolutionDate: string;
  settlementSource: string;
}

interface DeriveVaultTokenAccountParams {
  marketId: bigint;
  usdcMint: PublicKey;
  vaultProgramId: PublicKey;
}

export function generateOnchainMarketId(nowMs = Date.now()) {
  if (!Number.isSafeInteger(nowMs) || nowMs <= 0) {
    throw new Error('Unable to generate a valid on-chain market id.');
  }
  return nowMs;
}

export function buildOnchainMarketInput(params: BuildOnchainMarketInputParams): MarketInput {
  const resolutionMs = new Date(params.resolutionDate).getTime();
  if (!Number.isFinite(resolutionMs)) {
    throw new Error('Market resolution date is invalid.');
  }

  return {
    marketId: BigInt(params.marketId),
    lowerBound: BigInt(Math.round(params.lowerBound)),
    upperBound: BigInt(Math.round(params.upperBound)),
    resolutionTs: BigInt(Math.floor(resolutionMs / 1000)),
    settlementSource: params.settlementSource,
    minParticipants: 1,
  };
}

export function deriveVaultTokenAccount(params: DeriveVaultTokenAccountParams) {
  const marketIdBuffer = new Uint8Array(8);
  new DataView(marketIdBuffer.buffer).setBigUint64(0, params.marketId, true);
  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [new TextEncoder().encode('vault_authority'), marketIdBuffer],
    params.vaultProgramId,
  );
  const vaultTokenAccount = getAssociatedTokenAddressSync(
    params.usdcMint,
    vaultAuthority,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  return { vaultAuthority, vaultTokenAccount };
}

export async function ensureVaultTokenAccount(params: {
  connection: Connection;
  wallet: AnchorWalletLike;
  usdcMint: PublicKey;
  vaultAuthority: PublicKey;
  vaultTokenAccount: PublicKey;
}) {
  const existing = await params.connection.getAccountInfo(params.vaultTokenAccount);
  if (existing) return;

  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      params.wallet.publicKey,
      params.vaultTokenAccount,
      params.vaultAuthority,
      params.usdcMint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  );
  transaction.feePayer = params.wallet.publicKey;
  transaction.recentBlockhash = (await params.connection.getLatestBlockhash()).blockhash;

  const signed = await params.wallet.signTransaction(transaction);
  const signature = await params.connection.sendRawTransaction(signed.serialize());
  await params.connection.confirmTransaction(signature, 'confirmed');
}
