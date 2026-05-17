import { describe, expect, it } from "vitest";

import { isLikelyTransactionSignature, isValidSolanaAddress } from "../src/solana/rpc";

describe("address validation", () => {
  it("accepts valid Solana public keys", () => {
    expect(isValidSolanaAddress("11111111111111111111111111111111")).toBe(true);
  });

  it("rejects invalid Solana public keys", () => {
    expect(isValidSolanaAddress("not-a-wallet")).toBe(false);
  });

  it("validates likely transaction signatures without network access", () => {
    expect(isLikelyTransactionSignature("5".repeat(88))).toBe(true);
    expect(isLikelyTransactionSignature("0".repeat(88))).toBe(false);
  });
});
