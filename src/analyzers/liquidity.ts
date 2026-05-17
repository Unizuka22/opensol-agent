import { LiquidityResult } from "../types";

export function analyzeLiquidityPlaceholder(): LiquidityResult {
  return {
    status: "not_checked",
    notes: [
      "Liquidity pool discovery is not implemented in v0.1.",
      "Future versions should inspect public DEX pool accounts and avoid treating missing pool data as proof of risk."
    ]
  };
}
