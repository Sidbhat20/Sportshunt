import type { Dispatch, SetStateAction } from 'react';
import type {
  AppState,
  AppUser,
  NotificationItem,
  RefereeAccess,
  Tournament,
  TournamentEvent,
  TournamentRegistration,
} from '@/types';
import { validateRefereeSubmission } from '@/lib/scoring';
import { createNotification, refreshTournamentData } from '@/lib/state/helpers';
import type { AppContextValue, RefereeSession } from '@/lib/state/types';
import { createFixturesForEvent } from '@/lib/tournament-logic';
import { id } from '@/lib/utils';

type EnsureActiveUser = () => { ok: false; message: string } | { ok: true; user: AppUser };

type UpsertTournament = (nextTournament: Tournament, notifications?: NotificationItem[]) => void;

export function createTournamentActions({
  state,
  refereeSession,
  setRefereeSession,
  ensureActiveUser,
  upsertTournament,
}: {
  state: AppState;
  refereeSession: RefereeSession | null;
  setRefereeSession: Dispatch<SetStateAction<RefereeSession | null>>;
  ensureActiveUser: EnsureActiveUser;
  upsertTournament: UpsertTournament;
}): Pick<
  AppContextValue,
  | 'createTournament'
  | 'updateTournamentBasicInfo'
  | 'createTournamentEvent'
  | 'addTournamentParticipant'
  | 'joinTournamentEvent'
  | 'generateFixtures'
  | 'scheduleMatch'
  | 'unscheduleMatch'
  | 'updateMatchStatus'
  | 'verifyMatch'
  | 'generateRefereeOtp'
  | 'refereeLogin'
  | 'refereeLogout'
  | 'submitRefereeScore'
