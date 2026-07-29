import React from 'react';

/** Soft gradient wash behind every marketing page; muted in dark mode. */
export const AmbientBackground: React.FC = () => (
  <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100" />

    <div className="absolute inset-0 opacity-100 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen">
      <div className="absolute -top-40 left-[15%] w-[520px] h-[520px] rounded-full bg-amber-200/30 blur-[130px]" />
      <div className="absolute top-[15%] -right-24 w-[480px] h-[480px] rounded-full bg-sky-200/30 blur-[130px]" />
      <div className="absolute top-[48%] -left-24 w-[520px] h-[520px] rounded-full bg-indigo-200/25 blur-[140px]" />
      <div className="absolute top-[78%] right-[10%] w-[420px] h-[420px] rounded-full bg-emerald-200/25 blur-[130px]" />
    </div>

    <div
      className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '28px 28px',
        color: 'rgb(100 116 139 / 0.35)',
      }}
    />
  </div>
);
