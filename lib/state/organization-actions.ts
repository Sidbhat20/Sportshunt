import type { Dispatch, SetStateAction } from 'react';
import type {
  AppState,
  AppUser,
  NotificationItem,
  Organization,
  OrganizationMember,
} from '@/types';
import { createNotification } from '@/lib/state/helpers';
import type { AppContextValue } from '@/lib/state/types';
import { id } from '@/lib/utils';

type EnsureActiveUser = () => { ok: false; message: string } | { ok: true; user: AppUser };

function openInviteComposer(payload: {
  email: string;
  name: string;
  role: OrganizationMember['role'];
  organizationName: string;
}) {
  if (typeof window === 'undefined') return false;

  const subject = `Sportshunt invite • ${payload.organizationName}`;
  const body = [
    `Hi ${payload.name},`,
    '',
    `You've been invited to join ${payload.organizationName} on Sportshunt as ${payload.role}.`,
    '',
    'Open Sportshunt and sign in with your assigned testing credential to continue.',
    '',
    '— Sportshunt',
  ].join('\n');

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(payload.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const popup = window.open(gmailUrl, '_blank', 'noopener,noreferrer');

  if (popup) return true;

  window.location.href = `mailto:${encodeURIComponent(payload.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return true;
}

async function sendInviteEmail(payload: {
  email: string;
  name: string;
  role: OrganizationMember['role'];
  organizationName: string;
}) {
  if (typeof window === 'undefined') return;

  try {
    const response = await fetch('/api/member-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { ok?: boolean; mode?: string };
    if (!response.ok || !result.ok) {
      openInviteComposer(payload);
    }
  } catch {
    openInviteComposer(payload);
  }
}

export function createOrganizationActions({
  state,
  setState,
  setCurrentOrganizationId,
  ensureActiveUser,
  session,
  myOrganizations,
}: {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  setCurrentOrganizationId: Dispatch<SetStateAction<string | null>>;
  ensureActiveUser: EnsureActiveUser;
  session: AppUser | null;
  myOrganizations: Organization[];
}): Pick<
  AppContextValue,
  | 'setCurrentOrganization'
  | 'markNotificationsRead'
  | 'createOrganization'
  | 'inviteMember'
  | 'updateMemberRole'
  | 'removeMember'
> {
  return {
    setCurrentOrganization(organizationId) {
      setCurrentOrganizationId(organizationId);
    },
    markNotificationsRead() {
      setState((currentState) => ({
        ...currentState,
        notifications: currentState.notifications.map((notification) => {
          const matchesUser = !notification.userId || notification.userId === session?.id;
          const matchesOrg =
            !notification.organizationId ||
            myOrganizations.some((organization) => organization.id === notification.organizationId);
          return matchesUser && matchesOrg ? { ...notification, read: true } : notification;
        }),
      }));
    },
    createOrganization(payload) {
      const current = ensureActiveUser();
      if (!current.ok) return current;

      const organization: Organization = {
        id: id('organization'),
        ownerId: current.user.id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        status: 'pending',
        members: [
          {
            id: id('member'),
            organizationId: '',
            userId: current.user.id,
            name: current.user.name,
            email: current.user.email,
            role: 'admin',
            status: 'active',
          },
        ],
      };
      organization.members[0].organizationId = organization.id;

      setState((currentState) => ({
        ...currentState,
        organizations: [organization, ...currentState.organizations],
        notifications: [
          createNotification({
            title: 'Organization submitted',
            body: `${payload.name} has been sent to the admin team for review.`,
            userId: current.user.id,
          }),
          ...currentState.notifications,
        ],
      }));

      return { ok: true, message: 'Organization submitted for admin approval.' };
    },
    inviteMember(organizationId, payload) {
      const current = ensureActiveUser();
      if (!current.ok) return current;

      const targetOrganization = myOrganizations.find(
        (organization) => organization.id === organizationId,
      );
      const existingMember = targetOrganization?.members.find(
        (member) => member.email.toLowerCase() === payload.email.toLowerCase(),
      );
      const linkedUser = state.users.find(
        (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
      );
      if (existingMember) {
        return { ok: false, message: 'That member is already part of this organization.' };
      }

      setState((currentState) => ({
        ...currentState,
        organizations: currentState.organizations.map((organization) => {
          if (organization.id !== organizationId) return organization;
          const member: OrganizationMember = {
            id: id('member'),
            organizationId,
            userId: linkedUser?.id,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: linkedUser ? 'active' : 'invited',
          };
          return { ...organization, members: [...organization.members, member] };
        }),
        notifications: [
          createNotification({
            title: 'Member invited',
            body: `${linkedUser ? `${payload.email} was linked to the organization.` : `An invite draft has been opened for ${payload.email}.`}`,
            organizationId,
          }),
          ...currentState.notifications,
        ],
      }));

      if (!linkedUser && targetOrganization) {
        void sendInviteEmail({
          email: payload.email,
          name: payload.name,
          role: payload.role,
          organizationName: targetOrganization.name,
        });
      }

      return {
        ok: true,
        message: linkedUser
          ? 'Existing Sportshunt user linked successfully.'
          : 'Invite draft opened in email and member access has been recorded.',
      };
    },
    updateMemberRole(organizationId, memberId, role) {
      setState((currentState) => ({
        ...currentState,
        organizations: currentState.organizations.map((organization) =>
          organization.id !== organizationId
            ? organization
            : {
                ...organization,
                members: organization.members.map((member) =>
                  member.id === memberId ? { ...member, role } : member,
                ),
              },
        ),
      }));
    },
    removeMember(organizationId, memberId) {
      setState((currentState) => ({
        ...currentState,
        organizations: currentState.organizations.map((organization) =>
          organization.id !== organizationId
            ? organization
            : {
                ...organization,
                members: organization.members.filter((member) => member.id !== memberId),
              },
        ),
      }));
    },
  };
}
