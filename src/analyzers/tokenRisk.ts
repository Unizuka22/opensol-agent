import { RiskAssessment, RiskFlag, TokenMintInfo } from "../types";
import { clamp } from "../utils/math";
import { analyzeTokenAuthorities } from "./authorityCheck";

export function scoreTokenRisk(mint: TokenMintInfo): RiskAssessment {
  const flags: RiskFlag[] = [];
  const unknowns: string[] = [];

  if (!mint.isValidAddress) {
    return {
      score: 0,
      level: "unknown",
      flags: [{
        code: "INVALID_MINT_ADDRESS",
        label: "Invalid mint address",
        severity: "unknown",
        points: 0,
        detail: "The provided value is not a valid Solana public key."
      }],
      unknowns: ["Token mint could not be analyzed because the address is invalid."],
      summary: "The token mint could not be analyzed because the address is invalid."
    };
  }

  if (mint.fetchError) {
    unknowns.push(mint.fetchError);
  }

  if (!mint.exists) {
    unknowns.push("No parsed token mint account was found for this address.");
  }

  flags.push(...analyzeTokenAuthorities(mint));

  if (mint.tokenStandard === "Unknown" && mint.exists) {
    flags.push({
      code: "UNKNOWN_TOKEN_PROGRAM",
      label: "Unknown token program",
      severity: "unknown",
      points: 5,
      detail: "The account owner was not recognized as standard SPL Token or Token-2022."
    });
  }

  if (mint.tokenStandard === "Token-2022") {
    flags.push({
      code: "TOKEN_2022_DETECTED",
      label: "Token-2022 mint",
      severity: "info",
      points: 0,
      detail: "Token-2022 was detected. Extensions should be reviewed, but Token-2022 is not automatically suspicious."
    });
  }

  for (const extension of mint.extensions) {
    flags.push({
      code: "TOKEN_2022_EXTENSION",
      label: `Token extension: ${extension}`,
      severity: "info",
      points: 0,
      detail: "A token extension was detected and should be interpreted in context."
    });
  }

  if (mint.decimals === undefined && mint.exists) {
    unknowns.push("Mint decimals were unavailable in parsed data.");
  }

  if (mint.supply === undefined && mint.exists) {
    unknowns.push("Mint supply was unavailable in parsed data.");
  }

  const score = clamp(flags.reduce((total, flag) => total + flag.points, 5), 0, 100);

  return {
    score,
    level: unknowns.length > 0 && flags.every((flag) => flag.points === 0) ? "unknown" : riskLevel(score),
    flags,
    unknowns,
    summary: buildTokenRiskSummary(score, flags, unknowns)
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

function buildTokenRiskSummary(score: number, flags: RiskFlag[], unknowns: string[]): string {
  const authorityFlags = flags.filter((flag) => flag.points > 0);

  if (unknowns.length > 0 && authorityFlags.length === 0) {
    return "There is not enough reliable mint data to produce a confident token risk read.";
  }

  if (authorityFlags.length === 0) {
    return `The token mint shows no active authority risk flags in this MVP scan. Score: ${score}/100.`;
  }

  const labels = authorityFlags.map((flag) => flag.label.toLowerCase()).join(", ");
  return `The token mint has ${labels}. These are investigation signals, not proof of malicious behavior. Score: ${score}/100.`;
}
