'use client';

import { useEffect, useRef } from 'react';
import type { AppState, AppUser } from '@/types';
import {
  ORG_KEY,
  REFEREE_KEY,
  SESSION_KEY,
  SHARED_STATE_API,
  STATE_META_KEY,
  STORAGE_KEY,
  normalizeLoadedState,
} from '@/lib/state/helpers';
import type { RefereeSession } from '@/lib/state/types';

type SharedStateResponse = {
  ok?: boolean;
  snapshot?: {
    updatedAt: string;
    state: AppState;
  } | null;
};

type LocalStateMeta = {
  updatedAt: string;
};

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function fetchSharedSnapshot() {
  try {
    const response = await fetch(SHARED_STATE_API, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-store' },
    });
    if (!response.ok) return null;
    const result = (await response.json()) as SharedStateResponse;
    return result.snapshot ?? null;
  } catch {
    return null;
  }
}

export function useAppPersistence({
  ready,
  setReady,
  state,
  setState,
  session,
  setSession,
  currentOrganizationId,
  setCurrentOrganizationId,
  refereeSession,
  setRefereeSession,
}: {
  ready: boolean;
  setReady: (value: boolean) => void;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  session: AppUser | null;
  setSession: React.Dispatch<React.SetStateAction<AppUser | null>>;
  currentOrganizationId: string | null;
  setCurrentOrganizationId: React.Dispatch<React.SetStateAction<string | null>>;
  refereeSession: RefereeSession | null;
  setRefereeSession: React.Dispatch<React.SetStateAction<RefereeSession | null>>;
}) {
  const lastPersistedStateRef = useRef('');
  const lastSyncedAtRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    async function hydrate() {
      const storedState = safeParse<AppState>(window.localStorage.getItem(STORAGE_KEY));
      const storedSession = safeParse<AppUser>(window.localStorage.getItem(SESSION_KEY));
      const storedOrg = safeParse<string>(window.localStorage.getItem(ORG_KEY));
      const storedReferee = safeParse<RefereeSession>(window.localStorage.getItem(REFEREE_KEY));
      const storedMeta = safeParse<LocalStateMeta>(window.localStorage.getItem(STATE_META_KEY));
      const sharedSnapshot = await fetchSharedSnapshot();

      if (cancelled) return;

      const localUpdatedAt = storedMeta?.updatedAt ?? '';
      const sharedUpdatedAt = sharedSnapshot?.updatedAt ?? '';
      const shouldUseShared =
        Boolean(sharedSnapshot?.state) &&
        (!storedState || new Date(sharedUpdatedAt).getTime() >= new Date(localUpdatedAt).getTime());

      const initialState = shouldUseShared
        ? normalizeLoadedState(sharedSnapshot!.state)
        : storedState
          ? normalizeLoadedState(storedState)
          : null;

      if (initialState) {
        const serialized = JSON.stringify(initialState);
        lastPersistedStateRef.current = shouldUseShared ? serialized : '';
        lastSyncedAtRef.current = shouldUseShared ? sharedUpdatedAt : localUpdatedAt;
        setState(initialState);
      }

      if (storedSession) setSession(storedSession);
      if (storedOrg) setCurrentOrganizationId(storedOrg);
      if (storedReferee) setRefereeSession(storedReferee);

      setReady(true);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [setCurrentOrganizationId, setReady, setRefereeSession, setSession, setState]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;

    const serialized = JSON.stringify(state);
    if (serialized === lastPersistedStateRef.current) {
      window.localStorage.setItem(STORAGE_KEY, serialized);
      return;
    }

    const updatedAt = new Date().toISOString();
    lastPersistedStateRef.current = serialized;
    lastSyncedAtRef.current = updatedAt;

    window.localStorage.setItem(STORAGE_KEY, serialized);
    window.localStorage.setItem(STATE_META_KEY, JSON.stringify({ updatedAt }));

    void fetch(SHARED_STATE_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatedAt, state }),
    }).catch(() => undefined);
  }, [ready, state]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;

    const interval = window.setInterval(async () => {
      const sharedSnapshot = await fetchSharedSnapshot();
      if (!sharedSnapshot?.state) return;
      if (
        new Date(sharedSnapshot.updatedAt).getTime() <= new Date(lastSyncedAtRef.current || 0).getTime()
      ) {
        return;
      }

      const normalized = normalizeLoadedState(sharedSnapshot.state);
      const serialized = JSON.stringify(normalized);
      lastPersistedStateRef.current = serialized;
      lastSyncedAtRef.current = sharedSnapshot.updatedAt;
      window.localStorage.setItem(STORAGE_KEY, serialized);
      window.localStorage.setItem(
        STATE_META_KEY,
        JSON.stringify({ updatedAt: sharedSnapshot.updatedAt }),
      );
      setState(normalized);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [ready, setState]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;

    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      document.cookie = `sportshunt_role=${session.role}; path=/; max-age=2592000; samesite=lax`;
      return;
    }

    window.localStorage.removeItem(SESSION_KEY);
    document.cookie = 'sportshunt_role=; path=/; max-age=0; samesite=lax';
  }, [ready, session]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;

    if (currentOrganizationId) {
      window.localStorage.setItem(ORG_KEY, JSON.stringify(currentOrganizationId));
      return;
    }

    window.localStorage.removeItem(ORG_KEY);
  }, [currentOrganizationId, ready]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;

    if (refereeSession) {
      window.localStorage.setItem(REFEREE_KEY, JSON.stringify(refereeSession));
      return;
    }

    window.localStorage.removeItem(REFEREE_KEY);
  }, [ready, refereeSession]);
}
