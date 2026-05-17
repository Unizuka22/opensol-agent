import {
  HolderConcentrationResult,
  LiquidityResult,
  RiskAssessment,
  TokenMintInfo,
  TransactionSummary,
  WalletProfile
} from "../types";
import { boolStatus, formatNumber, formatPercent } from "../utils/format";

export function explainTokenReport(
  mint: TokenMintInfo,
  risk: RiskAssessment,
  holderConcentration: HolderConcentrationResult,
  liquidity: LiquidityResult
): string {
  if (!mint.isValidAddress) {
    return "This token mint address is invalid, so OpenSol Agent cannot inspect it.";
  }

  if (!mint.exists) {
    return "OpenSol Agent could not confirm a parsed token mint account at this address. Treat the result as unknown, not safe or unsafe.";
  }

  const authorityText = [
    `mint authority is ${boolStatus(mint.mintAuthority)}`,
    `freeze authority is ${boolStatus(mint.freezeAuthority)}`
  ].join(" and ");

  const concentrationText = holderConcentration.status === "available"
    ? ` The largest observed token account represents ${formatPercent(holderConcentration.topHolderPercent)} of observed top-account balance.`
    : "";

  const liquidityText = liquidity.status === "not_checked"
    ? " Liquidity was not checked in v0.1."
    : "";

  return `This mint appears to use ${mint.tokenStandard}. The ${authorityText}. Risk score is ${risk.score}/100 (${risk.level}).${concentrationText}${liquidityText}`;
}

export function explainWalletReport(wallet: WalletProfile, risk: RiskAssessment): string {
  if (!wallet.isValidAddress) {
    return "This wallet address is invalid, so OpenSol Agent cannot inspect it.";
  }

  if (wallet.fetchError) {
    return "OpenSol Agent could not fetch enough wallet data. Treat the result as unknown.";
  }

  return `This wallet currently looks like a ${wallet.walletTypeGuess}. It has ${formatNumber(wallet.solBalance)} SOL and ${wallet.recentActivityCount} recent signatures in the inspected window. Risk score is ${risk.score}/100 (${risk.level}).`;
}

export function explainTransaction(summary: TransactionSummary): string {
  if (!summary.isValidSignature) {
    return "This transaction signature does not look valid, so OpenSol Agent cannot inspect it.";
  }

  if (!summary.found) {
    return "OpenSol Agent could not find a parsed transaction for this signature. It may be too old, not finalized on this RPC, or unavailable from the selected endpoint.";
  }

  const programList = summary.programs.map((program) => program.program).filter(Boolean);
  const uniquePrograms = [...new Set(programList)];
  const tokenTransferText = summary.tokenTransfers.length > 0
    ? ` ${summary.tokenTransfers.length} visible token transfer instruction(s) were detected.`
    : " No parsed token transfer instructions were visible in the fetched transaction.";

  return `This transaction ${summary.status === "success" ? "succeeded" : "failed"} in slot ${summary.slot ?? "unknown"} and paid ${summary.feeLamports ?? "unknown"} lamports in fees. It called ${uniquePrograms.length > 0 ? uniquePrograms.join(", ") : "unknown programs"}.${tokenTransferText}`;
}
