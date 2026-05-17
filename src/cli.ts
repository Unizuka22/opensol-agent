import { promises as fs } from "node:fs";
import path from "node:path";

import { Command } from "commander";
import { Connection } from "@solana/web3.js";

import { explainTokenReport, explainTransaction, explainWalletReport } from "./agent/explain";
import { analyzeHolderConcentration } from "./analyzers/holderConcentration";
import { analyzeLiquidityPlaceholder } from "./analyzers/liquidity";
import { scoreTokenRisk } from "./analyzers/tokenRisk";
import { scoreWalletRisk } from "./analyzers/walletProfile";
import { renderJsonReport } from "./reports/json";
import { renderMarkdownReport } from "./reports/markdown";
import { createSolanaConnection } from "./solana/rpc";
import { getLargestTokenAccounts, getTokenMintInfo } from "./solana/token";
import { getTransactionSummary } from "./solana/transaction";
import { getWalletProfile } from "./solana/wallet";
import {
  OpenSolReport,
  OutputFormat,
  TokenReport,
  TransactionReport,
  WalletReport
} from "./types";

interface ReportCommandOptions {
  format?: string;
  out?: string;
  rpc?: string;
}

const VERSION = "0.1.0";
const SAFETY_WARNINGS = [
  "Research software only; not financial advice.",
  "OpenSol Agent analyzes public data only and does not prove intent.",
  "Verify important findings independently."
];

export function buildProgram(): Command {
  const program = new Command();

  program
    .name("opensol")
    .description("Solana public-data intelligence reports for tokens, wallets, and transactions.")
    .version(VERSION);

  program
    .command("token")
    .description("Analyze a token mint.")
    .argument("<mint-address>", "Solana token mint address")
    .option("-f, --format <format>", "Output format: markdown or json", "markdown")
    .option("-o, --out <path>", "Write report to a file")
    .option("--rpc <url>", "Override SOLANA_RPC_URL for this command")
    .action(async (mintAddress: string, options: ReportCommandOptions) => {
      const connection = createSolanaConnection(options.rpc);
      const report = await buildTokenReport(mintAddress, connection);
      await outputReport(report, options);
    });

  program
    .command("wallet")
    .description("Analyze a wallet address.")
    .argument("<wallet-address>", "Solana wallet address")
    .option("-f, --format <format>", "Output format: markdown or json", "markdown")
    .option("-o, --out <path>", "Write report to a file")
    .option("--rpc <url>", "Override SOLANA_RPC_URL for this command")
    .action(async (walletAddress: string, options: ReportCommandOptions) => {
      const connection = createSolanaConnection(options.rpc);
      const report = await buildWalletReport(walletAddress, connection);
      await outputReport(report, options);
    });

  program
    .command("tx")
    .description("Explain a transaction signature.")
    .argument("<transaction-signature>", "Solana transaction signature")
    .option("-f, --format <format>", "Output format: markdown or json", "markdown")
    .option("-o, --out <path>", "Write report to a file")
    .option("--rpc <url>", "Override SOLANA_RPC_URL for this command")
    .action(async (signature: string, options: ReportCommandOptions) => {
      const connection = createSolanaConnection(options.rpc);
      const report = await buildTransactionReport(signature, connection);
      await outputReport(report, options);
    });

  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  await buildProgram().parseAsync(argv);
}

export async function buildTokenReport(mintAddress: string, connection: Connection): Promise<TokenReport> {
  const mint = await getTokenMintInfo(connection, mintAddress);
  const largestAccounts = mint.isValidAddress && mint.exists
    ? await getLargestTokenAccounts(connection, mintAddress)
    : [];
  const holderConcentration = analyzeHolderConcentration(largestAccounts);
  const liquidity = analyzeLiquidityPlaceholder();
  const risk = scoreTokenRisk(mint);
  const summary = explainTokenReport(mint, risk, holderConcentration, liquidity);

  return {
    type: "token",
    title: "OpenSol Token Risk Report",
    generatedAt: new Date().toISOString(),
    summary,
    warnings: [
      ...SAFETY_WARNINGS,
      ...(mint.fetchError ? [`Fetch issue: ${mint.fetchError}`] : [])
    ],
    mint,
    risk,
    holderConcentration,
    liquidity
  };
}

export async function buildWalletReport(walletAddress: string, connection: Connection): Promise<WalletReport> {
  const wallet = await getWalletProfile(connection, walletAddress);
  const risk = scoreWalletRisk(wallet);
  const summary = explainWalletReport(wallet, risk);

  return {
    type: "wallet",
    title: "OpenSol Wallet Profile Report",
    generatedAt: new Date().toISOString(),
    summary,
    warnings: [
      ...SAFETY_WARNINGS,
      ...(wallet.fetchError ? [`Fetch issue: ${wallet.fetchError}`] : [])
    ],
    wallet,
    risk
  };
}

export async function buildTransactionReport(signature: string, connection: Connection): Promise<TransactionReport> {
  const transaction = await getTransactionSummary(connection, signature);
  const summary = explainTransaction(transaction);

  return {
    type: "transaction",
    title: "OpenSol Transaction Explanation",
    generatedAt: new Date().toISOString(),
    summary,
    warnings: [
      ...SAFETY_WARNINGS,
      ...(transaction.fetchError ? [`Fetch issue: ${transaction.fetchError}`] : [])
    ],
    transaction
  };
}

async function outputReport(report: OpenSolReport, options: ReportCommandOptions): Promise<void> {
  const format = parseOutputFormat(options.format);
  const content = format === "json" ? renderJsonReport(report) : renderMarkdownReport(report);

  if (options.out) {
    const outPath = path.resolve(options.out);
    await fs.writeFile(outPath, content, "utf8");
    process.stderr.write(`Wrote ${format} report to ${outPath}\n`);
    return;
  }

  process.stdout.write(content);
}

function parseOutputFormat(value: string | undefined): OutputFormat {
  if (value === undefined || value === "markdown" || value === "json") {
    return value ?? "markdown";
  }

  throw new Error(`Unsupported output format "${value}". Use "markdown" or "json".`);
}
