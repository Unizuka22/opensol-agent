import { HolderConcentrationResult, LargestTokenAccount } from "../types";

export function analyzeHolderConcentration(accounts: LargestTokenAccount[]): HolderConcentrationResult {
  if (accounts.length === 0) {
    return {
      status: "unknown",
      holderCount: 0,
      notes: ["Holder concentration was not available from the RPC response."]
    };
  }

  if (accounts.length < 3) {
    return {
      status: "insufficient_data",
      holderCount: accounts.length,
      notes: ["Too few largest token accounts were available to estimate concentration."]
    };
  }

  const balances = accounts.flatMap((account) => {
    try {
      return [BigInt(account.amount)];
    } catch {
      return [];
    }
  });
  const totalObserved = balances.reduce((total, balance) => total + balance, 0n);

  if (totalObserved <= 0n) {
    return {
      status: "unknown",
      holderCount: accounts.length,
      notes: ["Observed largest-account balances were zero or unavailable."]
    };
  }

  const topHolderPercent = bigintPercent(balances[0] ?? 0n, totalObserved);
  const topFivePercent = bigintPercent(
    balances.slice(0, 5).reduce((total, balance) => total + balance, 0n),
    totalObserved
  );
  const notes = [
    "Concentration is based on largest token accounts returned by RPC, not a complete holder graph."
  ];

  if (topHolderPercent >= 50) {
    notes.push("The largest observed token account controls at least half of the observed top-account balance.");
  }

  return {
    status: "available",
    topHolderPercent,
    topFivePercent,
    holderCount: accounts.length,
    notes
  };
}

function bigintPercent(part: bigint, whole: bigint): number {
  if (whole <= 0n) {
    return 0;
  }

  return Number((part * 10_000n) / whole) / 100;
}
