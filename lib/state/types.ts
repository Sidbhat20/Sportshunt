import type {
  AppState,
  AppUser,
  FixtureType,
  Game,
  NotificationItem,
  Organization,
  OrganizationMember,
  PaymentStatus,
  RefereeConfig,
  RefereeScoreSubmission,
  Role,
  Tournament,
  TournamentMatch,
  UserStatus,
} from '@/types';

export type RefereeSession = {
  accessId: string;
  tournamentId: string;
};

export type MessageResult = {
  ok: boolean;
  message: string;
  otp?: string;
  role?: Role;
};

export type AppContextValue = {
  ready: boolean;
  state: AppState;
  session: AppUser | null;
  refereeSession: RefereeSession | null;
  currentOrganizationId: string | null;
  currentOrganization: Organization | null;
  myOrganizations: Organization[];
  unreadNotifications: number;
  login: (email: string, name?: string, expectedRole?: Role | 'player') => MessageResult;
  logout: () => void;
  setCurrentOrganization: (organizationId: string) => void;
  markNotificationsRead: () => void;
  createOrganization: (payload: {
    name: string;
    email: string;
    phone: string;
    country: string;
  }) => MessageResult;
  inviteMember: (
    organizationId: string,
    payload: { name: string; email: string; role: OrganizationMember['role'] },
  ) => MessageResult;
  updateMemberRole: (
    organizationId: string,
    memberId: string,
    role: OrganizationMember['role'],
  ) => void;
  removeMember: (organizationId: string, memberId: string) => void;
  applyForRole: (type: 'venue' | 'organizer', details: Record<string, string>) => MessageResult;
  createBooking: (payload: {
    turfId: string;
    slotId?: string;
    slotIds?: string[];
    makePublic: boolean;
    maxPlayers: number;
    autoFill: boolean;
  }) => MessageResult;
  createGame: (payload: {
    turfId?: string;
    slotLabel?: string;
    sport: string;
    maxPlayers: number;
    autoFill: boolean;
    location?: string;
    scheduledAt?: string;
    description?: string;
  }) => MessageResult;
  joinGame: (gameId: string) => MessageResult;
  addTurf: (payload: {
    name: string;
    location: string;
    price: number;
    sport: string;
    photo: string;
    slotsText: string;
  }) => MessageResult;
  addSlots: (turfId: string, slotsText: string) => MessageResult;
  createTournament: (
    organizationId: string,
    payload: {
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
    },
  ) => MessageResult;
  updateTournamentBasicInfo: (
    tournamentId: string,
    payload: Partial<
      Pick<
        Tournament,
        | 'name'
        | 'sport'
        | 'description'
        | 'rules'
        | 'startDate'
        | 'endDate'
        | 'venue'
        | 'mapLocation'
        | 'poster'
        | 'categories'
      >
    >,
  ) => void;
  createTournamentEvent: (
    tournamentId: string,
    payload: { name: string; entryFee: number; maxParticipants: number },
  ) => MessageResult;
  addTournamentParticipant: (
    tournamentId: string,
    eventId: string,
    payload: { participantName: string; paymentStatus: PaymentStatus },
  ) => MessageResult;
  joinTournamentEvent: (
    tournamentId: string,
    eventId: string,
    payload?: { participantName?: string },
  ) => MessageResult;
  generateFixtures: (
    tournamentId: string,
    eventId: string,
    fixtureType: FixtureType,
    participantOrder?: string[],
  ) => MessageResult;
  scheduleMatch: (
    tournamentId: string,
    matchId: string,
    payload: { court: string; config: RefereeConfig },
  ) => MessageResult;
  unscheduleMatch: (tournamentId: string, matchId: string) => void;
  updateMatchStatus: (
    tournamentId: string,
    matchId: string,
    status: TournamentMatch['status'],
  ) => void;
  verifyMatch: (tournamentId: string, matchId: string) => void;
  generateRefereeOtp: (tournamentId: string, eventId: string) => MessageResult;
  refereeLogin: (otp: string) => MessageResult;
  refereeLogout: () => void;
  submitRefereeScore: (matchId: string, submission: RefereeScoreSubmission) => MessageResult;
  reviewApplication: (applicationId: string, status: 'approved' | 'rejected') => void;
  reviewTurf: (turfId: string, status: 'approved' | 'rejected') => void;
  reviewOrganization: (organizationId: string, status: 'approved' | 'rejected') => void;
  reviewTournament: (tournamentId: string, status: 'approved' | 'rejected') => void;
  moderateUser: (userId: string, status: UserStatus) => void;
  moderateGame: (gameId: string, status: Game['status']) => void;
  moderateTournament: (tournamentId: string, status: Tournament['status']) => void;
};
