import { RiskFlag, TokenMintInfo } from "../types";

export function analyzeTokenAuthorities(mint: TokenMintInfo): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (mint.mintAuthority) {
    flags.push({
      code: "ACTIVE_MINT_AUTHORITY",
      label: "Active mint authority",
      severity: "high",
      points: 30,
      detail: "The mint authority is still active, so the authority may be able to create additional supply."
    });
  }

  if (mint.freezeAuthority) {
    flags.push({
      code: "ACTIVE_FREEZE_AUTHORITY",
      label: "Active freeze authority",
      severity: "medium",
      points: 20,
      detail: "The freeze authority is still active, so token accounts may be freezeable by the authority."
    });
  }

  if (mint.mintAuthority === null) {
    flags.push({
      code: "MINT_AUTHORITY_DISABLED",
      label: "Mint authority disabled",
      severity: "info",
      points: 0,
      detail: "The mint authority appears disabled in parsed mint data."
    });
  }

  if (mint.freezeAuthority === null) {
    flags.push({
      code: "FREEZE_AUTHORITY_DISABLED",
      label: "Freeze authority disabled",
      severity: "info",
      points: 0,
      detail: "The freeze authority appears disabled in parsed mint data."
    });
  }

  return flags;
}
