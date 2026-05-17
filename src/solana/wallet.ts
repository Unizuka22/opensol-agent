import { Connection } from "@solana/web3.js";

import { WalletProfile, WalletSignatureSummary } from "../types";
import { formatLamportsAsSol } from "../utils/format";
import { parsePublicKey } from "./rpc";

export async function getWalletProfile(
  connection: Connection,
  walletAddress: string,
  recentLimit = 50
): Promise<WalletProfile> {
  const publicKey = parsePublicKey(walletAddress);

  if (!publicKey) {
    return {
      address: walletAddress,
      isValidAddress: false,
      recentActivityCount: 0,
      failedRecentActivityCount: 0,
      walletTypeGuess: "unknown",
      recentSignatures: [],
      fetchError: "Invalid Solana public key."
    };
  }

  try {
    const [balanceLamports, signatures] = await Promise.all([
      connection.getBalance(publicKey),
      connection.getSignaturesForAddress(publicKey, { limit: recentLimit })
    ]);

    const recentSignatures: WalletSignatureSummary[] = signatures.map((signature) => ({
      signature: signature.signature,
      slot: signature.slot,
      blockTime: signature.blockTime ?? null,
      failed: signature.err !== null
    }));

    const failedRecentActivityCount = recentSignatures.filter((signature) => signature.failed).length;

    return {
      address: walletAddress,
      isValidAddress: true,
      solBalance: formatLamportsAsSol(balanceLamports),
      recentActivityCount: recentSignatures.length,
      failedRecentActivityCount,
      walletTypeGuess: guessWalletType(recentSignatures.length, failedRecentActivityCount),
      recentSignatures
    };
  } catch (error) {
    return {
      address: walletAddress,
      isValidAddress: true,
      recentActivityCount: 0,
      failedRecentActivityCount: 0,
      walletTypeGuess: "unknown",
      recentSignatures: [],
      fetchError: error instanceof Error ? error.message : "Unable to fetch wallet profile."
    };
  }
}

export function guessWalletType(recentActivityCount: number, failedRecentActivityCount: number): WalletProfile["walletTypeGuess"] {
  if (recentActivityCount === 0) {
    return "inactive";
  }

  const failureRate = failedRecentActivityCount / recentActivityCount;

  if (recentActivityCount >= 45 || (recentActivityCount >= 30 && failureRate >= 0.2)) {
    return "possible bot/market-maker";
  }

  if (recentActivityCount >= 15) {
    return "high-activity wallet";
  }

  return "normal user";
}
