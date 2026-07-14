import type { Dispatch, SetStateAction } from 'react';
import type { AppState, AppUser, Role } from '@/types';
import {
  getTestingLoginForRole,
  getTestingUserForRole,
  isTestingLoginEmail,
} from '@/lib/auth-config';
import type { AppContextValue, MessageResult, RefereeSession } from '@/lib/state/types';
import { supabase } from '@/lib/supabase';

function buildPlayerUser(email: string, name: string): AppUser {
  const normalizedEmail = email.trim().toLowerCase();
  const safeId = `user_${normalizedEmail.replace(/[^a-z0-9]+/g, '_')}`;
  return {
    id: safeId,
    name: name.trim() || normalizedEmail.split('@')[0] || 'Player',
    email: normalizedEmail,
    role: 'user',
    status: 'active',
    city: 'Bangalore',
  };
}

export function createAuthActions({
  state,
  setState,
  setSession,
  setRefereeSession,
}: {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  setSession: Dispatch<SetStateAction<AppUser | null>>;
  setRefereeSession: Dispatch<SetStateAction<RefereeSession | null>>;
}): Pick<AppContextValue, 'login' | 'logout'> {
  return {
    login(email, name, expectedRole = 'player'): MessageResult {
      const normalizedEmail = email.trim().toLowerCase();
      const targetRole: Role = expectedRole === 'player' ? 'user' : expectedRole;

      if (isTestingLoginEmail(normalizedEmail, targetRole)) {
        const testingUser = getTestingUserForRole(targetRole);
        if (!state.users.some((user) => user.id === testingUser.id)) {
          setState((current) => ({
            ...current,
            users: [testingUser, ...current.users],
          }));
        }
        setSession(testingUser);
        return {
          ok: true,
          message: `Welcome back, ${testingUser.name}.`,
          role: testingUser.role,
        };
      }

      if (targetRole === 'user') {
        const existing = state.users.find(
          (user) => user.email.trim().toLowerCase() === normalizedEmail,
        );

        if (existing) {
          if (existing.status !== 'active') {
            return {
              ok: false,
              message: `Your account is ${existing.status}.`,
            };
          }
          setSession(existing);
          return {
            ok: true,
            message: `Welcome back, ${existing.name}.`,
            role: existing.role,
          };
        }

        const newUser = buildPlayerUser(normalizedEmail, name ?? '');
        setState((current) => ({
          ...current,
          users: [newUser, ...current.users],
        }));
        setSession(newUser);
        return {
          ok: true,
          message: `Welcome, ${newUser.name}.`,
          role: 'user',
        };
      }

      const testingCredential = getTestingLoginForRole(targetRole);
      return {
        ok: false,
        message: `Only ${testingCredential.email} can sign in to this workspace while testing mode is enabled.`,
      };
    },
    logout() {
      setSession(null);
      setRefereeSession(null);
      void supabase.auth.signOut();
    },
  };
}
