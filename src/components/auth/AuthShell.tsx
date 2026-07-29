import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Github, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Full-page auth layout — deliberately a route, never an overlay. */
export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer }) => (
  <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <div className="grid gap-6 lg:grid-cols-12 items-stretch">
      {/* Form side */}
      <div className="lg:col-span-6 xl:col-span-5">
        <div className="gx-card p-7 sm:p-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 leading-tight">{title}</h1>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
          {children}
          {footer ? <div className="pt-1 text-sm text-slate-600">{footer}</div> : null}
        </div>
      </div>

      {/* Marketing side */}
      <aside className="lg:col-span-6 xl:col-span-7">
        <div className="gx-card h-full overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1400&auto=format&fit=crop"
            alt="Tasarım üzerinde çalışan genç ekip"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/20" />

          <div className="relative h-full flex flex-col justify-end p-8 sm:p-10 text-white space-y-6 min-h-[420px]">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              GurX Youth Design 2026 başvuruları açık
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif leading-tight">
              Hesabınız, yarışma paneliniz ve sertifikalarınız tek yerde
            </h2>

            <ul className="space-y-2.5 text-sm text-white/80">
              {[
                'Yarışma duyuruları ve konu açıklaması panelinizde',
                'Sonuç linkinizi buradan gönderirsiniz',
                'Sertifika ve rozetlerinizi buradan indirirsiniz',
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <BadgeCheck className="w-4.5 h-4.5 text-emerald-300 shrink-0 mt-0.5" />
                  {line}
                </li>
              ))}
            </ul>

            <p className="text-xs text-white/60 flex items-center gap-2 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <Link to="/kurallar" className="underline hover:text-white">
                Kurallar & Şartlar
              </Link>
            </p>
          </div>
        </div>
      </aside>
    </div>
  </section>
);

export const GitHubButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}> = ({ onClick, disabled, label = 'GitHub ile devam et' }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="gx-btn-ghost w-full !py-3">
    <Github className="w-4.5 h-4.5" />
    {label}
  </button>
);

export const GoogleButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}> = ({ onClick, disabled, label = 'Google ile devam et' }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="gx-btn-ghost w-full !py-3">
    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.56Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.98A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6V7.12H1.76a12 12 0 0 0 0 10.76L5.6 14.7Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.2 15.1 0 12 0 7.3 0 3.25 2.7 1.76 7.12L5.6 10.1C6.5 7.39 9.02 4.77 12 4.77Z"
      />
    </svg>
    {label}
  </button>
);

export const AuthDivider: React.FC<{ label?: string }> = ({ label = 'veya e-posta ile' }) => (
  <div className="flex items-center gap-3">
    <span className="flex-1 h-px bg-slate-200" />
    <span className="text-xs text-slate-400 font-medium">{label}</span>
    <span className="flex-1 h-px bg-slate-200" />
  </div>
);
