import React, { Suspense } from 'react';
import { Link, Outlet, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState } from '../ui/Feedback';
import { ConsolePageSkeleton } from '../ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { fetchCompetitionBySlug } from '../../lib/api';
import type { Competition } from '../../types';

export interface CompetitionContext {
  competition: Competition;
  reloadCompetition: () => void;
}

export function useCompetition(): CompetitionContext {
  return useOutletContext<CompetitionContext>();
}

/** Loads the competition named in the URL once for every page beneath it. */
export const CompetitionLayout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, reload } = useAsync(
    () => (slug ? fetchCompetitionBySlug(slug) : Promise.resolve(null)),
    [slug],
  );

  if (loading) return <ConsolePageSkeleton label="Yarışma yükleniyor" />;

  if (!data) {
    return (
      <div className="px-5 sm:px-10 lg:px-14 py-14 max-w-2xl">
        <EmptyState
          title="Yarışma bulunamadı"
          description={`"${slug}" adresine karşılık gelen bir yarışma yok.`}
          action={
            <Link to="/dashboard/yarismalar" className="gx-btn-primary">
              Tüm yarışmalar
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <Suspense fallback={<ConsolePageSkeleton />}>
      <Outlet
        context={{ competition: data, reloadCompetition: reload } satisfies CompetitionContext}
      />
    </Suspense>
  );
};
