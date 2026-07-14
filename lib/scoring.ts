import { MatchScorecard, MatchScoreSet, RefereeScoreSubmission } from '@/types';
import { getScoringSportLabel, normalizeSportForScoring } from '@/lib/sports';

type WinnerSide = 'A' | 'B' | 'draw';

type ValidationResult = {
  ok: boolean;
  message: string;
  scoreA?: number;
  scoreB?: number;
  winnerSide?: WinnerSide;
  scorecard?: MatchScorecard;
};

function isValidScore(value: number | undefined) {
  return Number.isInteger(value) && (value ?? -1) >= 0;
}

function buildSetSummary(sets: MatchScoreSet[]) {
  return sets.map((set) => `${set.a}-${set.b}`).join(', ');
}

function validateRaceToTargetMatch({
  sport,
  sets,
  bestOf,
  target,
  requireWinner,
  mode,
  allowGoldenPoint = false,
}: {
  sport: MatchScorecard['sport'];
  sets: MatchScoreSet[];
  bestOf: number;
  target: number;
  requireWinner: boolean;
  mode?: string;
  allowGoldenPoint?: boolean;
}): ValidationResult {
  const setsToWin = Math.ceil(bestOf / 2);

  if (!sets.length) return { ok: false, message: 'Enter at least one completed game.' };
  if (sets.length > bestOf)
    return { ok: false, message: `This format only allows ${bestOf} game(s).` };

  let winsA = 0;
  let winsB = 0;

  for (let index = 0; index < sets.length; index += 1) {
    const set = sets[index];
    if (!isValidScore(set.a) || !isValidScore(set.b)) {
      return { ok: false, message: `Game ${index + 1} needs valid non-negative scores.` };
    }
    if (set.a === set.b) {
      return { ok: false, message: `Game ${index + 1} cannot finish tied.` };
    }

    const winner = Math.max(set.a, set.b);
    const loser = Math.min(set.a, set.b);
    const usesGoldenPoint = allowGoldenPoint && mode === 'golden_point';

    if (usesGoldenPoint) {
      if (winner !== target || loser > target - 1) {
        return {
          ok: false,
          message: `Game ${index + 1} must finish at ${target} with golden point mode.`,
        };
      }
    } else if (winner < target || winner - loser < 2) {
      return {
        ok: false,
        message: `Game ${index + 1} must be won by reaching ${target} and leading by 2.`,
      };
    }

    if (set.a > set.b) winsA += 1;
    else winsB += 1;

    if ((winsA >= setsToWin || winsB >= setsToWin) && index < sets.length - 1) {
      return {
        ok: false,
        message: 'Remove extra games after the match winner has already been decided.',
      };
    }
  }

  if (requireWinner && winsA !== setsToWin && winsB !== setsToWin) {
    return { ok: false, message: 'Complete enough games to decide the winner.' };
  }

  if (!requireWinner && winsA === winsB) {
    return { ok: false, message: 'Friendly scorecards still need a clear winner for this sport.' };
  }

  const winnerSide: WinnerSide = winsA > winsB ? 'A' : 'B';
  const summary = `Sets ${winsA}-${winsB} · ${buildSetSummary(sets)}`;

  return {
    ok: true,
    message: `${getScoringSportLabel(sport)} score recorded.`,
    scoreA: winsA,
    scoreB: winsB,
    winnerSide,
    scorecard: {
      sport,
      mode,
      summary,
      sets,
      formatLabel: sport === 'table_tennis' ? 'Best of 5 to 11' : `Best of ${bestOf} to ${target}`,
    },
  };
}

