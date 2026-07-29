import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Clock3,
  Compass,
  Gauge,
  Globe2,
  GraduationCap,
  Heart,
  Layers,
  Lightbulb,
  LockKeyhole,
  Rocket,
  ScanLine,
  Scale,
  Search,
  Sparkles,
  Users,
  Vote,
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Section, SectionHeading, Reveal } from '../components/ui/Section';
import { Countdown } from '../components/ui/Countdown';
import { AiStudioLockup } from '../components/ui/AiStudioLockup';
import { AwardsShowcase } from '../components/AwardsShowcase';
import { FaqSection } from '../components/FaqSection';
import { useSeo } from '../hooks/useSeo';
import { useAsync } from '../hooks/useAsync';
import { fetchYouthCompetition } from '../lib/api';
import { formatDate } from '../lib/format';
import { YOUTH_COMPETITION } from '../data/seed';

const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=900&auto=format&fit=crop',
    alt: 'Arayüz tasarımı üzerinde çalışan genç tasarımcı',
    className: 'col-span-2 h-44 sm:h-52',
  },
  {
    src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=700&auto=format&fit=crop',
    alt: 'Ekip halinde tasarım çalışması',
    className: 'h-32 sm:h-40',
  },
  {
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=700&auto=format&fit=crop',
    alt: 'Yarışma jürisi değerlendirme toplantısı',
    className: 'h-32 sm:h-40',
  },
];

const WHAT_IS = [
  {
    icon: Globe2,
    title: 'Uluslararası yarışma programı',
    body: 'GurX™ Design Awards, dünya çapındaki genç tasarımcıları aynı brief, aynı süre ve aynı değerlendirme ölçütleriyle buluşturan bir yarışma serisidir.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=900&auto=format&fit=crop',
  },
  {
    icon: Layers,
    title: 'Vibe Coding odaklı üretim',
    body: 'Fikirden çalışan ürüne giden yolu yapay zekâ destekli araçlarla kısaltan Vibe Coding yaklaşımını merkeze alır. Değerlendirilen şey araç değil, sonuçtaki deneyimdir.',
    image:
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=900&auto=format&fit=crop',
  },
  {
    icon: BadgeCheck,
    title: 'Doğrulanabilir belgeler',
    body: 'Her katılımcı benzersiz kodlu bir sertifika ve rozet alır. Kod, herkese açık doğrulama sayfasından 7/24 sorgulanabilir.',
    image:
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=900&auto=format&fit=crop',
  },
];

const FLOW = [
  {
    step: '01',
    icon: Users,
    title: 'Kayıt & başvuru',
    body: 'Hesabınızı oluşturun ve başvuru formunu doldurun. Yaş kontrolünü onayladıktan sonra anında maratona katılabilirsiniz.',
  },
  {
    step: '02',
    icon: Lightbulb,
    title: 'Konu açıklanır',
    body: 'Yarışma konusu, ilan edilen saatte katılımcı panelinde herkese aynı anda duyurulur. O an geri sayım başlar.',
  },
  {
    step: '03',
    icon: Clock3,
    title: '24 saat üretim',
    body: 'Google AI Studio üzerinde Vibe Coding ile tasarlarsınız. Süre içinde optimizasyon, SEO ve güvenlik iyileştirmelerini de tamamlamanız beklenir.',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Yayına alma & teslim',
    body: 'Projeyi Vercel veya Netlify üzerinden yayına alır, canlı bağlantıyı ve hero ekran görüntüsünü panelden gönderirsiniz.',
  },
  {
    step: '05',
    icon: Vote,
    title: 'Açık puanlama',
    body: 'Tüm projeler oylama sayfasında yayınlanır. Katılımcılar birbirlerini puanlar; kimse kendi projesine oy veremez.',
  },
  {
    step: '06',
    icon: BadgeCheck,
    title: 'Sonuç, sertifika & rozet',
    body: 'Sıralama herkese açık yayınlanır. Katılım sertifikaları ve kategori rozetleri panelinizden PDF olarak indirilir.',
  },
];

