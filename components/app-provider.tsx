'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, AppUser, NotificationItem, Organization, Tournament } from '@/types';
import { cloneSeed, organizationsForUser } from '@/lib/state/helpers';
import { createActivityActions } from '@/lib/state/activity-actions';
import { createAuthActions } from '@/lib/state/auth-actions';
import { createModerationActions } from '@/lib/state/moderation-actions';
import { createOrganizationActions } from '@/lib/state/organization-actions';
import { countUnreadNotifications, deriveCurrentOrganization } from '@/lib/state/selectors';
import { createTournamentActions } from '@/lib/state/tournament-actions';
import type { AppContextValue, RefereeSession } from '@/lib/state/types';
import { useAppPersistence } from '@/lib/state/use-app-persistence';
import { LenisProvider } from '@/components/motion/lenis-provider';
import { NavigationProgress } from '@/components/motion/navigation-progress';
import { ToastProvider } from '@/components/motion/toast';

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(cloneSeed);
  const [session, setSession] = useState<AppUser | null>(null);
  const [currentOrganizationId, setCurrentOrganizationIdState] = useState<string | null>(null);
  const [refereeSession, setRefereeSession] = useState<RefereeSession | null>(null);

  useAppPersistence({
    ready,
    setReady,
    state,
    setState,
    session,
    setSession,
    currentOrganizationId,
    setCurrentOrganizationId: setCurrentOrganizationIdState,
    refereeSession,
    setRefereeSession,
  });

  const myOrganizations = useMemo(() => organizationsForUser(session, state), [session, state]);
  const currentOrganization = useMemo(
    () => deriveCurrentOrganization(myOrganizations, currentOrganizationId),
    [currentOrganizationId, myOrganizations],
  );
  const unreadNotifications = useMemo(
    () => countUnreadNotifications(state.notifications, session, myOrganizations),
    [myOrganizations, session, state.notifications],
  );

  useEffect(() => {
    if (!ready) return;
    if (!currentOrganizationId && myOrganizations[0]) {
      setCurrentOrganizationIdState(myOrganizations[0].id);
      return;
    }
    if (
      currentOrganizationId &&
      !myOrganizations.some((organization) => organization.id === currentOrganizationId)
    ) {
      setCurrentOrganizationIdState(myOrganizations[0]?.id ?? null);
    }
  }, [currentOrganizationId, myOrganizations, ready]);

  function syncSessionWithUsers(users: AppUser[]) {
    setSession((current) => {
      if (!current) return current;
      const updated = users.find((user) => user.id === current.id);
      return updated ?? null;
    });
  }

  function ensureActiveUser() {
    if (!session) return { ok: false as const, message: 'Please log in first.' };
    if (session.status !== 'active')
      return { ok: false as const, message: `Your account is ${session.status}.` };
    return { ok: true as const, user: session };
  }

  function upsertTournament(nextTournament: Tournament, notifications: NotificationItem[] = []) {
    setState((currentState) => {
      const exists = currentState.tournaments.some(
        (tournament) => tournament.id === nextTournament.id,
      );

      return {
        ...currentState,
        tournaments: exists
          ? currentState.tournaments.map((tournament) =>
              tournament.id === nextTournament.id ? nextTournament : tournament,
            )
          : [nextTournament, ...currentState.tournaments],
        notifications: [...notifications, ...currentState.notifications],
      };
    });
  }

  const authActions = useMemo(
    () =>
      createAuthActions({
        state,
        setState,
        setSession,
        setRefereeSession,
      }),
    [state],
  );

  const organizationActions = useMemo(
    () =>
      createOrganizationActions({
        state,
        setState,
        setCurrentOrganizationId: setCurrentOrganizationIdState,
        ensureActiveUser,
        session,
        myOrganizations,
      }),
    [myOrganizations, session, state],
  );

  const activityActions = useMemo(
    () =>
      createActivityActions({
        state,
        setState,
        ensureActiveUser,
      }),
    [state],
  );

  const tournamentActions = useMemo(
    () =>
      createTournamentActions({
        state,
        refereeSession,
        setRefereeSession,
        ensureActiveUser,
        upsertTournament,
      }),
    [refereeSession, state],
  );

  const moderationActions = useMemo(
    () =>
      createModerationActions({
        state,
        setState,
        syncSessionWithUsers,
        upsertTournament,
      }),
    [state],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      state,
      session,
      refereeSession,
      currentOrganizationId,
      currentOrganization,
      myOrganizations,
      unreadNotifications,
      ...authActions,
      ...organizationActions,
      ...activityActions,
      ...tournamentActions,
      ...moderationActions,
    }),
    [
      activityActions,
      authActions,
      currentOrganization,
      currentOrganizationId,
      moderationActions,
      myOrganizations,
      organizationActions,
      ready,
      refereeSession,
      session,
      state,
      tournamentActions,
      unreadNotifications,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      <NavigationProgress />
      <ToastProvider>
        <LenisProvider>{children}</LenisProvider>
      </ToastProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
