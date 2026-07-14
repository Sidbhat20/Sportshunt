import { PlayerLayout } from '@/components/layouts/player-layout';

export default function PlayerSection({ children }: { children: React.ReactNode }) {
  return <PlayerLayout>{children}</PlayerLayout>;
}
