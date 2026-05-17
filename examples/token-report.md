# OpenSol Token Risk Report

Generated: 2026-05-17T00:00:00.000Z

Summary: This mint appears to use SPL Token. The mint authority is active and freeze authority is disabled. Risk score is 35/100 (medium). Liquidity was not checked in v0.1.

## Risk

Risk score: 35/100 (medium)

The token mint has active mint authority. These are investigation signals, not proof of malicious behavior. Score: 35/100.

### Flags

- [high] Active mint authority: The mint authority is still active, so the authority may be able to create additional supply. (30 pts)
- [info] Freeze authority disabled: The freeze authority appears disabled in parsed mint data. (0 pts)

## Mint Details

- Address: ExampleMint1111111111111111111111111111111111
- Valid address: yes
- Account found: yes
- Supply: 1,000,000,000
- Decimals: 6
- Mint authority: active
- Freeze authority: disabled
- Token program: SPL Token
- Owner program: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
- Extensions: none detected

## Holder Concentration

- Status: available
- Observed token accounts: 20
- Top account share: 42.10%
- Top five share: 76.25%
- Concentration is based on largest token accounts returned by RPC, not a complete holder graph.

## Liquidity

- Status: not_checked
- Liquidity pool discovery is not implemented in v0.1.
- Future versions should inspect public DEX pool accounts and avoid treating missing pool data as proof of risk.

## Warnings

- Research software only; not financial advice.
- OpenSol Agent analyzes public data only and does not prove intent.
- Verify important findings independently.
