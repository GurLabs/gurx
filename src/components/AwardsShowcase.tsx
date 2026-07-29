import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowUpRight, ScanLine } from 'lucide-react';
import { Section, SectionHeading, Reveal } from './ui/Section';
import { PARTICIPANT_AWARD_LIST, SAMPLE_CERTIFICATE_IMAGE } from '../lib/brand';

export const AwardsShowcase: React.FC<{ id?: string }> = ({ id = 'oduller' }) => (
  <Section id={id}>
    <div className="space-y-10">
      <SectionHeading
        eyebrow={
          <>
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Sertifika & Rozetler
          </>
        }
        title="Kazandığınız her şey doğrulanabilir"
        description="Nakit ödül yerine kariyerinizde kalıcı değer taşıyan belgeler veriyoruz: PDF sertifika, GitHub README ve portfolyonuzda kullanabileceğiniz rozetler ve 7/24 açık bir doğrulama bağlantısı."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PARTICIPANT_AWARD_LIST.map((award, i) => (
          <Reveal key={award.code} delay={i * 0.05}>
            <article className="gx-card p-6 h-full flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow">
              <img
                src={award.badge}
                alt={`${award.name} rozeti`}
                width={120}
                height={120}
                loading="lazy"
                className="h-24 w-auto object-contain drop-shadow-sm"
              />
              <div className="space-y-1.5">
                <p className="text-[0.65rem] font-mono font-semibold text-slate-400 tracking-widest">
                  {award.code}
                </p>
                <h3 className={`font-semibold text-sm ${award.accent}`}>{award.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{award.description}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="gx-card overflow-hidden grid lg:grid-cols-12">
          <div className="lg:col-span-6 p-8 sm:p-10 space-y-5">
            <div className="gx-pill">
              <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
              Örnek Katılım Sertifikası
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-slate-900 leading-tight">
              Her sertifikanın benzersiz bir kodu ve doğrulama sayfası var
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sertifikanız üzerindeki kodu doğrulama sayfasına girerek veya rozetteki QR kodu
              okutarak; sertifikanın kime ait olduğunu, hangi ödül türü olduğunu ve ne zaman
              verildiğini herkes teyit edebilir.
            </p>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Örnek kod
              </p>
              <p className="font-mono text-lg text-slate-900">GYD-26-0001-01</p>
              <ul className="text-xs text-slate-600 space-y-1 pt-1">
                <li>
                  <strong className="font-mono text-slate-900">GYD</strong> — GurX Youth Design
                </li>
                <li>
                  <strong className="font-mono text-slate-900">26</strong> — Yıl (2026)
                </li>
                <li>
                  <strong className="font-mono text-slate-900">0001</strong> — Katılımcı ID
                </li>
                <li>
                  <strong className="font-mono text-slate-900">01</strong> — Belge / ödül türü
                </li>
              </ul>
            </div>

            <Link to="/certificate/verify/GYD-26-0001-01" className="gx-btn-primary">
              Örnek doğrulamayı gör
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 sm:p-10 grid place-items-center">
            <img
              src={SAMPLE_CERTIFICATE_IMAGE}
              alt="GurX Youth Design katılım sertifikası örneği"
              width={900}
              height={640}
              loading="lazy"
              className="w-full max-w-lg rounded-2xl shadow-lg border border-slate-200 object-contain"
            />
          </div>
        </div>
      </Reveal>
    </div>
  </Section>
);
