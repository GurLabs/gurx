import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  MapPin,
  ScanLine,
} from 'lucide-react';
import { GurxMark, FoundationLogo } from '../components/ui/Logo';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {EmptyState} from '../components/ui/Feedback';
import { StandalonePageSkeleton } from '../components/ui/Skeleton';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import { fetchProfileCertificates, fetchProfileSubmissions, fetchPublicProfile } from '../lib/api';
import { awardMetaFor } from '../lib/certificate';
import { formatDate, initialsOf } from '../lib/format';
import { SITE_URL } from '../lib/brand';

/* Profile pages carry their own slim chrome, separate from the marketing site. */
const ProfileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <GurxMark className="h-6" />
          <span className="w-px h-5 bg-slate-200" aria-hidden />
          <FoundationLogo className="h-6" />
        </Link>
        <span className="text-xs font-semibold text-slate-500">Katılımcı Profili</span>
      </div>
    </header>

    <main className="flex-1 w-full max-w-4xl mx-auto px-5 py-10 sm:py-14">{children}</main>

    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>GurX™ Design Awards · GurLabs Foundation™</p>
        <div className="flex items-center gap-4">
          <Link to="/dogrula" className="hover:text-slate-900 transition-colors">
            Sertifika Doğrula
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  </div>
);

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  const { data: profile, loading } = useAsync(
    () => (username ? fetchPublicProfile(username) : Promise.resolve(null)),
    [username],
  );

  const { data: certificates } = useAsync(
    () => (profile ? fetchProfileCertificates(profile.id) : Promise.resolve([])),
    [profile?.id],
  );

  const { data: submissions } = useAsync(
    () => (profile ? fetchProfileSubmissions(profile.id) : Promise.resolve([])),
    [profile?.id],
  );

  useSeo({
    title: profile ? `${profile.full_name ?? profile.username} — GurX™` : 'Profil',
    description: profile?.bio ?? 'GurX™ Design Awards katılımcı profili.',
    path: `/u/${username}`,
    image: profile?.avatar_url ?? undefined,
  });

  if (loading) return <StandalonePageSkeleton />;

  if (!profile) {
    return (
      <ProfileShell>
        <EmptyState
          title="Profil bulunamadı"
          description={`"${username}" kullanıcı adına ait herkese açık bir profil yok. Profil kapalı olabilir.`}
          action={
            <Link to="/" className="gx-btn-primary">
              Ana sayfa
            </Link>
          }
        />
      </ProfileShell>
    );
  }

  const links = [
    { icon: Globe, href: profile.portfolio_url, label: 'Web sitesi' },
    { icon: Github, href: profile.github_url, label: 'GitHub' },
    { icon: Linkedin, href: profile.linkedin_url, label: 'LinkedIn' },
  ].filter((l) => Boolean(l.href));

  return (
    <ProfileShell>
      <div className="space-y-8">
        {/* Identity */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
            <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white grid place-items-center text-2xl font-bold overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                initialsOf(profile.full_name ?? profile.username)
              )}
            </div>

            <div className="min-w-0 space-y-2 flex-1">
              <div>
                <h1 className="text-3xl font-serif text-slate-900 leading-tight">
                  {profile.full_name ?? profile.username}
                </h1>
                <p className="font-mono text-sm text-slate-500">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {profile.country && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.country}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  Katılım: {formatDate(profile.created_at)}
                </span>
              </div>

              {links.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {links.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-900">
            Ödüller & sertifikalar
          </h2>

          {(certificates ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Henüz sertifika yok.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(certificates ?? []).map((cert) => {
                const meta = awardMetaFor(cert.award_type);
                return (
                  <Link
                    key={cert.id}
                    to={`/dogrula/${cert.code}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
                  >
                    <img src={meta.badge} alt="" className="h-14 w-auto object-contain shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${meta.accent}`}>{meta.name}</p>
                      <p className="font-mono text-xs text-slate-500">{cert.code}</p>
                      <p className="text-xs text-slate-500">{formatDate(cert.issued_at)}</p>
                    </div>
                    <ScanLine className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Projects */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-900">Projeler</h2>

          {(submissions ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Henüz yayınlanmış proje yok.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(submissions ?? []).map((s) => (
                <article
                  key={s.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                >
                  <img
                    src={s.hero_screenshot_url}
                    alt={s.title}
                    loading="lazy"
                    className="w-full aspect-video object-cover bg-slate-100"
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                    {s.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">{s.description}</p>
                    )}
                    <a
                      href={s.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gx-btn-ghost w-full !py-2 text-xs"
                    >
                      Projeyi aç
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="text-xs text-slate-400 text-center pt-2 break-all">
          {SITE_URL}/u/{profile.username}
        </p>
      </div>
    </ProfileShell>
  );
};
