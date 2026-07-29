import React from 'react';

/** Small presentational helpers shared by the admin/staff panels. */

export const AdminCard: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, actions, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-600 mt-1">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
    {children}
  </section>
);

export const StatTile: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    <p className="text-2xl gx-num text-slate-900 mt-1">{value}</p>
    {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
  </div>
);
