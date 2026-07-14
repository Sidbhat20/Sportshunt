'use client';

import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '@/components/motion/primitives';

export function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(...values, 1);
  const points = values
    .map(
      (value, index) =>
        `${(index / Math.max(values.length - 1, 1)) * 100},${100 - (value / max) * 80}`,
    )
    .join(' ');
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-44 w-full overflow-visible"
      >
        <defs>
          <linearGradient id="line-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polygon
          fill="url(#line-fill)"
          points={areaPoints}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        <motion.polyline
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: EASE_OUT }}
        />
        {values.map((value, index) => (
          <motion.circle
            key={`${value}-${index}`}
            cx={(index / Math.max(values.length - 1, 1)) * 100}
            cy={100 - (value / max) * 80}
            r="2.4"
            fill="#16a34a"
            stroke="white"
            strokeWidth="1.2"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.5 + index * 0.06 }}
          />
        ))}
      </svg>
      <div className="mt-3 flex justify-between gap-2 text-xs text-muted">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(...values, 1);
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex h-44 items-end gap-3">
        {values.map((value, index) => {
          const height = `${Math.max((value / max) * 100, 8)}%`;
          return (
            <div
              key={`${labels[index]}-${value}-${index}`}
              className="flex flex-1 flex-col items-center gap-3"
            >
              <motion.div
                className="w-full rounded-t-xl bg-gradient-to-b from-accent to-accentHover"
                style={{ height }}
                initial={reduce ? false : { height: 0 }}
                whileInView={reduce ? undefined : { height }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: index * 0.06 }}
              />
              <span className="truncate text-xs text-muted">{labels[index]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PieChart({ values, labels }: { values: number[]; labels: string[] }) {
  const reduce = useReducedMotion();
  const total = values.reduce((sum, value) => sum + value, 0);
  const palette = ['#16a34a', '#15803d', '#22c55e', '#84cc16', '#65a30d', '#0f766e'];

  if (!total) {
    return (
      <div className="rounded-2xl border border-line bg-white p-4">
        <div className="grid h-56 place-items-center rounded-2xl bg-canvas text-sm text-muted">
          No revenue data yet.
        </div>
      </div>
    );
  }

  let cumulative = 0;
  const segments = values.map((value, index) => {
    const start = cumulative / total;
    cumulative += value;
    const end = cumulative / total;
    const largeArcFlag = end - start > 0.5 ? 1 : 0;
    const startAngle = start * Math.PI * 2 - Math.PI / 2;
    const endAngle = end * Math.PI * 2 - Math.PI / 2;
    const x1 = 50 + Math.cos(startAngle) * 36;
    const y1 = 50 + Math.sin(startAngle) * 36;
    const x2 = 50 + Math.cos(endAngle) * 36;
    const y2 = 50 + Math.sin(endAngle) * 36;

    return {
      color: palette[index % palette.length],
      label: labels[index],
      value,
      path: `M 50 50 L ${x1} ${y1} A 36 36 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      share: (value / total) * 100,
    };
  });

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="mx-auto h-56 w-56">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {segments.map((segment, index) => (
              <motion.path
                key={`${segment.label}-${segment.value}`}
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="1.5"
                style={{ transformOrigin: '50px 50px' }}
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: index * 0.08 }}
              />
            ))}
            <circle cx="50" cy="50" r="18" fill="white" />
            <text
              x="50"
              y="47"
              textAnchor="middle"
              className="fill-[#111827] text-[6px] font-semibold"
            >
              Revenue
            </text>
            <text x="50" y="55" textAnchor="middle" className="fill-[#16a34a] text-[6px] font-bold">
              {Math.round(total)}
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
                <span className="font-medium text-ink">{segment.label}</span>
              </div>
              <span className="text-muted">{segment.share.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
