import React, { Suspense, useMemo } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { ConsoleShell } from './ConsoleShell';
import { adminNav, participantNav } from './nav';
import { ConsolePageSkeleton } from '../ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { fetchCompetitions } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Competition } from '../../types';

export interface ConsoleContext {
  competitions: Competition[];
  reloadCompetitions: () => void;
}

export function useConsole(): ConsoleContext {
  return useOutletContext<ConsoleContext>();
}

/** Reads the competition slug out of /…/yarismalar/<slug>/… */
function slugFromPath(pathname: string): string | null {
  const match = /\/yarismalar\/([^/]+)/.exec(pathname);
  return match ? match[1] : null;
}

/**
 * The shell renders straight away. Only the sidebar list waits for the
 * competition query, and only the content column waits for its lazy chunk —
 * so there is never a blank "loading" screen.
 */
export const ParticipantConsole: React.FC = () => {
  const { pathname } = useLocation();
  const { data, loading, reload } = useAsync(fetchCompetitions, []);
  const competitions = data ?? [];
  const activeSlug = slugFromPath(pathname);

  const sections = useMemo(
    () => (loading ? [] : participantNav(competitions, activeSlug)),
    [competitions, activeSlug, loading],
  );

  return (
    <ConsoleShell
      areaLabel="Katılımcı Paneli"
      sections={sections}
      navLoading={loading}
      topLinks={[
        { label: 'Tanıtım sitesi', to: '/' },
        { label: 'Yardım', to: '/dashboard/yardim' },
      ]}
    >
      <Suspense fallback={<ConsolePageSkeleton />}>
        <Outlet context={{ competitions, reloadCompetitions: reload } satisfies ConsoleContext} />
      </Suspense>
    </ConsoleShell>
  );
};

export const AdminConsole: React.FC = () => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const { data, loading, reload } = useAsync(fetchCompetitions, []);
  const competitions = data ?? [];
  const activeSlug = slugFromPath(pathname);

  const sections = useMemo(
    () => (loading ? [] : adminNav(competitions, activeSlug, isAdmin)),
    [competitions, activeSlug, isAdmin, loading],
  );

  return (
    <ConsoleShell
      areaLabel={isAdmin ? 'Admin Paneli' : 'Staff Paneli'}
      sections={sections}
      navLoading={loading}
      topLinks={[
        { label: 'Tanıtım sitesi', to: '/' },
        { label: 'Katılımcı paneli', to: '/dashboard' },
      ]}
    >
      <Suspense fallback={<ConsolePageSkeleton />}>
        <Outlet context={{ competitions, reloadCompetitions: reload } satisfies ConsoleContext} />
      </Suspense>
    </ConsoleShell>
  );
};
