import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  HelpCircle,
  Home,
  LayoutDashboard,
  Search,
  Sparkles,
} from 'lucide-react';
import { Section } from '../components/ui/Section';
import { FoundationLogo, GurxMark } from '../components/ui/Logo';
import { useSeo } from '../hooks/useSeo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useSeo({
    title: '404 — Sayfa Bulunamadı | GurX™ Design Awards',
    description: 'Aradığınız sayfa GurX™ platformunda bulunamadı.',
    noindex: true,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    if (q.includes('sertifika') || q.includes('doğrula')) {
      navigate('/certificate/verify');
    } else if (q.includes('youth') || q.includes('genç')) {
      navigate('/youth-design');
    } else if (q.includes('panel') || q.includes('dashboard')) {
      navigate('/dashboard');
    } else if (q.includes('yardım') || q.includes('destek')) {
      navigate('/yardim');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-200">
      <Section className="flex-1 flex items-center justify-center !py-16 sm:!py-24">
        <div className="max-w-2xl mx-auto w-full text-center space-y-8 px-4">
          
          {/* Logo Lockup */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <GurxMark className="h-6" />
            <span className="w-px h-5 bg-slate-200 dark:bg-slate-800" aria-hidden />
            <FoundationLogo className="h-7" />
          </div>

          {/* Big Glowing 404 Hero */}
          <div className="relative select-none">
            <div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-emerald-500/20 blur-3xl opacity-50 dark:opacity-30 rounded-full"
              aria-hidden
            />
            <h1 className="gx-num text-8xl sm:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-400 dark:from-white dark:via-slate-200 dark:to-slate-600 drop-shadow-sm">
              404
            </h1>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold uppercase tracking-widest shadow-lg">
              Sayfa Bulunamadı
            </div>
          </div>

          {/* Subtitle & Message */}
          <div className="space-y-3 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-slate-900 dark:text-slate-100">
              Arama Rotanız Yanlış Adrese Düştü
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak erişilemiyor olabilir. Aşağıdaki hızlı arama ve bağlantılardan devam edebilirsiniz.
            </p>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Aramak istediğiniz başlık (ör. sertifika, youth design...)"
              className="gx-input pr-12 text-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              aria-label="Ara"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center hover:opacity-90 transition-opacity"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Action Grid / Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-4 max-w-xl mx-auto">
            <Link
              to="/"
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 grid place-items-center mb-3 group-hover:scale-110 transition-transform">
                <Home className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Ana Sayfa</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">GurX™ vitrinine dönün</p>
            </Link>

            <Link
              to="/youth-design"
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 grid place-items-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Youth Design '26</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Özel kategori & kurallar</p>
            </Link>

            <Link
              to="/certificate/verify"
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-3 group-hover:scale-110 transition-transform">
                <FileCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Sertifika Doğrula</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Resmî sorgulama ekranı</p>
            </Link>
          </div>

          {/* Back Button & Direct Navigation */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="gx-btn-ghost dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Önceki Sayfaya Dön
            </button>

            <Link
              to="/dashboard"
              className="gx-btn-primary dark:bg-white dark:text-slate-900"
            >
              <LayoutDashboard className="w-4 h-4" />
              Yarışma Paneli
            </Link>

            <Link
              to="/yardim"
              className="gx-btn-ghost dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
            >
              <HelpCircle className="w-4 h-4" />
              Yardım & Destek
            </Link>
          </div>

        </div>
      </Section>
    </div>
  );
};
