import type { Dispatch, SetStateAction } from 'react';
import type { AppState, AppUser, NotificationItem, Role, Tournament } from '@/types';
import { createNotification, refreshTournamentData } from '@/lib/state/helpers';
import type { AppContextValue } from '@/lib/state/types';

type SyncSessionWithUsers = (users: AppUser[]) => void;
type UpsertTournament = (nextTournament: Tournament, notifications?: NotificationItem[]) => void;

export function createModerationActions({
  state,
  setState,
  syncSessionWithUsers,
  upsertTournament,
}: {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  syncSessionWithUsers: SyncSessionWithUsers;
  upsertTournament: UpsertTournament;
}): Pick<
  AppContextValue,
  | 'reviewApplication'
  | 'reviewTurf'
  | 'reviewOrganization'
  | 'reviewTournament'
  | 'moderateUser'
  | 'moderateGame'
  | 'moderateTournament'
> {
  return {
    reviewApplication(applicationId, status) {
      const application = state.applications.find((item) => item.id === applicationId);
      if (!application) return;
      const nextUsers = state.users.map((user) => {
        if (user.id !== application.userId) return user;
        if (status === 'approved') {
          return {
            ...user,
            role: application.type === 'venue' ? ('venue_owner' as Role) : ('organizer' as Role),
          };
        }
        return user;
      });
      setState((currentState) => ({
        ...currentState,
        users: nextUsers,
        applications: currentState.applications.map((item) =>
          item.id === applicationId ? { ...item, status } : item,
        ),
      }));
      syncSessionWithUsers(nextUsers);
    },
    reviewTurf(turfId, status) {
      setState((currentState) => ({
        ...currentState,
        turfs: currentState.turfs.map((turf) =>
          turf.id !== turfId
            ? turf
            : { ...turf, moderationStatus: status, approved: status === 'approved' },
        ),
      }));
    },
    reviewOrganization(organizationId, status) {
      const organization = state.organizations.find((item) => item.id === organizationId);
      if (!organization) return;
      const nextUsers =
        status === 'approved'
          ? state.users.map((user) =>
              user.id === organization.ownerId && user.role === 'user'
                ? { ...user, role: 'organizer' as Role }
                : user,
            )
          : state.users;
      setState((currentState) => ({
        ...currentState,
        users: nextUsers,
        organizations: currentState.organizations.map((item) =>
          item.id === organizationId ? { ...item, status } : item,
        ),
        notifications: [
          createNotification({
            title: `Organization ${status}`,
            body: `${organization.name} was ${status} by the admin team.`,
            userId: organization.ownerId,
          }),
          ...currentState.notifications,
        ],
      }));
      syncSessionWithUsers(nextUsers);
    },
    reviewTournament(tournamentId, status) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return;
      const nextTournament = refreshTournamentData({
        ...tournament,
        approvalStatus: status,
        publicStatus: status === 'approved' ? 'live' : 'draft',
      });
      upsertTournament(nextTournament, [
        createNotification({
          title: `Tournament ${status}`,
          body: `${tournament.name} was ${status} by the admin team.`,
          organizationId: tournament.organizationId,
        }),
      ]);
    },
    moderateUser(userId, status) {
      const nextUsers = state.users.map((user) =>
        user.id === userId ? { ...user, status } : user,
      );
      setState((currentState) => ({ ...currentState, users: nextUsers }));
      syncSessionWithUsers(nextUsers);
    },
    moderateGame(gameId, status) {
      setState((currentState) => ({
        ...currentState,
        games: currentState.games.map((game) => (game.id === gameId ? { ...game, status } : game)),
      }));
    },
    moderateTournament(tournamentId, status) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return;
      upsertTournament({ ...tournament, status });
    },
  };
}
