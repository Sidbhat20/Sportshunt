import { SupportedScoringSport } from '@/types';

export const TOURNAMENT_SPORT_OPTIONS = [
  'Badminton',
  'Basketball',
  'Football',
  'Pickleball',
  'Tennis',
  'Table Tennis',
  'Cricket',
  'Futsal',
  'Kabaddi',
  'Padel',
  'Squash',
  'Volleyball',
  'Throwball',
  'Hockey',
] as const;

const SCORING_SPORT_ALIASES: Record<SupportedScoringSport, string[]> = {
  badminton: ['badminton'],
  basketball: ['basketball'],
  football: ['football', 'soccer', 'futsal'],
  hockey: ['hockey'],
  pickleball: ['pickleball', 'pickelball'],
  tennis: ['tennis'],
  table_tennis: ['table tennis', 'table-tennis', 'table_tennis', 'tt', 'ping pong', 'ping-pong'],
  throwball: ['throwball'],
  volleyball: ['volleyball'],
};

export function normalizeSportForScoring(sport: string): SupportedScoringSport | null {
  const normalized = sport.trim().toLowerCase();
  if (!normalized) return null;

  for (const [key, aliases] of Object.entries(SCORING_SPORT_ALIASES) as Array<
    [SupportedScoringSport, string[]]
  >) {
    if (aliases.includes(normalized)) return key;
  }

  return null;
}

export function getScoringSportLabel(sport: string) {
  const key = normalizeSportForScoring(sport);
  if (key === 'table_tennis') return 'Table Tennis';
  if (key)
    return key
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  return sport;
}

export function getSportScoringBlurb(sport: string) {
  const key = normalizeSportForScoring(sport);

  switch (key) {
    case 'badminton':
      return 'Best of 3 games. Each game starts at 15. Choose deuce or golden point.';
    case 'basketball':
      return 'Single final score. A winner is required.';
    case 'football':
      return 'Single final score. Friendly mode can end in a draw.';
    case 'pickleball':
      return 'Best of 3 games to 11, win by 2.';
    case 'tennis':
      return 'Best of 3 sets. Standard set scores: 6-0 to 6-4, 7-5, or 7-6.';
    case 'table_tennis':
      return 'Best of 5 games to 11, win by 2.';
    case 'volleyball':
      return 'Set-based scoring with deuce or golden point configuration.';
    case 'throwball':
      return 'Set-based scoring with configurable points and win condition.';
    case 'hockey':
      return 'Quarter-based match with scoreboard and timer controls.';
    default:
      return 'Enter a final score for both sides.';
  }
}
