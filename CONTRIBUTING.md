# Contributing to OpenSol Agent

Thanks for considering a contribution. OpenSol Agent is intentionally small and transparent — the goal is for any analyst to be able to read the code and trust the reports.

## Ground Rules

1. **No black-box scoring.** Every risk flag must be traceable to a specific on-chain fact.
2. **No private keys.** OpenSol Agent never asks for, stores, or accepts a private key.
3. **No trading.** Pull requests that add buy/sell/swap/sign behavior will be closed.
4. **Public RPC must work.** Features should degrade gracefully when running against the free public endpoint, not require a paid RPC.

## Getting Set Up

```bash
git clone git@github.com:Unizuka22/opensol-agent.git
cd opensol-agent
npm install
npm run build
node dist/index.js token 9XQXjUhyV8n4Quwv6WHYzFco9Yst81Ga4Xxvc2KNjDvq
```

If you have your own RPC endpoint, set it in `.env`:

```bash
cp .env.example .env
echo "SOLANA_RPC_URL=https://your-rpc.example" >> .env
```

## Development Loop

```bash
npm run dev -- token <mint>     # run from source with tsx
npm run lint                    # type-check (tsc --noEmit)
npm test                        # vitest
npm run build                   # compile to dist/
```

The CI workflow runs the same three commands on Node 20 and 22 — please make sure they all pass before opening a PR.

## How to Add a New Analyzer

Analyzers live in [`src/analyzers/`](src/analyzers/). Each one:

- Takes a parsed Solana payload (mint, account, transaction)
- Returns a list of typed flags with a severity and points
- Has a corresponding test in [`tests/`](tests/)

If you add a new flag type, also update [`docs/risk-model.md`](docs/risk-model.md) so the scoring stays documented.

## Pull Request Checklist

- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] New analyzers or report fields have tests
- [ ] If you changed the scoring, [`docs/risk-model.md`](docs/risk-model.md) is updated
- [ ] You added or refreshed an example in [`examples/`](examples/) if the output shape changed
- [ ] The PR description explains *why*, not just *what*

## Reporting Bugs

For non-security bugs, open a GitHub issue with:

- The exact command you ran
- The address you ran it against
- The output you got vs. the output you expected

For security issues, follow [`SECURITY.md`](SECURITY.md) instead.

## Scope

OpenSol Agent is **not** trying to be a full block explorer, a wallet, or a trading bot. If your contribution moves it toward any of those, please open a discussion first so we can talk about scope before you put work into a PR.

Thanks again — small, sharp contributions are very welcome.
