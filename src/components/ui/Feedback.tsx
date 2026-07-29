import React from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<Tone, { wrap: string; icon: React.ReactNode }> = {
  info: {
    wrap: 'bg-sky-50 border-sky-200 text-sky-900',
    icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
  },
  success: {
    wrap: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />,
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
  },
  error: {
    wrap: 'bg-rose-50 border-rose-200 text-rose-900',
    icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
  },
};

export const Alert: React.FC<{ tone?: Tone; children: React.ReactNode; className?: string }> = ({
  tone = 'info',
  children,
  className = '',
}) => {
  const t = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs sm:text-sm leading-relaxed ${t.wrap} ${className}`}
    >
      {t.icon}
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export const Spinner: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <Loader2 className={`animate-spin text-slate-400 ${className}`} aria-label="Yükleniyor" />
);

export const PageLoading: React.FC<{ label?: string }> = ({ label = 'Yükleniyor…' }) => (
  <div className="min-h-[50vh] grid place-items-center">
    <div className="flex items-center gap-3 text-slate-500 text-sm">
      <Spinner />
      {label}
    </div>
  </div>
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="gx-card p-10 text-center space-y-3">
    {icon ? <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center text-slate-500">{icon}</div> : null}
    <h3 className="font-semibold text-slate-900">{title}</h3>
    {description ? <p className="text-sm text-slate-600 max-w-md mx-auto">{description}</p> : null}
    {action ? <div className="pt-2">{action}</div> : null}
  </div>
);
