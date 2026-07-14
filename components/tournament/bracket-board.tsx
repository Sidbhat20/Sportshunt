'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { StatusPill } from '@/components/ui';
import { EASE_OUT } from '@/components/motion/primitives';
import type { TournamentMatch } from '@/types';

type BracketRound = {
  key: string;
  label: string;
  phase: TournamentMatch['phase'];
  roundNumber: number;
  matches: TournamentMatch[];
};

function groupBracketRounds(matches: TournamentMatch[]) {
  const grouped = new Map<string, TournamentMatch[]>();

  matches
    .filter((match) => ['knockout', 'qualification'].includes(match.phase))
    .forEach((match) => {
      const key = `${match.phase}-${match.roundNumber}-${match.roundLabel}`;
      const round = grouped.get(key) ?? [];
      round.push(match);
      grouped.set(key, round);
    });

  return Array.from(grouped.entries())
    .map(([key, roundMatches]) => ({
      key,
      label: roundMatches[0]?.roundLabel ?? 'Round',
      phase: roundMatches[0]?.phase ?? 'knockout',
      roundNumber: roundMatches[0]?.roundNumber ?? 0,
      matches: roundMatches.sort((a, b) => a.matchNumber - b.matchNumber),
    }))
    .sort((a, b) => a.roundNumber - b.roundNumber) as BracketRound[];
}

export function BracketBoard({ matches }: { matches: TournamentMatch[] }) {
  const rounds = useMemo(() => groupBracketRounds(matches), [matches]);
  const reduce = useReducedMotion();

  if (!rounds.length) return null;

  // A connector that "draws" itself when it scrolls into view.
  function Connector({
    className,
    axis,
    origin,
    delay,
  }: {
    className: string;
    axis: 'x' | 'y';
    origin: 'left' | 'right' | 'top';
    delay: number;
  }) {
    return (
      <motion.div
        className={className}
        style={{ y: '-50%', transformOrigin: origin }}
        initial={reduce ? false : axis === 'x' ? { scaleX: 0 } : { scaleY: 0 }}
        whileInView={axis === 'x' ? { scaleX: 1 } : { scaleY: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay }}
      />
    );
  }

  return (
    <div className="space-y-3 pt-2">
      <div>
        <h3 className="text-base font-semibold text-ink">Knockout draw</h3>
        <p className="mt-1 text-xs text-muted">
          Visual bracket with progression connectors across rounds.
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-stretch gap-8 pb-3">
          {rounds.map((round, roundIndex) => {
            const verticalGap = `${Math.max(0.75, Math.pow(2, round.roundNumber - 1) * 0.6)}rem`;
            const paddingTop = `${Math.max(0, Math.pow(2, round.roundNumber - 2) * 1.2)}rem`;
            const roundDelay = roundIndex * 0.12;

            return (
              <motion.div
                key={round.key}
                className="relative w-72 shrink-0"
                initial={reduce ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: roundDelay }}
              >
                {roundIndex < rounds.length - 1 ? (
                  <Connector
                    className="absolute right-[-2rem] top-1/2 h-px w-8 bg-line"
                    axis="x"
                    origin="left"
                    delay={roundDelay + 0.25}
                  />
                ) : null}

                <div className="rounded-xl bg-canvas px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {round.phase}
                  </p>
                  <p className="mt-1 font-medium text-ink">{round.label}</p>
                </div>

                <div className="mt-4 flex flex-col" style={{ gap: verticalGap, paddingTop }}>
                  {round.matches.map((match, matchIndex) => (
                    <motion.div
                      key={match.id}
                      className="relative"
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.45,
                        ease: EASE_OUT,
                        delay: roundDelay + matchIndex * 0.08,
                      }}
                    >
                      {roundIndex > 0 ? (
                        <Connector
                          className="absolute left-[-2rem] top-1/2 h-px w-8 bg-line"
                          axis="x"
                          origin="right"
                          delay={roundDelay + 0.3}
                        />
                      ) : null}
                      {roundIndex < rounds.length - 1 ? (
                        <Connector
                          className="absolute right-[-2rem] top-1/2 h-px w-8 bg-line"
                          axis="x"
                          origin="left"
                          delay={roundDelay + 0.3}
                        />
                      ) : null}
                      {matchIndex < round.matches.length - 1 ? (
                        <Connector
                          className="absolute right-[-2rem] top-1/2 h-[calc(100%+1.5rem)] w-px bg-line"
                          axis="y"
                          origin="top"
                          delay={roundDelay + 0.35}
                        />
                      ) : null}

                      <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                            Match {match.matchNumber}
                          </p>
                          <StatusPill
                            tone={
                              match.status === 'live'
                                ? 'live'
                                : match.status === 'verified'
                                  ? 'success'
                                  : 'default'
                            }
                          >
                            {match.status}
                          </StatusPill>
                        </div>

                        <div className="space-y-2">
                          <TeamRow
                            name={match.participantAName || 'TBD'}
                            score={typeof match.scoreA === 'number' ? match.scoreA : null}
                            winner={match.winnerName === match.participantAName}
                          />
                          <TeamRow
                            name={match.participantBName || 'TBD'}
                            score={typeof match.scoreB === 'number' ? match.scoreB : null}
                            winner={match.winnerName === match.participantBName}
                          />
                        </div>

                        {match.winnerName ? (
                          <p className="mt-3 text-xs font-semibold text-accent">
                            Advances: {match.winnerName}
                          </p>
                        ) : match.nextMatchId ? (
                          <p className="mt-3 text-xs text-muted">Winner progresses to next round.</p>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TeamRow({ name, score, winner }: { name: string; score: number | null; winner: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={false}
      animate={
        reduce || !winner
          ? undefined
          : { boxShadow: ['0 0 0 0 rgba(21,128,61,0)', '0 0 0 4px rgba(21,128,61,0.18)', '0 0 0 0 rgba(21,128,61,0)'] }
      }
      transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.4 }}
      className={`flex items-center justify-between rounded-xl px-3 py-2 ${winner ? 'bg-accentSoft text-accentDeep ring-1 ring-accent/30' : 'bg-canvas text-ink'}`}
    >
      <span className="truncate pr-3 text-sm font-medium">{name}</span>
      <span className="scoreboard text-lg">{score ?? '—'}</span>
    </motion.div>
  );
}
