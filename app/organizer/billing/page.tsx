'use client';

import { useMemo } from 'react';
import { BarChart, PieChart } from '@/components/charts';
import { useApp } from '@/components/app-provider';
import { EmptyState, PageHeader, StatCard, SurfaceCard } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

export default function OrganizerBillingPage() {
  const { state, currentOrganization } = useApp();

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <PageHeader title="Billing" copy="Pick or create an organization to view its revenue." />
        <EmptyState
          title="No organization selected"
          body="Use the Organizations tab to create one."
        />
      </div>
    );
  }

  const tournaments = state.tournaments.filter(
    (item) => item.organizationId === currentOrganization.id,
  );
  const revenueRows = useMemo(
    () =>
      tournaments.map((tournament) => ({
        name: tournament.name,
        revenue: tournament.registrations
          .filter((registration) => registration.paymentStatus === 'paid')
          .reduce((sum, registration) => {
            const event = tournament.events.find((item) => item.id === registration.eventId);
            return sum + (event?.entryFee ?? 0);
          }, 0),
        registrations: tournament.registrations.length,
      })),
    [tournaments],
  );

  const totalRevenue = revenueRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalRegistrations = revenueRows.reduce((sum, row) => sum + row.registrations, 0);
  const monthlyValues = revenueRows.map((row) => row.revenue);
  const monthlyLabels = revenueRows.map((row) => row.name.split(' ').slice(0, 2).join(' '));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        copy={`Revenue and registrations for ${currentOrganization.name}.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total revenue" value={formatMoney(totalRevenue)} tone="accent" />
        <StatCard label="Total registrations" value={totalRegistrations} />
        <StatCard
          label="Avg per tournament"
          value={formatMoney(totalRevenue / Math.max(revenueRows.length, 1))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Revenue split</h2>
          <PieChart
            values={monthlyValues.length ? monthlyValues : [0]}
            labels={monthlyLabels.length ? monthlyLabels : ['No data']}
          />
        </SurfaceCard>
        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Revenue per tournament</h2>
          <BarChart
            values={monthlyValues.length ? monthlyValues : [0]}
            labels={monthlyLabels.length ? monthlyLabels : ['No data']}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Breakdown</h2>
        {revenueRows.length ? (
          revenueRows.map((row) => (
            <div
              key={row.name}
              className="flex flex-col gap-1 rounded-xl bg-canvas p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">{row.name}</p>
                <p className="text-xs text-muted">{row.registrations} registrations</p>
              </div>
              <p className="font-semibold text-ink">{formatMoney(row.revenue)}</p>
            </div>
          ))
        ) : (
          <EmptyState
            title="No revenue yet"
            body="Once registrations start flowing in, you'll see them here."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
