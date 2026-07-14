import { FixtureType, TournamentEvent, TournamentMatch, TournamentRegistration } from '@/types';
import { id } from '@/lib/utils';

type Participant = {
  id: string;
  name: string;
};

function nextPowerOfTwo(value: number) {
  let power = 1;
  while (power < value) power *= 2;
  return Math.max(2, power);
}

function roundLabel(size: number) {
  if (size === 2) return 'Final';
  if (size === 4) return 'Semifinal';
  if (size === 8) return 'Quarterfinal';
  return `Round of ${size}`;
}

export function eventParticipants(
  event: TournamentEvent,
  registrations: TournamentRegistration[],
  participantOrder?: string[],
): Participant[] {
  const sourceIds = participantOrder?.length ? participantOrder : event.registrationIds;
  return sourceIds
    .map((registrationId) =>
      registrations.find((registration) => registration.id === registrationId),
    )
    .filter(Boolean)
    .map((registration) => ({ id: registration!.id, name: registration!.participantName }));
}

export function createRoundRobinMatches(
  tournamentId: string,
  eventId: string,
  participants: Participant[],
  phase: TournamentMatch['phase'] = 'group',
) {
  const matches: TournamentMatch[] = [];
  let matchNumber = 1;
  for (let i = 0; i < participants.length; i += 1) {
    for (let j = i + 1; j < participants.length; j += 1) {
      matches.push({
        id: id('match'),
        tournamentId,
        eventId,
        phase,
        roundNumber: 1,
        roundLabel: phase === 'championship' ? 'Championship Group' : 'Group Stage',
        matchNumber: matchNumber++,
        participantAId: participants[i].id,
        participantAName: participants[i].name,
        participantBId: participants[j].id,
        participantBName: participants[j].name,
        status: 'scheduled',
      });
    }
  }
  return matches;
}

export function createKnockoutMatches(
  tournamentId: string,
  eventId: string,
  participants: Participant[],
  phase: TournamentMatch['phase'] = 'knockout',
) {
  const size = nextPowerOfTwo(participants.length);
  const seeded: Array<Participant | null> = [...participants];
  while (seeded.length < size) seeded.push(null);

  const rounds: TournamentMatch[][] = [];
  let roundSize = size;
  let roundNumber = 1;

  while (roundSize > 1) {
    const matchesInRound = roundSize / 2;
    const currentRound = Array.from({ length: matchesInRound }).map((_, index) => {
      const match: TournamentMatch = {
        id: id('match'),
        tournamentId,
        eventId,
        phase,
        roundNumber,
        roundLabel: roundLabel(roundSize),
        matchNumber: index + 1,
        status: 'scheduled',
      };

      if (roundNumber === 1) {
        const a = seeded[index * 2];
        const b = seeded[index * 2 + 1];
        match.participantAId = a?.id;
        match.participantAName = a?.name;
        match.participantBId = b?.id;
        match.participantBName = b?.name;

        if (a && !b) {
          match.winnerParticipantId = a.id;
          match.winnerName = a.name;
          match.status = 'verified';
        }
        if (!a && b) {
          match.winnerParticipantId = b.id;
          match.winnerName = b.name;
          match.status = 'verified';
        }
      }

      return match;
    });

    rounds.push(currentRound);
    roundSize /= 2;
    roundNumber += 1;
  }

  for (let i = 0; i < rounds.length - 1; i += 1) {
    const currentRound = rounds[i];
    const nextRound = rounds[i + 1];
    currentRound.forEach((match, index) => {
      match.nextMatchId = nextRound[Math.floor(index / 2)].id;
      match.nextMatchSlot = index % 2 === 0 ? 'A' : 'B';
    });
  }

  return propagateWinners(rounds.flat());
}

export function createRoundRobinThenKnockout(
  tournamentId: string,
  eventId: string,
  participants: Participant[],
) {
  const groupMatches = createRoundRobinMatches(tournamentId, eventId, participants, 'group');
  const knockoutMatches: TournamentMatch[] = [
    {
      id: id('match'),
      tournamentId,
      eventId,
      phase: 'knockout',
      roundNumber: 1,
      roundLabel: 'Semifinal',
      matchNumber: 1,
      status: 'scheduled',
      seedA: { mode: 'rank', value: 1 },
      seedB: { mode: 'rank', value: 4 },
      nextMatchId: '',
      nextMatchSlot: 'A',
    },
    {
      id: id('match'),
      tournamentId,
      eventId,
      phase: 'knockout',
      roundNumber: 1,
      roundLabel: 'Semifinal',
      matchNumber: 2,
      status: 'scheduled',
      seedA: { mode: 'rank', value: 2 },
      seedB: { mode: 'rank', value: 3 },
      nextMatchId: '',
      nextMatchSlot: 'B',
    },
    {
      id: id('match'),
      tournamentId,
      eventId,
      phase: 'knockout',
      roundNumber: 2,
      roundLabel: 'Final',
      matchNumber: 1,
      status: 'scheduled',
    },
  ];

  knockoutMatches[0].nextMatchId = knockoutMatches[2].id;
  knockoutMatches[1].nextMatchId = knockoutMatches[2].id;

  return [...groupMatches, ...knockoutMatches];
}