const CRITERIA = [
  {
    icon: Compass,
    title: 'Tasarım & Deneyim',
    body: 'Görsel hiyerarşi, tipografi, düzen, erişilebilirlik ve akışın netliği.',
    tone: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  {
    icon: Search,
    title: 'SEO',
    body: 'Semantik işaretleme, meta yapısı, yapılandırılmış veri, canonical ve sayfa hızı.',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    icon: LockKeyhole,
    title: 'Güvenlik',
    body: 'Güvenlik başlıkları, girdi doğrulama, gizli anahtar hijyeni ve güvenli dağıtım.',
    tone: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  {
    icon: Gauge,
    title: 'Optimizasyon',
    body: 'Görsel/varlık optimizasyonu, Core Web Vitals ve mobil performans.',
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
  },
];

const ELIGIBILITY = [
  { icon: GraduationCap, title: '15 – 21 yaş', body: 'Katılımcılar 22 yaşından küçük olmalıdır.' },
  {
    icon: Heart,
    title: '15 yaş ve altı için veli izni',
    body: '15 yaşında veya daha küçükseniz başvuruda veli izni onayı vermeniz gerekir.',
  },
  {
    icon: Globe2,
    title: 'Her ülkeden',
    body: 'Yarışma uluslararasıdır; öğrenci, bağımsız tasarımcı ve genç geliştiriciler katılabilir.',
  },
  {
    icon: Scale,
    title: 'Bireysel katılım',
    body: 'Youth Design bireysel bir yarışmadır; her katılımcı kendi projesini teslim eder.',
  },
];

export const HomePage: React.FC = () => {
  const { data } = useAsync(fetchYouthCompetition, []);
  const competition = data ?? YOUTH_COMPETITION;

  useSeo({
    title: 'GurX™ Design Awards — GurLabs Foundation™',
    description:
      'GurX™ Design Awards, GurLabs Foundation™ tarafından düzenlenen uluslararası UI/UX ve Vibe Coding tasarım yarışmalarıdır. Aktif yarışma: GurX Youth Design 2026.',
    path: '/',
  });

  return (
    <>
      <PageHero
        eyebrow={
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            GurX Youth Design 2026 başvuruları açık
          </>
        }
        title={
          <>
            Genç tasarımcılar için
            <br />
            uluslararası tasarım ödülleri
          </>
        }
        description={
          <>
            GurX<span className="align-super text-[0.7em]">™</span> Design Awards, GurLabs
            Foundation<span className="align-super text-[0.7em]">™</span> tarafından düzenlenen
            ücretsiz bir yarışma programıdır. 24 saat, tek bir konu, açık puanlama; sonunda
            doğrulanabilir sertifika ve rozet.
          </>
        }
        actions={
          <>
            <Link to="/kayit" className="gx-btn-primary">
              Başvuru yap
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/youth-design" className="gx-btn-ghost">
              Youth Design'ı incele
            </Link>
          </>
        }
        aside={
          <div className="grid grid-cols-2 gap-3">
            {HERO_IMAGES.map((img) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                loading="eager"
                className={`w-full object-cover rounded-3xl border border-slate-200/70 shadow-sm ${img.className}`}
              />
            ))}
          </div>
        }
      />

      {/* What are the GurX Awards */}
      <Section id="awards">
        <div className="space-y-10">
          <SectionHeading
            eyebrow={
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                GurX™ Awards nedir?
              </>
            }
            title="Genç tasarımcıyı görünür kılan bir ödül programı"
            description="GurLabs Foundation™, gençlere destek olmak ve uluslararası yarışmalar düzenlemek amacıyla kuruldu. GurX™ bu amacın yarışma ve ödül koludur."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {WHAT_IS.map(({ icon: Icon, title, body, image }, i) => (
              <Reveal key={title} delay={i * 0.07}>
                <article className="gx-card overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-6 space-y-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section id="isleyis">
        <div className="space-y-10">
          <SectionHeading
            eyebrow={
              <>
                <Compass className="w-3.5 h-3.5 text-slate-600" />
                İşleyiş
              </>
            }
            title="Başvurudan sertifikaya altı adım"
            description="Süreç herkes için aynıdır ve her adım katılımcı panelinizden takip edilir."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map(({ step, icon: Icon, title, body }, i) => (
              <Reveal key={step} delay={i * 0.05}>
                <article className="gx-card p-6 h-full space-y-3 relative overflow-hidden">
                  <span className="absolute top-4 right-5 gx-num text-5xl text-slate-100 select-none">
                    {step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center relative">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 relative">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed relative">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Who can join */}
      <Section id="kimler">
        <div className="gx-card overflow-hidden grid lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[280px]">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop"
              alt="Genç katılımcılar birlikte çalışırken"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 p-8 sm:p-10 space-y-7">
            <SectionHeading
              eyebrow={
                <>
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  Kimler katılabilir?
                </>
              }
              title="Genç, meraklı ve üretmeye hazır herkes"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {ELIGIBILITY.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 grid place-items-center text-slate-700 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/kurallar" className="gx-btn-ghost">
              Kurallar & Şartlar
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Active competition */}
      <Section id="aktif-yarisma">
        <Reveal>
          <div className="gx-card overflow-hidden">
            <div className="grid lg:grid-cols-12">
              <div className="lg:col-span-6 relative min-h-[260px]">
                <img
                  src={
                    competition.cover_image ??
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop'
                  }
                  alt="GurX Youth Design 2026"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Aktif yarışma
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {competition.category}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6 p-8 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 leading-tight">
                    {competition.title}
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    {competition.subtitle ?? '24 saatlik Vibe Coding tasarım maratonu'}
                  </p>
                </div>

                <Countdown
                  target={competition.registration_closes_at}
                  label="Başvuruların kapanmasına"
                  finishedLabel="Başvurular kapandı"
                />

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <dt className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5" />
                      Konu açıklanma
                    </dt>
                    <dd className="font-semibold text-slate-900 mt-1">
                      {formatDate(competition.topic_reveal_at)}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <dt className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5" />
                      Teslim süresi
                    </dt>
                    <dd className="font-semibold text-slate-900 mt-1">24 saat</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-3">
                  <Link to="/kayit" className="gx-btn-primary">
                    Başvuru yap
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/youth-design" className="gx-btn-ghost">
                    Proje detayları
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Mandatory tooling */}
      <Section className="!py-6">
        <AiStudioLockup />
      </Section>

      {/* Scoring criteria */}
      <Section id="puanlama">
        <div className="space-y-10">
          <SectionHeading
            eyebrow={
              <>
                <Vote className="w-3.5 h-3.5 text-slate-600" />
                Açık puanlama
              </>
            }
            title="Puanlar herkesin gözü önünde"
            description="Projeler dört başlıkta değerlendirilir. Oylama katılımcılar arasında yapılır, kimse kendi projesine oy veremez ve sonuçlar sıralama sayfasında açık şekilde yayınlanır."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CRITERIA.map(({ icon: Icon, title, body, tone }, i) => (
              <Reveal key={title} delay={i * 0.05}>
                <article className="gx-card p-6 h-full space-y-3">
                  <div className={`w-10 h-10 rounded-xl border grid place-items-center ${tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard" className="gx-btn-ghost">
              Oylama katılımcı panelinde
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link to="/siralama" className="gx-btn-ghost">
              Sıralama & ödüller
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Section>

      <AwardsShowcase />

      {/* Foundation */}
      <Section id="kurumsal">
        <div className="gx-card overflow-hidden grid lg:grid-cols-12">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-5">
            <div className="gx-pill">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Kurumsal
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 leading-tight">
              Bir GurLabs Foundation<span className="align-super text-[0.5em]">™</span> projesidir
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              GurLabs Foundation<span className="align-super text-[0.7em]">™</span>, gençlere
              yardımcı olmak ve uluslararası yarışmalar düzenlemek amacıyla kurulmuş bir oluşumdur.
              GurX<span className="align-super text-[0.7em]">™</span> markası bu oluşumun yarışma,
              ödül ve sertifikasyon programını yürütür.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {[
                'Katılım her zaman ücretsizdir; hiçbir aşamada ödeme talep edilmez.',
                'Değerlendirme ölçütleri ve puanlar herkese açıktır.',
                'Sertifika ve rozetler kalıcı bir doğrulama bağlantısıyla verilir.',
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <BadgeCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          {/* Dark plate — the foundation mark is designed for a dark ground. */}
          <div className="lg:col-span-5 bg-[#0b1120] grid place-items-center p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-amber-400/10 blur-[80px]" />
            <img
              src="/gf-big.png"
              alt="GurLabs Foundation™ logosu"
              loading="lazy"
              className="relative w-full max-w-xs object-contain"
            />
          </div>
        </div>
      </Section>

      <FaqSection />
    </>
  );
};
