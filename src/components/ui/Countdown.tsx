import React, { useEffect, useState } from 'react';
import { countdownTo, pad2 } from '../../lib/format';

interface CountdownProps {
  target?: string | null;
  label?: string;
  finishedLabel?: string;
  compact?: boolean;
}

const Cell: React.FC<{ value: string; label: string; compact?: boolean }> = ({
  value,
  label,
  compact,
}) => (
  <div
    className={`flex-1 rounded-2xl bg-white border border-slate-200 ${compact ? 'px-3 py-2' : 'px-4 py-3'} text-center`}
  >
    <div
      className={`gx-num text-slate-900 leading-none ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}
    >
      {value}
    </div>
    <div className="text-[0.65rem] uppercase tracking-[0.14em] text-slate-500 mt-1.5 font-semibold">
      {label}
    </div>
  </div>
);

export const Countdown: React.FC<CountdownProps> = ({
  target,
  label,
  finishedLabel = 'Süre doldu',
  compact = false,
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const c = countdownTo(target, now);

  if (!target) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-500">
        Tarih henüz açıklanmadı.
      </div>
    );
  }

  if (c.finished) {
    return (
      <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold text-center">
        {finishedLabel}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      ) : null}
      <div className="flex gap-2 sm:gap-3" role="timer" aria-live="off">
        <Cell value={pad2(c.days)} label="Gün" compact={compact} />
        <Cell value={pad2(c.hours)} label="Saat" compact={compact} />
        <Cell value={pad2(c.minutes)} label="Dakika" compact={compact} />
        <Cell value={pad2(c.seconds)} label="Saniye" compact={compact} />
      </div>
    </div>
  );
};
