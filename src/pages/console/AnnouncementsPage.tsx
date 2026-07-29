import React from 'react';
import { Megaphone, Pin } from 'lucide-react';
import { ConsolePage } from '../../components/console/ConsolePage';
import { useCompetition } from '../../components/console/CompetitionLayout';
import {EmptyState} from '../../components/ui/Feedback';
import { CardGridSkeleton } from '../../components/ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import { fetchAnnouncements } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

export const AnnouncementsPage: React.FC = () => {
  const { competition } = useCompetition();
  useSeo({ title: `${competition.title} — Duyurular`, noindex: true });

  const { data, loading } = useAsync(
    () => fetchAnnouncements(competition.id, 'participants'),
    [competition.id],
  );

  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Duyurular"
      description="Yarışma konusu açıklandığında, teslim penceresi değiştiğinde ve sonuçlar yayınlandığında buradan bilgilendirilirsiniz."
    >
      {loading ? (
        <CardGridSkeleton count={3} cols="grid-cols-1" />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-6 h-6" />}
          title="Henüz duyuru yok"
          description="Yeni bir duyuru yayınlandığında burada ve e-postanızda görünecek."
        />
      ) : (
        <ol className="space-y-4">
          {(data ?? []).map((a) => (
            <li
              key={a.id}
              className={`rounded-2xl border p-6 ${
                a.is_pinned ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  {a.is_pinned ? (
                    <Pin className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Megaphone className="w-4 h-4 text-slate-400" />
                  )}
                  {a.title}
                </h2>
                <span className="text-xs text-slate-500">{formatDateTime(a.published_at)}</span>
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {a.body}
              </p>
            </li>
          ))}
        </ol>
      )}
    </ConsolePage>
  );
};
