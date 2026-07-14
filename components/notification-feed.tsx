import Link from 'next/link';
import { NotificationItem } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui';

function getMeta(notification: NotificationItem) {
  const text = `${notification.title} ${notification.body}`.toLowerCase();

  if (/approved|confirmed|verified|booked|live|ready/.test(text)) {
    return {
      icon: '✓',
      label: 'Confirmed',
      dot: 'bg-emerald-500',
      chip: 'bg-emerald-500/10 text-emerald-700 ring-emerald-200',
      panel: 'from-emerald-500/[0.12] via-white to-white',
    };
  }

  if (/pending|submitted|waiting|invited/.test(text)) {
    return {
      icon: '↗',
      label: 'In progress',
      dot: 'bg-amber-400',
      chip: 'bg-amber-400/15 text-amber-800 ring-amber-200',
      panel: 'from-amber-400/[0.14] via-white to-white',
    };
  }

  if (/rejected|suspended/.test(text)) {
    return {
      icon: '!',
      label: 'Attention',
      dot: 'bg-rose-500',
      chip: 'bg-rose-500/10 text-rose-700 ring-rose-200',
      panel: 'from-rose-500/[0.12] via-white to-white',
    };
  }

  return {
    icon: '•',
    label: 'Update',
    dot: 'bg-accent',
    chip: 'bg-accent/10 text-accentDeep ring-accent/20',
    panel: 'from-accent/10 via-white to-white',
  };
}

function getScopeLabel(notification: NotificationItem) {
  if (notification.organizationId && notification.userId) return 'Personal · Team';
  if (notification.organizationId) return 'Organization';
  if (notification.userId) return 'Personal';
  return 'Platform';
}

export function NotificationFeed({
  notifications,
  emptyTitle,
  emptyBody,
  className,
}: {
  notifications: NotificationItem[];
  emptyTitle: string;
  emptyBody: string;
  className?: string;
}) {
  if (!notifications.length) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {notifications.map((notification) => {
        const meta = getMeta(notification);
        const content = (
          <div
            className={cn(
              'group relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-br p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card',
              meta.panel,
              notification.read ? 'opacity-80' : 'ring-1 ring-accent/10',
            )}
          >
            <div className="absolute inset-y-5 left-5 w-px bg-gradient-to-b from-transparent via-line to-transparent" />
            <div className="relative flex gap-4 pl-5">
              <div className="relative pt-0.5">
                <span
                  className={cn(
                    'absolute left-[-23px] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-white',
                    meta.dot,
                  )}
                />
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/80 text-lg font-semibold text-ink shadow-soft">
                  {meta.icon}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset',
                      meta.chip,
                    )}
                  >
                    {meta.label}
                  </span>
                  <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                    {getScopeLabel(notification)}
                  </span>
                  {!notification.read ? (
                    <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      Unread
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 space-y-1.5">
                  <h3 className="text-base font-semibold text-ink sm:text-lg">
                    {notification.title}
                  </h3>
                  <p className="max-w-2xl text-sm leading-6 text-muted">{notification.body}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mutedSoft">
                    {formatDate(notification.createdAt)}
                  </p>
                  {notification.link ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition group-hover:gap-2.5">
                      Open update <span aria-hidden>→</span>
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-muted">
                      Saved to your activity feed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

        return notification.link ? (
          <Link key={notification.id} href={notification.link} className="block">
            {content}
          </Link>
        ) : (
          <div key={notification.id}>{content}</div>
        );
      })}
    </div>
  );
}
