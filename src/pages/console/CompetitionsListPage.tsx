import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, Trophy, Users } from 'lucide-react';
import { ConsolePage } from '../../components/console/ConsolePage';
import { useConsole } from '../../components/console/ConsoleLayouts';
import { EmptyState } from '../../components/ui/Feedback';
import { useSeo } from '../../hooks/useSeo';
import { formatDate } from '../../lib/format';
import type { CompetitionStatus } from '../../types';

const STATUS_LABEL: Record<CompetitionStatus, { label: string; tone: string }> = {
  upcoming: { label: 'Yakında', tone: 'bg-slate-100 text-slate-600 border-slate-200' },
  registration_open: {
    label: 'Başvurular açık',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  topic_revealed: { label: 'Konu açıklandı', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { label: 'Üretim sürüyor', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  voting: { label: 'Oylama', tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  completed: { label: 'Tamamlandı', tone: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const CompetitionsListPage: React.FC = () => {
  const { competitions } = useConsole();
  useSeo({ title: 'Yarışmalar — Katılımcı Paneli', path: '/dashboard/yarismalar', noindex: true });

  return (
    <ConsolePage
      eyebrow="Yarışmalar"
      title="Tüm yarışmalar"
      description="Bir yarışma seçtiğinizde sol menüde o yarışmaya ait genel bakış, duyurular, başvuru, teslim ve oylama bölümleri açılır."
    >
      {competitions.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="Henüz yarışma yok"
          description="Yeni yarışma açıldığında burada listelenecek."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {competitions.map((c) => {
            const status = STATUS_LABEL[c.status];
            return (
              <Link
                key={c.id}
                to={`/dashboard/yarismalar/${c.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {c.cover_image && (
                  <div className="relative aspect-[16/7] bg-slate-100">
                    <img
                      src={c.cover_image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${status.tone}`}
                  >
                    {status.label}
                  </span>
                  <div>
                    <h2 className="font-semibold text-slate-900 group-hover:text-slate-950">
                      {c.title}
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5">{c.subtitle ?? c.category}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {formatDate(c.registration_closes_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {c.min_age}–{c.max_age} yaş
                    </div>
                  </dl>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    Panele git
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </ConsolePage>
  );
};
