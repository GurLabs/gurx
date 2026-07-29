import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Section } from '../components/ui/Section';
import { Alert } from '../components/ui/Feedback';
import { StandalonePageSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../hooks/useSeo';
import { authErrorMessage } from '../lib/authErrors';

/**
 * Landing point for Google OAuth and e-mail confirmation redirects.
 * Supabase reports failures in the URL *hash* (and sometimes the query string),
 * so both are inspected before deciding where to send the user.
 */
export const AuthCallbackPage: React.FC = () => {
  const { ready, user } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const next = params.get('next') || '/dashboard';

  const authError = useMemo(() => {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const code = params.get('error_code') ?? hash.get('error_code');
    const description = params.get('error_description') ?? hash.get('error_description');
    if (!code && !description) return null;
    return { code, description: description?.replace(/\+/g, ' ') ?? null };
  }, [location.hash, params]);

  useSeo({ title: 'Giriş yapılıyor…', path: '/auth/callback', noindex: true });

  useEffect(() => {
    if (!ready || authError) return;
    navigate(user ? next : '/giris', { replace: true });
  }, [ready, user, next, authError, navigate]);

  if (authError) {
    const expired = authError.code === 'otp_expired';
    return (
      <Section className="!py-20">
        <div className="max-w-lg mx-auto gx-card p-8 sm:p-10 space-y-5 text-center">
          <h1 className="text-2xl sm:text-3xl font-serif text-slate-900">
            {expired ? 'Bağlantının süresi dolmuş' : 'Giriş tamamlanamadı'}
          </h1>

          <Alert tone="error" className="text-left">
            {expired
              ? 'E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş. Bağlantılar tek kullanımlıktır ve kısa süre sonra geçersiz olur.'
              : authErrorMessage(authError.description, 'Bilinmeyen bir hata oluştu.')}
          </Alert>

          <p className="text-sm text-slate-600">
            {expired
              ? 'Giriş sayfasından yeniden deneyin; yeni bir doğrulama e-postası gönderilecektir. Google ile giriş yaparsanız e-posta doğrulaması gerekmez.'
              : 'Lütfen tekrar giriş yapmayı deneyin.'}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/giris" className="gx-btn-primary">
              Giriş sayfasına dön
            </Link>
            <Link to="/kayit" className="gx-btn-ghost">
              Kayıt ol
            </Link>
          </div>
        </div>
      </Section>
    );
  }

  return <StandalonePageSkeleton />;
};
