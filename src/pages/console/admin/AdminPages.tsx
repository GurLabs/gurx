import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarClock,
  FileCheck2,
  Megaphone,
  Settings2,
  Shield,
  Trophy,
  Upload,
  Users,
} from 'lucide-react';
import { ConsolePage, ConsoleSection, ConsoleStat } from '../../../components/console/ConsolePage';
import { useConsole } from '../../../components/console/ConsoleLayouts';
import { useCompetition } from '../../../components/console/CompetitionLayout';
import {
  AnnouncementsPanel,
  ApplicationsPanel,
  CertificatesPanel,
  CompetitionPanel,
  SubmissionsPanel,
  UsersPanel,
} from '../../../components/admin/panels';
import { Alert, EmptyState } from '../../../components/ui/Feedback';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../../context/AuthContext';
import { useAsync } from '../../../hooks/useAsync';
import { useSeo } from '../../../hooks/useSeo';
import { adminListApplications, adminListProfiles, adminListSubmissions } from '../../../lib/admin';
import { formatDateTime } from '../../../lib/format';
import { ADMIN_EMAIL } from '../../../lib/brand';
import { STAFF_ROLE_LABELS, type Application, type Profile, type StaffRole, type Submission } from '../../../types';

function useRoot() {
  const { isAdmin } = useAuth();
  return isAdmin ? '/admin' : '/staff';
}

/* ------------------------------------------------------------------ */

export const AdminOverviewPage: React.FC = () => {
  const { competitions } = useConsole();
  const { isAdmin, configured } = useAuth();
  const root = useRoot();
  useSeo({ title: 'Genel Bakış — Yönetim', noindex: true });

  const active = competitions[0];

  const { data: applications } = useAsync<Application[]>(
    () => (active && configured ? adminListApplications(active.id) : Promise.resolve([])),
    [active?.id, configured],
  );
  const { data: submissions } = useAsync<Submission[]>(
    () => (active && configured ? adminListSubmissions(active.id) : Promise.resolve([])),
    [active?.id, configured],
  );

  const apps = applications ?? [];
  const subs = submissions ?? [];

  return (
    <ConsolePage
      eyebrow={isAdmin ? 'Admin Paneli' : 'Staff Paneli'}
      title="Genel Bakış"
      description="Aktif yarışmanın durumu, bekleyen işler ve hızlı bağlantılar."
      toc={[
        { id: 'ozet', label: 'Özet' },
        { id: 'takvim', label: 'Takvim' },
        { id: 'kisayollar', label: 'Kısayollar' },
      ]}
    >
      {!configured && (
        <Alert tone="warning">
          Supabase bağlantısı olmadan yönetim işlemleri çalışmaz. Anahtarları tanımladıktan sonra bu
          panel canlı verilerle çalışır.
        </Alert>
      )}

      {!active ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="Henüz yarışma yok"
          description="Yeni bir yarışma oluşturulduğunda burada özet göreceksiniz."
        />
      ) : (
        <>
          <ConsoleSection id="ozet" title={active.title}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ConsoleStat
                label="Toplam başvuru"
                icon={<FileCheck2 className="w-3.5 h-3.5" />}
                value={apps.length}
              />
              <ConsoleStat
                label="Bekleyen"
                icon={<FileCheck2 className="w-3.5 h-3.5" />}
                value={apps.filter((a) => a.status === 'pending').length}
                hint="İnceleme gerekiyor"
              />
              <ConsoleStat
                label="Onaylı"
                icon={<Users className="w-3.5 h-3.5" />}
                value={apps.filter((a) => a.status === 'approved').length}
              />
              <ConsoleStat
                label="Teslim"
                icon={<Upload className="w-3.5 h-3.5" />}
                value={subs.length}
                hint={`${subs.filter((s) => s.is_published).length} yayında`}
              />
            </div>
          </ConsoleSection>

          <ConsoleSection id="takvim" title="Takvim">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['Başvuru kapanış', active.registration_closes_at],
                ['Konu açıklanma', active.topic_reveal_at],
                ['Teslim son tarihi', active.submission_deadline_at],
                ['Oylama açılış', active.voting_opens_at],
                ['Oylama kapanış', active.voting_closes_at],
                ['Sonuç açıklanma', active.results_at],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
                >
                  <dt className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 mt-1">
                    {formatDateTime(value as string | null)}
                  </dd>
                </div>
              ))}
            </dl>
          </ConsoleSection>

          <ConsoleSection id="kisayollar" title="Kısayollar">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  to: `${root}/yarismalar/${active.slug}/basvurular`,
                  label: 'Başvuruları incele',
                  icon: FileCheck2,
                },
                {
                  to: `${root}/yarismalar/${active.slug}/teslimler`,
                  label: 'Teslimleri yönet',
                  icon: Upload,
                },
                {
                  to: `${root}/yarismalar/${active.slug}/duyurular`,
                  label: 'Duyuru yayınla',
                  icon: Megaphone,
                },
                ...(isAdmin
                  ? [
                      {
                        to: `${root}/yarismalar/${active.slug}/sertifikalar`,
                        label: 'Sertifika üret',
                        icon: Award,
                      },
                      {
                        to: `${root}/yarismalar/${active.slug}/ayarlar`,
                        label: 'Yarışma ayarları',
                        icon: Settings2,
                      },
                      { to: `${root}/kullanicilar`, label: 'Kullanıcılar & roller', icon: Users },
                    ]
                  : []),
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-3 hover:border-slate-300 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-slate-100 grid place-items-center text-slate-600 shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-semibold text-sm text-slate-900 flex-1">{label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </ConsoleSection>
        </>
      )}
    </ConsolePage>
  );
};

