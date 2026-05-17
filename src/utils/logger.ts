export const logger = {
  info(message: string): void {
    process.stderr.write(`${message}\n`);
  },
  warn(message: string): void {
    process.stderr.write(`Warning: ${message}\n`);
  },
  error(message: string): void {
    process.stderr.write(`Error: ${message}\n`);
  }
};
