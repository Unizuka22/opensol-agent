export type OutputFormat = "markdown" | "json";

export type ReportKind = "token" | "wallet" | "transaction";

export type RiskLevel = "low" | "medium" | "high" | "unknown";

export type RiskFlagSeverity = "info" | "low" | "medium" | "high" | "unknown";

export interface RiskFlag {
  code: string;
  label: string;
  severity: RiskFlagSeverity;
  points: number;
  detail: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  flags: RiskFlag[];
  unknowns: string[];
  summary: string;
}

export interface TokenMintInfo {
  address: string;
  isValidAddress: boolean;
  exists: boolean;
  supply?: string;
  uiSupply?: number | null;
  decimals?: number;
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  ownerProgram?: string;
  tokenStandard: "SPL Token" | "Token-2022" | "Unknown";
  extensions: string[];
  fetchError?: string;
}

export interface LargestTokenAccount {
  address: string;
  amount: string;
  uiAmount: number | null;
  decimals: number;
}

export interface HolderConcentrationResult {
  status: "available" | "unknown" | "insufficient_data";
  topHolderPercent?: number;
  topFivePercent?: number;
  holderCount: number;
  notes: string[];
}

export interface LiquidityResult {
  status: "unknown" | "not_checked";
  notes: string[];
}

export interface WalletSignatureSummary {
  signature: string;
  slot: number;
  blockTime: number | null;
  failed: boolean;
}

export interface WalletProfile {
  address: string;
  isValidAddress: boolean;
  solBalance?: number;
  recentActivityCount: number;
  failedRecentActivityCount: number;
  walletTypeGuess:
    | "inactive"
    | "normal user"
    | "high-activity wallet"
    | "possible bot/market-maker"
    | "unknown";
  recentSignatures: WalletSignatureSummary[];
  fetchError?: string;
}

export interface ProgramCallSummary {
  program: string;
  programId: string;
  instructionType?: string;
}

export interface AccountSummary {
  address: string;
  signer: boolean;
  writable: boolean;
}

export interface TokenTransferSummary {
  type: string;
  source?: string;
  destination?: string;
  authority?: string;
  mint?: string;
  amount?: string;
}

export interface TransactionSummary {
  signature: string;
  isValidSignature: boolean;
  found: boolean;
  status: "success" | "failed" | "unknown";
  feeLamports?: number;
  slot?: number;
  blockTime?: number | null;
  accounts: AccountSummary[];
  programs: ProgramCallSummary[];
  tokenTransfers: TokenTransferSummary[];
  fetchError?: string;
}

export interface BaseReport {
  type: ReportKind;
  title: string;
  generatedAt: string;
  summary: string;
  warnings: string[];
}

export interface TokenReport extends BaseReport {
  type: "token";
  mint: TokenMintInfo;
  risk: RiskAssessment;
  holderConcentration: HolderConcentrationResult;
  liquidity: LiquidityResult;
}

export interface WalletReport extends BaseReport {
  type: "wallet";
  wallet: WalletProfile;
  risk: RiskAssessment;
}

export interface TransactionReport extends BaseReport {
  type: "transaction";
  transaction: TransactionSummary;
}

export type OpenSolReport = TokenReport | WalletReport | TransactionReport;

export type RoughnessClassification =
  | "too_smooth"
  | "normal"
  | "too_choppy"
  | "insufficient_data";

export interface RoughnessResult {
  classification: RoughnessClassification;
  sampleSize: number;
  averageAbsoluteMove?: number;
  volatility?: number;
  signChangeRate?: number;
  note: string;
}
