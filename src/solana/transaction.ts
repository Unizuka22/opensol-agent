import {
  Connection,
  ParsedInstruction,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction
} from "@solana/web3.js";

import {
  AccountSummary,
  ProgramCallSummary,
  TokenTransferSummary,
  TransactionSummary
} from "../types";
import { isLikelyTransactionSignature } from "./rpc";

type AnyInstruction = ParsedInstruction | PartiallyDecodedInstruction;

export async function getTransactionSummary(
  connection: Connection,
  signature: string
): Promise<TransactionSummary> {
  if (!isLikelyTransactionSignature(signature)) {
    return {
      signature,
      isValidSignature: false,
      found: false,
      status: "unknown",
      accounts: [],
      programs: [],
      tokenTransfers: [],
      fetchError: "Invalid or unlikely Solana transaction signature."
    };
  }

  try {
    const transaction = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0
    });

    if (!transaction) {
      return {
        signature,
        isValidSignature: true,
        found: false,
        status: "unknown",
        accounts: [],
        programs: [],
        tokenTransfers: []
      };
    }

    return summarizeParsedTransaction(signature, transaction);
  } catch (error) {
    return {
      signature,
      isValidSignature: true,
      found: false,
      status: "unknown",
      accounts: [],
      programs: [],
      tokenTransfers: [],
      fetchError: error instanceof Error ? error.message : "Unable to fetch parsed transaction."
    };
  }
}

export function summarizeParsedTransaction(
  signature: string,
  transaction: ParsedTransactionWithMeta
): TransactionSummary {
  const message = transaction.transaction.message;
  const accounts: AccountSummary[] = message.accountKeys.map((account) => ({
    address: account.pubkey.toBase58(),
    signer: account.signer,
    writable: account.writable
  }));

  const topLevelInstructions = message.instructions as AnyInstruction[];
  const innerInstructions = (transaction.meta?.innerInstructions ?? [])
    .flatMap((inner) => inner.instructions as AnyInstruction[]);
  const allInstructions = [...topLevelInstructions, ...innerInstructions];

  return {
    signature,
    isValidSignature: true,
    found: true,
    status: transaction.meta?.err ? "failed" : "success",
    feeLamports: transaction.meta?.fee,
    slot: transaction.slot,
    blockTime: transaction.blockTime ?? null,
    accounts,
    programs: topLevelInstructions.map(describeInstruction),
    tokenTransfers: allInstructions.flatMap(extractTokenTransfer)
  };
}

function describeInstruction(instruction: AnyInstruction): ProgramCallSummary {
  if ("parsed" in instruction) {
    return {
      program: instruction.program,
      programId: instruction.programId.toBase58(),
      instructionType: typeof instruction.parsed === "object" && "type" in instruction.parsed
        ? String(instruction.parsed.type)
        : undefined
    };
  }

  return {
    program: "unknown",
    programId: instruction.programId.toBase58()
  };
}

function extractTokenTransfer(instruction: AnyInstruction): TokenTransferSummary[] {
  if (!("parsed" in instruction) || instruction.program !== "spl-token") {
    return [];
  }

  const parsed = instruction.parsed;
  if (typeof parsed !== "object" || !("type" in parsed) || !("info" in parsed)) {
    return [];
  }

  const type = String(parsed.type);
  if (!type.toLowerCase().includes("transfer")) {
    return [];
  }

  const info = parsed.info as Record<string, unknown>;

  return [{
    type,
    source: typeof info.source === "string" ? info.source : undefined,
    destination: typeof info.destination === "string" ? info.destination : undefined,
    authority: typeof info.authority === "string" ? info.authority : undefined,
    mint: typeof info.mint === "string" ? info.mint : undefined,
    amount: extractTransferAmount(info)
  }];
}

function extractTransferAmount(info: Record<string, unknown>): string | undefined {
  if (typeof info.amount === "string") {
    return info.amount;
  }

  if (
    typeof info.tokenAmount === "object" &&
    info.tokenAmount !== null &&
    "uiAmountString" in info.tokenAmount
  ) {
    const tokenAmount = info.tokenAmount as { uiAmountString?: unknown };
    return typeof tokenAmount.uiAmountString === "string" ? tokenAmount.uiAmountString : undefined;
  }

  return undefined;
}
