import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  FileText,
  Lightbulb,
  Lock,
  Megaphone,
  Share2,
  Upload,
  Vote,
} from 'lucide-react';
import { ConsolePage, ConsoleSection, ConsoleStat } from '../../components/console/ConsolePage';
import { useCompetition } from '../../components/console/CompetitionLayout';
import { Countdown } from '../../components/ui/Countdown';
import { AiStudioLockup } from '../../components/ui/AiStudioLockup';
import { Alert } from '../../components/ui/Feedback';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import { fetchAnnouncements, fetchMyApplication, fetchMySubmission } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: 'İnceleniyor', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Onaylandı', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Reddedildi', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const OverviewPage: React.FC = () => {
  const { competition } = useCompetition();
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);

  useSeo({ title: `${competition.title} — Genel Bakış`, noindex: true });

  const { data: announcements } = useAsync(
    () => fetchAnnouncements(competition.id, 'participants'),
    [competition.id],
  );
  const { data: application } = useAsync(
    () => (user ? fetchMyApplication(user.id, competition.id) : Promise.resolve(null)),
    [user?.id, competition.id],
  );
  const { data: submission } = useAsync(
    () => (user ? fetchMySubmission(user.id, competition.id) : Promise.resolve(null)),
    [user?.id, competition.id],
  );

  const topicRevealed = useMemo(
    () =>
      Boolean(
        competition.topic_reveal_at &&
          Date.now() >= new Date(competition.topic_reveal_at).getTime(),
      ),
    [competition.topic_reveal_at],
  );

  const base = `/dashboard/yarismalar/${competition.slug}`;
  const referralLink = profile?.referral_code
    ? `${window.location.origin}/kayit?ref=${profile.referral_code}`
    : null;

  const copyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const appStatus = application ? STATUS_LABEL[application.status] : null;

  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Genel Bakış"
      description={
        competition.subtitle ??
        'Yarışma sürecinizin özeti: geri sayım, konu, başvuru ve teslim durumu.'
      }
      toc={[
        { id: 'gerisayim', label: 'Geri sayım & konu' },
        { id: 'durum', label: 'Durumum' },
        { id: 'ortam', label: 'Tasarım ortamı' },
        { id: 'duyurular', label: 'Duyurular' },
        { id: 'referans', label: 'Referans bağlantım' },
      ]}
    >
      {/* Countdown + topic */}
      <ConsoleSection
        id="gerisayim"
        title={topicRevealed ? 'Teslim süresi' : 'Konunun açıklanmasına'}
        description={formatDateTime(
          topicRevealed ? competition.submission_deadline_at : competition.topic_reveal_at,
        )}
      >
        <Countdown
          target={topicRevealed ? competition.submission_deadline_at : competition.topic_reveal_at}
          finishedLabel={topicRevealed ? 'Teslim süresi doldu' : 'Konu açıklandı'}
        />

        <div
          className={`rounded-2xl border p-5 space-y-2 ${
            topicRevealed && competition.topic
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            {topicRevealed && competition.topic ? (
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            Yarışma konusu
          </p>
          {topicRevealed && competition.topic ? (
            <p className="text-xl font-serif text-slate-900 leading-snug">{competition.topic}</p>
          ) : (
            <p className="text-sm text-slate-600">
              Konu, geri sayım sıfırlandığında bu alanda ve e-posta ile açıklanacaktır. O andan
              itibaren 24 saatiniz başlar.
            </p>
          )}
        </div>
      </ConsoleSection>

      {/* Status */}
      <ConsoleSection id="durum" title="Durumum">
        <div className="grid gap-4 sm:grid-cols-3">
          <ConsoleStat
            label="Başvuru"
            icon={<FileText className="w-3.5 h-3.5" />}
            value={appStatus?.label ?? 'Yok'}
            hint={
              application?.participant_no
                ? `Katılımcı no: ${String(application.participant_no).padStart(4, '0')}`
                : 'Başvuru formunu doldurun'
            }
          />
          <ConsoleStat
            label="Teslim"
            icon={<Upload className="w-3.5 h-3.5" />}
            value={submission ? 'Tamamlandı' : 'Bekliyor'}
            hint={submission ? submission.title : 'Canlı bağlantınızı gönderin'}
          />
          <ConsoleStat
            label="Kalan süre"
            icon={<Clock3 className="w-3.5 h-3.5" />}
            value={topicRevealed ? '24 saat içinde' : 'Başlamadı'}
            hint={formatDateTime(competition.submission_deadline_at)}
          />
        </div>

        {application?.note && <Alert tone="info">{application.note}</Alert>}

        <div className="flex flex-wrap gap-2.5">
          <Link to={`${base}/basvurum`} className="gx-btn-primary">
            {application ? 'Başvurumu görüntüle' : 'Başvuru yap'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to={`${base}/teslim`} className="gx-btn-ghost">
            <Upload className="w-4 h-4" />
            Sonuç yükleme
          </Link>
          <Link to={`${base}/oylama`} className="gx-btn-ghost">
            <Vote className="w-4 h-4" />
            Oylama
          </Link>
        </div>
      </ConsoleSection>

      <ConsoleSection id="ortam" title="Zorunlu tasarım ortamı">
        <AiStudioLockup />
      </ConsoleSection>

      {/* Announcements */}
      <ConsoleSection
        id="duyurular"
        title="Son duyurular"
        actions={
          <Link to={`${base}/duyurular`} className="gx-btn-ghost !py-2 !px-4 text-xs">
            Tümü
          </Link>
        }
      >
        {(announcements ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Henüz duyuru yok.</p>
        ) : (
          <ul className="space-y-3">
            {(announcements ?? []).slice(0, 3).map((a) => (
              <li
                key={a.id}
                className={`rounded-2xl border p-5 ${
                  a.is_pinned ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-slate-400" />
                    {a.title}
                  </h3>
                  <span className="text-xs text-slate-500 shrink-0">
                    {formatDateTime(a.published_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </ConsoleSection>

      {/* Referral */}
      <ConsoleSection
        id="referans"
        title="Referans bağlantım"
        description="Bu bağlantıyla kayıt olan her arkadaşınız referansınıza sayılır."
      >
        {referralLink ? (
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Share2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                readOnly
                value={referralLink}
                onFocus={(e) => e.currentTarget.select()}
                className="gx-input font-mono text-xs !pl-10"
                aria-label="Referans bağlantısı"
              />
            </div>
            <button onClick={copyReferral} className="gx-btn-ghost shrink-0 !px-4">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Referans kodunuz hesap kurulumu tamamlandığında burada görünecek.
          </p>
        )}
      </ConsoleSection>
    </ConsolePage>
  );
};
