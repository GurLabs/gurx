import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Github,
  Globe,
  Layers,
  Link2,
  Linkedin,
  Megaphone,
  Rocket,
  ScrollText,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Section, SectionHeading, Reveal } from '../components/ui/Section';
import { Countdown } from '../components/ui/Countdown';
import { AiStudioLockup } from '../components/ui/AiStudioLockup';
import { AwardsShowcase } from '../components/AwardsShowcase';
import { useSeo } from '../hooks/useSeo';
import { useAsync } from '../hooks/useAsync';
import { fetchAnnouncements, fetchYouthCompetition } from '../lib/api';
import { formatDate, formatDateTime } from '../lib/format';
import { YOUTH_COMPETITION } from '../data/seed';
import { DEPLOY_TARGETS } from '../lib/brand';
import { useAuth } from '../context/AuthContext';

const REQUIREMENTS = [
  {
    icon: Layers,
    title: '1 adet Vibe Coding web sitesi',
    body: 'Daha önce Vibe Coding ile ürettiğiniz bir web sitesini referans olarak gösterirsiniz. Yayında ve erişilebilir olmalıdır.',
  },
  {
    icon: Globe,
    title: '1 adet portfolyo bağlantısı',
    body: 'Kendi kişisel siteniz, LinkedIn profiliniz veya GitHub profiliniz portfolyo olarak kabul edilir.',
  },
  {
    icon: Users,
    title: 'Yaş koşulu',
    body: '15 – 21 yaş arası. 22 yaşından küçük olmalısınız; 15 yaş ve altındaysanız veli izni onayı gerekir.',
  },
  {
    icon: FileText,
    title: 'Doğru kimlik bilgileri',
    body: 'Ad soyad, e-posta ve doğum yılı; sertifikanız bu bilgilerle düzenlenir.',
  },
];

const TIMELINE_KEYS = [
  { key: 'registration_opens_at', label: 'Başvurular açılır', icon: Megaphone },
  { key: 'registration_closes_at', label: 'Başvurular kapanır', icon: CalendarClock },
  { key: 'topic_reveal_at', label: 'Konu açıklanır — 24 saat başlar', icon: Sparkles },
  { key: 'submission_deadline_at', label: 'Teslim son tarihi', icon: Clock3 },
  { key: 'voting_opens_at', label: 'Oylama açılır', icon: Users },
  { key: 'voting_closes_at', label: 'Oylama kapanır', icon: CheckCircle2 },
  { key: 'results_at', label: 'Sonuçlar & sertifikalar', icon: Trophy },
] as const;

const DELIVERABLES = [
  'Yayında olan proje bağlantısı (Vercel veya Netlify)',
  'Hero bölümünün ekran görüntüsü (oylama sayfasında kullanılır)',
  'Kısa proje açıklaması',
  'Yaptığınız SEO iyileştirmelerinin özeti',
  'Yaptığınız güvenlik iyileştirmelerinin özeti',
];

