import React from 'react';
import { List } from 'lucide-react';

export interface TocEntry {
  id: string;
  label: string;
}

interface ConsolePageProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Anchor list rendered in the right rail, like a docs "On this page". */
  toc?: TocEntry[];
  children: React.ReactNode;
}

/** Content column + optional right-hand anchor rail. */
export const ConsolePage: React.FC<ConsolePageProps> = ({
  eyebrow,
  title,
  description,
  actions,
  toc,
  children,
}) => (
  <div className="flex">
    <div className="flex-1 min-w-0 px-5 sm:px-10 lg:px-14 py-10 lg:py-14 max-w-4xl">
      <header className="space-y-3 mb-9">
        {eyebrow ? (
          <p className="text-sm font-semibold text-amber-600 tracking-tight">{eyebrow}</p>
        ) : null}
        <h1 className="text-4xl sm:text-[2.75rem] font-serif text-slate-900 leading-[1.1]">
          {title}
        </h1>
        {description ? (
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">{description}</p>
        ) : null}
        {actions ? <div className="flex flex-wrap gap-2.5 pt-2">{actions}</div> : null}
      </header>

      <div className="space-y-10">{children}</div>
    </div>

    {toc && toc.length > 0 ? (
      <aside className="hidden xl:block w-64 shrink-0 py-14 pr-10">
        <nav aria-label="Bu sayfada" className="sticky top-28 space-y-2">
          <p className="flex items-center gap-2 text-sm text-slate-500 pb-1">
            <List className="w-4 h-4" />
            Bu sayfada
          </p>
          {toc.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className="block border-l-2 border-slate-200 pl-3 py-1 text-sm text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors"
            >
              {entry.label}
            </a>
          ))}
        </nav>
      </aside>
    ) : null}
  </div>
);

/** Section heading that doubles as a TOC anchor target. */
export const ConsoleSection: React.FC<{
  id?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, title, description, actions, children }) => (
  <section id={id} className="scroll-mt-24 space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-600 mt-1">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
    {children}
  </section>
);

export const ConsoleCard: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}>{children}</div>
);

export const ConsoleStat: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
}> = ({ label, value, hint, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      {icon}
      {label}
    </div>
    <p className="text-2xl gx-num text-slate-900 mt-1.5">{value}</p>
    {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
  </div>
);
