import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { AuthShell, AuthDivider, GitHubButton, GoogleButton } from '../components/auth/AuthShell';
import { Alert, Spinner } from '../components/ui/Feedback';
import { Turnstile, isTurnstileEnabled } from '../components/ui/Turnstile';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../hooks/useSeo';
import { authErrorMessage } from '../lib/authErrors';

export const RegisterPage: React.FC = () => {
  const { user, ready, configured, signUpWithPassword, signInWithProvider } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get('next') || '/dashboard';
  const referral = params.get('ref');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useSeo({
    title: 'Kayıt Ol — GurX™ Design Awards',
    description:
      'GurX Youth Design 2026 başvurusu için ücretsiz katılımcı hesabı oluşturun. Google ile veya e-posta ile kayıt olabilirsiniz.',
    path: '/kayit',
    noindex: true,
  });

  if (ready && user) return <Navigate to={next} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (fullName.trim().split(/\s+/).length < 2) {
      setError('Lütfen ad ve soyadınızı birlikte yazın. Sertifikanız bu isimle düzenlenecek.');
      return;
    }
    if (password.length < 8) {
      setError('Şifreniz en az 8 karakter olmalıdır.');
      return;
    }
    if (password !== password2) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!accepted) {
      setError('Devam etmek için Kurallar ve Şartlar’ı kabul etmelisiniz.');
      return;
    }
    if (isTurnstileEnabled && !captchaToken) {
      setError('Devam etmeden önce “insan olduğumu doğrula” adımını tamamlayın.');
      return;
    }

    setBusy(true);
    try {
      const { needsEmailConfirm } = await signUpWithPassword({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        referredBy: referral,
        captchaToken,
      });

      if (needsEmailConfirm) {
        setNotice(
          'Hesabınız oluşturuldu. E-posta adresinize gönderilen doğrulama bağlantısına tıklayarak girişi tamamlayın.',
        );
      } else {
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError(authErrorMessage(err, 'Kayıt tamamlanamadı.'));
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      await signInWithProvider(provider, next);
    } catch (err) {
      setError(authErrorMessage(err, `${provider} kaydı başlatılamadı.`));
    }
  };

  return (
    <AuthShell
      title="Kayıt ol"
      subtitle="Başvuru yapabilmek için ücretsiz bir katılımcı hesabı oluşturun. Yaş ve veli izni bilgileri başvuru formunda sorulur."
      footer={
        <>
          Zaten hesabınız var mı?{' '}
          <Link to="/giris" className="font-semibold text-slate-900 underline underline-offset-2">
            Giriş yapın
          </Link>
        </>
      }
    >
      {!configured && (
        <Alert tone="warning">
          Supabase anahtarları tanımlı olmadığı için kayıt devre dışı. Kurulum tamamlandığında bu
          form çalışacaktır.
        </Alert>
      )}
      {referral && (
        <Alert tone="info">
          Referans kodu ile geldiniz: <strong className="font-mono">{referral}</strong>
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="space-y-2.5">
        <GoogleButton
          onClick={() => handleOAuth('google')}
          disabled={!configured || busy}
          label="Google ile kayıt ol"
        />
        <GitHubButton
          onClick={() => handleOAuth('github')}
          disabled={!configured || busy}
          label="GitHub ile kayıt ol"
        />
      </div>
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="gx-label">
            Ad Soyad <span className="text-rose-500">*</span>
          </label>
          <input
            id="reg-name"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="gx-input"
            placeholder="Ad Soyad"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Sertifikanız bu isimle düzenlenir; sonradan değiştirilemez.
          </p>
        </div>

        <div>
          <label htmlFor="reg-email" className="gx-label">
            E-posta <span className="text-rose-500">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="gx-input"
            placeholder="ornek@eposta.com"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-pass" className="gx-label">
              Şifre <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-pass"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gx-input"
              placeholder="En az 8 karakter"
            />
          </div>
          <div>
            <label htmlFor="reg-pass2" className="gx-label">
              Şifre (tekrar) <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-pass2"
              type="password"
              required
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="gx-input"
              placeholder="••••••••"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
          />
          <span>
            <Link
              to="/kurallar"
              className="font-semibold text-slate-900 underline underline-offset-2"
            >
              Kurallar ve Şartlar
            </Link>
            ’ı okudum ve kabul ediyorum.
          </span>
        </label>

        <Turnstile onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

        <button type="submit" disabled={!configured || busy} className="gx-btn-primary w-full !py-3">
          {busy ? <Spinner className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          Hesabımı oluştur
        </button>
      </form>
    </AuthShell>
  );
};
