import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MarketingPageSkeleton } from '../ui/Skeleton';
import { Header } from './Header';
import { Footer } from './Footer';
import { AmbientBackground } from '../ui/AmbientBackground';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../ui/Feedback';

/** Scrolls to top on navigation, or to the #hash target when there is one. */
const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

export const Layout: React.FC = () => {
  const { configured } = useAuth();

  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-x-hidden">
      <AmbientBackground />
      <ScrollManager />
      <Header />

      {/* The header is fixed, so content starts below its resting height. */}
      <div className="h-16 sm:h-20" aria-hidden />

      {!configured && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert tone="warning">
            <strong>Kurulum bekleniyor:</strong> Supabase anahtarları tanımlı değil. Herkese açık
            sayfalar örnek içerikle çalışır; giriş, kayıt, oylama ve panel işlemleri için proje
            köküne <code className="font-mono">.env</code> dosyası ekleyip{' '}
            <code className="font-mono">VITE_SUPABASE_URL</code> ve{' '}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> değerlerini girin.
          </Alert>
        </div>
      )}

      {/* Header and footer are already painted; only the page body suspends. */}
      <main className="flex-1 relative z-10">
        <Suspense fallback={<MarketingPageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};
