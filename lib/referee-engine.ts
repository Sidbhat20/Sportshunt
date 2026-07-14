import {
  MatchScorecard,
  RefereeConfig,
  RefereeScoreSubmission,
  SupportedScoringSport,
} from '@/types';
import { normalizeSportForScoring } from '@/lib/sports';

export type RefereeSportKey = SupportedScoringSport;

export type RefereeSegment = {
  label: string;
  a: number;
  b: number;
};

export type RefereeBoard = {
  teamA: string;
  teamB: string;
  sport: RefereeSportKey;
  config: RefereeConfig;
  scoreA: number;
  scoreB: number;
  matchA: number;
  matchB: number;
  currentSegment: number;
  currentSegmentA: number;
  currentSegmentB: number;
  segments: RefereeSegment[];
  timerRunning: boolean;
  timerMs: number;
  shotClockMs: number | null;
  completed: boolean;
};

export const REFEREE_SPORT_OPTIONS: Array<{ value: RefereeSportKey; label: string }> = [
  { value: 'badminton', label: 'Badminton' },
  { value: 'table_tennis', label: 'Table Tennis' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'pickleball', label: 'Pickleball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'throwball', label: 'Throwball' },
  { value: 'hockey', label: 'Hockey' },
];

function sportLabel(sport: RefereeSportKey) {
  return REFEREE_SPORT_OPTIONS.find((item) => item.value === sport)?.label ?? sport;
}

export function normalizeRefereeSport(sport: string): RefereeSportKey {
  const normalized = normalizeSportForScoring(sport);
  if (normalized) return normalized;
  if (sport.trim().toLowerCase() === 'volleyball') return 'volleyball';
  if (sport.trim().toLowerCase() === 'throwball') return 'throwball';
  if (sport.trim().toLowerCase() === 'hockey') return 'hockey';
  return 'football';
}

export function getDefaultRefereeConfig(sportInput: string): RefereeConfig {
  const sport = normalizeRefereeSport(sportInput);

  if (sport === 'basketball') {
    return { kind: 'basketball', sport, quarters: 4, minutesPerQuarter: 10, shotClock: '24' };
  }
  if (sport === 'football') {
    return { kind: 'football', sport, matchMinutes: 90, extraTime: false, injuryTime: 0 };
  }
  if (sport === 'hockey') {
    return { kind: 'hockey', sport, quarters: 4, minutesPerQuarter: 15 };
  }
  if (sport === 'tennis') {
    return { kind: 'tennis', sport, sets: 3, tieBreak: true, timerEnabled: false };
  }
  if (sport === 'table_tennis') {
    return {
      kind: 'racket',
      sport,
      sets: 5,
      pointsToWin: 11,
      winCondition: 'deuce',
      timerEnabled: false,
    };
  }
  if (sport === 'pickleball') {
    return {
      kind: 'racket',
      sport,
      sets: 3,
      pointsToWin: 11,
      winCondition: 'deuce',
      timerEnabled: false,
    };
  }
  if (sport === 'volleyball') {
    return {
      kind: 'racket',
      sport,
      sets: 5,
      pointsToWin: 25,
      winCondition: 'deuce',
      timerEnabled: false,
    };
  }
  if (sport === 'throwball') {
    return {
      kind: 'racket',
      sport,
      sets: 5,
      pointsToWin: 15,
      winCondition: 'deuce',
      timerEnabled: false,
    };
  }

  return {
    kind: 'racket',
    sport: 'badminton',
    sets: 3,
    pointsToWin: 21,
    winCondition: 'deuce',
    timerEnabled: false,
  };
}

export function createRefereeBoard({
  config,
  teamA,
  teamB,
}: {
  config: RefereeConfig;
  teamA: string;
  teamB: string;
}): RefereeBoard {
  return {
    teamA,
    teamB,
    sport: config.sport,
    config,
    scoreA: 0,
    scoreB: 0,
    matchA: 0,
    matchB: 0,
    currentSegment: 1,
    currentSegmentA: 0,
    currentSegmentB: 0,
    segments: [],
    timerRunning: false,
    timerMs: getInitialTimerMs(config),
    shotClockMs: getInitialShotClockMs(config),
    completed: false,
  };
}

function getInitialTimerMs(config: RefereeConfig) {
  if (config.kind === 'basketball' || config.kind === 'hockey')
    return config.minutesPerQuarter * 60 * 1000;
  return 0;
}

function getInitialShotClockMs(config: RefereeConfig) {
  if (config.kind !== 'basketball' || config.shotClock === 'off') return null;
  return Number(config.shotClock) * 1000;
}

function setsToWin(config: Extract<RefereeConfig, { kind: 'racket' | 'tennis' }>) {
  return Math.ceil(config.sets / 2);
}

function canWinRacketSet(a: number, b: number, config: Extract<RefereeConfig, { kind: 'racket' }>) {
  const winner = Math.max(a, b);
  const loser = Math.min(a, b);
  if (winner < config.pointsToWin) return false;
  if (config.winCondition === 'golden_point') {
    return winner === config.pointsToWin && loser >= config.pointsToWin - 1;
  }
  return winner >= config.pointsToWin && winner - loser >= 2;
}

function canWinTennisSet(a: number, b: number, config: Extract<RefereeConfig, { kind: 'tennis' }>) {
  const winner = Math.max(a, b);
  const loser = Math.min(a, b);
  if (config.tieBreak) {
    return (winner === 6 && loser <= 4) || (winner === 7 && (loser === 5 || loser === 6));
  }
  return winner >= 6 && winner - loser >= 2;
}

function nextMatchScore(matchA: number, matchB: number, side: 'A' | 'B') {
  return side === 'A' ? { matchA: matchA + 1, matchB } : { matchA, matchB: matchB + 1 };
}

export function scoreButtonValues(config: RefereeConfig) {
  return config.kind === 'basketball' ? [1, 2, 3] : [1];
}

export function usesTimer(config: RefereeConfig) {
  if (config.kind === 'basketball' || config.kind === 'hockey' || config.kind === 'football')
    return true;
  if (config.kind === 'racket' || config.kind === 'tennis') return config.timerEnabled;
  return false;
}

export function isPeriodSport(config: RefereeConfig) {
  return config.kind === 'basketball' || config.kind === 'hockey';
}

export function getActiveSegmentLabel(board: RefereeBoard) {
  if (board.config.kind === 'basketball') return `Quarter ${board.currentSegment}`;
  if (board.config.kind === 'hockey') return `Quarter ${board.currentSegment}`;
  if (board.config.kind === 'tennis') return `Set ${board.currentSegment}`;
  if (board.config.kind === 'racket') return `Set ${board.currentSegment}`;
  return 'Match';
}

export function getMetaLine(board: RefereeBoard) {
  if (board.config.kind === 'racket') {
    return `Best of ${board.config.sets} • ${board.config.pointsToWin} points • ${board.config.winCondition === 'deuce' ? 'Win by 2' : 'Golden point'}`;
  }
  if (board.config.kind === 'tennis') {
    return `Best of ${board.config.sets} • Tie-break ${board.config.tieBreak ? 'on' : 'off'}`;
  }
  if (board.config.kind === 'basketball') {
    return `${board.config.quarters} quarters • ${board.config.minutesPerQuarter} min • Shot clock ${board.config.shotClock === 'off' ? 'off' : `${board.config.shotClock}s`}`;
  }
  if (board.config.kind === 'hockey') {
    return `${board.config.quarters} quarters • ${board.config.minutesPerQuarter} min`;
  }
  return `${board.config.matchMinutes} min${board.config.extraTime ? ' + extra time' : ''}${board.config.injuryTime ? ` + ${board.config.injuryTime} min injury` : ''}`;
}

export function changeBoardScore(board: RefereeBoard, side: 'A' | 'B', delta: number) {
  if (board.completed) return board;
  if (delta < 0) {
    if (
      board.config.kind === 'basketball' ||
      board.config.kind === 'hockey' ||
      board.config.kind === 'football'
    ) {
      const nextScoreA = side === 'A' ? Math.max(0, board.scoreA + delta) : board.scoreA;
      const nextScoreB = side === 'B' ? Math.max(0, board.scoreB + delta) : board.scoreB;
      const nextSegmentA =
        side === 'A' ? Math.max(0, board.currentSegmentA + delta) : board.currentSegmentA;
      const nextSegmentB =
        side === 'B' ? Math.max(0, board.currentSegmentB + delta) : board.currentSegmentB;
      return {
        ...board,
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        currentSegmentA: nextSegmentA,
        currentSegmentB: nextSegmentB,
      };
    }

    return {
      ...board,
      scoreA: side === 'A' ? Math.max(0, board.scoreA + delta) : board.scoreA,
      scoreB: side === 'B' ? Math.max(0, board.scoreB + delta) : board.scoreB,
      currentSegmentA:
        side === 'A' ? Math.max(0, board.currentSegmentA + delta) : board.currentSegmentA,
      currentSegmentB:
        side === 'B' ? Math.max(0, board.currentSegmentB + delta) : board.currentSegmentB,
    };
  }

  if (
    board.config.kind === 'basketball' ||
    board.config.kind === 'hockey' ||
    board.config.kind === 'football'
  ) {
    return {
      ...board,
      scoreA: side === 'A' ? board.scoreA + delta : board.scoreA,
      scoreB: side === 'B' ? board.scoreB + delta : board.scoreB,
      currentSegmentA: side === 'A' ? board.currentSegmentA + delta : board.currentSegmentA,
      currentSegmentB: side === 'B' ? board.currentSegmentB + delta : board.currentSegmentB,
    };
  }

  const nextA = side === 'A' ? board.scoreA + delta : board.scoreA;
  const nextB = side === 'B' ? board.scoreB + delta : board.scoreB;

  if (board.config.kind === 'racket' && canWinRacketSet(nextA, nextB, board.config)) {
    const winner = nextA > nextB ? 'A' : 'B';
    const nextMatch = nextMatchScore(board.matchA, board.matchB, winner);
    const completed =
      nextMatch.matchA >= setsToWin(board.config) || nextMatch.matchB >= setsToWin(board.config);
    return {
      ...board,
      scoreA: completed ? nextA : 0,
      scoreB: completed ? nextB : 0,
      currentSegmentA: completed ? nextA : 0,
      currentSegmentB: completed ? nextB : 0,
      matchA: nextMatch.matchA,
      matchB: nextMatch.matchB,
      currentSegment: completed ? board.currentSegment : board.currentSegment + 1,
      segments: [...board.segments, { label: `Set ${board.currentSegment}`, a: nextA, b: nextB }],
      completed,
      timerRunning: completed ? false : board.timerRunning,
    };
  }

  if (board.config.kind === 'tennis' && canWinTennisSet(nextA, nextB, board.config)) {
    const winner = nextA > nextB ? 'A' : 'B';
    const nextMatch = nextMatchScore(board.matchA, board.matchB, winner);
    const completed =
      nextMatch.matchA >= setsToWin(board.config) || nextMatch.matchB >= setsToWin(board.config);
    return {
      ...board,
      scoreA: completed ? nextA : 0,
      scoreB: completed ? nextB : 0,
      currentSegmentA: completed ? nextA : 0,
      currentSegmentB: completed ? nextB : 0,
      matchA: nextMatch.matchA,
      matchB: nextMatch.matchB,
      currentSegment: completed ? board.currentSegment : board.currentSegment + 1,
      segments: [...board.segments, { label: `Set ${board.currentSegment}`, a: nextA, b: nextB }],
      completed,
      timerRunning: completed ? false : board.timerRunning,
    };
  }

  return { ...board, scoreA: nextA, scoreB: nextB, currentSegmentA: nextA, currentSegmentB: nextB };
}

export function toggleBoardTimer(board: RefereeBoard) {
  if (!usesTimer(board.config) || board.completed) return board;
  return { ...board, timerRunning: !board.timerRunning };
}

export function resetBoardTimer(board: RefereeBoard) {
  return {
    ...board,
    timerRunning: false,
    timerMs: getInitialTimerMs(board.config),
    shotClockMs: getInitialShotClockMs(board.config),
  };
}

export function resetShotClock(board: RefereeBoard) {
  if (board.config.kind !== 'basketball') return board;
  return { ...board, shotClockMs: getInitialShotClockMs(board.config) };
}

export function advanceBoardSegment(board: RefereeBoard) {
  if (board.config.kind !== 'basketball' && board.config.kind !== 'hockey') return board;
  const segmentLabel = `${board.config.kind === 'basketball' ? 'Quarter' : 'Quarter'} ${board.currentSegment}`;
  const nextSegments = [
    ...board.segments,
    { label: segmentLabel, a: board.currentSegmentA, b: board.currentSegmentB },
  ];
  const maxSegments = board.config.quarters;
  const completed = board.currentSegment >= maxSegments;

  return {
    ...board,
    currentSegment: completed ? board.currentSegment : board.currentSegment + 1,
    currentSegmentA: 0,
    currentSegmentB: 0,
    segments: nextSegments,
    timerRunning: false,
    timerMs: completed ? 0 : board.config.minutesPerQuarter * 60 * 1000,
    shotClockMs: completed ? board.shotClockMs : getInitialShotClockMs(board.config),
    completed,
  };
}

export function tickBoard(board: RefereeBoard) {
  if (!board.timerRunning || board.completed) return board;

  let nextBoard = board;

  if (board.config.kind === 'basketball' || board.config.kind === 'hockey') {
    const nextTimer = Math.max(0, board.timerMs - 1000);
    nextBoard = { ...nextBoard, timerMs: nextTimer };
    if (nextTimer === 0) nextBoard = advanceBoardSegment(nextBoard);
  } else if (board.config.kind === 'football') {
    const limit =
      (board.config.matchMinutes + (board.config.extraTime ? 30 : 0) + board.config.injuryTime) *
      60 *
      1000;
    const nextTimer = Math.min(limit, board.timerMs + 1000);
    nextBoard = { ...nextBoard, timerMs: nextTimer };
    if (nextTimer >= limit) nextBoard = { ...nextBoard, timerRunning: false, completed: true };
  } else {
    nextBoard = { ...nextBoard, timerMs: nextBoard.timerMs + 1000 };
  }

  if (
    nextBoard.config.kind === 'basketball' &&
    nextBoard.shotClockMs !== null &&
    nextBoard.timerRunning
  ) {
    nextBoard = { ...nextBoard, shotClockMs: Math.max(0, nextBoard.shotClockMs - 1000) };
  }

  return nextBoard;
}

export function getDisplayClock(board: RefereeBoard) {
  const totalSeconds = Math.max(0, Math.floor(board.timerMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getShotClockLabel(board: RefereeBoard) {
  if (board.shotClockMs === null) return null;
  return `${Math.ceil(board.shotClockMs / 1000)}s`;
}

export function getScoreHeadline(board: RefereeBoard) {
  if (board.config.kind === 'racket' || board.config.kind === 'tennis') {
    return `Sets ${board.matchA}-${board.matchB}`;
  }
  return `${sportLabel(board.sport)} score`;
}

function buildSegments(board: RefereeBoard) {
  if (
    (board.config.kind === 'basketball' || board.config.kind === 'hockey') &&
    (board.currentSegmentA > 0 || board.currentSegmentB > 0) &&
    !board.completed
  ) {
    return [
      ...board.segments,
      {
        label: `${board.config.kind === 'basketball' ? 'Quarter' : 'Quarter'} ${board.currentSegment}`,
        a: board.currentSegmentA,
        b: board.currentSegmentB,
      },
    ];
  }
  return board.segments;
}

export function buildRefereeSubmission(board: RefereeBoard): {
  ok: boolean;
  message: string;
  submission?: RefereeScoreSubmission;
} {
  const winnerSide =
    board.config.kind === 'racket' || board.config.kind === 'tennis'
      ? board.matchA === board.matchB
        ? 'draw'
        : board.matchA > board.matchB
          ? 'A'
          : 'B'
      : board.scoreA === board.scoreB
        ? 'draw'
        : board.scoreA > board.scoreB
          ? 'A'
          : 'B';

  if (winnerSide === 'draw') {
    return { ok: false, message: 'A winner is required before saving this match.' };
  }

  let scorecard: MatchScorecard;

  if (board.config.kind === 'racket') {
    scorecard = {
      sport: board.sport,
      formatLabel: `Best of ${board.config.sets} • ${board.config.pointsToWin} points`,
      summary: `Sets ${board.matchA}-${board.matchB} · ${board.segments.map((segment) => `${segment.a}-${segment.b}`).join(', ')}`,
      mode: board.config.winCondition,
      sets: board.segments.map((segment) => ({ a: segment.a, b: segment.b })),
      segments: board.segments,
      stats: {
        sets: board.config.sets,
        pointsToWin: board.config.pointsToWin,
        winCondition: board.config.winCondition,
      },
    };

    return {
      ok: true,
      message: `${sportLabel(board.sport)} result saved.`,
      submission: {
        scoreA: board.matchA,
        scoreB: board.matchB,
        winnerSide,
        mode: board.config.winCondition,
        sets: board.segments.map((segment) => ({ a: segment.a, b: segment.b })),
        scorecard,
      },
    };
  }

  if (board.config.kind === 'tennis') {
    scorecard = {
      sport: board.sport,
      formatLabel: `Best of ${board.config.sets} • Tie-break ${board.config.tieBreak ? 'on' : 'off'}`,
      summary: `Sets ${board.matchA}-${board.matchB} · ${board.segments.map((segment) => `${segment.a}-${segment.b}`).join(', ')}`,
      sets: board.segments.map((segment) => ({ a: segment.a, b: segment.b })),
      segments: board.segments,
      stats: {
        sets: board.config.sets,
        tieBreak: board.config.tieBreak,
      },
    };

    return {
      ok: true,
      message: 'Tennis result saved.',
      submission: {
        scoreA: board.matchA,
        scoreB: board.matchB,
        winnerSide,
        sets: board.segments.map((segment) => ({ a: segment.a, b: segment.b })),
        scorecard,
      },
    };
  }

  if (board.config.kind === 'basketball') {
    scorecard = {
      sport: board.sport,
      formatLabel: `${board.config.quarters} quarters • ${board.config.minutesPerQuarter} min`,
      summary: `${board.scoreA}-${board.scoreB} · ${buildSegments(board)
        .map((segment) => `${segment.label} ${segment.a}-${segment.b}`)
        .join(', ')}`,
      segments: buildSegments(board),
      stats: {
        quarters: board.config.quarters,
        minutesPerQuarter: board.config.minutesPerQuarter,
        shotClock: board.config.shotClock,
      },
    };
  } else if (board.config.kind === 'hockey') {
    scorecard = {
      sport: board.sport,
      formatLabel: `${board.config.quarters} quarters • ${board.config.minutesPerQuarter} min`,
      summary: `${board.scoreA}-${board.scoreB} · ${buildSegments(board)
        .map((segment) => `${segment.label} ${segment.a}-${segment.b}`)
        .join(', ')}`,
      segments: buildSegments(board),
      stats: {
        quarters: board.config.quarters,
        minutesPerQuarter: board.config.minutesPerQuarter,
      },
    };
  } else {
    scorecard = {
      sport: board.sport,
      formatLabel: `${board.config.matchMinutes} min match`,
      summary: `${board.scoreA}-${board.scoreB} • ${getDisplayClock(board)} played`,
      stats: {
        matchMinutes: board.config.matchMinutes,
        extraTime: board.config.extraTime,
        injuryTime: board.config.injuryTime,
      },
    };
  }

  return {
    ok: true,
    message: `${sportLabel(board.sport)} result saved.`,
    submission: {
      scoreA: board.scoreA,
      scoreB: board.scoreB,
      winnerSide,
      scorecard,
    },
  };
}
