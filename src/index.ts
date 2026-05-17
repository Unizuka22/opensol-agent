#!/usr/bin/env node
import { runCli } from "./cli";
import { logger } from "./utils/logger";

runCli().catch((error) => {
  logger.error(error instanceof Error ? error.message : "Unknown CLI error.");
  process.exitCode = 1;
});
