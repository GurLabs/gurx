import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BadgeCheck,
  ClipboardCheck,
  Gavel,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Section, SectionHeading, Reveal } from '../components/ui/Section';
import { Alert } from '../components/ui/Feedback';
import { useSeo } from '../hooks/useSeo';
import { AWARD_TYPES, OFFICIAL_FORM_URL } from '../lib/brand';

const ROLES = [
  {
    icon: Gavel,
    title: 'Jüri Üyesi',
    body: 'Teslim edilen projeleri belirlenen ölçütlere göre inceler ve kategori ödüllerinin sahiplerini belirler. Tasarım, ürün veya yazılım alanında deneyim beklenir.',
  },
  {
    icon: MessageSquare,
    title: 'Moderatör',
    body: 'Yarışma süresince katılımcı sorularını yanıtlar, duyuruların iletilmesine yardımcı olur ve süreç akışını takip eder.',
  },
  {
    icon: ClipboardCheck,
    title: 'Değerlendirme Desteği',
    body: 'Başvuru referanslarının erişilebilirliğini kontrol eder, teslimlerin kurallara uygunluğunu ön incelemeden geçirir.',
  },
  {
    icon: HeartHandshake,
    title: 'Destekleyici',
    body: 'Yarışmanın duyurulmasına, içerik üretimine veya katılımcı topluluğunun desteklenmesine katkı sağlar.',
  },
];

const STEPS = [
  'Aşağıdaki başvuru formunu doldurun.',
  'Ekibimiz başvurunuzu inceler ve uygun görülen role göre size döner.',
  'Görev süreniz boyunca yetkili paneline erişiminiz açılır.',
  'Yarışma tamamlandığında adınıza düzenlenmiş Yetkili Görev Belgesi verilir.',
];

export const OfficialApplicationPage: React.FC = () => {
  useSeo({
    title: 'Yetkili Başvurusu — GurX™ Design Awards',
    description:
      'GurX yarışmalarında jüri, moderatör veya destekleyici olarak görev alın; görev süreniz sonunda doğrulanabilir Yetkili Görev Belgesi kazanın.',
    path: '/yetkili-basvuru',
  });

  const officialAward = AWARD_TYPES['06'];

  return (
    <>
      <PageHero
        eyebrow={
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            Görev al
          </>
        }
        title="Yetkili başvurusu"
        description="Jüri, moderatör veya destekleyici olarak görev alarak yarışmanın yürütülmesine katkıda bulunun. Görev süreniz sonunda adınıza düzenlenmiş, doğrulanabilir bir görev belgesi verilir."
        actions={
          <>
            <a
              href={OFFICIAL_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gx-btn-primary"
            >
              Başvuru formunu aç
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <Link to="/youth-design" className="gx-btn-ghost">
              Yarışmayı incele
            </Link>
          </>
        }
        aside={
          <div className="gx-card p-6 flex items-center gap-5">
            <img
              src={officialAward.badge}
              alt={officialAward.name}
              width={88}
              height={88}
              className="h-20 w-auto object-contain shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-mono text-slate-400">{officialAward.code}</p>
              <p className="font-semibold text-slate-900">{officialAward.name}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{officialAward.description}</p>
            </div>
          </div>
        }
      />

      <Section id="roller">
        <div className="space-y-10">
          <SectionHeading
            eyebrow={
              <>
                <Gavel className="w-3.5 h-3.5 text-slate-600" />
                Roller
              </>
            }
            title="Hangi görevleri üstlenebilirsiniz?"
            description="Başvuru formunda ilgilendiğiniz rolü seçersiniz; birden fazla rol için de başvurabilirsiniz."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {ROLES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.05}>
                <article className="gx-card p-6 h-full space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section id="surec">
        <div className="gx-card p-8 sm:p-10 space-y-6">
          <SectionHeading
            eyebrow={
              <>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                Süreç
              </>
            }
            title="Başvurudan belgeye"
          />

          <ol className="space-y-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-3.5 text-sm text-slate-600">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 grid place-items-center text-xs font-bold shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>

          <div className="pt-2">
            <a
              href={OFFICIAL_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gx-btn-primary"
            >
              Başvuru formunu aç
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Section>
    </>
  );
};
