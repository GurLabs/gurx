import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wand2 } from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../../components/console/ConsolePage';
import { useConsole } from '../../../components/console/ConsoleLayouts';
import { Alert, Spinner } from '../../../components/ui/Feedback';
import { useSeo } from '../../../hooks/useSeo';
import { adminCreateCompetition } from '../../../lib/admin';

function slugify(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function toIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const DATE_FIELDS = [
  { key: 'registration_opens_at', label: 'Başvurular açılır' },
  { key: 'registration_closes_at', label: 'Başvurular kapanır' },
  { key: 'topic_reveal_at', label: 'Konu açıklanır' },
  { key: 'submission_deadline_at', label: 'Teslim son tarihi' },
  { key: 'voting_opens_at', label: 'Oylama açılır' },
  { key: 'voting_closes_at', label: 'Oylama kapanır' },
  { key: 'results_at', label: 'Sonuçlar açıklanır' },
] as const;

type DateKey = (typeof DATE_FIELDS)[number]['key'];

export const NewCompetitionPage: React.FC = () => {
  const navigate = useNavigate();
  const { reloadCompetitions } = useConsole();
  useSeo({ title: 'Yeni yarışma — Yönetim', noindex: true });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Vibe Coding · UI/UX');
  const [eventCode, setEventCode] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [minAge, setMinAge] = useState('15');
  const [maxAge, setMaxAge] = useState('21');
  const [dates, setDates] = useState<Record<DateKey, string>>({
    registration_opens_at: '',
    registration_closes_at: '',
    topic_reveal_at: '',
    submission_deadline_at: '',
    voting_opens_at: '',
    voting_closes_at: '',
    results_at: '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  /** Teslim tarihi kural gereği konu + 24 saattir. */
  const syncDeadline = () => {
    const reveal = toIso(dates.topic_reveal_at);
    if (!reveal) return;
    const deadline = new Date(new Date(reveal).getTime() + 86_400_000);
    const off = deadline.getTimezoneOffset() * 60_000;
    setDates((d) => ({
      ...d,
      submission_deadline_at: new Date(deadline.getTime() - off).toISOString().slice(0, 16),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError('Yarışma adı zorunludur.');
    if (!slug.trim()) return setError('Adres (slug) zorunludur.');
    if (!/^[A-Z]{2,5}$/.test(eventCode.trim().toUpperCase())) {
      return setError('Etkinlik kodu 2–5 büyük harf olmalıdır (örn. GYD).');
    }
    const lo = Number(minAge);
    const hi = Number(maxAge);
    if (!lo || !hi || lo >= hi) return setError('Yaş aralığı geçersiz.');

    setBusy(true);
    try {
      const created = await adminCreateCompetition({
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        category: category.trim() || 'Vibe Coding · UI/UX',
        event_code: eventCode.trim().toUpperCase(),
        cover_image: coverImage.trim() || null,
        registration_opens_at: toIso(dates.registration_opens_at),
        registration_closes_at: toIso(dates.registration_closes_at),
        topic_reveal_at: toIso(dates.topic_reveal_at),
        submission_deadline_at: toIso(dates.submission_deadline_at),
        voting_opens_at: toIso(dates.voting_opens_at),
        voting_closes_at: toIso(dates.voting_closes_at),
        results_at: toIso(dates.results_at),
        min_age: lo,
        max_age: hi,
      });
      reloadCompetitions();
      navigate(`/admin/yarismalar/${created.slug}/ayarlar`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yarışma oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConsolePage
      eyebrow="Yönetim"
      title="Yeni yarışma"
      description="Yarışmayı oluşturduktan sonra durumu “Yakında” olur; takvimi ve konuyu ayarlar sayfasından yönetirsiniz."
      toc={[
        { id: 'kimlik', label: 'Kimlik' },
        { id: 'katilim', label: 'Katılım koşulları' },
        { id: 'takvim', label: 'Takvim' },
      ]}
    >
      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={submit} className="space-y-10">
        <ConsoleSection id="kimlik" title="Kimlik">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nc-title" className="gx-label">
                Yarışma adı <span className="text-rose-500">*</span>
              </label>
              <input
                id="nc-title"
                required
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="gx-input"
                placeholder="GurX Youth Design 2027"
              />
            </div>
            <div>
              <label htmlFor="nc-slug" className="gx-label">
                Adres (slug) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">/yarismalar/</span>
                <input
                  id="nc-slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="gx-input font-mono"
                  placeholder="gurx-youth-design-2027"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="nc-subtitle" className="gx-label">
              Alt başlık
            </label>
            <input
              id="nc-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="gx-input"
              placeholder="24 saatlik Vibe Coding tasarım maratonu"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nc-category" className="gx-label">
                Kategori
              </label>
              <input
                id="nc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="gx-input"
              />
            </div>
            <div>
              <label htmlFor="nc-code" className="gx-label">
                Etkinlik kodu <span className="text-rose-500">*</span>
              </label>
              <input
                id="nc-code"
                required
                maxLength={5}
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                className="gx-input font-mono uppercase"
                placeholder="GYD"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Sertifika kodunun ilk parçası: <span className="font-mono">GYD</span>-26-0001-01
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="nc-cover" className="gx-label">
              Kapak görseli bağlantısı
            </label>
            <input
              id="nc-cover"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="gx-input"
              placeholder="https://…"
            />
            {coverImage && (
              <img
                src={coverImage}
                alt=""
                className="mt-3 w-full max-w-md rounded-2xl border border-slate-200 object-cover aspect-video"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </ConsoleSection>

        <ConsoleSection id="katilim" title="Katılım koşulları">
          <div className="grid sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label htmlFor="nc-min" className="gx-label">
                Alt yaş sınırı
              </label>
              <input
                id="nc-min"
                inputMode="numeric"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value.replace(/\D/g, ''))}
                className="gx-input"
              />
            </div>
            <div>
              <label htmlFor="nc-max" className="gx-label">
                Üst yaş sınırı
              </label>
              <input
                id="nc-max"
                inputMode="numeric"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value.replace(/\D/g, ''))}
                className="gx-input"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Alt sınıra eşit veya daha küçük yaştaki katılımcılardan veli izni onayı istenir.
          </p>
        </ConsoleSection>

        <ConsoleSection
          id="takvim"
          title="Takvim"
          description="Boş bırakılan tarihler sonradan ayarlar sayfasından girilebilir."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {DATE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label htmlFor={`nc-${key}`} className="gx-label">
                  {label}
                </label>
                <input
                  id={`nc-${key}`}
                  type="datetime-local"
                  value={dates[key]}
                  onChange={(e) => setDates((d) => ({ ...d, [key]: e.target.value }))}
                  className="gx-input"
                />
              </div>
            ))}
          </div>

          <button type="button" onClick={syncDeadline} className="gx-btn-ghost">
            <Wand2 className="w-4 h-4" />
            Teslim tarihini konu + 24 saat yap
          </button>

          <button type="submit" disabled={busy} className="gx-btn-primary !py-3 w-full sm:w-auto">
            {busy ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Yarışmayı oluştur
          </button>
        </ConsoleSection>
      </form>
    </ConsolePage>
  );
};
