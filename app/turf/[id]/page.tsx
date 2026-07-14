'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { PublicHeader } from '@/components/layouts/public-header';
import { PlayerAuthModal } from '@/components/player-auth-modal';
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from '@/components/ui';
import { RevealImage, Stagger, StaggerItem } from '@/components/motion/primitives';
import { getTurfGallery, getTurfMeta, groupSlotsByDay } from '@/lib/turf-booking';
import { formatMoney } from '@/lib/utils';

export default function TurfDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, session } = useApp();

  const turf = state.turfs.find((item) => item.id === params.id && item.approved) ?? null;
  const gallery = useMemo(() => (turf ? getTurfGallery(turf) : []), [turf]);
  const meta = useMemo(() => (turf ? getTurfMeta(turf) : null), [turf]);
  const groups = useMemo(() => (turf ? groupSlotsByDay(turf.slots) : []), [turf]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [openAuth, setOpenAuth] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!groups.length) return;
    if (!groups.some((group) => group.key === selectedDateKey)) {
      setSelectedDateKey(groups[0].key);
      setSelectedSlotIds([]);
    }
  }, [groups, selectedDateKey]);

  useEffect(() => {
    if (!session || !pendingCheckout || !turf || !selectedSlotIds.length) return;
    router.push(
      `/turf/${turf.id}/payment?slots=${selectedSlotIds.join(',')}&date=${selectedDateKey}`,
    );
  }, [pendingCheckout, router, selectedDateKey, selectedSlotIds, session, turf]);

  const activeDate = groups.find((group) => group.key === selectedDateKey) ?? groups[0] ?? null;
  const selectedSlots = turf?.slots.filter((slot) => selectedSlotIds.includes(slot.id)) ?? [];
  const total = turf ? turf.price * selectedSlots.length : 0;

  function toggleSlot(slotId: string, available: boolean) {
    if (!available) return;
    setSelectedSlotIds((current) =>
      current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId],
    );
  }

  function handleBookNow() {
    if (!turf) return;
    if (!selectedSlotIds.length) {
      setMessage('Select at least one available slot to continue.');
      return;
    }
    setMessage('');
    if (!session) {
      setPendingCheckout(true);
      setOpenAuth(true);
      return;
    }
    router.push(
      `/turf/${turf.id}/payment?slots=${selectedSlotIds.join(',')}&date=${selectedDateKey}`,
    );
  }

  if (!turf || !meta) {
    return (
      <>
        <PublicHeader />
        <main className="page-shell">
          <EmptyState
            title="Turf not found"
            body="This venue is unavailable or was removed."
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
      <PublicHeader />
      <main className="page-shell space-y-6">
        <PageHeader
          title={turf.name}
          copy={meta.description}
          action={
            <Link href="/turfs" className="secondary-btn">
              Back to listing
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <SurfaceCard className="space-y-4 overflow-hidden p-0">
              <RevealImage
                src={gallery[selectedImage]}
                alt={`${turf.name} ${turf.sport} venue in ${turf.location}`}
                className="h-72 w-full sm:h-96"
                imgClassName="h-full w-full object-cover saturate-[1.08] contrast-[1.04]"
                vtName="turf-hero"
              />
              <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
                {gallery.slice(0, 3).map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Show ${turf.name} venue view ${index + 1}`}
                    className={`group overflow-hidden rounded-2xl border-2 transition ${selectedImage === index ? 'border-accent shadow-ring' : 'border-line hover:border-accent/50'}`}
                  >
                    <img
                      src={image}
                      alt={`${turf.name} venue view ${index + 1}`}
                      className="h-24 w-full object-cover saturate-[1.08] contrast-[1.04] transition-transform duration-500 group-hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            </SurfaceCard>

            <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StaggerItem className="h-full">
                <SurfaceCard className="h-full">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Location
                  </p>
                  <p className="mt-2 font-semibold text-ink">{meta.fullLocation}</p>
                </SurfaceCard>
              </StaggerItem>
              <StaggerItem className="h-full">
                <SurfaceCard className="h-full">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Price / hour
                  </p>
                  <p className="mt-2 font-semibold text-ink">{formatMoney(turf.price)}</p>
                </SurfaceCard>
              </StaggerItem>
              <StaggerItem className="h-full">
                <SurfaceCard className="h-full">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Sports
                  </p>
                  <p className="mt-2 font-semibold text-ink">{meta.sportsAvailable.join(', ')}</p>
                </SurfaceCard>
              </StaggerItem>
              <StaggerItem className="h-full">
                <SurfaceCard className="h-full">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Capacity
                  </p>
                  <p className="mt-2 font-semibold text-ink">{meta.countLabel}</p>
                </SurfaceCard>
              </StaggerItem>
            </Stagger>

            <SurfaceCard>
              <h2 className="text-lg font-semibold text-ink">Amenities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {meta.amenities.map((amenity) => (
                  <StatusPill key={amenity} tone="success">
                    {amenity}
                  </StatusPill>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="space-y-6">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                  Slot selection
                </p>
                <h2 className="mt-1 text-xl font-semibold text-ink">Choose date & time</h2>
                <p className="mt-1 text-sm text-muted">
                  Available slots are selectable. Booked slots stay disabled.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <button
                    key={group.key}
                    onClick={() => {
                      setSelectedDateKey(group.key);
                      setSelectedSlotIds([]);
                    }}
                    className={selectedDateKey === group.key ? 'primary-btn' : 'secondary-btn'}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeDate?.slots.map((slot) => {
                  const selected = selectedSlotIds.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      onClick={() => toggleSlot(slot.id, slot.available)}
                      disabled={!slot.available}
                      className={`rounded-2xl border p-4 text-left transition ${
                        !slot.available
                          ? 'cursor-not-allowed border-line bg-canvas text-muted opacity-70'
                          : selected
                            ? 'border-accent bg-accentSoft text-accentDeep'
                            : 'border-line bg-white hover:border-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{slot.timeLabel}</p>
                          <p className="mt-1 text-xs">{slot.available ? 'Available' : 'Booked'}</p>
                        </div>
                        <StatusPill
                          tone={slot.available ? (selected ? 'accent' : 'success') : 'default'}
                        >
                          {slot.available ? (selected ? 'Selected' : 'Open') : 'Booked'}
                        </StatusPill>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">Booking summary</h2>
              <div className="rounded-2xl bg-canvas p-4 text-sm text-muted">
                <p className="font-semibold text-ink">{turf.name}</p>
                <p className="mt-1">{meta.fullLocation}</p>
              </div>

              <div className="space-y-2 rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Selected slots</span>
                  <span className="font-semibold text-ink">{selectedSlots.length}</span>
                </div>
                {selectedSlots.length ? (
                  selectedSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{slot.label}</span>
                      <span className="font-semibold text-ink">{formatMoney(turf.price)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No slots selected yet.</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-canvas p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Total price
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-ink">{formatMoney(total || 0)}</p>
                </div>
                <button onClick={handleBookNow} className="primary-btn">
                  Book Now
                </button>
              </div>
            </SurfaceCard>

            {message ? (
              <p className="rounded-xl bg-accentSoft px-3 py-2 text-sm font-medium text-accentDeep">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </main>
      <PlayerAuthModal
        open={openAuth}
        onClose={() => {
          setOpenAuth(false);
          setPendingCheckout(false);
        }}
        title="Login to continue booking"
      />
    </>
  );
}
