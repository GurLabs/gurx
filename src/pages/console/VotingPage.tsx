import React, { useEffect, useMemo, useState } from 'react';
import { Check, ExternalLink, Info, Lock, Vote as VoteIcon } from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import { useCompetition } from '../../components/console/CompetitionLayout';
import {Alert, EmptyState, Spinner} from '../../components/ui/Feedback';
import { CardGridSkeleton } from '../../components/ui/Skeleton';
import { Countdown } from '../../components/ui/Countdown';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import { castVote, fetchMyVotes, fetchPublishedSubmissions } from '../../lib/api';
import { CRITERIA, SCORE_MAX, SCORE_MIN, type Criterion } from '../../lib/criteria';
import type { Submission, Vote } from '../../types';

type ScoreKey = Criterion['key'];
type Scores = Record<ScoreKey, number>;

const DEFAULT_SCORES: Scores = { design: 7, seo: 7, security: 7 };

const ScoreSlider: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="font-mono font-bold text-slate-900 tabular-nums">{value}</span>
    </div>
    <input
      type="range"
      min={SCORE_MIN}
      max={SCORE_MAX}
      step={1}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-slate-900 disabled:opacity-40"
      aria-label={label}
    />
  </div>
);

const SubmissionCard: React.FC<{
  submission: Submission;
  isOwn: boolean;
  alreadyVoted: boolean;
  canVote: boolean;
  voterId: string;
  onVoted: () => void;
}> = ({ submission, isOwn, alreadyVoted, canVote, voterId, onVoted }) => {
  const [scores, setScores] = useState<Scores>(DEFAULT_SCORES);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyVoted);

  useEffect(() => setDone(alreadyVoted), [alreadyVoted]);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await castVote({
        voterId,
        submissionId: submission.id,
        design: scores.design,
        seo: scores.seo,
        security: scores.security,
      });
      setDone(true);
      onVoted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oy kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-slate-100">
        <img
          src={submission.hero_screenshot_url}
          alt={`${submission.title} hero görseli`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {isOwn && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            Sizin projeniz
          </span>
        )}
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900">{submission.title}</h3>
          {submission.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{submission.description}</p>
          )}
        </div>

        <a
          href={submission.live_url}
          target="_blank"
          rel="noopener noreferrer"
          className="gx-btn-ghost w-full !py-2 text-xs"
        >
          Projeyi aç
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="space-y-3 mt-auto">
          {isOwn ? (
            <p className="text-sm text-slate-500 text-center py-2">
              Kendi projenize oy veremezsiniz.
            </p>
          ) : done ? (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl py-3">
              <Check className="w-4 h-4" />
              Oyunuz kaydedildi
            </div>
          ) : (
            <>
              {CRITERIA.map((c) => (
                <ScoreSlider
                  key={c.key}
                  label={c.label}
                  value={scores[c.key]}
                  disabled={!canVote}
                  onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
                />
              ))}
              {error && <Alert tone="error">{error}</Alert>}
              <button onClick={submit} disabled={!canVote || busy} className="gx-btn-primary w-full">
                {busy ? <Spinner className="w-4 h-4" /> : <VoteIcon className="w-4 h-4" />}
                Oy ver
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export const VotingPage: React.FC = () => {
  const { competition } = useCompetition();
  const { user, configured } = useAuth();

  useSeo({ title: `${competition.title} — Oylama`, noindex: true });

  const { data: submissions, loading } = useAsync(
    () => fetchPublishedSubmissions(competition.id),
    [competition.id],
  );
  const { data: myVotes, reload: reloadVotes } = useAsync<Vote[]>(
    () => (user ? fetchMyVotes(user.id, competition.id) : Promise.resolve([])),
    [user?.id, competition.id],
  );

  const votedIds = useMemo(() => new Set((myVotes ?? []).map((v) => v.submission_id)), [myVotes]);

  const now = Date.now();
  const opensAt = competition.voting_opens_at ? new Date(competition.voting_opens_at).getTime() : null;
  const closesAt = competition.voting_closes_at
    ? new Date(competition.voting_closes_at).getTime()
    : null;
  const votingOpen = (opensAt === null || now >= opensAt) && (closesAt === null || now <= closesAt);
  const canVote = Boolean(user) && configured && votingOpen;

  return (
    <ConsolePage
      eyebrow={competition.title}
      title="Oylama"
      description="24 saatlik süre sonunda yayınlanan tüm projeler hero görselleriyle burada listelenir. Katılımcılar birbirlerini puanlar; kimse kendi projesine oy veremez."
      toc={[
        { id: 'pencere', label: 'Oylama penceresi' },
        { id: 'projeler', label: 'Projeler' },
      ]}
    >
      <ConsoleSection id="pencere" title="Oylama penceresi">
        <div className="max-w-md">
          <Countdown
            target={votingOpen ? competition.voting_closes_at : competition.voting_opens_at}
            label={votingOpen ? 'Oylamanın kapanmasına' : 'Oylamanın açılmasına'}
            finishedLabel={votingOpen ? 'Oylama kapandı' : 'Oylama açıldı'}
            compact
          />
        </div>
        <p className="text-sm text-slate-500 flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          Her proje tasarım, SEO ve güvenlik başlıklarında 1–10 arası puanlanır. Oy kullanabilmek
          için projenizi teslim etmiş olmanız gerekir.
        </p>
        {!votingOpen && (
          <Alert tone="warning">
            Oylama penceresi şu anda kapalı. Projeleri inceleyebilirsiniz ancak oy veremezsiniz.
          </Alert>
        )}
      </ConsoleSection>

      <ConsoleSection id="projeler" title="Projeler">
        {loading ? (
          <CardGridSkeleton count={4} media />
        ) : (submissions ?? []).length === 0 ? (
          <EmptyState
            icon={<VoteIcon className="w-6 h-6" />}
            title="Henüz yayınlanmış proje yok"
            description="Teslim süresi dolduğunda tüm projeler burada listelenecek."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {(submissions ?? []).map((s) => (
              <SubmissionCard
                key={s.id}
                submission={s}
                voterId={user?.id ?? ''}
                isOwn={Boolean(user) && s.user_id === user?.id}
                alreadyVoted={votedIds.has(s.id)}
                canVote={canVote}
                onVoted={reloadVotes}
              />
            ))}
          </div>
        )}
      </ConsoleSection>
    </ConsolePage>
  );
};