/* ------------------------------------------------------------------ */

export const AdminCompetitionsListPage: React.FC = () => {
  const { competitions } = useConsole();
  const root = useRoot();
  useSeo({ title: 'Yarışmalar — Yönetim', noindex: true });

  return (
    <ConsolePage
      eyebrow="Yönetim"
      title="Yarışmalar"
      description="Bir yarışma seçtiğinizde sol menüde o yarışmanın başvuruları, teslimleri, duyuruları ve ayarları açılır."
    >
      <div className="space-y-3">
        {competitions.map((c) => (
          <Link
            key={c.id}
            to={`${root}/yarismalar/${c.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{c.title}</p>
              <p className="text-sm text-slate-600">{c.subtitle ?? c.category}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{c.slug}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </ConsolePage>
  );
};

/* ------------------------------------------------------------------ */

export const AdminCompetitionOverviewPage: React.FC = () => {
  const { competition } = useCompetition();
  const { isAdmin } = useAuth();
  const root = useRoot();
  useSeo({ title: `${competition.title} — Yönetim`, noindex: true });

  return (
    <ConsolePage
      eyebrow="Yönetim"
      title={competition.title}
      description={competition.subtitle ?? competition.category}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { to: `${root}/yarismalar/${competition.slug}/basvurular`, label: 'Başvurular', icon: FileCheck2 },
          { to: `${root}/yarismalar/${competition.slug}/teslimler`, label: 'Teslimler', icon: Upload },
          { to: `${root}/yarismalar/${competition.slug}/duyurular`, label: 'Duyurular', icon: Megaphone },
          { to: `${root}/yarismalar/${competition.slug}/siralama`, label: 'Sıralama', icon: Trophy },
          ...(isAdmin
            ? [
                {
                  to: `${root}/yarismalar/${competition.slug}/sertifikalar`,
                  label: 'Sertifikalar',
                  icon: Award,
                },
                {
                  to: `${root}/yarismalar/${competition.slug}/ayarlar`,
                  label: 'Yarışma Ayarları',
                  icon: Settings2,
                },
              ]
            : []),
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-3 hover:border-slate-300 transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-slate-100 grid place-items-center text-slate-600 shrink-0">
              <Icon className="w-4 h-4" />
            </span>
            <span className="font-semibold text-sm text-slate-900 flex-1">{label}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </ConsolePage>
  );
};

/* ------------------------------------------------------------------ */

export const AdminApplicationsPage: React.FC = () => {
  const { competition } = useCompetition();
  useSeo({ title: `${competition.title} — Başvurular`, noindex: true });
  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Başvurular"
      description="Onaylanan katılımcılar teslim yapabilir. Yaş ve veli izni bilgileri başvuru satırında görünür."
    >
      <ApplicationsPanel competitionId={competition.id} />
    </ConsolePage>
  );
};

export const AdminSubmissionsPage: React.FC = () => {
  const { competition } = useCompetition();
  useSeo({ title: `${competition.title} — Teslimler`, noindex: true });
  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Teslimler"
      description="Yayınlanan teslimler oylama sayfasında listelenir. Göz simgesiyle yayından kaldırabilirsiniz."
    >
      <SubmissionsPanel competitionId={competition.id} />
    </ConsolePage>
  );
};

export const AdminAnnouncementsPage: React.FC = () => {
  const { competition } = useCompetition();
  useSeo({ title: `${competition.title} — Duyurular`, noindex: true });
  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Duyurular"
      description="Katılımcı panelinde ve herkese açık yarışma sayfasında görünecek duyuruları buradan yayınlayın."
    >
      <AnnouncementsPanel competitionId={competition.id} />
    </ConsolePage>
  );
};

export const AdminCertificatesPage: React.FC = () => {
  const { competition } = useCompetition();
  useSeo({ title: `${competition.title} — Sertifikalar`, noindex: true });

  const year = competition.topic_reveal_at
    ? new Date(competition.topic_reveal_at).getFullYear()
    : new Date().getFullYear();

  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Sertifikalar"
      description="Kodlar GYD-26-0001-01 biçiminde otomatik üretilir. Toplu katılım sertifikası, teslim yapmış tüm onaylı katılımcılara verilir."
    >
      <CertificatesPanel competitionId={competition.id} eventCode="GYD" year={year} />
    </ConsolePage>
  );
};

export const AdminCompetitionSettingsPage: React.FC = () => {
  const { competition, reloadCompetition } = useCompetition();
  useSeo({ title: `${competition.title} — Ayarlar`, noindex: true });
  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Yarışma Ayarları"
      description="Konu ve takvim burada belirlenir. Konu alanı boşken katılımcı panelinde “henüz açıklanmadı” görünür."
    >
      <CompetitionPanel competition={competition} onSaved={reloadCompetition} />
    </ConsolePage>
  );
};

export const AdminUsersPage: React.FC = () => {
  useSeo({ title: 'Kullanıcılar — Yönetim', noindex: true });
  return (
    <ConsolePage
      eyebrow="Yönetim"
      title="Kullanıcılar"
      description="Rol atamaları anında geçerli olur. Katılımcı, Staff ve Admin rolleri arasında geçiş yapabilirsiniz."
    >
      <Alert tone="info">
        <strong>{ADMIN_EMAIL}</strong> adresi kayıt olduğunda veritabanı tarafından otomatik olarak
        admin yapılır.
      </Alert>
      <UsersPanel />
    </ConsolePage>
  );
};

export const AdminSettingsPage: React.FC = () => {
  useSeo({ title: 'Ayarlar — Yönetim', noindex: true });
  return (
    <ConsolePage
      eyebrow="Yönetim"
      title="Ayarlar"
      description="Platform genelindeki sabitler ve kurulum bilgileri."
    >
      <ConsoleSection id="kurulum" title="Kurulum">
        <dl className="space-y-3 text-sm">
          {[
            ['Kurucu admin', ADMIN_EMAIL],
            ['Etkinlik kodu', 'GYD'],
            ['Sertifika doğrulama', 'https://gurx.gurlabs.com/certificate/verify/<KOD>'],
            ['Zorunlu tasarım ortamı', 'aistudio.google.com'],
            ['Yayın hedefleri', 'Vercel, Netlify'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5"
            >
              <dt className="text-slate-500 sm:w-56 shrink-0">{label}</dt>
              <dd className="font-mono text-slate-900 break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </ConsoleSection>

      <ConsoleSection id="notlar" title="Notlar">
        <Alert tone="info">
          Yarışmaya özgü tarih, konu ve durum ayarları ilgili yarışmanın{' '}
          <strong>Yarışma Ayarları</strong> sayfasındadır.
        </Alert>
      </ConsoleSection>
    </ConsolePage>
  );
};

/* ------------------------------------------------------------------ */

const ROLE_MATRIX: { role: StaffRole; summary: string; can: string[] }[] = [
  {
    role: 'co_organizer',
    summary: 'Organizasyonun ikinci sorumlusu; günlük işleyişin tamamını yürütür.',
    can: ['Başvuruları onaylar/reddeder', 'Teslimleri yönetir', 'Duyuru yayınlar', 'Sıralamayı görür'],
  },
  {
    role: 'moderator',
    summary: 'Katılımcı iletişimini ve destek taleplerini yürütür.',
    can: ['Destek taleplerini yanıtlar', 'Duyuru yayınlar', 'Başvuruları inceler'],
  },
  {
    role: 'developer',
    summary: 'Teknik altyapı ve teslim doğrulamasından sorumludur.',
    can: ['Teslimleri yönetir', 'Bağlantı erişilebilirliğini denetler', 'Destek taleplerini görür'],
  },
  {
    role: 'marketing_lead',
    summary: 'Duyuru ve tanıtım içeriklerini yönetir.',
    can: ['Duyuru yayınlar', 'Sıralamayı görür', 'Destek taleplerini görür'],
  },
  {
    role: 'jury',
    summary: 'Tasarım, SEO ve güvenlik ölçütlerini puanlar.',
    can: ['Teslimleri puanlar', 'Sıralamayı görür', 'Kategori ödüllerini belirler'],
  },
];

/**
 * Ekip görevlerinin tek referansı. Admin buradan hem kimin hangi görevde
 * olduğunu görür hem de staff panelini olduğu gibi önizleyebilir.
 */
export const AdminTeamPage: React.FC = () => {
  const { isAdmin } = useAuth();
  useSeo({ title: 'Ekip & Roller — Yönetim', noindex: true });

  const { data, loading } = useAsync<Profile[]>(
    () => (isAdmin ? adminListProfiles() : Promise.resolve([])),
    [isAdmin],
  );

  const team = (data ?? []).filter((p) => p.role !== 'participant');

  return (
    <ConsolePage
      eyebrow="Yönetim"
      title="Ekip & Roller"
      description="Yetki seviyesi neye erişildiğini, ekip görevi ise organizasyondaki sorumluluğu belirler."
      actions={
        <Link to="/staff/genel" className="gx-btn-ghost">
          Staff panelini önizle
          <ArrowRight className="w-4 h-4" />
        </Link>
      }
      toc={[
        { id: 'roller', label: 'Görev tanımları' },
        { id: 'ekip', label: 'Mevcut ekip' },
      ]}
    >
      <ConsoleSection
        id="roller"
        title="Görev tanımları"
        description="Görev ataması Kullanıcılar sayfasından yapılır."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {ROLE_MATRIX.map(({ role, summary, can }) => (
            <article
              key={role}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center">
                  <Shield className="w-4 h-4" />
                </span>
                <h3 className="font-semibold text-slate-900">{STAFF_ROLE_LABELS[role]}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
              <ul className="space-y-1.5">
                {can.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-slate-600">
                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ConsoleSection>

      <ConsoleSection id="ekip" title="Mevcut ekip">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : team.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="Henüz ekip üyesi yok"
            description="Kullanıcılar sayfasından bir kullanıcıyı Staff yapıp görev atayın."
          />
        ) : (
          <ul className="space-y-2.5">
            {team.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{p.full_name ?? p.email}</p>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {p.role === 'admin' ? 'Admin' : 'Staff'}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    p.staff_role
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {p.staff_role ? STAFF_ROLE_LABELS[p.staff_role] : 'görev yok'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ConsoleSection>
    </ConsolePage>
  );
};