export function createKnockoutThenRoundRobin(
  tournamentId: string,
  eventId: string,
  participants: Participant[],
) {
  if (participants.length <= 4) {
    return createRoundRobinMatches(tournamentId, eventId, participants, 'championship');
  }

  const qualifierMatches: TournamentMatch[] = [];
  const qualificationSize = nextPowerOfTwo(Math.max(participants.length, 4));
  const totalRounds = Math.log2(qualificationSize);
  const roundsNeeded = Math.max(0, totalRounds - 2);

  if (roundsNeeded > 0) {
    const seeded: Array<Participant | null> = [...participants];
    while (seeded.length < qualificationSize) seeded.push(null);
    const rounds: TournamentMatch[][] = [];
    let roundSize = qualificationSize;
    let roundNumber = 1;

    while (roundNumber <= roundsNeeded) {
      const matchCount = roundSize / 2;
      const currentRound = Array.from({ length: matchCount }).map((_, index) => {
        const match: TournamentMatch = {
          id: id('match'),
          tournamentId,
          eventId,
          phase: 'qualification',
          roundNumber,
          roundLabel: roundLabel(roundSize),
          matchNumber: index + 1,
          status: 'scheduled',
        };

        if (roundNumber === 1) {
          const a = seeded[index * 2];
          const b = seeded[index * 2 + 1];
          match.participantAId = a?.id;
          match.participantAName = a?.name;
          match.participantBId = b?.id;
          match.participantBName = b?.name;
          if (a && !b) {
            match.winnerParticipantId = a.id;
            match.winnerName = a.name;
            match.status = 'verified';
          }
          if (!a && b) {
            match.winnerParticipantId = b.id;
            match.winnerName = b.name;
            match.status = 'verified';
          }
        }

        return match;
      });

      rounds.push(currentRound);
      roundSize /= 2;
      roundNumber += 1;
    }

    for (let i = 0; i < rounds.length - 1; i += 1) {
      rounds[i].forEach((match, index) => {
        match.nextMatchId = rounds[i + 1][Math.floor(index / 2)].id;
        match.nextMatchSlot = index % 2 === 0 ? 'A' : 'B';
      });
    }

    const finalQualificationRound = rounds[rounds.length - 1];
    finalQualificationRound.forEach((match, index) => {
      match.qualifierRank = index + 1;
    });

    qualifierMatches.push(...propagateWinners(rounds.flat()));
  }

  const championshipMatches: TournamentMatch[] = [];
  const seeds = [1, 2, 3, 4];
  let matchNumber = 1;
  for (let i = 0; i < seeds.length; i += 1) {
    for (let j = i + 1; j < seeds.length; j += 1) {
      championshipMatches.push({
        id: id('match'),
        tournamentId,
        eventId,
        phase: 'championship',
        roundNumber: 1,
        roundLabel: 'Championship Group',
        matchNumber: matchNumber++,
        status: 'scheduled',
        seedA: { mode: 'qualifier', value: seeds[i] },
        seedB: { mode: 'qualifier', value: seeds[j] },
      });
    }
  }

  return [...qualifierMatches, ...championshipMatches];
}

export function createFixturesForEvent(
  tournamentId: string,
  eventId: string,
  registrations: TournamentRegistration[],
  event: TournamentEvent,
  fixtureType: FixtureType,
  participantOrder?: string[],
) {
  const participants = eventParticipants(event, registrations, participantOrder);
  if (participants.length < 2) {
    return [] as TournamentMatch[];
  }

  if (fixtureType === 'knockout') {
    return createKnockoutMatches(tournamentId, eventId, participants, 'knockout');
  }
  if (fixtureType === 'round_robin') {
    return createRoundRobinMatches(tournamentId, eventId, participants, 'group');
  }
  if (fixtureType === 'round_robin_knockout') {
    return createRoundRobinThenKnockout(tournamentId, eventId, participants);
  }
  return createKnockoutThenRoundRobin(tournamentId, eventId, participants);
}

