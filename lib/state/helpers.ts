import type {
  AppState,
  AppUser,
  NotificationItem,
  Organization,
  Tournament,
  TournamentMatch,
  Turf,
} from '@/types';
import { SEEDED_USERS } from '@/lib/auth-config';
import { bangaloreTurfs } from '@/lib/demo/turfs';
import { seedState } from '@/lib/demo/seed-state';
import { populateSeededMatches, propagateWinners } from '@/lib/tournament-logic';
import { id } from '@/lib/utils';

export const STORAGE_KEY = 'sportshunt_state_v6';
export const STATE_META_KEY = 'sportshunt_state_meta_v1';
export const SHARED_STATE_API = '/api/state';
export const SESSION_KEY = 'sportshunt_session_v6';
export const ORG_KEY = 'sportshunt_org_v6';
export const REFEREE_KEY = 'sportshunt_referee_v6';

export function cloneSeed() {
  if (typeof structuredClone === 'function') return structuredClone(seedState);
  return JSON.parse(JSON.stringify(seedState)) as AppState;
}

function mergeWithSeedTurfs(rawTurfs: Turf[] | undefined): Turf[] {
  const seedIds = new Set(bangaloreTurfs.map((turf) => turf.id));
  const userTurfs = (rawTurfs ?? []).filter(
    (turf) => turf && !seedIds.has(turf.id) && turf.ownerId !== 'owner_platform',
  );
  return [...bangaloreTurfs, ...userTurfs];
}

export function normalizeLoadedState(raw: AppState): AppState {
  const seededUsersById = new Map(SEEDED_USERS.map((user) => [user.id, user]));

  const mergedUsers = raw.users.map((user) => {
    const seededUser = seededUsersById.get(user.id);
    return seededUser ? { ...user, ...seededUser } : user;
  });

  SEEDED_USERS.forEach((seedUser) => {
    if (!mergedUsers.some((user) => user.id === seedUser.id)) {
      mergedUsers.push(seedUser);
    }
  });

  return {
    ...raw,
    users: mergedUsers,
    turfs: mergeWithSeedTurfs(raw.turfs),
    tournaments: raw.tournaments.map((tournament) => ({
      ...tournament,
      categories: tournament.categories ?? [],
    })),
  };
}

export function organizationsForUser(user: AppUser | null, appState: AppState) {
  if (!user) return [] as Organization[];
  if (user.role === 'super_admin') return appState.organizations;

  return appState.organizations.filter(
    (organization) =>
      organization.status === 'approved' &&
      organization.members.some(
        (member) => member.userId === user.id && member.status === 'active',
      ),
  );
}

export function deriveTournamentStatus(
  matches: TournamentMatch[],
  approvalStatus: Tournament['approvalStatus'],
  currentStatus: Tournament['status'],
): Tournament['status'] {
  if (currentStatus === 'suspended') return 'suspended';
  if (!matches.length) return 'upcoming';

  const verified = matches.every((match) => match.status === 'verified');
  if (verified) return 'completed';

  const touched = matches.some((match) => ['live', 'completed', 'verified'].includes(match.status));
  if (approvalStatus === 'approved' && touched) return 'ongoing';

  return 'upcoming';
}

export function refreshTournamentData(tournament: Tournament) {
  const seeded = populateSeededMatches(tournament.matches);
  const progressed = propagateWinners(seeded);

  return {
    ...tournament,
    matches: progressed,
    status: deriveTournamentStatus(progressed, tournament.approvalStatus, tournament.status),
  };
}

export function createNotification(
  payload: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>,
): NotificationItem {
  return {
    id: id('notification'),
    createdAt: new Date().toISOString(),
    read: false,
    ...payload,
  };
}
