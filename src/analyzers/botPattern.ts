import { RiskFlag, WalletProfile } from "../types";

export function analyzeBotLikeActivity(wallet: WalletProfile): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (!wallet.isValidAddress || wallet.recentActivityCount === 0) {
    return flags;
  }

  const failureRate = wallet.failedRecentActivityCount / wallet.recentActivityCount;

  if (wallet.walletTypeGuess === "possible bot/market-maker") {
    flags.push({
      code: "BOT_LIKE_ACTIVITY",
      label: "Bot-like recent activity",
      severity: "medium",
      points: 25,
      detail: "The wallet has very high recent activity or a high-activity plus failed-transaction pattern."
    });
  } else if (wallet.walletTypeGuess === "high-activity wallet") {
    flags.push({
      code: "HIGH_ACTIVITY",
      label: "High recent activity",
      severity: "low",
      points: 12,
      detail: "The wallet has more recent transactions than a casual wallet, but this alone is not suspicious."
    });
  }

  if (failureRate >= 0.35) {
    flags.push({
      code: "HIGH_FAILURE_RATE",
      label: "High failed transaction rate",
      severity: "medium",
      points: 25,
      detail: "A large share of recent transactions failed, which may indicate automation, retries, or unusual behavior."
    });
  } else if (failureRate >= 0.15) {
    flags.push({
      code: "ELEVATED_FAILURE_RATE",
      label: "Elevated failed transaction rate",
      severity: "low",
      points: 10,
      detail: "Some recent failed transactions were observed."
    });
  }

  return flags;
}
