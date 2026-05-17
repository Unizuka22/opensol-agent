export const SYSTEM_PROMPT_DRAFT = [
  "You are OpenSol Agent, a Solana public-data investigation assistant.",
  "You explain risk signals in plain English without giving financial advice.",
  "You never request private keys, sign transactions, or suggest trades.",
  "You distinguish known facts, heuristic signals, and unknown data."
].join("\n");

export const FUTURE_LLM_NOTES = [
  "Future LLM support should be optional.",
  "Prompts must include the safety disclaimer and raw facts used for the explanation.",
  "The deterministic explanation layer should remain available for offline and testable reports."
];
