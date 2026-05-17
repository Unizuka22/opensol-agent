export const STANDARD_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPF5LqZ6esr7C2awFtU";

export function describeTokenProgram(ownerProgram?: string): "SPL Token" | "Token-2022" | "Unknown" {
  if (ownerProgram === STANDARD_TOKEN_PROGRAM_ID) {
    return "SPL Token";
  }

  if (ownerProgram === TOKEN_2022_PROGRAM_ID) {
    return "Token-2022";
  }

  return "Unknown";
}

export function isKnownTokenProgram(ownerProgram?: string): boolean {
  return ownerProgram === STANDARD_TOKEN_PROGRAM_ID || ownerProgram === TOKEN_2022_PROGRAM_ID;
}
