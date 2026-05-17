# Architecture

OpenSol Agent is a CLI-first TypeScript application with small modules for fetching public Solana data, analyzing it, and rendering reports.

## Data Flow

```text
CLI command
  -> config/RPC setup
  -> Solana fetcher
  -> analyzer modules
  -> deterministic explanation layer
  -> Markdown or JSON report
```

## Modules

### `src/cli.ts`

Defines the `opensol` command surface:

- `opensol token <mint-address>`
- `opensol wallet <wallet-address>`
- `opensol tx <transaction-signature>`

It also handles `--format`, `--out`, and `--rpc`.

### `src/config.ts`

Loads `.env` using `dotenv`, validates `SOLANA_RPC_URL`, and falls back to the public Solana mainnet RPC endpoint when unset.

### `src/solana/`

Contains RPC-facing code:

- `rpc.ts`: connection creation, public key validation, signature validation
- `token.ts`: parsed mint account lookup and largest token account fetch
- `wallet.ts`: SOL balance and recent signature lookup
- `transaction.ts`: parsed transaction fetch and instruction summaries
- `programs.ts`: known token program IDs and token program classification

### `src/analyzers/`

Contains deterministic, transparent heuristics:

- `tokenRisk.ts`: 0-100 token risk scoring
- `walletProfile.ts`: 0-100 wallet risk scoring
- `authorityCheck.ts`: mint and freeze authority checks
- `holderConcentration.ts`: largest-account concentration estimate
- `liquidity.ts`: v0.1 placeholder for future DEX pool checks
- `botPattern.ts`: high activity and failed-transaction signals
- `roughness.ts`: standalone price-series roughness heuristic

### `src/agent/`

The agent layer is deterministic in v0.1:

- `explain.ts`: plain-English explanations
- `prompts.ts`: future LLM prompt notes
- `memory.ts`: simple local JSON memory/watchlist placeholder

LLM support is intentionally optional and not required for the MVP.

### `src/reports/`

Renders typed reports:

- `markdown.ts`: human-readable reports
- `json.ts`: structured JSON output

### `src/types/`

Shared report, analyzer, and Solana summary types.

## Design Principles

- Public data only
- No private keys
- No signing
- No auto-buying or auto-selling
- Unknown data remains unknown
- Risk scoring is transparent and documented
