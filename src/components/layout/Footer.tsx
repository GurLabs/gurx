import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Globe, Linkedin, Mail } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { FoundationLogo, GurxMark } from '../ui/Logo';
import { AI_STUDIO, SUPPORT_EMAIL } from '../../lib/brand';

const YEAR = new Date().getFullYear();

const COLUMNS: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    title: 'Yarışma',
    links: [
      { label: 'GurX Youth Design 2026', to: '/youth-design' },
      { label: 'Kurallar & Şartlar', to: '/kurallar' },
      { label: 'Sıralama', to: '/siralama' },
      { label: 'Yetkili Başvurusu', to: '/yetkili-basvuru' },
    ],
  },
  {
    title: 'Katılımcı',
    links: [
      { label: 'Kayıt Ol', to: '/kayit' },
      { label: 'Giriş Yap', to: '/giris' },
      { label: 'Katılımcı Paneli', to: '/dashboard' },
      { label: 'Yardım', to: '/yardim' },
    ],
  },
  {
    title: 'Destek',
    links: [
      { label: 'İletişim', to: '/iletisim' },
      { label: 'Sertifika Doğrula', to: '/dogrula' },
      { label: 'Sıkça Sorulan Sorular', to: '/#sss' },
      { label: 'Google AI Studio', to: AI_STUDIO.url, external: true },
    ],
  },
];

const SOCIAL = [
  { icon: Globe, href: 'https://gurlabs.com', label: 'Web sitesi' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export const Footer: React.FC = () => (
  <footer className="mt-20 border-t border-slate-200/70 bg-white/60">
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Brand: GurX first, Foundation second — no tagline, no badges. */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center gap-4">
            <GurxMark className="h-8" />
            <span className="w-px h-7 bg-slate-200" aria-hidden />
            <FoundationLogo className="h-8" />
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
            Genç tasarımcılar için uluslararası yarışmalar, açık puanlama ve doğrulanabilir
            sertifikasyon.
          </p>

          <div className="flex items-center gap-2">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
            <a
              href="mailto:gurx@gurlabs.com"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 h-9 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <div className="lg:col-span-8 grid gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-900">
                {col.title}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 text-center sm:text-left">
          © {YEAR} GurLabs Foundation<span className="align-super text-[0.7em]">™</span> · GurX
          <span className="align-super text-[0.7em]">™</span> tescilli bir markadır.
        </p>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/kurallar#gizlilik" className="hover:text-slate-900 transition-colors">
              Gizlilik
            </Link>
            <Link to="/kurallar#kvkk" className="hover:text-slate-900 transition-colors">
              KVKK
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </footer>
);
