import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, Search, Shield, UserRound, X } from 'lucide-react';
import { ConsoleNavSkeleton } from '../ui/Skeleton';
import type { NavSection } from './nav';
import { useAuth } from '../../context/AuthContext';
import { initialsOf } from '../../lib/format';

interface ConsoleShellProps {
  sections: NavSection[];
  /** Shown as the small label under the wordmark, e.g. "Katılımcı Paneli". */
  areaLabel: string;
  topLinks?: { label: string; to: string; external?: boolean }[];
  /** Nav entries still loading — the frame renders, the list shows placeholders. */
  navLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Documentation-style application shell: persistent left sidebar with grouped
 * navigation, slim top bar, and a wide content column. Used by both the
 * participant console and the admin/staff console.
 */
export const ConsoleShell: React.FC<ConsoleShellProps> = ({
  sections,
  areaLabel,
  topLinks = [],
  navLoading = false,
  children,
}) => {
  const { user, profile, isAdmin, isStaff, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => setOpen(false), [location.pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.label.toLocaleLowerCase('tr').includes(q) ||
            s.title.toLocaleLowerCase('tr').includes(q),
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, query]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <label htmlFor="console-search" className="sr-only">
          Menüde ara
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="console-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
          />
        </div>
      </div>

      <nav aria-label="Panel menüsü" className="flex-1 overflow-y-auto px-3 pb-8 space-y-6">
        {navLoading && <ConsoleNavSkeleton />}

        {filtered.map((section) => (
          <div key={section.title} className="space-y-1">
            <h2 className="px-3 pb-1 text-xs font-bold text-slate-900 tracking-tight">
              {section.title}
            </h2>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {item.icon ? <item.icon className="w-4 h-4 shrink-0 opacity-70" /> : null}
                <span className="min-w-0 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto shrink-0 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[0.6rem] font-bold px-2 py-0.5">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}

        {!navLoading && filtered.length === 0 && (
          <p className="px-3 text-sm text-slate-500">Sonuç bulunamadı.</p>
        )}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="h-full px-4 sm:px-6 flex items-center gap-4">
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 grid place-items-center text-slate-600 shrink-0"
            aria-expanded={open}
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* GurX first, Foundation second — same order everywhere. */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/gurx-logo.png"
              alt="GurX™"
              width={96}
              height={28}
              className="h-7 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <img
              src="/gf-l.png"
              alt="GurLabs Foundation™"
              width={28}
              height={28}
              className="h-7 w-auto object-contain"
            />
            <span className="hidden sm:inline text-xs text-slate-400 border-l border-slate-200 pl-2.5 ml-1">
              {areaLabel}
            </span>
          </Link>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            {topLinks.map((l) =>
              l.external ? (
                <a
                  key={l.to}
                  href={l.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                >
                  {l.label}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <Link key={l.to} to={l.to} className="hover:text-slate-900 transition-colors">
                  {l.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isStaff && (
              <Link
                to={isAdmin ? '/admin/genel' : '/staff/genel'}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                {isAdmin ? 'Admin' : 'Staff'}
              </Link>
            )}
            <Link
              to="/dashboard/profil"
              className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center text-[0.7rem] font-bold hover:bg-slate-800 transition-colors"
              title={profile?.full_name ?? user?.email ?? 'Profil'}
            >
              {initialsOf(profile?.full_name ?? user?.email)}
            </Link>
            <button
              onClick={handleSignOut}
              className="w-9 h-9 rounded-lg border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Çıkış yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-[268px] shrink-0 border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16">
          {sidebar}
        </aside>

        {/* Sidebar — mobile disclosure, pushes content instead of covering it */}
        {open && (
          <aside className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-white border-t border-slate-200 overflow-y-auto">
            {sidebar}
          </aside>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export const ConsoleUserChip: React.FC = () => {
  const { profile, user } = useAuth();
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
      <UserRound className="w-4 h-4" />
      {profile?.full_name ?? user?.email}
    </span>
  );
};
