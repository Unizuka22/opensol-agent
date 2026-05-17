import { OpenSolReport } from "../types";

export function renderJsonReport(report: OpenSolReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
