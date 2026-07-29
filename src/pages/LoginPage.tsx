import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { AuthShell, AuthDivider, GitHubButton, GoogleButton } from '../components/auth/AuthShell';
import { Alert, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../hooks/useSeo';
import { authErrorMessage } from '../lib/authErrors';

export const LoginPage: React.FC = () => {
  const { user, ready, configured, signInWithPassword, signInWithProvider, sendPasswordReset } =
    useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get('error'));
  const [notice, setNotice] = useState<string | null>(null);

  useSeo({
    title: 'Giriş Yap — GurX™ Design Awards',
    description: 'GurX™ katılımcı hesabınıza giriş yapın.',
    path: '/giris',
    noindex: true,
  });

  if (ready && user) return <Navigate to={next} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await signInWithPassword(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err, 'Giriş yapılamadı.'));
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      await signInWithProvider(provider, next);
    } catch (err) {
      setError(authErrorMessage(err, `${provider} girişi başlatılamadı.`));
    }
  };

  const handleReset = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Sıfırlama bağlantısı için önce e-posta adresinizi yazın.');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setNotice('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sıfırlama e-postası gönderilemedi.');
    }
  };

  return (
    <AuthShell
      title="Giriş yap"
      subtitle="Katılımcı paneline, oylamaya ve sertifikalarınıza erişmek için giriş yapın."
      footer={
        <>
          Hesabınız yok mu?{' '}
          <Link to="/kayit" className="font-semibold text-slate-900 underline underline-offset-2">
            Kayıt olun
          </Link>
        </>
      }
    >
      {!configured && (
        <Alert tone="warning">
          Supabase anahtarları tanımlı olmadığı için giriş devre dışı. Kurulum tamamlandığında bu
          form çalışacaktır.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="space-y-2.5">
        <GoogleButton onClick={() => handleOAuth('google')} disabled={!configured || busy} />
        <GitHubButton onClick={() => handleOAuth('github')} disabled={!configured || busy} />
      </div>
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="gx-label">
            E-posta
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="gx-input"
            placeholder="ornek@eposta.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="gx-label !mb-0">
              Şifre
            </label>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Şifremi unuttum
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="gx-input"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={!configured || busy} className="gx-btn-primary w-full !py-3">
          {busy ? <Spinner className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          Giriş yap
        </button>
      </form>
    </AuthShell>
  );
};
