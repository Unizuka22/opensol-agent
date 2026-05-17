import {
  OpenSolReport,
  RiskAssessment,
  TokenReport,
  TransactionReport,
  WalletReport
} from "../types";
import { boolStatus, formatNumber, formatPercent, shortAddress } from "../utils/format";

export function renderMarkdownReport(report: OpenSolReport): string {
  if (report.type === "token") {
    return renderTokenMarkdown(report);
  }

  if (report.type === "wallet") {
    return renderWalletMarkdown(report);
  }

  return renderTransactionMarkdown(report);
}

function renderHeader(report: OpenSolReport): string[] {
  return [
    `# ${report.title}`,
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Summary: ${report.summary}`,
    ""
  ];
}

function renderRisk(risk: RiskAssessment): string[] {
  const lines = [
    "## Risk",
    "",
    `Risk score: ${risk.score}/100 (${risk.level})`,
    "",
    risk.summary,
    ""
  ];

  if (risk.flags.length > 0) {
    lines.push("### Flags", "");
    for (const flag of risk.flags) {
      lines.push(`- [${flag.severity}] ${flag.label}: ${flag.detail} (${flag.points} pts)`);
    }
    lines.push("");
  }

  if (risk.unknowns.length > 0) {
    lines.push("### Unknowns", "");
    for (const unknown of risk.unknowns) {
      lines.push(`- ${unknown}`);
    }
    lines.push("");
  }

  return lines;
}

function renderWarnings(report: OpenSolReport): string[] {
  if (report.warnings.length === 0) {
    return [];
  }

  return [
    "## Warnings",
    "",
    ...report.warnings.map((warning) => `- ${warning}`),
    ""
  ];
}

function renderTokenMarkdown(report: TokenReport): string {
  const { mint, holderConcentration, liquidity } = report;
  const lines = [
    ...renderHeader(report),
    ...renderRisk(report.risk),
    "## Mint Details",
    "",
    `- Address: ${mint.address}`,
    `- Valid address: ${mint.isValidAddress ? "yes" : "no"}`,
    `- Account found: ${mint.exists ? "yes" : "no"}`,
    `- Supply: ${formatNumber(mint.uiSupply ?? mint.supply)}`,
    `- Decimals: ${mint.decimals ?? "unknown"}`,
    `- Mint authority: ${boolStatus(mint.mintAuthority)}`,
    `- Freeze authority: ${boolStatus(mint.freezeAuthority)}`,
    `- Token program: ${mint.tokenStandard}`,
    `- Owner program: ${mint.ownerProgram ?? "unknown"}`,
    `- Extensions: ${mint.extensions.length > 0 ? mint.extensions.join(", ") : "none detected"}`,
    "",
    "## Holder Concentration",
    "",
    `- Status: ${holderConcentration.status}`,
    `- Observed token accounts: ${holderConcentration.holderCount}`,
    `- Top account share: ${formatPercent(holderConcentration.topHolderPercent)}`,
    `- Top five share: ${formatPercent(holderConcentration.topFivePercent)}`,
    ...holderConcentration.notes.map((note) => `- ${note}`),
    "",
    "## Liquidity",
    "",
    `- Status: ${liquidity.status}`,
    ...liquidity.notes.map((note) => `- ${note}`),
    "",
    ...renderWarnings(report)
  ];

  return `${lines.join("\n").trim()}\n`;
}

function renderWalletMarkdown(report: WalletReport): string {
  const { wallet } = report;
  const recentSignatures = wallet.recentSignatures.slice(0, 10);
  const lines = [
    ...renderHeader(report),
    ...renderRisk(report.risk),
    "## Wallet Details",
    "",
    `- Address: ${wallet.address}`,
    `- Valid address: ${wallet.isValidAddress ? "yes" : "no"}`,
    `- SOL balance: ${formatNumber(wallet.solBalance)}`,
    `- Recent signature count: ${wallet.recentActivityCount}`,
    `- Failed recent signatures: ${wallet.failedRecentActivityCount}`,
    `- Wallet type guess: ${wallet.walletTypeGuess}`,
    "",
    "## Recent Signatures",
    "",
    ...(
      recentSignatures.length > 0
        ? recentSignatures.map((signature) => `- ${shortAddress(signature.signature, 8)} | slot ${signature.slot} | ${signature.failed ? "failed" : "success"}`)
        : ["- none found"]
    ),
    "",
    ...renderWarnings(report)
  ];

  return `${lines.join("\n").trim()}\n`;
}

function renderTransactionMarkdown(report: TransactionReport): string {
  const { transaction } = report;
  const lines = [
    ...renderHeader(report),
    "## Transaction Details",
    "",
    `- Signature: ${transaction.signature}`,
    `- Valid signature: ${transaction.isValidSignature ? "yes" : "no"}`,
    `- Found: ${transaction.found ? "yes" : "no"}`,
    `- Status: ${transaction.status}`,
    `- Fee: ${transaction.feeLamports ?? "unknown"} lamports`,
    `- Slot: ${transaction.slot ?? "unknown"}`,
    `- Block time: ${transaction.blockTime ?? "unknown"}`,
    "",
    "## Programs Called",
    "",
    ...(
      transaction.programs.length > 0
        ? transaction.programs.map((program) => `- ${program.program} (${program.programId})${program.instructionType ? `: ${program.instructionType}` : ""}`)
        : ["- none parsed"]
    ),
    "",
    "## Involved Accounts",
    "",
    ...transaction.accounts.slice(0, 20).map((account) => `- ${account.address}${account.signer ? " | signer" : ""}${account.writable ? " | writable" : ""}`),
    ...(transaction.accounts.length > 20 ? [`- ${transaction.accounts.length - 20} more account(s) omitted`] : []),
    "",
    "## Visible Token Transfers",
    "",
    ...(
      transaction.tokenTransfers.length > 0
        ? transaction.tokenTransfers.map((transfer) => `- ${transfer.type}: ${transfer.amount ?? "unknown amount"} from ${transfer.source ?? "unknown"} to ${transfer.destination ?? "unknown"}${transfer.mint ? ` mint ${transfer.mint}` : ""}`)
        : ["- none parsed"]
    ),
    "",
    ...renderWarnings(report)
  ];

  return `${lines.join("\n").trim()}\n`;
}
