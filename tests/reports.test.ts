import { describe, expect, it } from "vitest";

import { renderJsonReport } from "../src/reports/json";
import { renderMarkdownReport } from "../src/reports/markdown";
import { TokenReport } from "../src/types";

const tokenReport: TokenReport = {
  type: "token",
  title: "OpenSol Token Risk Report",
  generatedAt: "2026-05-17T00:00:00.000Z",
  summary: "A deterministic test summary.",
  warnings: ["Research software only; not financial advice."],
  mint: {
    address: "11111111111111111111111111111111",
    isValidAddress: true,
    exists: true,
    supply: "1000000",
    uiSupply: 1,
    decimals: 6,
    mintAuthority: null,
    freezeAuthority: null,
    ownerProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    tokenStandard: "SPL Token",
    extensions: []
  },
  risk: {
    score: 5,
    level: "low",
    flags: [],
    unknowns: [],
    summary: "No active authority risk flags."
  },
  holderConcentration: {
    status: "unknown",
    holderCount: 0,
    notes: ["Holder data unavailable."]
  },
  liquidity: {
    status: "not_checked",
    notes: ["Liquidity was not checked."]
  }
};

describe("report generation", () => {
  it("renders markdown reports", () => {
    const markdown = renderMarkdownReport(tokenReport);

    expect(markdown).toContain("# OpenSol Token Risk Report");
    expect(markdown).toContain("Risk score: 5/100 (low)");
    expect(markdown).toContain("Research software only; not financial advice.");
  });

  it("renders JSON reports", () => {
    const json = renderJsonReport(tokenReport);
    const parsed = JSON.parse(json) as TokenReport;

    expect(parsed.type).toBe("token");
    expect(parsed.risk.score).toBe(5);
  });
});
