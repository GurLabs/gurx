import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Eye, EyeOff, Github, Globe, Linkedin, Save } from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import { AvatarUpload } from '../../components/ui/AvatarUpload';
import { Alert, Spinner } from '../../components/ui/Feedback';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { SITE_URL } from '../../lib/brand';

const USERNAME_RE = /^[a-z0-9_-]{3,30}$/;

export const ProfileSettingsPage: React.FC = () => {
  const { user, profile, updateProfile, refreshProfile, role, configured } = useAuth();
  useSeo({ title: 'Profilim — Katılımcı Paneli', noindex: true });

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setUsername(profile.username ?? '');
    setBio(profile.bio ?? '');
    setEmail(profile.email ?? user?.email ?? '');
    setCountry(profile.country ?? '');
    setPortfolio(profile.portfolio_url ?? '');
    setGithub(profile.github_url ?? '');
    setLinkedin(profile.linkedin_url ?? '');
    setIsPublic(profile.is_public ?? true);
  }, [profile, user?.email]);

  const emailMissing = !(profile?.email ?? user?.email ?? '').trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (emailMissing && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    const handle = username.trim().toLowerCase();
    if (handle && !USERNAME_RE.test(handle)) {
      setError(
        'Kullanıcı adı 3–30 karakter olmalı ve yalnızca küçük harf, rakam, tire veya alt tire içermelidir.',
      );
      return;
    }

    setBusy(true);
    try {
      await updateProfile({
        ...(emailMissing ? { email: email.trim() } : {}),
        full_name: fullName.trim() || null,
        username: handle || null,
        bio: bio.trim() || null,
        country: country.trim() || null,
        portfolio_url: portfolio.trim() || null,
        github_url: github.trim() || null,
        linkedin_url: linkedin.trim() || null,
        is_public: isPublic,
      });
      setSaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profil güncellenemedi.';
      setError(
        /duplicate key|unique/i.test(message)
          ? 'Bu kullanıcı adı zaten alınmış, başka bir tane deneyin.'
          : message,
      );
    } finally {
      setBusy(false);
    }
  };

  const publicUrl = profile?.username ? `${SITE_URL}/u/${profile.username}` : null;

  return (
    <ConsolePage
      eyebrow="Hesabım"
      title="Profilim"
      description="Ad soyad bilgisi sertifikanızda kullanılır; başvurudan önce doğru olduğundan emin olun."
      toc={[
        { id: 'fotograf', label: 'Profil fotoğrafı' },
        { id: 'bilgiler', label: 'Hesap bilgileri' },
        { id: 'baglantilar', label: 'Bağlantılar' },
        { id: 'gorunurluk', label: 'Herkese açık profil' },
      ]}
      actions={
        publicUrl && profile?.is_public ? (
          <Link to={`/u/${profile.username}`} className="gx-btn-ghost">
            Profilimi görüntüle
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        ) : undefined
      }
    >
      {!configured && <Alert tone="warning">Supabase bağlantısı olmadan profil güncellenemez.</Alert>}
      {saved && <Alert tone="success">Profiliniz güncellendi.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <ConsoleSection id="fotograf" title="Profil fotoğrafı">
        {user && (
          <AvatarUpload
            userId={user.id}
            url={profile?.avatar_url ?? null}
            name={profile?.full_name ?? user.email}
            onChange={async (avatarUrl) => {
              await updateProfile({ avatar_url: avatarUrl });
              await refreshProfile();
            }}
          />
        )}
      </ConsoleSection>

      <form onSubmit={handleSave} className="space-y-10">
        <ConsoleSection id="bilgiler" title="Hesap bilgileri">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pr-name" className="gx-label">
                Ad Soyad
              </label>
              <input
                id="pr-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="gx-input"
                placeholder="Ad Soyad"
              />
            </div>
            <div>
              <label htmlFor="pr-username" className="gx-label">
                Kullanıcı adı
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 shrink-0">/u/</span>
                <input
                  id="pr-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="gx-input font-mono"
                  placeholder="kullaniciadi"
                />
              </div>
            </div>
          </div>

          {/*
            GitHub, adresi gizli olan hesaplarda e-posta döndürmez. Böyle bir
            durumda alan boş gelir ve düzenlenebilir olmalıdır; aksi hâlde
            kullanıcı başvuru yapamaz.
          */}
          <div>
            <label htmlFor="pr-email" className="gx-label">
              E-posta {emailMissing && <span className="text-rose-500">*</span>}
            </label>
            <input
              id="pr-email"
              type="email"
              readOnly={!emailMissing}
              value={emailMissing ? email : (profile?.email ?? user?.email ?? '')}
              onChange={(e) => setEmail(e.target.value)}
              className={`gx-input ${emailMissing ? '' : 'bg-slate-50 cursor-not-allowed'}`}
              placeholder="ornek@eposta.com"
            />
            {emailMissing && (
              <p className="text-xs text-amber-700 mt-1.5">
                Giriş sağlayıcınız e-posta adresinizi paylaşmadı. Sertifikanız ve başvurunuz için
                bir adres girin.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pr-bio" className="gx-label">
              Hakkımda
            </label>
            <textarea
              id="pr-bio"
              rows={4}
              maxLength={400}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="gx-input resize-none"
              placeholder="Kendinizi birkaç cümleyle tanıtın."
            />
            <p className="text-xs text-slate-500 mt-1.5">{bio.length}/400</p>
          </div>

          <div>
            <label htmlFor="pr-country" className="gx-label">
              Ülke
            </label>
            <input
              id="pr-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="gx-input sm:max-w-xs"
              placeholder="Türkiye"
            />
          </div>

          <p className="text-xs text-slate-500">
            Rolünüz: <strong className="text-slate-700">{role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : 'Katılımcı'}</strong>
          </p>
        </ConsoleSection>

        <ConsoleSection id="baglantilar" title="Bağlantılar">
          <div>
            <label htmlFor="pr-portfolio" className="gx-label">
              <Globe className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Portfolyo / web sitesi
            </label>
            <input
              id="pr-portfolio"
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="gx-input"
              placeholder="https://siteniz.com"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pr-github" className="gx-label">
                <Github className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                GitHub
              </label>
              <input
                id="pr-github"
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="gx-input"
                placeholder="https://github.com/kullaniciadi"
              />
            </div>
            <div>
              <label htmlFor="pr-linkedin" className="gx-label">
                <Linkedin className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                LinkedIn
              </label>
              <input
                id="pr-linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="gx-input"
                placeholder="https://linkedin.com/in/kullaniciadi"
              />
            </div>
          </div>
        </ConsoleSection>

        <ConsoleSection
          id="gorunurluk"
          title="Herkese açık profil"
          description="Açıkken profiliniz paylaşılabilir bir adreste yayınlanır. E-posta, doğum yılı ve rol bilgisi hiçbir zaman görünmez."
        >
          <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer rounded-2xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900"
            />
            <span className="min-w-0">
              <span className="font-semibold flex items-center gap-2">
                {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Profilim herkese açık olsun
              </span>
              {publicUrl && (
                <span className="block text-xs text-slate-500 mt-1 break-all font-mono">
                  {publicUrl}
                </span>
              )}
            </span>
          </label>

          <button type="submit" disabled={busy || !configured} className="gx-btn-primary">
            {busy ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            Kaydet
          </button>
        </ConsoleSection>
      </form>
    </ConsolePage>
  );
};
