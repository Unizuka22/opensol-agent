import { promises as fs } from "node:fs";
import path from "node:path";

import { z } from "zod";

const WatchedAddressSchema = z.object({
  address: z.string(),
  label: z.string().optional(),
  addedAt: z.string()
});

const MemorySchema = z.object({
  watchedAddresses: z.array(WatchedAddressSchema),
  updatedAt: z.string()
});

export type WatchedAddress = z.infer<typeof WatchedAddressSchema>;
export type LocalMemory = z.infer<typeof MemorySchema>;

export function defaultMemoryPath(): string {
  return path.join(process.cwd(), ".opensol-agent-memory.json");
}

export async function loadMemory(filePath = defaultMemoryPath()): Promise<LocalMemory> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = MemorySchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return parsed.data;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return {
    watchedAddresses: [],
    updatedAt: new Date().toISOString()
  };
}

export async function saveMemory(memory: LocalMemory, filePath = defaultMemoryPath()): Promise<void> {
  await fs.writeFile(filePath, `${JSON.stringify(memory, null, 2)}\n`, "utf8");
}

export async function addWatchedAddress(
  address: string,
  label?: string,
  filePath = defaultMemoryPath()
): Promise<LocalMemory> {
  const memory = await loadMemory(filePath);
  const existing = memory.watchedAddresses.find((item) => item.address === address);

  if (!existing) {
    memory.watchedAddresses.push({
      address,
      label,
      addedAt: new Date().toISOString()
    });
  }

  memory.updatedAt = new Date().toISOString();
  await saveMemory(memory, filePath);
  return memory;
}
