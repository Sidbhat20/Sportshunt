'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/app-provider';
import { PageHeader, SurfaceCard } from '@/components/ui';
import { TournamentTabs } from '@/components/layouts/tournament-tabs';

export default function TournamentDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const { state, currentOrganization, myOrganizations } = useApp();
  const tournament = state.tournaments.find((item) => item.id === params.id);
  const tournamentOrg = tournament
    ? myOrganizations.find((organization) => organization.id === tournament.organizationId)
    : null;

  if (!tournament || !tournamentOrg) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tournament"
          copy="This tournament can't be found in your organizations."
        />
        <SurfaceCard>
          <p className="text-sm text-muted">
            Pick another tournament from the list, or switch organizations.
          </p>
          <Link href="/organizer/tournaments" className="secondary-btn mt-3">
            Back to tournaments
          </Link>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={tournament.name}
        copy={`${tournamentOrg.name} • ${tournament.sport} • ${tournament.venue}`}
        action={
          <Link href="/organizer/tournaments" className="secondary-btn">
            Back
          </Link>
        }
      />
      <TournamentTabs tournament={tournament} />
      {currentOrganization && currentOrganization.id !== tournamentOrg.id ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          You're viewing a tournament from {tournamentOrg.name} while {currentOrganization.name} is
          selected in the switcher.
        </p>
      ) : null}
      {children}
    </div>
  );
}
