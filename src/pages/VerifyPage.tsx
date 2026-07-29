import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Search,
  ShieldX,
  UserRound,
} from 'lucide-react';
import { Turnstile, isTurnstileEnabled } from '../components/ui/Turnstile';
import { FoundationLogo, GurxMark } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Feedback';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import { fetchCertificateByCode } from '../lib/api';
import {
  awardMetaFor,
  certificateVerifyUrl,
  eventNameFor,
  parseCertificateCode,
  qrImageUrl,
} from '../lib/certificate';
import { formatDate } from '../lib/format';

/* ------------------------------------------------------------------ */
/* Standalone chrome — deliberately plainer than the marketing site.   */

const VerifyShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GurxMark className="h-6" />
          <span className="w-px h-5 bg-slate-200" aria-hidden />
          <FoundationLogo className="h-6" />
        </div>

        <span className="text-xs font-semibold text-slate-500">Sertifika Doğrulama Servisi</span>
      </div>
    </header>

    <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-10 sm:py-14">{children}</main>

    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-3xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>
          Bu servis GurLabs Foundation<span className="align-super text-[0.8em]">™</span> tarafından
          işletilir.
        </p>
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          gurx.gurlabs.com
        </Link>
      </div>
    </footer>
  </div>
);

/* ------------------------------------------------------------------ */

const CodeForm: React.FC<{ initial?: string; autoFocus?: boolean }> = ({
  initial = '',
  autoFocus,
}) => {
  const [code, setCode] = useState(initial);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const blocked = isTurnstileEnabled && !token;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (blocked) return;
        const value = code.trim().toUpperCase();
        if (value) navigate(`/dogrula/${value}`);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="verify-code" className="block text-sm font-semibold text-slate-700 mb-2">
          Sertifika kodu
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            id="verify-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="GYD-26-0001-01"
            autoComplete="off"
            autoFocus={autoFocus}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-base uppercase tracking-wider text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/5"
          />
          <button
            type="submit"
            disabled={blocked}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            Doğrula
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Kodu sertifikanın alt kısmında veya rozetin QR bağlantısında bulabilirsiniz.
        </p>
      </div>

      <Turnstile onVerify={setToken} onExpire={() => setToken(null)} />
    </form>
  );
};

/* ------------------------------------------------------------------ */

export const VerifyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  useSeo({
    title: code ? `Sertifika Doğrulama · ${code}` : 'Sertifika Doğrulama',
    description:
      'GurX™ sertifikalarını benzersiz kodla doğrulayın: sahibi, ödül türü ve veriliş tarihi.',
    path: code ? `/dogrula/${code}` : '/dogrula',
  });

  const { data: certificate, loading } = useAsync(
    () => (code ? fetchCertificateByCode(code) : Promise.resolve(null)),
    [code],
  );

  /* ---------- entry screen ---------- */
  if (!code) {
    return (
      <VerifyShell>
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif text-slate-900">Sertifika doğrulama</h1>
            <p className="text-slate-600">
              Kodu girin; sertifikanın sahibi, ödül türü ve veriliş tarihi görüntülensin.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <CodeForm autoFocus />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Kod nasıl okunur?</h2>
            <p className="font-mono text-xl text-slate-900 mb-4 tracking-wider">GYD-26-0001-01</p>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                ['GYD', 'Etkinlik'],
                ['26', 'Yıl'],
                ['0001', 'Katılımcı ID'],
                ['01', 'Belge türü'],
              ].map(([part, meaning]) => (
                <div key={part}>
                  <dt className="font-mono font-bold text-slate-900">{part}</dt>
                  <dd className="text-slate-500 text-xs mt-0.5">{meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </VerifyShell>
    );
  }

  /* ---------- result screen ---------- */
  if (loading) {
    return (
      <VerifyShell>
        <div className="flex items-center gap-3 text-slate-500 py-20 justify-center">
          <Spinner />
          Sertifika sorgulanıyor…
        </div>
      </VerifyShell>
    );
  }

  const parsed = parseCertificateCode(code);
  const valid = Boolean(certificate) && !certificate?.revoked && parsed.valid;
  const meta = certificate ? awardMetaFor(certificate.award_type) : null;
  const verifyUrl = certificateVerifyUrl(code);

  return (
    <VerifyShell>
      <div className="space-y-6">
        {/* Verdict */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 flex items-center gap-5 ${
            valid ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full grid place-items-center shrink-0 ${
              valid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {valid ? <BadgeCheck className="w-8 h-8" /> : <ShieldX className="w-7 h-7" />}
          </div>
          <div className="min-w-0">
            <p
              className={`text-xl sm:text-2xl font-semibold tracking-tight ${
                valid ? 'text-emerald-800' : 'text-rose-800'
              }`}
            >
              {valid
                ? 'Geçerli sertifika'
                : certificate?.revoked
                  ? 'İptal edilmiş sertifika'
                  : 'Sertifika bulunamadı'}
            </p>
            <p className="font-mono text-sm text-slate-600 mt-0.5 tracking-wider">
              {code.toUpperCase()}
            </p>
          </div>
        </div>

        {!valid && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
            <p className="text-sm text-slate-600">
              {certificate?.revoked
                ? 'Bu sertifika kural ihlali nedeniyle iptal edilmiştir ve geçerli değildir.'
                : parsed.valid
                  ? 'Bu koda ait bir kayıt bulunamadı. Kodu doğru yazdığınızdan emin olun.'
                  : 'Girilen kod GurX™ kod biçimine uymuyor. Beklenen biçim: GYD-26-0001-01'}
            </p>
            <CodeForm initial={code} />
          </div>
        )}

        {/* Detail */}
        {certificate && meta && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-6 sm:px-8 py-4 border-b border-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">Sertifika bilgileri</h2>
              </div>

              <dl className="divide-y divide-slate-100">
                {[
                  { icon: UserRound, label: 'Sertifika sahibi', value: certificate.recipient_name },
                  { icon: BadgeCheck, label: 'Ödül / belge türü', value: meta.name },
                  {
                    icon: CalendarDays,
                    label: 'Veriliş tarihi',
                    value: formatDate(certificate.issued_at),
                  },
                  { icon: Building2, label: 'Düzenleyen', value: certificate.issuer },
                  {
                    icon: FileText,
                    label: 'Etkinlik',
                    value: `${eventNameFor(certificate.event_code)} ${parsed.year || ''}`.trim(),
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6"
                  >
                    <dt className="flex items-center gap-2 text-sm text-slate-500 sm:w-52 shrink-0">
                      <Icon className="w-4 h-4" />
                      {label}
                    </dt>
                    <dd className="text-base font-semibold text-slate-900 break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <img
                  src={meta.badge}
                  alt={`${meta.name} rozeti`}
                  width={120}
                  height={120}
                  className="h-24 w-auto object-contain mx-auto"
                />
                <p className="text-xs text-slate-500 mt-3">Bu belgeye ait rozet</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <img
                  src={qrImageUrl(verifyUrl, 160)}
                  alt="Doğrulama QR kodu"
                  width={112}
                  height={112}
                  loading="lazy"
                  className="w-28 h-28 mx-auto rounded-lg bg-white p-1.5 border border-slate-200"
                />
                <p className="text-xs text-slate-500 mt-3 break-all">{verifyUrl}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Başka bir kod doğrula</h2>
              <CodeForm />
            </div>
          </>
        )}
      </div>
    </VerifyShell>
  );
};
