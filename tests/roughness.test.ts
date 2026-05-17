import { describe, expect, it } from "vitest";

import { analyzeMarketRoughness } from "../src/analyzers/roughness";

describe("market roughness", () => {
  it("requires enough samples", () => {
    expect(analyzeMarketRoughness([1, 2, 3]).classification).toBe("insufficient_data");
  });

  it("classifies unusually smooth series", () => {
    const result = analyzeMarketRoughness([100, 100.01, 100, 100.01, 100, 100.01, 100, 100.01]);
    expect(result.classification).toBe("too_smooth");
  });

  it("classifies normal-looking series", () => {
    const result = analyzeMarketRoughness([100, 101, 100.8, 102, 101.4, 102.4, 102.1, 103]);
    expect(result.classification).toBe("normal");
  });

  it("classifies unusually choppy series", () => {
    const result = analyzeMarketRoughness([100, 120, 90, 125, 85, 130, 80, 135]);
    expect(result.classification).toBe("too_choppy");
  });
});
