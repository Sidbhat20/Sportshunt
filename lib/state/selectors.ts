import type { AppUser, NotificationItem, Organization } from '@/types';

export function deriveCurrentOrganization(
  organizations: Organization[],
  currentOrganizationId: string | null,
) {
  return (
    organizations.find((organization) => organization.id === currentOrganizationId) ??
    organizations[0] ??
    null
  );
}

export function countUnreadNotifications(
  notifications: NotificationItem[],
  session: AppUser | null,
  organizations: Organization[],
) {
  return notifications.filter((notification) => {
    if (notification.read) return false;

    const matchesUser = !notification.userId || notification.userId === session?.id;
    const matchesOrganization =
      !notification.organizationId ||
      organizations.some((organization) => organization.id === notification.organizationId);

    return matchesUser && matchesOrganization;
  }).length;
}
