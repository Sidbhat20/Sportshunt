'use client';

import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { GameStatus } from '@/types';

const gameStatuses: GameStatus[] = ['open', 'filled', 'cancelled', 'suspended'];

export default function AdminModerationPage() {
  const { state, moderateGame } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader title="Moderation" copy="Suspend abusive games or restore them after review." />

      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Hunters</h2>
        {state.games.length ? (
          state.games.map((game) => (
            <div key={game.id} className="rounded-xl bg-canvas p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{game.turfName}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Host: {game.createdByName} • {game.players.length}/{game.maxPlayers} players
                  </p>
                </div>
                <StatusPill
                  tone={
                    game.status === 'open'
                      ? 'accent'
                      : game.status === 'suspended'
                        ? 'danger'
                        : 'success'
                  }
                >
                  {game.status}
                </StatusPill>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {gameStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => moderateGame(game.id, status)}
                    className={game.status === status ? 'primary-btn' : 'secondary-btn'}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No hunts to moderate" body="All clear." />
        )}
      </SurfaceCard>
    </div>
  );
}