export const YouthDesignPage: React.FC = () => {
  const { user } = useAuth();
  const { data } = useAsync(fetchYouthCompetition, []);
  const competition = data ?? YOUTH_COMPETITION;

  const { data: announcements } = useAsync(
    () => fetchAnnouncements(competition.id, 'public'),
    [competition.id],
  );

  /** Logged-in visitors go straight to the application form inside the console. */
  const applyHref = user
    ? `/dashboard/yarismalar/${competition.slug}/basvurum`
    : `/kayit?next=${encodeURIComponent(`/dashboard/yarismalar/${competition.slug}/basvurum`)}`;

  useSeo({
    title: 'GurX Youth Design 2026 — GurX™ Design Awards',
    description:
      '15–21 yaş arası genç tasarımcılar için 24 saatlik Vibe Coding tasarım yarışması. Google AI Studio ile tasarla, Vercel veya Netlify’a yayınla, sertifika ve rozet kazan.',
    path: '/youth-design',
  });

  return (
    <>
      <PageHero
        eyebrow={
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aktif yarışma · Başvurular açık
          </>
        }
        title="GurX Youth Design 2026"
        description="Konu açıklandığı anda 24 saatlik geri sayım başlar. Google AI Studio üzerinde Vibe Coding ile tasarlar, SEO ve güvenlik iyileştirmelerini yapar, projenizi yayına alıp açık puanlamaya sunarsınız."
        actions={
          <>
            <Link to={applyHref} className="gx-btn-primary">
              Başvuru yap
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/kurallar" className="gx-btn-ghost">
              <ScrollText className="w-4 h-4" />
              Kurallar & Şartlar
            </Link>
          </>
        }
        aside={
          <div className="gx-card p-6 space-y-5">
            <Countdown
              target={competition.registration_closes_at}
              label="Başvuruların kapanmasına"
              finishedLabel="Başvurular kapandı"
            />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-medium">Yaş aralığı</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {competition.min_age} – {competition.max_age}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-medium">Katılım ücreti</p>
                <p className="font-semibold text-slate-900 mt-1">Ücretsiz</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-medium">Üretim süresi</p>
                <p className="font-semibold text-slate-900 mt-1">24 saat</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-medium">Değerlendirme</p>
                <p className="font-semibold text-slate-900 mt-1">Açık puanlama</p>
              </div>
            </div>
          </div>
        }
      />

      <Section className="!py-6">
        <AiStudioLockup />
      </Section>

      {/* Project detail */}
      <Section id="detaylar">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 gx-card p-8 sm:p-10 space-y-5">
            <SectionHeading
              eyebrow={
                <>
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  Proje detayları
                </>
              }
              title="Yarışma nasıl ilerliyor?"
            />
            <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>
                GurX Youth Design, genç tasarımcıların gerçek bir üretim baskısı altında ne
                yapabildiğini görünür kılmak için tasarlandı. Başvurunuz onaylandıktan sonra
                yapmanız gereken tek şey konunun açıklanmasını beklemek.
              </p>
              <p>
                Konu, katılımcı panelinizde ve e-postanızda aynı anda duyurulur. O andan itibaren{' '}
                <strong className="text-slate-900">24 saatiniz</strong> vardır. Bu süre içinde
                projeyi Google AI Studio üzerinde Vibe Coding ile tasarlar; ardından
                optimizasyonlarını, SEO iyileştirmelerini ve güvenlik iyileştirmelerini
                tamamlarsınız.
              </p>
              <p>
                İşiniz bittiğinde projeyi{' '}
                {DEPLOY_TARGETS.map((t, i) => (
                  <React.Fragment key={t.name}>
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-slate-900 underline underline-offset-2"
                    >
                      {t.name}
                    </a>
                    {i < DEPLOY_TARGETS.length - 1 ? ' veya ' : ''}
                  </React.Fragment>
                ))}{' '}
                üzerinden yayına alır, canlı bağlantıyı ve hero ekran görüntüsünü katılımcı
                panelindeki <strong className="text-slate-900">sonuç yükleme</strong> bölümüne
                girersiniz.
              </p>
              <p>
                Süre dolduğunda tüm projeler oylama sayfasında yayınlanır ve katılımcılar
                birbirlerini puanlar. Kimse kendi projesine oy veremez. Sıralama ve ödüller
                yarışmanın sıralama sayfasında açıklanır.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/kurallar" className="gx-btn-primary">
                <ScrollText className="w-4 h-4" />
                Kurallar ve Şartlar sayfasına git
              </Link>
              <Link to="/yardim" className="gx-btn-ghost">
                Nasıl yapılır? Yardım sayfası
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link to="/siralama" className="gx-btn-ghost">
                <Trophy className="w-4 h-4" />
                Sıralama & ödüller
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="gx-card p-8 space-y-5">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CalendarClock className="w-4.5 h-4.5 text-slate-500" />
                Takvim
              </h3>
              <ol className="space-y-4">
                {TIMELINE_KEYS.map(({ key, label, icon: Icon }) => (
                  <li key={key} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 grid place-items-center text-slate-600 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDateTime(competition[key] as string | null)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="gx-card p-8 space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Rocket className="w-4.5 h-4.5 text-slate-500" />
                Teslim edilecekler
              </h3>
              <ul className="space-y-2.5">
                {DELIVERABLES.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Requirements */}
      <Section id="kosullar">
        <div className="space-y-10">
          <SectionHeading
            eyebrow={
              <>
                <Link2 className="w-3.5 h-3.5 text-slate-600" />
                Başvuru koşulları
              </>
            }
            title="Başvururken hazır olması gerekenler"
            description="Referanslarınız değerlendirme öncesi kontrol edilir; erişilemeyen bağlantılar başvuruyu geçersiz kılar."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REQUIREMENTS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.05}>
                <article className="gx-card p-6 h-full space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="gx-card p-6 flex flex-wrap items-center gap-4">
            <p className="text-sm text-slate-600 flex-1 min-w-[240px]">
              Portfolyo olarak kabul edilenler:
            </p>
            {[
              { icon: Globe, label: 'Kendi web siteniz' },
              { icon: Linkedin, label: 'LinkedIn profili' },
              { icon: Github, label: 'GitHub profili' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="gx-pill">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Announcements */}
      <Section id="duyurular">
        <div className="space-y-8">
          <SectionHeading
            eyebrow={
              <>
                <Megaphone className="w-3.5 h-3.5 text-slate-600" />
                Duyurular
              </>
            }
            title="Yarışma duyuruları"
            description="Katılımcılara özel duyurular ayrıca katılımcı panelinde yayınlanır."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {(announcements ?? []).slice(0, 6).map((a) => (
              <article key={a.id} className="gx-card p-6 space-y-2">
                <p className="text-xs text-slate-500">{formatDate(a.published_at)}</p>
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <AwardsShowcase id="odul-sistemi" />

      <Section>
        <div className="rounded-[32px] bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-emerald-400/20 blur-[100px]" />
          <div className="relative grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Katılım için gerekli
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif leading-tight">
                Başvuru yapabilmek için önce kayıt olun veya giriş yapın
              </h2>
              <p className="text-white/70 text-sm sm:text-base max-w-2xl">
                Başvuru formu, katılımcı paneli, oylama ve sertifika indirme yalnızca hesabı olan
                katılımcılara açıktır.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
              <Link
                to={applyHref}
                className="inline-flex items-center gap-2 bg-white text-slate-900 text-sm font-semibold px-5 py-3 rounded-full hover:bg-slate-100 transition-colors"
              >
                <BadgeCheck className="w-4 h-4" />
                {user ? 'Başvuru formunu aç' : 'Kayıt ol'}
              </Link>
              {!user && (
                <Link
                  to="/giris"
                  className="inline-flex items-center gap-2 border border-white/25 text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-white/10 transition-colors"
                >
                  Giriş yap
                </Link>
              )}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};
