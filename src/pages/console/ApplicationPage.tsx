import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, Send } from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import { useCompetition } from '../../components/console/CompetitionLayout';
import { Alert, Spinner } from '../../components/ui/Feedback';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import { fetchMyApplication, submitApplication } from '../../lib/api';
import { ageFromBirthYear, isValidHttpUrl } from '../../lib/format';
import type { ReferenceType } from '../../types';

const REFERENCE_TYPES: { value: ReferenceType; label: string }[] = [
  { value: 'portfolio', label: 'Kendi web sitem' },
  { value: 'linkedin', label: 'LinkedIn profilim' },
  { value: 'github', label: 'GitHub profilim' },
];

export const ApplicationPage: React.FC = () => {
  const { competition } = useCompetition();
  const { user, profile, updateProfile } = useAuth();
  const currentYear = new Date().getFullYear();

  useSeo({ title: `${competition.title} — Başvurum`, noindex: true });

  const { data: existing, loading, reload } = useAsync(
    () => (user ? fetchMyApplication(user.id, competition.id) : Promise.resolve(null)),
    [user?.id, competition.id],
  );

  const [birthYear, setBirthYear] = useState('');
  const [vibeUrl, setVibeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioType, setPortfolioType] = useState<ReferenceType>('portfolio');
  const [guardian, setGuardian] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [aiStudioAccepted, setAiStudioAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setBirthYear(String(existing.birth_year));
    setVibeUrl(existing.reference_design_url);
    setPortfolioUrl(existing.portfolio_url ?? '');
    setPortfolioType(existing.reference_type);
    setGuardian(existing.guardian_consent);
    setRulesAccepted(true);
    setAiStudioAccepted(true);
  }, [existing]);

  const fullName = profile?.full_name ?? '';
  const email = profile?.email ?? user?.email ?? '';

  const age = useMemo(() => {
    const y = Number(birthYear);
    if (!y || birthYear.length !== 4) return null;
    return ageFromBirthYear(y, currentYear);
  }, [birthYear, currentYear]);

  const needsGuardian = age !== null && age <= competition.min_age;
  const tooOld = age !== null && age > competition.max_age;
  const tooYoung = age !== null && age < competition.min_age;

  const registrationClosed = competition.registration_closes_at
    ? Date.now() > new Date(competition.registration_closes_at).getTime()
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;

    if (!fullName.trim() || !email.trim()) {
      setError('Ad soyad ve e-posta bilgisi eksik. Profilinizden tamamlayın.');
      return;
    }
    if (age === null) {
      setError('Doğum yılınızı 4 haneli olarak girin.');
      return;
    }
    if (tooOld) {
      setError(
        `Bu yarışmaya ${competition.max_age + 1} yaşından küçük katılımcılar başvurabilir. Girdiğiniz doğum yılına göre yaşınız ${age}.`,
      );
      return;
    }
    if (tooYoung) {
      setError(`Bu yarışmanın alt yaş sınırı ${competition.min_age}’tir.`);
      return;
    }
    if (needsGuardian && !guardian) {
      setError('15 yaş ve altı katılımcılar için veli izni onayı zorunludur.');
      return;
    }
    if (!rulesAccepted || !aiStudioAccepted) {
      setError('Devam etmek için her iki onay kutusunu da işaretlemelisiniz.');
      return;
    }

    setBusy(true);
    try {
      await submitApplication({
        user_id: user.id,
        competition_id: competition.id,
        full_name: fullName.trim(),
        email: email.trim(),
        birth_year: Number(birthYear),
        guardian_consent: guardian,
        reference_design_url: vibeUrl.trim() || 'https://gurx.gurlabs.com',
        reference_type: portfolioType,
        portfolio_url: portfolioUrl.trim() || null,
      });
      if (profile && profile.birth_year !== Number(birthYear)) {
        await updateProfile({ birth_year: Number(birthYear) });
      }
      setDone(true);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru gönderilemedi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Başvurum"
      description="Bilgiler sertifikanızda kullanılacağı için dikkatle doldurun. Ad soyad ve e-posta kayıt bilgilerinizden gelir ve değiştirilemez."
      toc={[
        { id: 'kimlik', label: 'Kimlik bilgileri' },
        { id: 'referanslar', label: 'Referanslar' },
        { id: 'onaylar', label: 'Onaylar' },
      ]}
    >
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner className="w-4 h-4" /> Başvurunuz kontrol ediliyor…
        </div>
      )}
      {done && (
        <Alert tone="success">
          Başvurunuz kaydedildi. Onay durumunu Genel Bakış sayfasından takip edebilirsiniz.
        </Alert>
      )}
      {registrationClosed && (
        <Alert tone="warning">
          Başvuru süresi kapandı. Mevcut başvurunuzu görüntüleyebilir ancak değiştiremezsiniz.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-10">
        <ConsoleSection id="kimlik" title="Kimlik bilgileri">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ap-name" className="gx-label">
                Ad Soyad <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="ap-name"
                  readOnly
                  value={fullName}
                  className="gx-input bg-slate-50 pr-10 cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Kayıt bilgilerinizden alınır.</p>
            </div>

            <div>
              <label htmlFor="ap-email" className="gx-label">
                E-posta <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="ap-email"
                  readOnly
                  value={email}
                  className="gx-input bg-slate-50 pr-10 cursor-not-allowed"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Kayıt bilgilerinizden alınır.</p>
            </div>
          </div>

          {!fullName && (
            <Alert tone="warning">
              Profilinizde ad soyad bilgisi yok.{' '}
              <Link to="/dashboard/profil" className="underline font-semibold">
                Profilinizden ekleyin
              </Link>
              .
            </Alert>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ap-year" className="gx-label">
                Doğum yılı <span className="text-rose-500">*</span>
              </label>
              <input
                id="ap-year"
                inputMode="numeric"
                maxLength={4}
                required
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="gx-input"
                placeholder="2008"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Katılımcılar {competition.max_age + 1} yaşından küçük ve en az {competition.min_age}{' '}
                yaşında olmalıdır.
              </p>
            </div>

            <div className="flex items-end">
              <div
                className={`w-full rounded-2xl border px-4 py-3 text-sm ${
                  age === null
                    ? 'bg-slate-50 border-slate-200 text-slate-500'
                    : tooOld || tooYoung
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                {age === null
                  ? 'Yaşınız doğum yılına göre hesaplanır.'
                  : tooOld
                    ? `Yaşınız ${age} — üst sınır ${competition.max_age}.`
                    : tooYoung
                      ? `Yaşınız ${age} — alt sınır ${competition.min_age}.`
                      : `Yaşınız ${age} — yaş koşulunu sağlıyorsunuz.`}
              </div>
            </div>
          </div>

          {needsGuardian && (
            <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <input
                type="checkbox"
                checked={guardian}
                onChange={(e) => setGuardian(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900"
              />
              <span>
                <strong>Velimin izin verdiğini doğruluyorum.</strong>
                <br />
                <span className="text-xs text-amber-800">
                  {competition.min_age} yaşında veya daha küçük katılımcılar için bu onay zorunludur.
                </span>
              </span>
            </label>
          )}
        </ConsoleSection>

        <ConsoleSection id="onaylar" title="Onaylar">
          <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900"
            />
            <span>
              <Link
                to={`/dashboard/yarismalar/${competition.slug}/kurallar`}
                className="font-semibold text-slate-900 underline underline-offset-2"
              >
                Kurallar ve Şartlar
              </Link>
              ’ı okudum, kabul ediyorum.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={aiStudioAccepted}
              onChange={(e) => setAiStudioAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900"
            />
            <span>
              Projemi <strong className="text-slate-900">aistudio.google.com</strong> üzerinde Vibe
              Coding ile tasarlayacağımı kabul ediyorum.
            </span>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kontrol listesi
            </p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              {[
                'Ad soyad ve e-posta kayıt bilgilerinizden gelir',
                'Doğum yılı zorunludur ve yaş kontrolü yapılır',
                '15 yaş ve altı için veli izni onayı gerekir',
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={busy || registrationClosed}
            className="gx-btn-primary !py-3 w-full sm:w-auto"
          >
            {busy ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {existing ? 'Başvurumu güncelle' : 'Başvuruyu gönder'}
          </button>
        </ConsoleSection>
      </form>
    </ConsolePage>
  );
};
