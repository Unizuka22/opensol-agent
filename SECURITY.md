# Security Policy

OpenSol Agent is research software that analyzes **public** Solana data. It does not handle private keys, sign transactions, or move funds. That said, it is a tool that other people may rely on, so security reports are taken seriously.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security problems.**

If you believe you have found a security issue, please report it privately:

1. Open a [private security advisory](https://github.com/Unizuka22/opensol-agent/security/advisories/new) on GitHub, or
2. Email the maintainer through the address listed on the [Unizuka22 GitHub profile](https://github.com/Unizuka22).

When reporting, please include:

- A description of the issue and its impact
- Steps to reproduce
- Affected version (commit hash or release tag)
- Any suggested mitigation, if you have one

You can expect an initial response within 72 hours. Coordinated disclosure is preferred — please give the maintainer a reasonable window to fix the issue before publishing details.

## What Counts as a Security Issue

- A way to make OpenSol Agent **execute arbitrary code** from a malicious RPC response, address, or report file
- A path that causes OpenSol Agent to **leak local data** (env vars, file contents, etc.)
- **Denial-of-service** vectors triggered by a crafted on-chain payload
- **Supply-chain** issues in dependencies that affect end users

## What Is Not a Security Issue

- A risk score you disagree with — risk scores are heuristics, not verdicts. Open a normal issue with the address and the score you expected.
- The CLI being slow against the public Solana RPC under heavy load — set `SOLANA_RPC_URL` to your own endpoint.
- Lack of features in the [roadmap](docs/roadmap.md).

## Disclaimer

Findings produced by OpenSol Agent are **not** financial advice, legal advice, or proof of wrongdoing. They are signals for further investigation. See [`docs/disclaimer.md`](docs/disclaimer.md) for the full disclaimer.
