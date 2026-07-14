import type { AppUser, Role } from '@/types';

export const DEFAULT_TEST_LOGIN = {
  email: 'siddharthbhat20@gmail.com',
  password: 'SH@123',
  name: 'Siddharth Bhat',
} as const;

export const SUPER_ADMIN_TEST_LOGIN = {
  email: 'bhatsiddharth10@gmail.com',
  password: 'SH@123',
  name: 'Siddharth Bhat',
} as const;

export const REFEREE_TEST_LOGIN = {
  email: 'suchetanms@gmail.com',
  password: 'SH@123',
  name: 'Suchetan M S',
} as const;

export function getTestingLoginForRole(role: Role | 'player') {
  if (role === 'super_admin') return SUPER_ADMIN_TEST_LOGIN;
  if (role === 'referee') return REFEREE_TEST_LOGIN;
  return DEFAULT_TEST_LOGIN;
}

export const TEST_USERS_BY_ROLE: Record<Role, AppUser> = {
  user: {
    id: 'test_player_siddharth',
    name: DEFAULT_TEST_LOGIN.name,
    email: DEFAULT_TEST_LOGIN.email,
    role: 'user',
    status: 'active',
    city: 'Bangalore',
  },
  venue_owner: {
    id: 'test_venue_owner_siddharth',
    name: DEFAULT_TEST_LOGIN.name,
    email: DEFAULT_TEST_LOGIN.email,
    role: 'venue_owner',
    status: 'active',
    city: 'Bangalore',
  },
  organizer: {
    id: 'test_organizer_siddharth',
    name: DEFAULT_TEST_LOGIN.name,
    email: DEFAULT_TEST_LOGIN.email,
    role: 'organizer',
    status: 'active',
    city: 'Bangalore',
  },
  referee: {
    id: 'test_referee_siddharth',
    name: REFEREE_TEST_LOGIN.name,
    email: REFEREE_TEST_LOGIN.email,
    role: 'referee',
    status: 'active',
    city: 'Bangalore',
  },
  super_admin: {
    id: 'test_super_admin_siddharth',
    name: SUPER_ADMIN_TEST_LOGIN.name,
    email: SUPER_ADMIN_TEST_LOGIN.email,
    role: 'super_admin',
    status: 'active',
    city: 'Bangalore',
  },
};

export const SEEDED_USERS: AppUser[] = [
  TEST_USERS_BY_ROLE.super_admin,
  TEST_USERS_BY_ROLE.venue_owner,
  TEST_USERS_BY_ROLE.organizer,
  TEST_USERS_BY_ROLE.referee,
  TEST_USERS_BY_ROLE.user,
  {
    id: 'owner_platform',
    name: 'Sportshunt Venues',
    email: 'venues@sportshunt.in',
    role: 'venue_owner',
    status: 'active',
    city: 'Bangalore',
  },
];

export function expectedRoleForRoute(value: string | null): Role | 'player' {
  if (value === 'admin') return 'super_admin';
  if (value === 'venue-owner') return 'venue_owner';
  if (value === 'organizer' || value === 'organiser') return 'organizer';
  if (value === 'referee') return 'referee';
  return 'player';
}

export function isTestingLoginEmail(email: string, role: Role | 'player') {
  return email.trim().toLowerCase() === getTestingLoginForRole(role).email;
}

export function isTestingCredentialMatch(email: string, password: string, role: Role | 'player') {
  const credential = getTestingLoginForRole(role);
  return email.trim().toLowerCase() === credential.email && password === credential.password;
}

export function getTestingUserForRole(role: Role): AppUser {
  return TEST_USERS_BY_ROLE[role];
}
