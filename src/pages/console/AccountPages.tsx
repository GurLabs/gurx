import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Download,
  ExternalLink,
  FileBadge,
  Github,
  Globe,
  Linkedin,
  Save,
  ScanLine,
  Search,
} from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import {Alert, EmptyState, Spinner} from '../../components/ui/Feedback';
import { CardGridSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import { fetchMyCertificates } from '../../lib/api';
import { awardMetaFor } from '../../lib/certificate';
import { formatDate, initialsOf } from '../../lib/format';
import { PARTICIPANT_AWARD_LIST } from '../../lib/brand';
import type { Certificate } from '../../types';

/* ------------------------------------------------------------------ */

export const ConsoleAwardsPage: React.FC<{ competitionId?: string; eyebrow?: string }> = ({
  competitionId,
  eyebrow = 'Hesabım',
}) => {
  const { user } = useAuth();
  useSeo({ title: 'Ödüllerim — Katılımcı Paneli', noindex: true });

  const { data, loading, error } = useAsync<Certificate[]>(
    () => (user ? fetchMyCertificates(user.id) : Promise.resolve([])),
    [user?.id],
  );

  const certificates = (data ?? []).filter(
    (c) => !competitionId || c.competition_id === competitionId,
  );

  return (
    <ConsolePage
      eyebrow={eyebrow}
      title="Ödüllerim"
      description="Sertifikalarınızı PDF olarak indirin, rozetlerinizi portfolyonuzda ve GitHub profilinizde kullanın."
      toc={[
        { id: 'sertifikalarim', label: 'Sertifikalarım' },
        { id: 'odul-turleri', label: 'Ödül türleri' },
      ]}
    >
      <ConsoleSection id="sertifikalarim" title="Sertifikalarım">
        {loading ? (
          <CardGridSkeleton count={2} />
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={<Award className="w-6 h-6" />}
            title="Henüz sertifikanız yok"
            description="Sertifikalar sonuçlar açıklandıktan sonra burada görünür. Katılım sertifikası, projesini süresi içinde teslim eden tüm katılımcılara verilir."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((cert) => {
              const meta = awardMetaFor(cert.award_type);
              return (
                <article
                  key={cert.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
                >
                  <div className="flex items-start gap-5">
                    <img
                      src={meta.badge}
                      alt={`${meta.name} rozeti`}
                      width={80}
                      height={80}
                      className="h-20 w-auto object-contain shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <h3 className={`font-semibold ${meta.accent}`}>{meta.name}</h3>
                      <p className="text-sm text-slate-600">{cert.recipient_name}</p>
                      <p className="text-xs text-slate-500">Veriliş: {formatDate(cert.issued_at)}</p>
                      <p className="font-mono text-xs text-slate-900 pt-1">{cert.code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Link to={`/certificate/${cert.code}/belge`} className="gx-btn-primary w-full">
                      <Download className="w-4 h-4" />
                      PDF
                    </Link>
                    <a href={meta.badge} download className="gx-btn-ghost w-full">
                      <FileBadge className="w-4 h-4" />
                      Rozet
                    </a>
                    <Link
                      to={`/certificate/verify/${cert.code}`}
                      className="gx-btn-ghost w-full col-span-2"
                    >
                      <ScanLine className="w-4 h-4" />
                      Doğrulama sayfası
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </ConsoleSection>

      <ConsoleSection
        id="odul-turleri"
        title="Ödül türleri"
        description="Her ödülün sertifika kodunda kendi türü vardır."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PARTICIPANT_AWARD_LIST.map((a) => (
            <div
              key={a.code}
              className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4"
            >
              <img src={a.badge} alt="" className="h-12 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <p className="font-mono text-[0.65rem] text-slate-400">{a.code}</p>
                <p className={`text-sm font-semibold ${a.accent}`}>{a.name}</p>
              </div>
            </div>
          ))}
        </div>
      </ConsoleSection>
    </ConsolePage>
  );
};

/* ------------------------------------------------------------------ */

export const ConsoleCertificateLookupPage: React.FC = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  useSeo({ title: 'Sertifika Sorgula — Panel', noindex: true });

  return (
    <ConsolePage
      eyebrow="Hesabım"
      title="Sertifika Sorgula"
      description="Herhangi bir GurX™ sertifikasının gerçek olup olmadığını kodla doğrulayın."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = code.trim().toUpperCase();
          if (v) navigate(`/certificate/verify/${v}`);
        }}
        className="flex flex-col sm:flex-row gap-2.5 max-w-xl"
      >
        <label htmlFor="lookup-code" className="sr-only">
          Sertifika kodu
        </label>
        <input
          id="lookup-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="GYD-26-0001-01"
          autoComplete="off"
          className="gx-input font-mono uppercase"
        />
        <button type="submit" className="gx-btn-primary shrink-0">
          <Search className="w-4 h-4" />
          Doğrula
        </button>
      </form>

      <ConsoleSection id="kod-yapisi" title="Kod yapısı">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
          <p className="font-mono text-lg text-slate-900">GYD-26-0001-01</p>
          <ul className="text-sm text-slate-600 space-y-1.5">
            <li>
              <strong className="font-mono text-slate-900">GYD</strong> — Etkinlik kodu (GurX Youth
              Design)
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
      </ConsoleSection>
    </ConsolePage>
  );
};

/* ConsoleProfilePage artık ProfileSettingsPage.tsx dosyasındadır. */
