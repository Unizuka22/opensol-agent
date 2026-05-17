import { RoughnessResult } from "../types";
import { mean, standardDeviation } from "../utils/math";

const MIN_SAMPLE_SIZE = 8;

export function analyzeMarketRoughness(priceSeries: number[]): RoughnessResult {
  const cleanSeries = priceSeries.filter((value) => Number.isFinite(value) && value > 0);

  if (cleanSeries.length < MIN_SAMPLE_SIZE) {
    return {
      classification: "insufficient_data",
      sampleSize: cleanSeries.length,
      note: "Insufficient data for roughness analysis. This is a heuristic signal, not proof of manipulation."
    };
  }

  const returns = cleanSeries.slice(1).map((price, index) => {
    const previous = cleanSeries[index];
    return (price - previous) / previous;
  });

  const absoluteReturns = returns.map(Math.abs);
  const averageAbsoluteMove = mean(absoluteReturns);
  const volatility = standardDeviation(returns);
  const signChangeRate = calculateSignChangeRate(returns);
  const priceRange = (Math.max(...cleanSeries) - Math.min(...cleanSeries)) / mean(cleanSeries);

  // This is a heuristic signal, not proof of manipulation.
  if (priceRange < 0.003 || volatility < 0.0005) {
    return {
      classification: "too_smooth",
      sampleSize: cleanSeries.length,
      averageAbsoluteMove,
      volatility,
      signChangeRate,
      note: "Series appears unusually smooth for this simple heuristic. This is not proof of manipulation."
    };
  }

  if ((signChangeRate > 0.7 && priceRange > 0.04) || volatility > averageAbsoluteMove * 1.8) {
    return {
      classification: "too_choppy",
      sampleSize: cleanSeries.length,
      averageAbsoluteMove,
      volatility,
      signChangeRate,
      note: "Series appears unusually choppy for this simple heuristic. This is not proof of manipulation."
    };
  }

  return {
    classification: "normal",
    sampleSize: cleanSeries.length,
    averageAbsoluteMove,
    volatility,
    signChangeRate,
    note: "Series appears normal under this simple roughness heuristic."
  };
}

function calculateSignChangeRate(values: number[]): number {
  const nonZeroSigns = values
    .map((value) => Math.sign(value))
    .filter((sign) => sign !== 0);

  if (nonZeroSigns.length < 2) {
    return 0;
  }

  let signChanges = 0;
  for (let index = 1; index < nonZeroSigns.length; index += 1) {
    if (nonZeroSigns[index] !== nonZeroSigns[index - 1]) {
      signChanges += 1;
    }
  }

  return signChanges / (nonZeroSigns.length - 1);
}
