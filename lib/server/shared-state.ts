import { promises as fs } from 'fs';
import path from 'path';
import type { AppState } from '@/types';

export type SharedStateSnapshot = {
  updatedAt: string;
  state: AppState;
};

const DATA_DIR = path.join(process.cwd(), '.sportshunt');
const STATE_FILE = path.join(DATA_DIR, 'shared-state.json');

export async function readSharedStateSnapshot(): Promise<SharedStateSnapshot | null> {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    return JSON.parse(raw) as SharedStateSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function writeSharedStateSnapshot(snapshot: SharedStateSnapshot) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
  return snapshot;
}
