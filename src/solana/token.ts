import { Connection } from "@solana/web3.js";

import { LargestTokenAccount, TokenMintInfo } from "../types";
import { describeTokenProgram } from "./programs";
import { isParsedAccountData, parsePublicKey } from "./rpc";

interface ParsedMintInfo {
  decimals?: number;
  freezeAuthority?: string | null;
  mintAuthority?: string | null;
  supply?: string;
  extensions?: Array<{ extension?: string; extensionType?: string }>;
}

export async function getTokenMintInfo(connection: Connection, mintAddress: string): Promise<TokenMintInfo> {
  const publicKey = parsePublicKey(mintAddress);

  if (!publicKey) {
    return {
      address: mintAddress,
      isValidAddress: false,
      exists: false,
      tokenStandard: "Unknown",
      extensions: [],
      fetchError: "Invalid Solana public key."
    };
  }

  try {
    const account = await connection.getParsedAccountInfo(publicKey);
    const value = account.value;

    if (!value) {
      return {
        address: mintAddress,
        isValidAddress: true,
        exists: false,
        tokenStandard: "Unknown",
        extensions: []
      };
    }

    const ownerProgram = value.owner.toBase58();
    const tokenStandard = describeTokenProgram(ownerProgram);

    if (!isParsedAccountData(value.data) || value.data.parsed.type !== "mint") {
      return {
        address: mintAddress,
        isValidAddress: true,
        exists: true,
        ownerProgram,
        tokenStandard,
        extensions: [],
        fetchError: "Account exists, but parsed data is not a token mint."
      };
    }

    const info = value.data.parsed.info as ParsedMintInfo;
    const decimals = info.decimals;
    const supply = info.supply;
    const uiSupply = supply !== undefined && decimals !== undefined
      ? Number(supply) / 10 ** decimals
      : null;

    return {
      address: mintAddress,
      isValidAddress: true,
      exists: true,
      supply,
      uiSupply,
      decimals,
      mintAuthority: info.mintAuthority ?? null,
      freezeAuthority: info.freezeAuthority ?? null,
      ownerProgram,
      tokenStandard,
      extensions: (info.extensions ?? []).map((extension) => {
        return extension.extensionType ?? extension.extension ?? "unknown_extension";
      })
    };
  } catch (error) {
    return {
      address: mintAddress,
      isValidAddress: true,
      exists: false,
      tokenStandard: "Unknown",
      extensions: [],
      fetchError: error instanceof Error ? error.message : "Unable to fetch token mint."
    };
  }
}

export async function getLargestTokenAccounts(
  connection: Connection,
  mintAddress: string
): Promise<LargestTokenAccount[]> {
  const publicKey = parsePublicKey(mintAddress);
  if (!publicKey) {
    return [];
  }

  try {
    const response = await connection.getTokenLargestAccounts(publicKey);
    return response.value.map((account) => ({
      address: account.address.toBase58(),
      amount: account.amount,
      uiAmount: account.uiAmount,
      decimals: account.decimals
    }));
  } catch {
    return [];
  }
}
