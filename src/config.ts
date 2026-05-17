import dotenv from "dotenv";
import { z } from "zod";

export const DEFAULT_SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

dotenv.config();

const envSchema = z.object({
  SOLANA_RPC_URL: z.string().url().optional()
});

export interface OpenSolConfig {
  rpcUrl: string;
}

export function getConfig(overrides: Partial<OpenSolConfig> = {}): OpenSolConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment config: ${parsed.error.message}`);
  }

  return {
    rpcUrl: overrides.rpcUrl ?? parsed.data.SOLANA_RPC_URL ?? DEFAULT_SOLANA_RPC_URL
  };
}