> {
  return {
    createTournament(organizationId, payload) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      const organization = state.organizations.find((item) => item.id === organizationId);
      if (!organization || organization.status !== 'approved') {
        return { ok: false, message: 'Choose an approved organization first.' };
      }
      const member = organization.members.find((item) => item.userId === current.user.id);
      if (!member && current.user.role !== 'super_admin') {
        return { ok: false, message: 'You are not a member of this organization.' };
      }
      if (member && member.role === 'viewer') {
        return { ok: false, message: 'Viewers cannot create tournaments.' };
      }
      if (!payload.categories.length) {
        return {
          ok: false,
          message: 'Add at least one tournament category before submitting for approval.',
        };
      }

      const tournament: Tournament = {
        id: id('tournament'),
        organizationId,
        createdBy: current.user.id,
        name: payload.name,
        sport: payload.sport,
        description: payload.description,
        rules: payload.rules,
        startDate: payload.startDate,
        endDate: payload.endDate,
        venue: payload.venue,
        mapLocation: payload.mapLocation,
        poster:
          payload.poster ||
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
        categories: payload.categories,
        approvalStatus: 'pending',
        publicStatus: 'draft',
        status: 'upcoming',
        events: [],
        registrations: [],
        matches: [],
        referees: [],
      };

      upsertTournament(tournament, [
        createNotification({
          title: 'Tournament submitted',
          body: `${payload.name} has been submitted and is waiting for approval.`,
          organizationId,
        }),
      ]);
      return { ok: true, message: 'Tournament created and sent for approval.' };
    },
    updateTournamentBasicInfo(tournamentId, payload) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return;
      upsertTournament({ ...tournament, ...payload });
    },
    createTournamentEvent(tournamentId, payload) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return { ok: false, message: 'Tournament not found.' };
      const event: TournamentEvent = {
        id: id('event'),
        name: payload.name,
        entryFee: payload.entryFee,
        maxParticipants: payload.maxParticipants,
        registrationIds: [],
      };
      upsertTournament({ ...tournament, events: [...tournament.events, event] }, [
        createNotification({
          title: 'Event created',
          body: `${payload.name} is now part of ${tournament.name}.`,
          organizationId: tournament.organizationId,
        }),
      ]);
      return { ok: true, message: 'Event added successfully.' };
    },
    addTournamentParticipant(tournamentId, eventId, payload) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return { ok: false, message: 'Tournament not found.' };
      const event = tournament.events.find((item) => item.id === eventId);
      if (!event) return { ok: false, message: 'Event not found.' };
      if (event.registrationIds.length >= event.maxParticipants) {
        return { ok: false, message: 'This event is full.' };
      }
      const registration: TournamentRegistration = {
        id: id('registration'),
        tournamentId,
        eventId,
        participantName: payload.participantName,
        paymentStatus: payload.paymentStatus,
        createdAt: new Date().toISOString(),
      };
      const nextTournament = refreshTournamentData({
        ...tournament,
        registrations: [registration, ...tournament.registrations],
        events: tournament.events.map((item) =>
          item.id !== eventId
            ? item
            : { ...item, registrationIds: [...item.registrationIds, registration.id] },
        ),
      });
      upsertTournament(nextTournament, [
        createNotification({
          title: 'New registration',
          body: `${payload.participantName} just joined ${event.name}.`,
          organizationId: tournament.organizationId,
        }),
      ]);
      return { ok: true, message: 'Participant added successfully.' };
    },
    joinTournamentEvent(tournamentId, eventId, payload) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      const tournament = state.tournaments.find(
        (item) =>
          item.id === tournamentId &&
          item.approvalStatus === 'approved' &&
          item.publicStatus === 'live',
      );
      if (!tournament) return { ok: false, message: 'Tournament is not available.' };
      const event = tournament.events.find((item) => item.id === eventId);
      if (!event) return { ok: false, message: 'Event not found.' };
      const exists = tournament.registrations.some(
        (registration) =>
          registration.eventId === eventId && registration.userId === current.user.id,
      );
      if (exists) return { ok: false, message: 'You are already registered for this event.' };
      if (event.registrationIds.length >= event.maxParticipants) {
        return { ok: false, message: 'This event is full.' };
      }
      const registration: TournamentRegistration = {
        id: id('registration'),
        tournamentId,
        eventId,
        userId: current.user.id,
        participantName: payload?.participantName?.trim() || current.user.name,
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
      };
      const nextTournament = refreshTournamentData({
        ...tournament,
        registrations: [registration, ...tournament.registrations],
        events: tournament.events.map((item) =>
          item.id !== eventId
            ? item
            : { ...item, registrationIds: [...item.registrationIds, registration.id] },
        ),
      });
      upsertTournament(nextTournament, [
        createNotification({
          title: 'Registration confirmed',
          body: `You are in for ${event.name}.`,
          userId: current.user.id,
        }),
        createNotification({
          title: 'New registration',
          body: `${payload?.participantName?.trim() || current.user.name} just registered for ${event.name}.`,
          organizationId: tournament.organizationId,
        }),
      ]);
      return {
        ok: true,
        message: 'Registered successfully. Payment marked as paid for demo mode.',
      };
    },
    generateFixtures(tournamentId, eventId, fixtureType, participantOrder) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return { ok: false, message: 'Tournament not found.' };
      const event = tournament.events.find((item) => item.id === eventId);
      if (!event) return { ok: false, message: 'Event not found.' };
      const matches = createFixturesForEvent(
        tournamentId,
        eventId,
        tournament.registrations,
        event,
        fixtureType,
        participantOrder,
      );
      if (!matches.length) {
        return {
          ok: false,
          message: 'At least two participants are required before generating fixtures.',
        };
      }
      const nextTournament = refreshTournamentData({
        ...tournament,
        events: tournament.events.map((item) =>
          item.id !== eventId ? item : { ...item, fixtureType },
        ),
        matches: [...tournament.matches.filter((match) => match.eventId !== eventId), ...matches],
      });
      upsertTournament(nextTournament, [
        createNotification({
          title: 'Fixtures ready',
          body: `${event.name} brackets are ready in ${fixtureType.replaceAll('_', ' ')} format.`,
          organizationId: tournament.organizationId,
        }),
      ]);
      return { ok: true, message: 'Fixtures generated successfully.' };
    },
    scheduleMatch(tournamentId, matchId, payload) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return { ok: false, message: 'Tournament not found.' };
      const match = tournament.matches.find((item) => item.id === matchId);
      if (!match) return { ok: false, message: 'Match not found.' };
      if (!match.participantAName || !match.participantBName) {
        return { ok: false, message: 'This match still has TBD participants.' };
      }
      if (!payload.court.trim()) {
        return { ok: false, message: 'Court is required.' };
      }

      const nextTournament = refreshTournamentData({
        ...tournament,
        matches: tournament.matches.map((item) =>
          item.id !== matchId
            ? item
            : {
                ...item,
                refereeAssignment: {
                  court: payload.court.trim(),
                  createdAt: new Date().toISOString(),
                  assignedBy: current.user.id,
                  config: payload.config,
                },
                status: ['completed', 'verified'].includes(item.status) ? item.status : 'scheduled',
              },
        ),
      });
      const activeTournamentAccess = tournament.referees.find(
        (access) => access.active && new Date(access.expiresAt).getTime() > Date.now(),
      );
      const withAccess = activeTournamentAccess
        ? {
            ...nextTournament,
            referees: nextTournament.referees.map((access) =>
              access.id !== activeTournamentAccess.id || access.matchIds.includes(matchId)
                ? access
                : { ...access, matchIds: [...access.matchIds, matchId] },
            ),
          }
        : nextTournament;

      upsertTournament(withAccess, [
        createNotification({
          title: 'Match scheduled for referee',
          body: `${match.participantAName} vs ${match.participantBName} is set for ${payload.court}.`,
          organizationId: tournament.organizationId,
        }),
      ]);
      return {
        ok: true,
        message: activeTournamentAccess
          ? 'Match scheduled and pushed to the referee dashboard.'
          : 'Match scheduled. Generate the tournament referee OTP once to unlock the dashboard.',
      };
    },
    unscheduleMatch(tournamentId, matchId) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return;
      const match = tournament.matches.find((item) => item.id === matchId);
      if (!match) return;
      const nextTournament = refreshTournamentData({
        ...tournament,
        referees: tournament.referees
          .map((access) => {
            const nextMatchIds = access.matchIds.filter((id) => id !== matchId);
            return {
              ...access,
              matchIds: nextMatchIds,
              active: nextMatchIds.length ? access.active : false,
            };
          })
          .filter((access) => access.matchIds.length),
        matches: tournament.matches.map((item) =>
          item.id !== matchId ? item : { ...item, refereeAssignment: undefined, status: 'scheduled' },
        ),
      });
      upsertTournament(nextTournament, [
        createNotification({
          title: 'Match unscheduled',
          body: `${match.participantAName || 'Match'} referee assignment was cleared.`,
          organizationId: tournament.organizationId,
        }),
      ]);
    },
    updateMatchStatus(tournamentId, matchId, status) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return;
      const nextTournament = refreshTournamentData({
        ...tournament,
        publicStatus:
          status === 'live' && tournament.approvalStatus === 'approved'
            ? 'live'
            : tournament.publicStatus,
        matches: tournament.matches.map((match) =>
          match.id === matchId ? { ...match, status } : match,
        ),
      });
      upsertTournament(nextTournament);
    },
    verifyMatch(tournamentId, matchId) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return;
      const match = tournament.matches.find((item) => item.id === matchId);
      if (!match || !match.winnerParticipantId) return;
      const nextTournament = refreshTournamentData({
        ...tournament,
        matches: tournament.matches.map((item) =>
          item.id === matchId ? { ...item, status: 'verified' } : item,
        ),
      });
      upsertTournament(nextTournament, [
        createNotification({
          title: 'Match verified',
          body: `${match.winnerName} has officially advanced in ${tournament.name}.`,
          organizationId: tournament.organizationId,
        }),
      ]);
    },
    generateRefereeOtp(tournamentId, eventId) {
      const tournament = state.tournaments.find((item) => item.id === tournamentId);
      if (!tournament) return { ok: false, message: 'Tournament not found.' };
      const matchIds = tournament.matches
        .filter(
          (match) =>
            Boolean(match.refereeAssignment) &&
            ['scheduled', 'live'].includes(match.status) &&
            match.participantAName &&
            match.participantBName,
        )
        .map((match) => match.id);
      if (!matchIds.length)
        return { ok: false, message: 'Schedule at least one match before generating referee access.' };

      const existingAccess = tournament.referees.find(
        (access) => access.active && new Date(access.expiresAt).getTime() > Date.now(),
      );

      if (existingAccess) {
        const nextTournament = {
          ...tournament,
          referees: tournament.referees.map((access) =>
            access.id !== existingAccess.id ? access : { ...access, matchIds },
          ),
        };
        upsertTournament(nextTournament, [
          createNotification({
            title: 'Referee access ready',
            body: `Tournament OTP (${existingAccess.otp}) now covers ${matchIds.length} scheduled matches.`,
            organizationId: tournament.organizationId,
          }),
        ]);
        return {
          ok: true,
          message: 'Tournament referee OTP already exists and was reused.',
          otp: existingAccess.otp,
        };
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const access: RefereeAccess = {
        id: id('ref'),
        tournamentId,
        otp,
        matchIds,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
        active: true,
      };
      upsertTournament({ ...tournament, referees: [access, ...tournament.referees] }, [
        createNotification({
          title: 'Referee access ready',
          body: `Tournament OTP (${otp}) is ready for ${matchIds.length} scheduled matches.`,
          organizationId: tournament.organizationId,
        }),
      ]);
      return { ok: true, message: 'Tournament referee OTP generated.', otp };
    },
    refereeLogin(otp) {
      const normalizedOtp = otp.trim();
      const inMemoryAccess = state.tournaments
        .flatMap((tournament) => tournament.referees)
        .find(
          (item) =>
            item.otp === normalizedOtp &&
            item.active &&
            new Date(item.expiresAt).getTime() > Date.now(),
        );

      let access = inMemoryAccess;

      if (!access && typeof window !== 'undefined') {
        try {
          const storedState = window.localStorage.getItem('sportshunt_state_v5');
          if (storedState) {
            const parsed = JSON.parse(storedState) as AppState;
            access = parsed.tournaments
              .flatMap((tournament) => tournament.referees)
              .find(
                (item) =>
                  item.otp === normalizedOtp &&
                  item.active &&
                  new Date(item.expiresAt).getTime() > Date.now(),
              );
          }
        } catch {
          access = inMemoryAccess;
        }
      }

      if (!access) return { ok: false, message: 'OTP is invalid or expired.' };
      setRefereeSession({
        accessId: access.id,
        tournamentId: access.tournamentId,
      });
      return { ok: true, message: 'Referee access granted.' };
    },
    refereeLogout() {
      setRefereeSession(null);
    },
    submitRefereeScore(matchId, submission) {
      if (!refereeSession) return { ok: false, message: 'Referee session not found.' };
      const tournament = state.tournaments.find((item) => item.id === refereeSession.tournamentId);
      if (!tournament) return { ok: false, message: 'Tournament not found.' };
      const access = tournament.referees.find((item) => item.id === refereeSession.accessId);
      const match = tournament.matches.find((item) => item.id === matchId);
      if (!match || !access?.matchIds.includes(matchId))
        return { ok: false, message: 'Match not assigned.' };

      const directScore =
        submission.scorecard &&
        typeof submission.scoreA === 'number' &&
        typeof submission.scoreB === 'number' &&
        submission.winnerSide &&
        submission.winnerSide !== 'draw'
          ? {
              ok: true as const,
              scoreA: submission.scoreA,
              scoreB: submission.scoreB,
              winnerSide: submission.winnerSide,
              scorecard: submission.scorecard,
              message: 'Score submitted.',
            }
          : null;

      const result =
        directScore ??
        validateRefereeSubmission(tournament.sport, submission, { requireWinner: true });
      if (
        !result.ok ||
        typeof result.scoreA !== 'number' ||
        typeof result.scoreB !== 'number' ||
        !result.winnerSide ||
        result.winnerSide === 'draw'
      ) {
        return { ok: false, message: result.message };
      }

      const winnerIsA = result.winnerSide === 'A';
      const nextTournament = refreshTournamentData({
        ...tournament,
        referees: tournament.referees
          .map((access) => ({
            ...access,
            matchIds: access.matchIds.filter((id) => id !== matchId),
            active: access.matchIds.some((id) => id !== matchId),
          }))
          .filter((access) => access.matchIds.length),
        matches: tournament.matches.map((item) =>
          item.id !== matchId
            ? item
            : {
                ...item,
                scoreA: result.scoreA,
                scoreB: result.scoreB,
                scorecard: result.scorecard,
                winnerParticipantId: winnerIsA ? item.participantAId : item.participantBId,
                winnerName: winnerIsA ? item.participantAName : item.participantBName,
                status: 'verified',
              },
        ),
      });
      upsertTournament(nextTournament, [
        createNotification({
          title: 'Score submitted',
          body: `${match.participantAName} vs ${match.participantBName} is final. Organizer dashboard updated automatically.`,
          organizationId: tournament.organizationId,
        }),
      ]);
      return { ok: true, message: 'Score submitted and organizer dashboard updated.' };
    },
  };
}
