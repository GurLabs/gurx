import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock, Rocket, Upload } from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import { useCompetition } from '../../components/console/CompetitionLayout';
import { Alert, Spinner } from '../../components/ui/Feedback';
import { Countdown } from '../../components/ui/Countdown';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import { fetchMyApplication, fetchMySubmission, upsertSubmission } from '../../lib/api';
import { isValidHttpUrl } from '../../lib/format';
import { DEPLOY_TARGETS } from '../../lib/brand';

export const SubmissionPage: React.FC = () => {
  const { competition } = useCompetition();
  const { user } = useAuth();

  useSeo({ title: `${competition.title} — Sonuç Yükleme`, noindex: true });

  const { data: application } = useAsync(
    () => (user ? fetchMyApplication(user.id, competition.id) : Promise.resolve(null)),
    [user?.id, competition.id],
  );
  const { data: existing, loading, reload } = useAsync(
    () => (user ? fetchMySubmission(user.id, competition.id) : Promise.resolve(null)),
    [user?.id, competition.id],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [heroUrl, setHeroUrl] = useState('');
  const [seoNotes, setSeoNotes] = useState('');
  const [securityNotes, setSecurityNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description ?? '');
    setLiveUrl(existing.live_url);
    setRepoUrl(existing.repo_url ?? '');
    setHeroUrl(existing.hero_screenshot_url);
    setSeoNotes(existing.seo_notes ?? '');
    setSecurityNotes(existing.security_notes ?? '');
  }, [existing]);

  const now = Date.now();
  const revealAt = competition.topic_reveal_at ? new Date(competition.topic_reveal_at).getTime() : null;
  const deadlineAt = competition.submission_deadline_at
    ? new Date(competition.submission_deadline_at).getTime()
    : null;

  const notStarted = revealAt !== null && now < revealAt;
  const closed = deadlineAt !== null && now > deadlineAt;
  const notApproved = !application || application.status !== 'approved';
  const locked = notStarted || closed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!user) return;

    if (!title.trim()) return setError('Proje adı zorunludur.');
    if (!isValidHttpUrl(liveUrl)) {
      return setError('Canlı proje bağlantısı geçerli bir http(s) adresi olmalıdır.');
    }
    if (!isValidHttpUrl(heroUrl)) {
      return setError('Hero ekran görüntüsü bağlantısı geçerli bir http(s) adresi olmalıdır.');
    }
    if (repoUrl && !isValidHttpUrl(repoUrl)) {
      return setError('Kod deposu bağlantısı geçerli bir http(s) adresi olmalıdır.');
    }

    setBusy(true);
    try {
      await upsertSubmission({
        user_id: user.id,
        competition_id: competition.id,
        title: title.trim(),
        description: description.trim() || null,
        live_url: liveUrl.trim(),
        repo_url: repoUrl.trim() || null,
        hero_screenshot_url: heroUrl.trim(),
        seo_notes: seoNotes.trim() || null,
        security_notes: securityNotes.trim() || null,
      });
      setSaved(true);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Teslim kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Sonuç Yükleme"
      description="Projenizi Vercel veya Netlify’a yayınlayıp canlı bağlantıyı buradan gönderin. Süre bitene kadar teslimi güncelleyebilirsiniz."
      toc={[
        { id: 'sure', label: 'Kalan süre' },
        { id: 'proje', label: 'Proje bilgileri' },
        { id: 'iyilestirmeler', label: 'İyileştirmeler' },
        { id: 'yayin', label: 'Yayına alma' },
      ]}
    >
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner className="w-4 h-4" /> Teslim bilgileriniz yükleniyor…
        </div>
      )}
      {notApproved && (
        <Alert tone="warning">
          Teslim yapabilmek için başvurunuzun onaylanmış olması gerekir.{' '}
          <Link
            to={`/dashboard/yarismalar/${competition.slug}/basvurum`}
            className="underline font-semibold"
          >
            Başvuru durumunuzu kontrol edin
          </Link>
          .
        </Alert>
      )}
      {notStarted && <Alert tone="info">Teslim bölümü, yarışma konusu açıklandığında açılır.</Alert>}
      {closed && <Alert tone="error">Teslim süresi doldu. Yeni gönderim alınmıyor.</Alert>}
      {saved && <Alert tone="success">Tesliminiz kaydedildi.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <ConsoleSection id="sure" title="Kalan süre">
        <Countdown
          target={competition.submission_deadline_at}
          finishedLabel="Teslim süresi doldu"
        />
      </ConsoleSection>

      <form onSubmit={handleSubmit} className="space-y-10">
        <ConsoleSection id="proje" title="Proje bilgileri">
          <div>
            <label htmlFor="sb-title" className="gx-label">
              Proje adı <span className="text-rose-500">*</span>
            </label>
            <input
              id="sb-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="gx-input"
              placeholder="Projenizin adı"
            />
          </div>

          <div>
            <label htmlFor="sb-desc" className="gx-label">
              Kısa açıklama
            </label>
            <textarea
              id="sb-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="gx-input resize-none"
              placeholder="Projenizi iki cümleyle anlatın."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sb-live" className="gx-label">
                Canlı proje bağlantısı <span className="text-rose-500">*</span>
              </label>
              <input
                id="sb-live"
                type="url"
                required
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="gx-input"
                placeholder="https://projem.vercel.app"
              />
            </div>
            <div>
              <label htmlFor="sb-repo" className="gx-label">
                Kod deposu (isteğe bağlı)
              </label>
              <input
                id="sb-repo"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="gx-input"
                placeholder="https://github.com/kullanici/proje"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sb-hero" className="gx-label">
              Hero ekran görüntüsü bağlantısı <span className="text-rose-500">*</span>
            </label>
            <input
              id="sb-hero"
              type="url"
              required
              value={heroUrl}
              onChange={(e) => setHeroUrl(e.target.value)}
              className="gx-input"
              placeholder="https://.../hero.png"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Oylama sayfasında projeniz bu görselle listelenir. 16:9 ve en az 1200px genişlik
              önerilir.
            </p>
            {isValidHttpUrl(heroUrl) && (
              <img
                src={heroUrl}
                alt="Hero önizleme"
                className="mt-3 w-full rounded-2xl border border-slate-200 object-cover max-h-72"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </ConsoleSection>

        <ConsoleSection
          id="iyilestirmeler"
          title="İyileştirmeler"
          description="Puanlamanın üç başlığından ikisi burada anlattıklarınızla değerlendirilir."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sb-seo" className="gx-label">
                SEO iyileştirmeleriniz
              </label>
              <textarea
                id="sb-seo"
                rows={5}
                value={seoNotes}
                onChange={(e) => setSeoNotes(e.target.value)}
                className="gx-input resize-none"
                placeholder="Meta etiketleri, yapılandırılmış veri, performans…"
              />
            </div>
            <div>
              <label htmlFor="sb-sec" className="gx-label">
                Güvenlik iyileştirmeleriniz
              </label>
              <textarea
                id="sb-sec"
                rows={5}
                value={securityNotes}
                onChange={(e) => setSecurityNotes(e.target.value)}
                className="gx-input resize-none"
                placeholder="Güvenlik başlıkları, girdi doğrulama, bağımlılık denetimi…"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy || locked || notApproved}
            className="gx-btn-primary !py-3 w-full sm:w-auto"
          >
            {busy ? (
              <Spinner className="w-4 h-4" />
            ) : locked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {existing ? 'Teslimi güncelle' : 'Teslim et'}
          </button>
        </ConsoleSection>
      </form>

      <ConsoleSection
        id="yayin"
        title="Yayına alma"
        description="AI Studio’daki işiniz bittiğinde projeyi aşağıdaki servislerden biriyle yayınlayın."
      >
        <div className="flex flex-wrap gap-2.5">
          {DEPLOY_TARGETS.map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gx-btn-ghost"
            >
              <Rocket className="w-4 h-4" />
              {t.name}
              <ExternalLink className="w-4 h-4" />
            </a>
          ))}
          <Link to="/dashboard/yardim" className="gx-btn-ghost">
            Adım adım nasıl yapılır?
          </Link>
        </div>
      </ConsoleSection>
    </ConsolePage>
  );
};
