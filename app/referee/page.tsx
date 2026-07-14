'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLockup } from '@/components/brand';
import { RoleGuard } from '@/components/guards';
import { useApp } from '@/components/app-provider';
import { EmptyState, StatusPill, SurfaceCard } from '@/components/ui';
import { RefereeConfigPanel } from '@/components/referee-config-panel';
import type { RefereeConfig } from '@/types';
import {
  buildRefereeSubmission,
  changeBoardScore,
  createRefereeBoard,
  getActiveSegmentLabel,
  getDefaultRefereeConfig,
  getDisplayClock,
  getMetaLine,
  getScoreHeadline,
  getShotClockLabel,
  isPeriodSport,
  normalizeRefereeSport,
  RefereeBoard,
  REFEREE_SPORT_OPTIONS,
  resetBoardTimer,
  resetShotClock,
  scoreButtonValues,
  tickBoard,
  toggleBoardTimer,
  usesTimer,
  advanceBoardSegment,
} from '@/lib/referee-engine';
import { getScoringSportLabel } from '@/lib/sports';

const STORAGE_KEY = 'sportshunt_referee_engine_v2';
const HISTORY_KEY = 'sportshunt_referee_history_v1';

type SavedResult = {
  id: string;
  title: string;
  summary: string;
  savedAt: string;
};

type TournamentMatchOption = {
  id: string;
  teamA: string;
  teamB: string;
  sport: string;
  label: string;
  court?: string;
  config?: RefereeConfig;
};

export default function RefereePage() {
  return (
    <RoleGuard allow={['referee']}>
      <RefereeDashboard />
    </RoleGuard>
  );
}

