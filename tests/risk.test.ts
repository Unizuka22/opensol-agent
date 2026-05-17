import { describe, expect, it } from "vitest";

import { scoreTokenRisk } from "../src/analyzers/tokenRisk";
import { scoreWalletRisk } from "../src/analyzers/walletProfile";
import { TokenMintInfo, WalletProfile } from "../src/types";

describe("risk scoring", () => {
  it("adds transparent points for active token authorities", () => {
    const mint: TokenMintInfo = {
      address: "ExampleMint1111111111111111111111111111111111",
      isValidAddress: true,
      exists: true,
      supply: "1000000",
      uiSupply: 1,
      decimals: 6,
      mintAuthority: "Authority111111111111111111111111111111111",
      freezeAuthority: null,
      ownerProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      tokenStandard: "SPL Token",
      extensions: []
    };

    const risk = scoreTokenRisk(mint);

    expect(risk.score).toBe(35);
    expect(risk.level).toBe("medium");
    expect(risk.flags.some((flag) => flag.code === "ACTIVE_MINT_AUTHORITY")).toBe(true);
  });

  it("labels failed fetches as unknown when no scoring signal is available", () => {
    const mint: TokenMintInfo = {
      address: "11111111111111111111111111111111",
      isValidAddress: true,
      exists: false,
      tokenStandard: "Unknown",
      extensions: [],
      fetchError: "RPC unavailable"
    };

    const risk = scoreTokenRisk(mint);

    expect(risk.level).toBe("unknown");
    expect(risk.unknowns).toContain("RPC unavailable");
  });

  it("scores bot-like wallet activity without claiming certainty", () => {
    const wallet: WalletProfile = {
      address: "11111111111111111111111111111111",
      isValidAddress: true,
      solBalance: 1,
      recentActivityCount: 50,
      failedRecentActivityCount: 20,
      walletTypeGuess: "possible bot/market-maker",
      recentSignatures: []
    };

    const risk = scoreWalletRisk(wallet);

    expect(risk.score).toBeGreaterThanOrEqual(55);
    expect(risk.flags.map((flag) => flag.code)).toContain("BOT_LIKE_ACTIVITY");
    expect(risk.flags.map((flag) => flag.code)).toContain("HIGH_FAILURE_RATE");
  });
});
