'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { PublicHeader } from '@/components/layouts/public-header';
import { PlayerAuthModal } from '@/components/player-auth-modal';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { Confetti, RevealImage, SuccessCheck } from '@/components/motion/primitives';
import { formatMoney } from '@/lib/utils';

export default function TurfPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, session, createBooking } = useApp();

  const turf = state.turfs.find((item) => item.id === params.id && item.approved) ?? null;
  const selectedIds = useMemo(
    () =>
      (searchParams.get('slots') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    [searchParams],
  );
  const selectedSlots = turf?.slots.filter((slot) => selectedIds.includes(slot.id)) ?? [];
  const hasUnavailableSlot = selectedSlots.some((slot) => !slot.available);
  const total = turf ? turf.price * selectedSlots.length : 0;

  const [openAuth, setOpenAuth] = useState(!session);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [paid, setPaid] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  async function handlePay() {
    if (!turf) return;
    if (!session) {
      setOpenAuth(true);
      return;
    }
    if (!selectedSlots.length) {
      setMessage('Select at least one slot before continuing to payment.');
      return;
    }
    if (hasUnavailableSlot) {
      setMessage(
        'One or more selected slots were already booked. Please go back and choose open slots.',
      );
      return;
    }

    setProcessing(true);
    setMessage('Processing mock payment…');
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    const result = createBooking({
      turfId: turf.id,
      slotIds: selectedSlots.map((slot) => slot.id),
      makePublic: false,
      maxPlayers: 10,
      autoFill: true,
    });

    setProcessing(false);
    setMessage(result.message);
    if (result.ok) {
      setPaid(true);
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 1600);
      router.refresh();
    }
  }

  if (!turf) {
    return (
      <>
        <PublicHeader />
        <main className="page-shell">
          <EmptyState
            title="Payment unavailable"
            body="This turf could not be found."
            action={
              <Link href="/turfs" className="primary-btn">
                Back to turfs
              </Link>
            }
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Confetti fire={celebrate} />
      <PublicHeader />
      <main className="page-shell space-y-6">
        <PageHeader
          title="Payment"
          copy="Review your booking and continue with the mock payment step."
          action={
            <Link href={`/turf/${turf.id}`} className="secondary-btn">
              Back to turf
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SurfaceCard className="space-y-4">
            <RevealImage
              src={turf.photos[0]}
              alt={`${turf.name} ${turf.sport} venue`}
              className="h-64 w-full rounded-3xl"
              imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04]"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                Selected turf
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-ink">{turf.name}</h2>
              <p className="mt-1 text-sm text-muted">{turf.location}</p>
            </div>
            <div className="grid gap-3 rounded-2xl bg-canvas p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Sport</span>
                <StatusPill tone="accent">{turf.sport}</StatusPill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Price / hour</span>
                <span className="font-semibold text-ink">{formatMoney(turf.price)}</span>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                Booking details
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ink">Review before payment</h2>
            </div>

            <div className="space-y-3 rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Slots selected</span>
                <span className="font-semibold text-ink">{selectedSlots.length}</span>
              </div>
              {selectedSlots.length ? (
                selectedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-3 text-sm"
                  >
                    <span className="text-ink">{slot.label}</span>
                    <span className="font-semibold text-ink">{formatMoney(turf.price)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No slots were passed into this payment step.</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-canvas p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Total price
                </p>
                <p className="mt-1 text-3xl font-semibold text-ink">{formatMoney(total || 0)}</p>
              </div>
              <button onClick={handlePay} disabled={processing || paid} className="primary-btn">
                {paid ? 'Payment complete' : processing ? 'Processing…' : 'Proceed to Pay'}
              </button>
            </div>

            {paid ? (
              <div className="rounded-2xl bg-accentSoft p-4 text-sm text-accentDeep">
                <div className="flex items-center gap-3">
                  <SuccessCheck size={40} />
                  <p className="text-base font-semibold">Booking confirmed.</p>
                </div>
                <p className="mt-2">
                  Your selected slot{selectedSlots.length > 1 ? 's are' : ' is'} now reserved.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/player/home" className="secondary-btn">
                    Go to player home
                  </Link>
                  <Link href="/turfs" className="ghost-btn">
                    Browse more turfs
                  </Link>
                </div>
              </div>
            ) : null}

            {message ? (
              <p className="rounded-xl bg-accentSoft px-3 py-2 text-sm font-medium text-accentDeep">
                {message}
              </p>
            ) : null}
            {hasUnavailableSlot ? (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                One of the selected slots is already booked. Please go back and reselect.
              </p>
            ) : null}
          </SurfaceCard>
        </div>
      </main>
      <PlayerAuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        title="Login to continue payment"
      />
    </>
  );
}
