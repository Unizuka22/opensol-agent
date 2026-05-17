# Risk Model

OpenSol Agent uses a simple transparent score from 0 to 100. The score is a heuristic investigation aid, not a financial recommendation and not proof of wrongdoing.

## Token Risk

The v0.1 token score starts from a low baseline and adds points for explicit observable signals.

| Signal | Points | Why it matters |
| --- | ---: | --- |
| Active mint authority | +30 | Additional supply may be created by the authority. |
| Active freeze authority | +20 | Token accounts may be freezeable by the authority. |
| Unknown token program | +5 | The account owner was not recognized as standard SPL Token or Token-2022. |
| Token-2022 detected | +0 | Token-2022 and extensions should be reviewed, but are not automatically suspicious. |
| Missing metadata | +0 | Missing metadata is unknown or neutral in v0.1, not automatically high risk. |

Risk levels:

- `low`: score below 35
- `medium`: score from 35 to 69
- `high`: score 70 or above
- `unknown`: not enough reliable data to score confidently

## Wallet Risk

Wallet risk is based on recent public activity from the selected RPC endpoint.

| Signal | Points | Why it matters |
| --- | ---: | --- |
| High recent activity | +12 | More activity than a casual wallet; not suspicious by itself. |
| Bot-like activity pattern | +25 | Very high activity or high activity plus failed transactions. |
| Elevated failed transaction rate | +10 | Repeated failures may indicate retries or unusual automation. |
| High failed transaction rate | +25 | A large share of failures deserves closer review. |
| Limited activity data | +0 | Low activity limits confidence. |

## Holder Concentration

Holder concentration currently uses `getTokenLargestAccounts`. This is not a full holder graph. It is an observed largest-account concentration estimate and should be treated as incomplete.

## Liquidity Risk

Liquidity analysis is a placeholder in v0.1. Future versions should inspect public DEX pool accounts, pool depth, LP concentration, and recent liquidity changes.

## Roughness Signal

The roughness analyzer accepts a numeric price series and classifies it as:

- `too_smooth`
- `normal`
- `too_choppy`
- `insufficient_data`

This is a heuristic signal, not proof of manipulation. It should only be used as one clue among many.

## Limitations

- RPC endpoints may omit old data or behave differently.
- Parsed transaction data can miss details in custom programs.
- Risk scores do not model market value or future performance.
- The tool does not know intent.
- The tool does not provide financial advice.