export function computeStandings(matches: TournamentMatch[]) {
  const table = new Map<
    string,
    {
      id: string;
      name: string;
      played: number;
      wins: number;
      losses: number;
      scored: number;
      conceded: number;
    }
  >();

  matches
    .filter(
      (match) =>
        ['completed', 'verified'].includes(match.status) &&
        match.participantAId &&
        match.participantBId,
    )
    .forEach((match) => {
      const a = table.get(match.participantAId!) ?? {
        id: match.participantAId!,
        name: match.participantAName ?? 'Participant A',
        played: 0,
        wins: 0,
        losses: 0,
        scored: 0,
        conceded: 0,
      };
      const b = table.get(match.participantBId!) ?? {
        id: match.participantBId!,
        name: match.participantBName ?? 'Participant B',
        played: 0,
        wins: 0,
        losses: 0,
        scored: 0,
        conceded: 0,
      };
      const scoreA = Number(match.scoreA ?? 0);
      const scoreB = Number(match.scoreB ?? 0);
      a.played += 1;
      b.played += 1;
      a.scored += scoreA;
      a.conceded += scoreB;
      b.scored += scoreB;
      b.conceded += scoreA;
      if (scoreA > scoreB) {
        a.wins += 1;
        b.losses += 1;
      }
      if (scoreB > scoreA) {
        b.wins += 1;
        a.losses += 1;
      }
      table.set(a.id, a);
      table.set(b.id, b);
    });

  return Array.from(table.values()).sort((left, right) => {
    if (right.wins !== left.wins) return right.wins - left.wins;
    const diffRight = right.scored - right.conceded;
    const diffLeft = left.scored - left.conceded;
    if (diffRight !== diffLeft) return diffRight - diffLeft;
    return right.scored - left.scored;
  });
}

export function propagateWinners(matches: TournamentMatch[]) {
  const byId = new Map(matches.map((match) => [match.id, { ...match }]));
  let changed = true;

  while (changed) {
    changed = false;
    for (const match of byId.values()) {
      if (match.winnerParticipantId && match.nextMatchId) {
        const next = byId.get(match.nextMatchId);
        if (!next) continue;
        if (match.nextMatchSlot === 'A' && next.participantAId !== match.winnerParticipantId) {
          next.participantAId = match.winnerParticipantId;
          next.participantAName = match.winnerName;
          changed = true;
        }
        if (match.nextMatchSlot === 'B' && next.participantBId !== match.winnerParticipantId) {
          next.participantBId = match.winnerParticipantId;
          next.participantBName = match.winnerName;
          changed = true;
        }
      }
    }
  }

  return Array.from(byId.values());
}

export function populateSeededMatches(matches: TournamentMatch[]) {
  const cloned = matches.map((match) => ({ ...match }));
  const groupMatches = cloned.filter((match) => match.phase === 'group');
  const groupReady =
    !!groupMatches.length && groupMatches.every((match) => match.status === 'verified');
  const standings = groupReady ? computeStandings(groupMatches) : [];
  const qualifiers = cloned
    .filter(
      (match) =>
        match.phase === 'qualification' &&
        match.qualifierRank &&
        match.status === 'verified' &&
        match.winnerParticipantId,
    )
    .sort((a, b) => (a.qualifierRank ?? 0) - (b.qualifierRank ?? 0));
  const qualifiersReady = qualifiers.length >= 4;

  const resolveRankSource = (value: number) => {
    const source = groupReady ? standings[value - 1] : null;
    if (!source) return null;
    return { id: source.id, name: source.name };
  };

  const resolveQualifierSource = (value: number) => {
    const source = qualifiersReady ? qualifiers[value - 1] : null;
    if (!source || !source.winnerParticipantId || !source.winnerName) return null;
    return { id: source.winnerParticipantId, name: source.winnerName };
  };

  return cloned.map((match) => {
    const next = { ...match };
    if (next.seedA && !next.participantAId) {
      const source =
        next.seedA.mode === 'rank'
          ? resolveRankSource(next.seedA.value)
          : resolveQualifierSource(next.seedA.value);
      if (source) {
        next.participantAId = source.id;
        next.participantAName = source.name;
      }
    }
    if (next.seedB && !next.participantBId) {
      const source =
        next.seedB.mode === 'rank'
          ? resolveRankSource(next.seedB.value)
          : resolveQualifierSource(next.seedB.value);
      if (source) {
        next.participantBId = source.id;
        next.participantBName = source.name;
      }
    }
    return next;
  });
}
