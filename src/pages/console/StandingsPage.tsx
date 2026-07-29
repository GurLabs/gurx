import React from 'react';
import { ExternalLink, Trophy } from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import { useCompetition } from '../../components/console/CompetitionLayout';
import {EmptyState} from '../../components/ui/Feedback';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import { fetchLeaderboard } from '../../lib/api';
import { AWARD_TYPES } from '../../lib/brand';

export const StandingsPage: React.FC = () => {
  const { competition } = useCompetition();
  useSeo({ title: `${competition.title} — Sıralama`, noindex: true });

  const { data, loading } = useAsync(() => fetchLeaderboard(competition.id), [competition.id]);
  const rows = data ?? [];
  const awarded = rows.filter((r) => r.award_type);

  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Sıralama"
      description="Açık puanlama sonucunda oluşan genel sıralama ve ödül kazananlar."
      toc={[
        { id: 'oduller', label: 'Ödül alanlar' },
        { id: 'tablo', label: 'Genel sıralama' },
      ]}
    >
      {loading ? (
        <TableSkeleton rows={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="Sonuçlar henüz açıklanmadı"
          description="Oylama tamamlandığında sıralama ve ödüller burada yayınlanacak."
        />
      ) : (
        <>
          {awarded.length > 0 && (
            <ConsoleSection id="oduller" title="Ödül alanlar">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {awarded.map((row) => {
                  const meta = AWARD_TYPES[row.award_type!];
                  return (
                    <article
                      key={`${row.submission_id}-${row.award_type}`}
                      className="rounded-2xl border border-slate-200 bg-white p-5 text-center space-y-2"
                    >
                      <img src={meta.badge} alt="" className="h-16 w-auto object-contain mx-auto" />
                      <p className={`text-xs font-semibold ${meta.accent}`}>{meta.name}</p>
                      <p className="font-semibold text-slate-900 text-sm">{row.author_name}</p>
                      <p className="text-xs text-slate-500">{row.title}</p>
                    </article>
                  );
                })}
              </div>
            </ConsoleSection>
          )}

          <ConsoleSection id="tablo" title="Genel sıralama">
            <div className="rounded-2xl border border-slate-200 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <caption className="sr-only">Genel sıralama tablosu</caption>
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50">
                    <th scope="col" className="px-5 py-3 font-semibold">#</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Proje</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Katılımcı</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Tasarım</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">SEO</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Güvenlik</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Toplam</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Oy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.submission_id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-mono text-slate-500">{row.rank}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <a
                          href={row.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline inline-flex items-center gap-1.5"
                        >
                          {row.title}
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{row.author_name}</td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                        {row.design_score.toFixed(1)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                        {row.seo_score.toFixed(1)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                        {row.security_score.toFixed(1)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold tabular-nums text-slate-900">
                        {row.total_score.toFixed(1)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-500">{row.vote_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ConsoleSection>
        </>
      )}
    </ConsolePage>
  );
};
