import { Game } from '@/types';

export function getHunterStatus(game: Game): 'upcoming' | 'ongoing' | 'completed' {
  if (!game.scheduledAt) return game.status === 'cancelled' ? 'completed' : 'upcoming';

  const start = new Date(game.scheduledAt).getTime();
  const end = start + 1000 * 60 * 90;
  const now = Date.now();

  if (now < start) return 'upcoming';
  if (now <= end) return 'ongoing';
  return 'completed';
}

export function getHunterStatusTone(status: 'upcoming' | 'ongoing' | 'completed') {
  if (status === 'upcoming') return 'accent' as const;
  if (status === 'ongoing') return 'live' as const;
  return 'success' as const;
}

export function getHunterTimeLabel(game: Game) {
  if (game.scheduledAt) {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(game.scheduledAt));
  }

  return game.slotLabel;
}
