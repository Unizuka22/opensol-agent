import {
  Commitment,
  Connection,
  ParsedAccountData,
  PublicKey
} from "@solana/web3.js";

import { getConfig } from "../config";

export function createSolanaConnection(rpcUrl?: string, commitment: Commitment = "confirmed"): Connection {
  const config = getConfig({ rpcUrl });
  return new Connection(config.rpcUrl, commitment);
}

export function parsePublicKey(value: string): PublicKey | null {
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

export function isValidSolanaAddress(value: string): boolean {
  return parsePublicKey(value) !== null;
}

export function isLikelyTransactionSignature(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{64,128}$/.test(value);
}

export function isParsedAccountData(data: Buffer | ParsedAccountData): data is ParsedAccountData {
  return !Buffer.isBuffer(data) && "parsed" in data;
}
