import { NextResponse } from 'next/server';
import type { AppState } from '@/types';
import {
  readSharedStateSnapshot,
  writeSharedStateSnapshot,
  type SharedStateSnapshot,
} from '@/lib/server/shared-state';

function isValidSnapshot(value: unknown): value is SharedStateSnapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SharedStateSnapshot>;
  return Boolean(candidate.updatedAt && candidate.state);
}

export async function GET() {
  try {
    const snapshot = await readSharedStateSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read shared state.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as {
      updatedAt?: string;
      state?: AppState;
    };

    if (!payload.updatedAt || !payload.state) {
      return NextResponse.json({ ok: false, error: 'Missing state payload.' }, { status: 400 });
    }

    const current = await readSharedStateSnapshot();
    if (current && new Date(current.updatedAt).getTime() > new Date(payload.updatedAt).getTime()) {
      return NextResponse.json({ ok: true, snapshot: current, accepted: false });
    }

    const nextSnapshot: SharedStateSnapshot = {
      updatedAt: payload.updatedAt,
      state: payload.state,
    };

    if (!isValidSnapshot(nextSnapshot)) {
      return NextResponse.json({ ok: false, error: 'Invalid shared state payload.' }, { status: 400 });
    }

    await writeSharedStateSnapshot(nextSnapshot);
    return NextResponse.json({ ok: true, snapshot: nextSnapshot, accepted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to write shared state.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
