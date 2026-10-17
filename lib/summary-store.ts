import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Server-side store for AI summaries shared by every user: one JSON file on
// disk (a Docker volume in production), mirrored in memory. If the directory
// is not writable (e.g. on Vercel) summaries still live in memory until the
// process restarts.

export interface StoredSummary {
  summary: string;
  createdAt: number;
}

const STORE_DIR = process.env.SUMMARY_STORE_DIR || path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'ai-summaries.json');
const MAX_ENTRY_AGE_MS = 7 * 24 * 60 * 60 * 1000;

let entries: Promise<Map<string, StoredSummary>> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function loadEntries(): Promise<Map<string, StoredSummary>> {
  entries ??= readFile(STORE_FILE, 'utf8')
    .then((raw) => new Map(Object.entries(JSON.parse(raw) as Record<string, StoredSummary>)))
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        console.error('Failed to read the AI summary store, starting empty:', error);
      }
      return new Map<string, StoredSummary>();
    });
  return entries;
}

export async function readSummary(key: string): Promise<StoredSummary | undefined> {
  return (await loadEntries()).get(key);
}

export async function writeSummary(key: string, summary: string): Promise<void> {
  const all = await loadEntries();
  const now = Date.now();
  all.set(key, { summary, createdAt: now });
  for (const [entryKey, entry] of all) {
    if (now - entry.createdAt > MAX_ENTRY_AGE_MS) all.delete(entryKey);
  }

  // Writes are serialized and go through a temp file + rename so a crash
  // mid-write never leaves a truncated store behind.
  const snapshot = JSON.stringify(Object.fromEntries(all));
  writeQueue = writeQueue.then(async () => {
    try {
      await mkdir(STORE_DIR, { recursive: true });
      const tempFile = `${STORE_FILE}.tmp`;
      await writeFile(tempFile, snapshot, 'utf8');
      await rename(tempFile, STORE_FILE);
    } catch (error) {
      console.error('Failed to persist the AI summary store:', error);
    }
  });
  await writeQueue;
}
