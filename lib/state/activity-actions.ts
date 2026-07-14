import type { Dispatch, SetStateAction } from 'react';
import type { AppState, AppUser, Application, Booking, Game, Turf } from '@/types';
import { createNotification } from '@/lib/state/helpers';
import type { AppContextValue } from '@/lib/state/types';
import { id } from '@/lib/utils';

type EnsureActiveUser = () => { ok: false; message: string } | { ok: true; user: AppUser };

export function createActivityActions({
  state,
  setState,
  ensureActiveUser,
}: {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  ensureActiveUser: EnsureActiveUser;
}): Pick<
  AppContextValue,
  'applyForRole' | 'createBooking' | 'createGame' | 'joinGame' | 'addTurf' | 'addSlots'
> {
  return {
    applyForRole(type, details) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      const existing = state.applications.find(
        (application) =>
          application.userId === current.user.id &&
          application.type === type &&
          application.status === 'pending',
      );
      if (existing) return { ok: false, message: 'You already have a pending application.' };

      const application: Application = {
        id: id('application'),
        type,
        userId: current.user.id,
        userName: current.user.name,
        userEmail: current.user.email,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        details,
      };

      setState((currentState) => ({
        ...currentState,
        applications: [application, ...currentState.applications],
      }));
      return {
        ok: true,
        message: `${type === 'venue' ? 'Venue owner' : 'Organizer'} application submitted for admin review.`,
      };
    },
    createBooking({ turfId, slotId, slotIds, makePublic, maxPlayers, autoFill }) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      const turf = state.turfs.find((item) => item.id === turfId && item.approved);
      if (!turf) return { ok: false, message: 'Turf is not available.' };

      const requestedSlotIds = Array.from(
        new Set(slotIds?.length ? slotIds : slotId ? [slotId] : []),
      );
      if (!requestedSlotIds.length)
        return { ok: false, message: 'Please choose at least one slot.' };

      const selectedSlots = requestedSlotIds
        .map((requestedId) => turf.slots.find((item) => item.id === requestedId))
        .filter(Boolean) as Turf['slots'];
      if (selectedSlots.length !== requestedSlotIds.length) {
        return { ok: false, message: 'One or more selected slots could not be found.' };
      }
      if (selectedSlots.some((slot) => !slot.available)) {
        return { ok: false, message: 'One or more selected slots have already been booked.' };
      }

      const bookings: Booking[] = selectedSlots.map((slot) => ({
        id: id('booking'),
        turfId: turf.id,
        turfName: turf.name,
        userId: current.user.id,
        userName: current.user.name,
        slotId: slot.id,
        slotLabel: slot.label,
        makePublic,
        createdAt: new Date().toISOString(),
      }));
      const nextGame =
        makePublic && selectedSlots[0]
          ? {
              id: id('game'),
              createdBy: current.user.id,
              createdByName: current.user.name,
              turfId: turf.id,
              turfName: turf.name,
              sport: turf.sport,
              location: turf.location,
              slotLabel: selectedSlots[0].label,
              players: [{ id: current.user.id, name: current.user.name }],
              maxPlayers,
              autoFill,
              status: 'open' as const,
            }
          : null;

      setState((currentState) => ({
        ...currentState,
        bookings: [...bookings, ...currentState.bookings],
        games: nextGame ? [nextGame, ...currentState.games] : currentState.games,
        turfs: currentState.turfs.map((item) =>
          item.id !== turf.id
            ? item
            : {
                ...item,
                slots: item.slots.map((entry) =>
                  requestedSlotIds.includes(entry.id) ? { ...entry, available: false } : entry,
                ),
              },
        ),
        notifications: [
          createNotification({
            title: 'Booking confirmed',
            body: `You are booked at ${turf.name} for ${selectedSlots.map((slot) => slot.label).join(', ')}.`,
            userId: current.user.id,
          }),
          ...currentState.notifications,
        ],
      }));
      return {
        ok: true,
        message: makePublic
          ? 'Booking confirmed and public hunt created.'
          : `Booking confirmed for ${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''}.`,
      };
    },
    createGame({
      turfId,
      slotLabel,
      sport,
      maxPlayers,
      autoFill,
      location,
      scheduledAt,
      description,
    }) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      const turf = turfId ? state.turfs.find((item) => item.id === turfId) : null;
      const safeLocation = location || turf?.location || current.user.city || 'Bangalore';
      const safeSlotLabel =
        slotLabel ||
        (scheduledAt
          ? new Intl.DateTimeFormat('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Asia/Kolkata',
            }).format(new Date(scheduledAt))
          : 'Time to be confirmed');
      const game: Game = {
        id: id('game'),
        createdBy: current.user.id,
        createdByName: current.user.name,
        turfId: turf?.id,
        turfName: turf?.name || safeLocation,
        sport,
        location: safeLocation,
        scheduledAt,
        description,
        slotLabel: safeSlotLabel,
        players: [{ id: current.user.id, name: current.user.name }],
        maxPlayers,
        autoFill,
        status: 'open',
      };
      setState((currentState) => ({ ...currentState, games: [game, ...currentState.games] }));
      return { ok: true, message: 'Hunt created and visible for nearby players.' };
    },
    joinGame(gameId) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      const game = state.games.find((item) => item.id === gameId);
      if (!game || game.status !== 'open')
        return { ok: false, message: 'This game is not open anymore.' };
      if (game.players.some((player) => player.id === current.user.id)) {
        return { ok: false, message: 'You are already in this game.' };
      }
      if (game.players.length >= game.maxPlayers) {
        return { ok: false, message: 'This game is already full.' };
      }

      setState((currentState) => ({
        ...currentState,
        games: currentState.games.map((item) => {
          if (item.id !== gameId) return item;
          const players = [...item.players, { id: current.user.id, name: current.user.name }];
          return {
            ...item,
            players,
            status: players.length >= item.maxPlayers ? 'filled' : item.status,
          };
        }),
      }));
      return { ok: true, message: 'You joined the game successfully.' };
    },
    addTurf({ name, location, price, sport, photo, slotsText }) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      if (!['venue_owner', 'super_admin'].includes(current.user.role)) {
        return { ok: false, message: 'Only approved venue owners can add turfs.' };
      }
      const turf: Turf = {
        id: id('turf'),
        ownerId: current.user.id,
        name,
        sport,
        location,
        price,
        photos: [
          photo ||
            'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80',
        ],
        approved: false,
        moderationStatus: 'pending',
        slots: slotsText
          .split(',')
          .map((slot) => slot.trim())
          .filter(Boolean)
          .map((slot) => ({ id: id('slot'), label: slot, available: true })),
      };
      setState((currentState) => ({ ...currentState, turfs: [turf, ...currentState.turfs] }));
      return { ok: true, message: 'Turf submitted. It will go live after admin approval.' };
    },
    addSlots(turfId, slotsText) {
      const current = ensureActiveUser();
      if (!current.ok) return current;
      setState((currentState) => ({
        ...currentState,
        turfs: currentState.turfs.map((turf) => {
          if (turf.id !== turfId || turf.ownerId !== current.user.id) return turf;
          const nextSlots = slotsText
            .split(',')
            .map((slot) => slot.trim())
            .filter(Boolean)
            .map((slot) => ({ id: id('slot'), label: slot, available: true }));
          return { ...turf, slots: [...turf.slots, ...nextSlots] };
        }),
      }));
      return { ok: true, message: 'Slots added successfully.' };
    },
  };
}
