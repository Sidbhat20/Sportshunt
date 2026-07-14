import type { AppState } from '@/types';
import { SEEDED_USERS } from '@/lib/auth-config';
import { bangaloreTurfs } from '@/lib/demo/turfs';

export const seedState: AppState = {
  users: SEEDED_USERS,
  organizations: [],
  turfs: bangaloreTurfs,
  bookings: [],
  games: [],
  tournaments: [],
  applications: [],
  notifications: [],
};
