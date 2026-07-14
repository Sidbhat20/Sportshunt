import type { Role } from '@/types';

export const APP_ROUTES = {
  home: '/',
  about: '/about',
  login: '/login',
  partnerLogin: '/partner-login',
  privacyPolicy: '/privacy-policy',
  termsAndConditions: '/terms-and-conditions',
  cancellationPolicy: '/cancellation-policy',
  authCallback: '/auth/callback',
  playerHome: '/',
  venueHome: '/venue',
  venueDashboard: '/venue/dashboard',
  organizerHome: '/organizer',
  organizerDashboard: '/organizer/dashboard',
  adminHome: '/admin',
  refereeHome: '/referee',
} as const;

export const ROLE_HOME: Record<Role, string> = {
  user: APP_ROUTES.playerHome,
  venue_owner: APP_ROUTES.venueHome,
  organizer: APP_ROUTES.organizerHome,
  referee: APP_ROUTES.refereeHome,
  super_admin: APP_ROUTES.adminHome,
};

export function homeForRole(role: Role | undefined | null): string {
  if (!role) return APP_ROUTES.home;
  return ROLE_HOME[role] ?? APP_ROUTES.home;
}
