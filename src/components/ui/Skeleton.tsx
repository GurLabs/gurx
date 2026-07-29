import React from 'react';

/**
 * Yükleme sırasında boş ekran yerine sayfanın iskeleti gösterilir.
 * Amaç, kullanıcının bakacağı yerin daha veri gelmeden yerleşmiş olması:
 * içerik geldiğinde düzen zıplamaz.
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} aria-hidden />
);

/** Ekran okuyucular için tek bir "yükleniyor" bildirimi. */
const Announce: React.FC<{ label?: string }> = ({ label = 'İçerik yükleniyor' }) => (
  <span className="sr-only" role="status" aria-live="polite">
    {label}
  </span>
);

export const TextLines: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ media?: boolean }> = ({ media = false }) => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    {media && <Skeleton className="w-full aspect-video rounded-none" />}
    <div className="p-6 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <TextLines lines={2} />
    </div>
  </div>
);

export const CardGridSkeleton: React.FC<{ count?: number; media?: boolean; cols?: string }> = ({
  count = 4,
  media = false,
  cols = 'sm:grid-cols-2',
}) => (
  <div className={`grid gap-4 ${cols}`}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} media={media} />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
      <Skeleton className="h-3 w-40" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-4">
          <Skeleton className="h-3.5 w-8 shrink-0" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-24 hidden sm:block" />
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Sayfa iskeletleri                                                   */

/** Konsol içeriği: başlık bloğu + bölümler. Sol menü zaten basılmıştır. */
export const ConsolePageSkeleton: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex">
    <div className="flex-1 min-w-0 px-5 sm:px-10 lg:px-14 py-10 lg:py-14 max-w-4xl">
      <Announce label={label} />
      <div className="space-y-3 mb-9">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-10 w-2/3" />
        <TextLines lines={2} className="max-w-xl" />
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <CardGridSkeleton count={2} />
        </div>
      </div>
    </div>

    <aside className="hidden xl:block w-64 shrink-0 py-14 pr-10">
      <div className="sticky top-28 space-y-3">
        <Skeleton className="h-3 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </aside>
  </div>
);

/** Sol menü henüz yarışma listesini beklerken kullanılır. */
export const ConsoleNavSkeleton: React.FC = () => (
  <div className="px-3 py-4 space-y-6">
    {Array.from({ length: 3 }).map((_, section) => (
      <div key={section} className="space-y-2">
        <Skeleton className="h-3 w-24 mx-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2">
            <Skeleton className="h-4 w-4 rounded shrink-0" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

/**
 * Konsolun tamamı: üst bar + sol menü + içerik.
 * Oturum/yetki kontrolü sürerken kullanılır, böylece kontrol bitince
 * ekranda yalnızca iskelet gerçek içerikle değişir.
 */
export const ConsoleShellSkeleton: React.FC<{ label?: string }> = ({ label }) => (
  <div className="min-h-screen bg-white">
    <header className="h-16 border-b border-slate-200 flex items-center gap-4 px-4 sm:px-6">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-7 w-7 rounded" />
      <div className="flex-1" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-lg" />
    </header>

    <div className="flex">
      <aside className="hidden lg:block w-[268px] shrink-0 border-r border-slate-200 h-[calc(100vh-4rem)]">
        <div className="p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <ConsoleNavSkeleton />
      </aside>
      <main className="flex-1 min-w-0">
        <ConsolePageSkeleton label={label} />
      </main>
    </div>
  </div>
);

/** Tanıtım sitesi: hero + kart ızgarası. */
export const MarketingPageSkeleton: React.FC = () => (
  <>
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-4">
      <Announce label="Sayfa yükleniyor" />
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-7 w-56 rounded-full" />
          <Skeleton className="h-14 w-full max-w-xl" />
          <Skeleton className="h-14 w-3/4 max-w-lg" />
          <TextLines lines={2} className="max-w-2xl pt-2" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-40 rounded-full" />
          </div>
        </div>
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <Skeleton className="col-span-2 h-44 sm:h-52 rounded-3xl" />
          <Skeleton className="h-32 sm:h-40 rounded-3xl" />
          <Skeleton className="h-32 sm:h-40 rounded-3xl" />
        </div>
      </div>
    </section>

    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
      <Skeleton className="h-8 w-72" />
      <CardGridSkeleton count={3} media cols="md:grid-cols-3" />
    </section>
  </>
);

/** Kendi kabuğu olan sayfalar (doğrulama, profil, sertifika). */
export const StandalonePageSkeleton: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Announce />
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </header>
    <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-10 sm:py-14 space-y-6">
      <Skeleton className="h-9 w-64" />
      <TextLines lines={2} className="max-w-lg" />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </main>
  </div>
);
