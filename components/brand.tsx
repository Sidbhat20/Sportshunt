import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const sizes = {
  sm: {
    shell: 'gap-2.5',
    logoWrap: 'h-10 w-10 rounded-xl',
    text: 'text-xl',
    sub: 'text-[10px]',
  },
  md: {
    shell: 'gap-3',
    logoWrap: 'h-12 w-12 rounded-2xl',
    text: 'text-2xl',
    sub: 'text-[11px]',
  },
  lg: {
    shell: 'gap-3',
    logoWrap: 'h-14 w-14 rounded-2xl',
    text: 'text-3xl',
    sub: 'text-xs',
  },
} as const;

export function BrandLockup({
  href = '/',
  subtitle,
  className,
  size = 'md',
  accent = 'green',
}: {
  href?: string;
  subtitle?: string;
  className?: string;
  size?: keyof typeof sizes;
  accent?: 'green' | 'lime' | 'gold';
}) {
  // Both 'gold' and 'lime' map to the energetic lime variant on the white theme.
  const tone =
    accent === 'green'
      ? {
          word: 'text-accent',
          sub: 'text-accent/80',
        }
      : {
          word: 'text-limeDeep',
          sub: 'text-limeDeep/80',
        };

  const sizeClasses = sizes[size];

  return (
    <Link
      href={href}
      className={cn('group inline-flex items-center', sizeClasses.shell, className)}
    >
      <span
        className={cn(
          'relative grid place-items-center transition-all duration-300 group-hover:-translate-y-0.5',
          sizeClasses.logoWrap,
        )}
      >
        <Image
          src="/sh-logo.png"
          alt="Sportshunt logo"
          width={56}
          height={56}
          priority
          className="h-full w-full object-contain drop-shadow-[0_4px_14px_rgba(22,163,74,0.22)]"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('display font-display tracking-athletic text-ink', sizeClasses.text)}>
          Sports<span className={tone.word}>hunt</span>
        </span>
        {subtitle ? (
          <span
            className={cn(
              'mt-1.5 font-bold uppercase tracking-[0.22em]',
              sizeClasses.sub,
              tone.sub,
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
