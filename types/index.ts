export type Role = 'user' | 'venue_owner' | 'organizer' | 'referee' | 'super_admin';
export type UserStatus = 'active' | 'banned' | 'suspended';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'suspended';
export type GameStatus = 'open' | 'filled' | 'cancelled' | 'suspended';
export type PaymentStatus = 'paid' | 'pending';
export type MemberRole = 'admin' | 'manager' | 'viewer';
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'verified';
export type FixtureType =
  | 'knockout'
  | 'round_robin'
  | 'round_robin_knockout'
  | 'knockout_round_robin';
export type SupportedScoringSport =
  | 'badminton'
  | 'basketball'
  | 'football'
  | 'hockey'
  | 'pickleball'
  | 'tennis'
  | 'table_tennis'
  | 'throwball'
  | 'volleyball';

export type WinCondition = 'deuce' | 'golden_point';
export type ShotClockMode = 'off' | '24' | '14';

export type RefereeConfig =
  | {
      kind: 'racket';
      sport: 'badminton' | 'table_tennis' | 'pickleball' | 'volleyball' | 'throwball';
      sets: 3 | 5;
      pointsToWin: number;
      winCondition: WinCondition;
      timerEnabled: boolean;
    }
  | {
      kind: 'tennis';
      sport: 'tennis';
      sets: 3 | 5;
      tieBreak: boolean;
      timerEnabled: boolean;
    }
  | {
      kind: 'basketball';
      sport: 'basketball';
      quarters: number;
      minutesPerQuarter: number;
      shotClock: ShotClockMode;
    }
  | {
      kind: 'football';
      sport: 'football';
      matchMinutes: number;
      extraTime: boolean;
      injuryTime: number;
    }
  | {
      kind: 'hockey';
      sport: 'hockey';
      quarters: number;
      minutesPerQuarter: number;
    };

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  city: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId?: string;
  name: string;
  email: string;
  role: MemberRole;
  status: 'active' | 'invited';
}

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: ReviewStatus;
  members: OrganizationMember[];
}

export interface TurfSlot {
  id: string;
  label: string;
  available: boolean;
}

export interface Turf {
  id: string;
  ownerId: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  photos: string[];
  approved: boolean;
  moderationStatus: ReviewStatus;
  slots: TurfSlot[];
}

export interface Booking {
  id: string;
  turfId: string;
  turfName: string;
  userId: string;
  userName: string;
  slotId: string;
  slotLabel: string;
  makePublic: boolean;
  createdAt: string;
}

export interface GamePlayer {
  id: string;
  name: string;
}

export interface Game {
  id: string;
  createdBy: string;
  createdByName: string;
  turfId?: string;
  turfName: string;
  sport: string;
  location?: string;
  scheduledAt?: string;
  description?: string;
  slotLabel: string;
  players: GamePlayer[];
  maxPlayers: number;
  autoFill: boolean;
  status: GameStatus;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  eventId: string;
  userId?: string;
  participantName: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface TournamentEvent {
  id: string;
  name: string;
  entryFee: number;
  maxParticipants: number;
  registrationIds: string[];
  fixtureType?: FixtureType;
}

export interface MatchSeedSource {
  mode: 'rank' | 'qualifier';
  value: number;
}

export interface MatchScoreSet {
  a: number;
  b: number;
}

export interface MatchScorecard {
  sport: SupportedScoringSport;
  formatLabel: string;
  summary: string;
  mode?: string;
  sets?: MatchScoreSet[];
  segments?: Array<{ label: string; a: number; b: number }>;
  stats?: Record<string, string | number | boolean>;
}

export interface RefereeScoreSubmission {
  scoreA?: number;
  scoreB?: number;
  mode?: string;
  sets?: MatchScoreSet[];
  winnerSide?: 'A' | 'B' | 'draw';
  scorecard?: MatchScorecard;
}

export interface MatchRefereeAssignment {
  court: string;
  createdAt: string;
  assignedBy: string;
  config: RefereeConfig;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  eventId: string;
  phase: 'group' | 'knockout' | 'qualification' | 'championship';
  roundNumber: number;
  roundLabel: string;
  matchNumber: number;
  participantAId?: string;
  participantAName?: string;
  participantBId?: string;
  participantBName?: string;
  scoreA?: number;
  scoreB?: number;
  winnerParticipantId?: string;
  winnerName?: string;
  scorecard?: MatchScorecard;
  status: MatchStatus;
  refereeAssignment?: MatchRefereeAssignment;
  nextMatchId?: string;
  nextMatchSlot?: 'A' | 'B';
  qualifierRank?: number;
  seedA?: MatchSeedSource;
  seedB?: MatchSeedSource;
}

export interface RefereeAccess {
  id: string;
  tournamentId: string;
  otp: string;
  matchIds: string[];
  expiresAt: string;
  active: boolean;
}

export interface Tournament {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  sport: string;
  description: string;
  rules: string;
  startDate: string;
  endDate: string;
  venue: string;
  mapLocation: string;
  poster: string;
  categories: string[];
  approvalStatus: ReviewStatus;
  publicStatus: 'draft' | 'live' | 'archived';
  status: TournamentStatus;
  events: TournamentEvent[];
  registrations: TournamentRegistration[];
  matches: TournamentMatch[];
  referees: RefereeAccess[];
}

export interface Application {
  id: string;
  type: 'venue' | 'organizer';
  userId: string;
  userName: string;
  userEmail: string;
  status: ReviewStatus;
  submittedAt: string;
  details: Record<string, string>;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  userId?: string;
  organizationId?: string;
  link?: string;
}

export interface AppState {
  users: AppUser[];
  organizations: Organization[];
  turfs: Turf[];
  bookings: Booking[];
  games: Game[];
  tournaments: Tournament[];
  applications: Application[];
  notifications: NotificationItem[];
}