function RefereeDashboard() {
  const router = useRouter();
  const {
    state,
    session,
    logout,
    refereeSession,
    refereeLogin,
    refereeLogout,
    submitRefereeScore,
  } = useApp();

  const [mode, setMode] = useState<'manual' | 'otp'>('manual');
  const [manualSport, setManualSport] = useState<string>('');
  const [manualConfig, setManualConfig] = useState<RefereeConfig | null>(null);
  const [manualBoard, setManualBoard] = useState<RefereeBoard | null>(null);
  const [boards, setBoards] = useState<Record<string, RefereeBoard>>({});
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<SavedResult[]>([]);

  const tournament = refereeSession
    ? state.tournaments.find((item) => item.id === refereeSession.tournamentId)
    : null;
  const access =
    refereeSession && tournament
      ? tournament.referees.find((item) => item.id === refereeSession.accessId)
      : null;

  const assignedMatches = useMemo<TournamentMatchOption[]>(() => {
    if (!tournament || !access) return [];
    return tournament.matches
      .filter(
        (match) =>
          access.matchIds.includes(match.id) && match.participantAName && match.participantBName,
      )
      .map((match) => ({
        id: match.id,
        teamA: match.participantAName ?? 'Team A',
        teamB: match.participantBName ?? 'Team B',
        sport: tournament.sport,
        label: `${match.participantAName} vs ${match.participantBName}`,
        court: match.refereeAssignment?.court,
        config: match.refereeAssignment?.config,
      }));
  }, [access, tournament]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedBoards = window.localStorage.getItem(STORAGE_KEY);
    const storedHistory = window.localStorage.getItem(HISTORY_KEY);
    if (storedBoards) setBoards(JSON.parse(storedBoards) as Record<string, RefereeBoard>);
    if (storedHistory) setHistory(JSON.parse(storedHistory) as SavedResult[]);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!manualSport) return;
    setManualConfig(getDefaultRefereeConfig(manualSport));
  }, [manualSport]);

  useEffect(() => {
    if (!assignedMatches.length) return;
    if (!selectedMatchId || !assignedMatches.some((match) => match.id === selectedMatchId)) {
      setSelectedMatchId(assignedMatches[0].id);
    }
  }, [assignedMatches, selectedMatchId]);

  useEffect(() => {
    const activeMatch = assignedMatches.find((match) => match.id === selectedMatchId);
    if (!activeMatch) return;
    setBoards((current) =>
      current[activeMatch.id]
        ? current
        : {
            ...current,
            [activeMatch.id]: createRefereeBoard({
              config: activeMatch.config ?? getDefaultRefereeConfig(activeMatch.sport),
              teamA: activeMatch.teamA,
              teamB: activeMatch.teamB,
            }),
          },
    );
  }, [assignedMatches, selectedMatchId]);

  useEffect(() => {
    const activeTournamentBoard = selectedMatchId ? boards[selectedMatchId] : null;
    const target = mode === 'manual' ? manualBoard : activeTournamentBoard;
    if (!target?.timerRunning) return;

    const timer = window.setInterval(() => {
      if (mode === 'manual') {
        setManualBoard((current) => (current ? tickBoard(current) : current));
      } else if (selectedMatchId) {
        setBoards((current) => ({
          ...current,
          [selectedMatchId]: current[selectedMatchId]
            ? tickBoard(current[selectedMatchId])
            : current[selectedMatchId],
        }));
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [boards, manualBoard, mode, selectedMatchId]);

  function saveLocalResult(board: RefereeBoard) {
    const result = buildRefereeSubmission(board);
    if (!result.ok || !result.submission?.scorecard) {
      setMessage(result.message);
      return;
    }

    const summary = result.submission.scorecard.summary;

    setHistory((current) => [
      {
        id: `${Date.now()}`,
        title: `${board.teamA} vs ${board.teamB}`,
        summary,
        savedAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setMessage(result.message);
  }

  function saveTournamentResult(matchId: string, board: RefereeBoard) {
    const result = buildRefereeSubmission(board);
    if (!result.ok || !result.submission) {
      setMessage(result.message);
      return;
    }
    const response = submitRefereeScore(matchId, result.submission);
    setMessage(response.message);
  }

  function resetManualFlow() {
    setManualBoard(null);
    setManualSport('');
    setManualConfig(null);
  }

  function activeTournamentBoard() {
    return selectedMatchId ? (boards[selectedMatchId] ?? null) : null;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <BrandLockup href="/referee" accent="green" size="sm" subtitle="Referee dashboard" />
          <div className="flex items-center gap-2">
            {refereeSession ? (
              <button onClick={refereeLogout} className="secondary-btn">
                End OTP session
              </button>
            ) : null}
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="secondary-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Multi-sport referee engine
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-ink">
                Tap-first scoring, sport-aware logic
              </h1>
              <p className="mt-1 text-sm text-muted">
                Manual setup for friendly matches or OTP-based tournament scoring with auto-loaded
                sport config.
              </p>
            </div>
            <div className="rounded-2xl bg-canvas px-4 py-3 text-sm">
              <p className="font-semibold text-ink">{session.name}</p>
              <p className="mt-1 text-muted">Referee workspace</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode('manual')}
              className={mode === 'manual' ? 'primary-btn' : 'secondary-btn'}
            >
              Manual setup
            </button>
            <button
              onClick={() => setMode('otp')}
              className={mode === 'otp' ? 'primary-btn' : 'secondary-btn'}
            >
              Tournament OTP
            </button>
          </div>
        </SurfaceCard>

        {mode === 'manual' ? (
          manualBoard ? (
            <ScoreboardWorkspace
              board={manualBoard}
              onChange={(next) => setManualBoard(next)}
              onReset={() =>
                setManualBoard(
                  manualConfig
                    ? createRefereeBoard({ config: manualConfig, teamA: 'Team A', teamB: 'Team B' })
                    : null,
                )
              }
              onBack={resetManualFlow}
              onSave={() => saveLocalResult(manualBoard)}
              saveLabel="Save match"
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <SurfaceCard className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">Select sport</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {REFEREE_SPORT_OPTIONS.map((sport) => (
                    <button
                      key={sport.value}
                      onClick={() => setManualSport(sport.value)}
                      className={`rounded-2xl border p-4 text-left transition ${manualSport === sport.value ? 'border-accent bg-accentSoft' : 'border-line bg-white hover:border-accent/40'}`}
                    >
                      <p className="font-semibold text-ink">{sport.label}</p>
                      <p className="mt-1 text-xs text-muted">
                        Dynamic rules and controls will adapt automatically.
                      </p>
                    </button>
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                    Step 2
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">Match configuration</h2>
                </div>
                {manualConfig ? (
                  <>
                    <RefereeConfigPanel
                      config={manualConfig}
                      onChange={setManualConfig}
                      locked={false}
                    />
                    <button
                      onClick={() =>
                        setManualBoard(
                          createRefereeBoard({
                            config: manualConfig,
                            teamA: 'Team A',
                            teamB: 'Team B',
                          }),
                        )
                      }
                      className="primary-btn w-full justify-center"
                    >
                      Start scoring
                    </button>
                  </>
                ) : (
                  <EmptyState
                    title="Choose a sport first"
                    body="The match config will appear here as soon as you pick a sport."
                  />
                )}
              </SurfaceCard>
            </div>
          )
        ) : !refereeSession ? (
          <SurfaceCard className="mx-auto max-w-md space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Tournament OTP
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ink">Load assigned match</h2>
              <p className="mt-1 text-sm text-muted">
                Enter the organizer-issued OTP. Match and sport config will auto-load with no manual
                setup.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  OTP
                </label>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="6-digit OTP"
                  inputMode="numeric"
                />
              </div>
              <button
                onClick={() => {
                  const result = refereeLogin(otp.trim());
                  setMessage(result.message);
                }}
                className="primary-btn w-full justify-center"
              >
                Access match
              </button>
            </div>
          </SurfaceCard>
        ) : assignedMatches.length ? (
          <>
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                    Assigned matches
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">{tournament?.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {assignedMatches.length} match(es) available in this OTP session.
                  </p>
                </div>
                <StatusPill tone="live">OTP active</StatusPill>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {assignedMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatchId(match.id)}
                    className={`min-w-[220px] rounded-2xl border px-4 py-3 text-left transition ${selectedMatchId === match.id ? 'border-accent bg-accentSoft' : 'border-line bg-white hover:border-accent/40'}`}
                  >
                    <p className="font-semibold text-ink">{match.label}</p>
                    <p className="mt-1 text-xs text-muted">
                      {getScoringSportLabel(match.sport)}
                      {match.court ? ` • ${match.court}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            </SurfaceCard>

            {activeTournamentBoard() ? (
              <ScoreboardWorkspace
                board={activeTournamentBoard() as RefereeBoard}
                onChange={(next) =>
                  setBoards((current) =>
                    selectedMatchId ? { ...current, [selectedMatchId]: next } : current,
                  )
                }
                onReset={() => {
                  const match = assignedMatches.find((item) => item.id === selectedMatchId);
                  if (!match) return;
                  setBoards((current) => ({
                    ...current,
                    [selectedMatchId]: createRefereeBoard({
                      config: match.config ?? getDefaultRefereeConfig(match.sport),
                      teamA: match.teamA,
                      teamB: match.teamB,
                    }),
                  }));
                }}
                onBack={() => {}}
                onSave={() =>
                  saveTournamentResult(selectedMatchId, activeTournamentBoard() as RefereeBoard)
                }
                saveLabel="Save to fixture"
                lockedConfig
              />
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No matches assigned"
            body="Ask the organizer to generate a fresh referee OTP for scheduled fixtures."
          />
        )}

        {history.length && mode === 'manual' ? (
          <SurfaceCard className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">Recent saved matches</h2>
            {history.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl bg-canvas p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.summary}</p>
              </div>
            ))}
          </SurfaceCard>
        ) : null}

        {message ? (
          <p className="rounded-xl bg-accentSoft px-3 py-2 text-sm font-medium text-accentDeep">
            {message}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function ScoreboardWorkspace({
  board,
  onChange,
  onReset,
  onBack,
  onSave,
  saveLabel,
  lockedConfig = false,
}: {
  board: RefereeBoard;
  onChange: (next: RefereeBoard) => void;
  onReset: () => void;
  onBack: () => void;
  onSave: () => void;
  saveLabel: string;
  lockedConfig?: boolean;
}) {
  return (
    <div className="space-y-6">
      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Live scoreboard
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              {board.teamA} vs {board.teamB}
            </h2>
            <p className="mt-1 text-sm text-muted">{getMetaLine(board)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!lockedConfig ? (
              <button onClick={onBack} className="secondary-btn">
                Change sport
              </button>
            ) : null}
            <button onClick={onReset} className="secondary-btn">
              Reset match
            </button>
            <button onClick={onSave} className="primary-btn">
              {saveLabel}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="accent">{getScoringSportLabel(board.sport)}</StatusPill>
          <StatusPill tone={board.completed ? 'success' : 'live'}>
            {board.completed ? 'Completed' : getActiveSegmentLabel(board)}
          </StatusPill>
          {board.config.kind === 'racket' || board.config.kind === 'tennis' ? (
            <StatusPill tone="lime">{getScoreHeadline(board)}</StatusPill>
          ) : null}
        </div>

        {board.segments.length ? (
          <div className="flex flex-wrap gap-2">
            {board.segments.map((segment) => (
              <span
                key={`${segment.label}-${segment.a}-${segment.b}`}
                className="rounded-full bg-canvas px-3 py-1.5 text-xs font-medium text-ink"
              >
                {segment.label}: {segment.a}-{segment.b}
              </span>
            ))}
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-ink px-5 py-4 text-white">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lime">Timer</p>
            <p className="mt-1 text-4xl font-semibold tracking-[0.08em]">
              {usesTimer(board.config) ? getDisplayClock(board) : 'Optional'}
            </p>
            <p className="mt-1 text-xs text-white/70">{getActiveSegmentLabel(board)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange(toggleBoardTimer(board))}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink"
              disabled={!usesTimer(board.config)}
            >
              {board.timerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => onChange(resetBoardTimer(board))}
              className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white"
              disabled={!usesTimer(board.config)}
            >
              Reset timer
            </button>
            {isPeriodSport(board.config) ? (
              <button
                onClick={() => onChange(advanceBoardSegment(board))}
                className="rounded-full border border-lime/40 bg-lime/10 px-5 py-3 text-sm font-semibold text-lime"
              >
                Next quarter
              </button>
            ) : null}
            {board.config.kind === 'basketball' ? (
              <button
                onClick={() => onChange(resetShotClock(board))}
                className="rounded-full border border-lime/40 bg-lime/10 px-5 py-3 text-sm font-semibold text-lime"
              >
                Reset shot clock
              </button>
            ) : null}
          </div>
        </div>

        {board.config.kind === 'basketball' && getShotClockLabel(board) ? (
          <div className="rounded-2xl bg-canvas px-4 py-3 text-sm text-ink">
            <span className="font-semibold">Shot clock:</span> {getShotClockLabel(board)}
          </div>
        ) : null}

        {board.config.kind === 'racket' || board.config.kind === 'tennis' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <SurfaceCard className="bg-canvas">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Sets won
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {board.teamA}: {board.matchA}
              </p>
            </SurfaceCard>
            <SurfaceCard className="bg-canvas">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Sets won
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {board.teamB}: {board.matchB}
              </p>
            </SurfaceCard>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <ScoreTeamCard board={board} side="A" onChange={onChange} />
          <ScoreTeamCard board={board} side="B" onChange={onChange} />
        </div>
      </SurfaceCard>
    </div>
  );
}

function ScoreTeamCard({
  board,
  side,
  onChange,
}: {
  board: RefereeBoard;
  side: 'A' | 'B';
  onChange: (next: RefereeBoard) => void;
}) {
  const isA = side === 'A';
  const name = isA ? board.teamA : board.teamB;
  const score = isA ? board.scoreA : board.scoreB;
  const tone = isA
    ? 'from-accent/15 to-accent/5 border-accent/25'
    : 'from-lime/20 to-lime/5 border-lime/30';

  return (
    <div className={`rounded-3xl border bg-gradient-to-b ${tone} p-5`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{name}</p>
      <div className="mt-4 rounded-3xl bg-white px-6 py-8 text-center shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Current score
        </p>
        <p className="mt-3 text-7xl font-semibold text-ink sm:text-8xl">{score}</p>
      </div>
      <div
        className={`mt-4 grid gap-3 ${scoreButtonValues(board.config).length > 1 ? 'grid-cols-2' : 'grid-cols-2'}`}
      >
        {scoreButtonValues(board.config).map((value) => (
          <button
            key={`${side}-${value}`}
            onClick={() => onChange(changeBoardScore(board, side, value))}
            className="primary-btn min-h-16 justify-center text-base"
          >
            +{value}
          </button>
        ))}
        <button
          onClick={() => onChange(changeBoardScore(board, side, -1))}
          className="secondary-btn min-h-16 justify-center text-base"
        >
          -1
        </button>
      </div>
    </div>
  );
}