function validateTennisMatch(sets: MatchScoreSet[], requireWinner: boolean): ValidationResult {
  if (!sets.length) return { ok: false, message: 'Enter at least one completed set.' };
  if (sets.length > 3) return { ok: false, message: 'Tennis best-of-3 allows up to 3 sets.' };

  let winsA = 0;
  let winsB = 0;

  const isValidTennisSet = (a: number, b: number) => {
    const winner = Math.max(a, b);
    const loser = Math.min(a, b);
    return (winner === 6 && loser <= 4) || (winner === 7 && (loser === 5 || loser === 6));
  };

  for (let index = 0; index < sets.length; index += 1) {
    const set = sets[index];
    if (!isValidScore(set.a) || !isValidScore(set.b)) {
      return { ok: false, message: `Set ${index + 1} needs valid non-negative scores.` };
    }
    if (set.a === set.b) {
      return { ok: false, message: `Set ${index + 1} cannot finish tied.` };
    }
    if (!isValidTennisSet(set.a, set.b)) {
      return { ok: false, message: `Set ${index + 1} must end 6-0 to 6-4, 7-5, or 7-6.` };
    }

    if (set.a > set.b) winsA += 1;
    else winsB += 1;

    if ((winsA >= 2 || winsB >= 2) && index < sets.length - 1) {
      return { ok: false, message: 'Remove extra sets after the winner has already been decided.' };
    }
  }

  if (requireWinner && winsA !== 2 && winsB !== 2) {
    return { ok: false, message: 'Complete enough sets to decide the winner.' };
  }

  const winnerSide: WinnerSide = winsA > winsB ? 'A' : 'B';
  const summary = `Sets ${winsA}-${winsB} · ${buildSetSummary(sets)}`;

  return {
    ok: true,
    message: 'Tennis score recorded.',
    scoreA: winsA,
    scoreB: winsB,
    winnerSide,
    scorecard: {
      sport: 'tennis',
      summary,
      sets,
      formatLabel: 'Best of 3 sets',
    },
  };
}

function validateSimpleScore({
  sport,
  scoreA,
  scoreB,
  requireWinner,
}: {
  sport: string;
  scoreA?: number;
  scoreB?: number;
  requireWinner: boolean;
}): ValidationResult {
  if (!isValidScore(scoreA) || !isValidScore(scoreB)) {
    return { ok: false, message: 'Enter valid non-negative scores for both sides.' };
  }

  const normalized = normalizeSportForScoring(sport);
  const allowsDraw = normalized === 'football' && !requireWinner;
  const safeScoreA = Number(scoreA);
  const safeScoreB = Number(scoreB);

  if (safeScoreA === safeScoreB && !allowsDraw) {
    return {
      ok: false,
      message: requireWinner
        ? 'A winner is required for this match.'
        : 'This sport cannot finish tied in referee mode.',
    };
  }

  const winnerSide: WinnerSide =
    safeScoreA === safeScoreB ? 'draw' : safeScoreA > safeScoreB ? 'A' : 'B';
  const safeSport = normalized ?? 'football';

  return {
    ok: true,
    message: `${getScoringSportLabel(sport)} score recorded.`,
    scoreA: safeScoreA,
    scoreB: safeScoreB,
    winnerSide,
    scorecard: {
      sport: safeSport,
      summary: `${safeScoreA}-${safeScoreB}`,
      formatLabel: 'Final score',
    },
  };
}

export function validateRefereeSubmission(
  sport: string,
  submission: RefereeScoreSubmission,
  options: { requireWinner?: boolean } = {},
): ValidationResult {
  const key = normalizeSportForScoring(sport);
  const requireWinner = options.requireWinner ?? true;

  if (key === 'badminton') {
    return validateRaceToTargetMatch({
      sport: 'badminton',
      sets: submission.sets ?? [],
      bestOf: 3,
      target: 15,
      requireWinner,
      mode: submission.mode,
      allowGoldenPoint: true,
    });
  }

  if (key === 'pickleball') {
    return validateRaceToTargetMatch({
      sport: 'pickleball',
      sets: submission.sets ?? [],
      bestOf: 3,
      target: 11,
      requireWinner,
    });
  }

  if (key === 'table_tennis') {
    return validateRaceToTargetMatch({
      sport: 'table_tennis',
      sets: submission.sets ?? [],
      bestOf: 5,
      target: 11,
      requireWinner,
    });
  }

  if (key === 'tennis') {
    return validateTennisMatch(submission.sets ?? [], requireWinner);
  }

  return validateSimpleScore({
    sport,
    scoreA: submission.scoreA,
    scoreB: submission.scoreB,
    requireWinner,
  });
}
