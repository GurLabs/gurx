import React from 'react';
import { ExternalLink, Medal, Trophy } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Section, SectionHeading } from '../components/ui/Section';
import {EmptyState} from '../components/ui/Feedback';
import { CardGridSkeleton } from '../components/ui/Skeleton';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import { fetchLeaderboard, fetchYouthCompetition } from '../lib/api';
import { YOUTH_COMPETITION } from '../data/seed';
import { AWARD_TYPES } from '../lib/brand';

const RANK_STYLE = [
  'bg-gradient-to-b from-amber-50 to-white border-amber-200',
  'bg-gradient-to-b from-slate-50 to-white border-slate-200',
  'bg-gradient-to-b from-orange-50 to-white border-orange-200',
];

export const LeaderboardPage: React.FC = () => {
  useSeo({
    title: 'Sıralama & Ödüller — GurX Youth Design 2026',
    description:
      'GurX Youth Design 2026 açık puanlama sonuçları, sıralama ve ödül kazananlar. Best Design, Best SEO, Best Security ve Grand Winner.',
    path: '/siralama',
  });

  const { data: competitionData } = useAsync(fetchYouthCompetition, []);
  const competition = competitionData ?? YOUTH_COMPETITION;

  const { data: rows, loading } = useAsync(
    () => fetchLeaderboard(competition.id),
    [competition.id],
  );

  const podium = (rows ?? []).slice(0, 3);
  const rest = (rows ?? []).slice(3);
  const awarded = (rows ?? []).filter((r) => r.award_type);

  return (
    <>
      <PageHero
        eyebrow={
          <>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Sonuçlar
          </>
        }
        title="Sıralama & ödüller"
        description="Puanlar açık puanlama sonucunda oluşur. Tasarım, SEO ve güvenlik başlıklarının ortalamaları toplanarak genel sıralama belirlenir."
      />

      <Section>
        {loading ? (
          <CardGridSkeleton count={3} media cols="md:grid-cols-3" />
        ) : (rows ?? []).length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-6 h-6" />}
            title="Sonuçlar henüz açıklanmadı"
            description="Oylama tamamlandığında sıralama ve ödüller bu sayfada yayınlanacak."
          />
        ) : (
          <div className="space-y-12">
            {/* Podium */}
            <div className="grid gap-5 md:grid-cols-3">
              {podium.map((row, i) => (
                <article
                  key={row.submission_id}
                  className={`rounded-[28px] border shadow-sm overflow-hidden flex flex-col ${
                    RANK_STYLE[i] ?? RANK_STYLE[1]
                  }`}
                >
                  <div className="relative aspect-video bg-slate-100">
                    <img
                      src={row.hero_screenshot_url}
                      alt={`${row.title} hero görseli`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 w-10 h-10 rounded-full bg-slate-900 text-white grid place-items-center gx-num text-lg">
                      {row.rank}
                    </span>
                    {row.award_type && (
                      <img
                        src={AWARD_TYPES[row.award_type].badge}
                        alt={AWARD_TYPES[row.award_type].name}
                        className="absolute -bottom-5 right-4 h-16 w-auto object-contain drop-shadow"
                      />
                    )}
                  </div>

                  <div className="p-6 pt-7 space-y-3 flex-1 flex flex-col">
                    <div>
                      <h2 className="font-semibold text-slate-900">{row.title}</h2>
                      <p className="text-sm text-slate-600">{row.author_name}</p>
                    </div>

                    <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                      {[
                        { label: 'Tasarım', value: row.design_score },
                        { label: 'SEO', value: row.seo_score },
                        { label: 'Güvenlik', value: row.security_score },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl bg-white/70 border border-slate-200 py-2">
                          <dt className="text-slate-500">{s.label}</dt>
                          <dd className="font-mono font-bold text-slate-900 tabular-nums">
                            {s.value.toFixed(1)}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <p className="text-sm text-slate-600">
                      Toplam:{' '}
                      <strong className="font-mono text-slate-900">
                        {row.total_score.toFixed(1)}
                      </strong>{' '}
                      · {row.vote_count} oy
                    </p>

                    <a
                      href={row.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gx-btn-ghost w-full mt-auto"
                    >
                      Projeyi aç
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Award winners */}
            {awarded.length > 0 && (
              <div className="space-y-6">
                <SectionHeading
                  eyebrow={
                    <>
                      <Medal className="w-3.5 h-3.5 text-amber-500" />
                      Ödül alanlar
                    </>
                  }
                  title="Kategori ödülleri"
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {awarded.map((row) => {
                    const meta = AWARD_TYPES[row.award_type!];
                    return (
                      <article key={`${row.submission_id}-${row.award_type}`} className="gx-card p-6 text-center space-y-3">
                        <img
                          src={meta.badge}
                          alt={meta.name}
                          className="h-20 w-auto object-contain mx-auto"
                        />
                        <div>
                          <p className={`text-sm font-semibold ${meta.accent}`}>{meta.name}</p>
                          <p className="font-semibold text-slate-900 mt-1">{row.author_name}</p>
                          <p className="text-xs text-slate-500">{row.title}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full table */}
            {rest.length > 0 && (
              <div className="space-y-6">
                <SectionHeading title="Genel sıralama" />
                <div className="gx-card overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <caption className="sr-only">Genel sıralama tablosu</caption>
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <th scope="col" className="px-6 py-4 font-semibold">#</th>
                        <th scope="col" className="px-6 py-4 font-semibold">Proje</th>
                        <th scope="col" className="px-6 py-4 font-semibold">Katılımcı</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-right">Tasarım</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-right">SEO</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-right">Güvenlik</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rest.map((row) => (
                        <tr key={row.submission_id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4 font-mono text-slate-500">{row.rank}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <a
                              href={row.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {row.title}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{row.author_name}</td>
                          <td className="px-6 py-4 text-right font-mono tabular-nums">
                            {row.design_score.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono tabular-nums">
                            {row.seo_score.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono tabular-nums">
                            {row.security_score.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold tabular-nums text-slate-900">
                            {row.total_score.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
};
