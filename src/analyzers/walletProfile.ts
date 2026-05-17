import { RiskAssessment, RiskFlag, WalletProfile } from "../types";
import { clamp } from "../utils/math";
import { analyzeBotLikeActivity } from "./botPattern";

export function scoreWalletRisk(wallet: WalletProfile): RiskAssessment {
  if (!wallet.isValidAddress) {
    return {
      score: 0,
      level: "unknown",
      flags: [{
        code: "INVALID_WALLET_ADDRESS",
        label: "Invalid wallet address",
        severity: "unknown",
        points: 0,
        detail: "The provided value is not a valid Solana public key."
      }],
      unknowns: ["Wallet could not be analyzed because the address is invalid."],
      summary: "The wallet could not be analyzed because the address is invalid."
    };
  }

  const flags: RiskFlag[] = analyzeBotLikeActivity(wallet);
  const unknowns: string[] = [];

  if (wallet.fetchError) {
    unknowns.push(wallet.fetchError);
  }

  if (wallet.recentActivityCount > 0 && wallet.recentActivityCount < 3) {
    flags.push({
      code: "LIMITED_ACTIVITY_DATA",
      label: "Limited recent activity",
      severity: "info",
      points: 0,
      detail: "Only a small number of recent transactions were found, so conclusions are limited."
    });
  }

  if (wallet.walletTypeGuess === "inactive") {
    flags.push({
      code: "INACTIVE_WALLET",
      label: "Inactive wallet",
      severity: "info",
      points: 0,
      detail: "No recent signatures were found in the configured lookback window."
    });
  }

  const score = clamp(flags.reduce((total, flag) => total + flag.points, 5), 0, 100);

  return {
    score,
    level: unknowns.length > 0 && flags.every((flag) => flag.points === 0) ? "unknown" : riskLevel(score),
    flags,
    unknowns,
    summary: buildWalletSummary(wallet, score, flags, unknowns)
  };
}

function riskLevel(score: number): RiskAssessment["level"] {
  if (score >= 70) {
    return "high";
  }

  if (score >= 35) {
    return "medium";
  }

  return "low";
}

function buildWalletSummary(
  wallet: WalletProfile,
  score: number,
  flags: RiskFlag[],
  unknowns: string[]
): string {
  if (unknowns.length > 0 && flags.every((flag) => flag.points === 0)) {
    return "There is not enough reliable wallet data to produce a confident risk read.";
  }

  if (wallet.walletTypeGuess === "inactive") {
    return "This wallet appears inactive in the recent signature window. Limited data means limited conclusions.";
  }

  const scoredFlags = flags.filter((flag) => flag.points > 0);
  if (scoredFlags.length === 0) {
    return `This wallet looks like a ${wallet.walletTypeGuess} based on recent public activity. Score: ${score}/100.`;
  }

  return `This wallet shows ${scoredFlags.map((flag) => flag.label.toLowerCase()).join(", ")}. These are behavior signals, not proof of intent. Score: ${score}/100.`;
}
