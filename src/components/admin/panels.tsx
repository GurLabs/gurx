import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { AdminCard, StatTile } from './AdminShell';
import {Alert, EmptyState, Spinner} from '../ui/Feedback';
import { CardGridSkeleton, TableSkeleton } from '../ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import {
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminIssueAttendeeCertificates,
  adminIssueCertificate,
  adminListApplications,
  adminListCertificates,
  adminListProfiles,
  adminListSubmissions,
  adminSetApplicationStatus,
  adminSetCertificateRevoked,
  adminSetRole,
  adminSetStaffRole,
  adminTogglePublish,
  adminUpdateCompetition,
} from '../../lib/admin';
import { fetchAnnouncements } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { AWARD_LIST } from '../../lib/brand';
import {
  STAFF_ROLE_LABELS,
  type AwardTypeCode,
  type Competition,
  type CompetitionStatus,
  type StaffRole,
  type UserRole,
} from '../../types';

const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

/** Converts an ISO string to the value a datetime-local input expects. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/* ------------------------------------------------------------------ */

export const ApplicationsPanel: React.FC<{ competitionId: string }> = ({ competitionId }) => {
  const { data, loading, error, reload } = useAsync(
    () => adminListApplications(competitionId),
    [competitionId],
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const setStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActionError(null);
    setBusyId(id);
    try {
      await adminSetApplicationStatus(id, status);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'İşlem başarısız.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <TableSkeleton rows={6} />;
  if (error) return <Alert tone="error">{error}</Alert>;

  const rows = data ?? [];
  const pending = rows.filter((r) => r.status === 'pending').length;
  const approved = rows.filter((r) => r.status === 'approved').length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Toplam başvuru" value={rows.length} />
        <StatTile label="Bekleyen" value={pending} />
        <StatTile label="Onaylı" value={approved} />
      </div>

      {actionError && <Alert tone="error">{actionError}</Alert>}

      <AdminCard title="Başvurular" description="Onaylanan katılımcılar teslim yapabilir.">
        {rows.length === 0 ? (
          <EmptyState title="Henüz başvuru yok" />
        ) : (
          <div className="overflow-x-auto -mx-6 sm:-mx-8">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th scope="col" className="px-6 py-3 font-semibold">No</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Katılımcı</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Doğum yılı</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Referanslar</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Durum</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 align-top">
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {app.participant_no ? String(app.participant_no).padStart(4, '0') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{app.full_name}</p>
                      <p className="text-xs text-slate-500">{app.email}</p>
                      {app.guardian_consent && (
                        <span className="inline-block mt-1 text-[0.65rem] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          Veli izni onaylı
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{app.birth_year}</td>
                    <td className="px-6 py-4 space-y-1">
                      <a
                        href={app.reference_design_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-700 hover:underline flex items-center gap-1"
                      >
                        Vibe Coding <ExternalLink className="w-3 h-3" />
                      </a>
                      {app.portfolio_url && (
                        <a
                          href={app.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-700 hover:underline flex items-center gap-1"
                        >
                          Portfolyo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_TONE[app.status]}`}
                      >
                        {app.status === 'pending'
                          ? 'Bekliyor'
                          : app.status === 'approved'
                            ? 'Onaylı'
                            : 'Reddedildi'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {busyId === app.id ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <>
                            <button
                              onClick={() => setStatus(app.id, 'approved')}
                              className="w-8 h-8 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 grid place-items-center hover:bg-emerald-100"
                              aria-label="Onayla"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setStatus(app.id, 'rejected')}
                              className="w-8 h-8 rounded-full border border-rose-200 bg-rose-50 text-rose-700 grid place-items-center hover:bg-rose-100"
                              aria-label="Reddet"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setStatus(app.id, 'pending')}
                              className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 grid place-items-center hover:bg-slate-50"
                              aria-label="Beklemeye al"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const SubmissionsPanel: React.FC<{ competitionId: string }> = ({ competitionId }) => {
  const { data, loading, error, reload } = useAsync(
    () => adminListSubmissions(competitionId),
    [competitionId],
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (id: string, next: boolean) => {
    setBusyId(id);
    try {
      await adminTogglePublish(id, next);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <CardGridSkeleton count={6} media cols="sm:grid-cols-2 lg:grid-cols-3" />;
  if (error) return <Alert tone="error">{error}</Alert>;

  const rows = data ?? [];

  return (
    <AdminCard
      title="Teslimler"
      description="Yayınlanan teslimler oylama sayfasında listelenir."
    >
      {rows.length === 0 ? (
        <EmptyState title="Henüz teslim yok" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => (
            <article key={s.id} className="rounded-2xl border border-slate-200 overflow-hidden">
              <img
                src={s.hero_screenshot_url}
                alt={s.title}
                loading="lazy"
                className="w-full aspect-video object-cover bg-slate-100"
              />
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-500">{formatDateTime(s.submitted_at)}</p>
                <div className="flex gap-2">
                  <a
                    href={s.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gx-btn-ghost flex-1 !py-2 text-xs"
                  >
                    Aç <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => toggle(s.id, !s.is_published)}
                    disabled={busyId === s.id}
                    className="gx-btn-ghost !px-3 !py-2"
                    aria-label={s.is_published ? 'Yayından kaldır' : 'Yayınla'}
                  >
                    {busyId === s.id ? (
                      <Spinner className="w-4 h-4" />
                    ) : s.is_published ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminCard>
  );
};

/* ------------------------------------------------------------------ */

export const UsersPanel: React.FC = () => {
  const { data, loading, error, reload } = useAsync(adminListProfiles, []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [query, setQuery] = useState('');

  const changeRole = async (id: string, role: UserRole) => {
    setActionError(null);
    setBusyId(id);
    try {
      await adminSetRole(id, role);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Rol güncellenemedi.');
    } finally {
      setBusyId(null);
    }
  };

  const changeStaffRole = async (id: string, staffRole: StaffRole | '') => {
    setActionError(null);
    setBusyId(id);
    try {
      await adminSetStaffRole(id, staffRole === '' ? null : staffRole);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Görev güncellenemedi.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <TableSkeleton rows={8} />;
  if (error) return <Alert tone="error">{error}</Alert>;

  const q = query.trim().toLocaleLowerCase('tr');
  const rows = (data ?? []).filter(
    (p) =>
      !q ||
      p.email.toLocaleLowerCase('tr').includes(q) ||
      (p.full_name ?? '').toLocaleLowerCase('tr').includes(q),
  );

  const staffCount = (data ?? []).filter((p) => p.role !== 'participant').length;

  return (
    <div className="space-y-5">
      {actionError && <Alert tone="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Toplam kullanıcı" value={(data ?? []).length} />
        <StatTile label="Ekip (staff + admin)" value={staffCount} />
        <StatTile
          label="Jüri"
          value={(data ?? []).filter((p) => p.staff_role === 'jury').length}
        />
      </div>

      <AdminCard
        title="Kullanıcılar"
        description="Yetki seviyesi neye erişebildiğini, görev ise ekipteki rolünü belirler. Değişiklikler anında geçerli olur."
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad veya e-posta ile ara…"
          className="gx-input max-w-sm"
          aria-label="Kullanıcı ara"
        />

        <div className="overflow-x-auto -mx-6 sm:-mx-8">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th scope="col" className="px-6 py-3 font-semibold">Kullanıcı</th>
                <th scope="col" className="px-6 py-3 font-semibold">Kayıt</th>
                <th scope="col" className="px-6 py-3 font-semibold">Yetki</th>
                <th scope="col" className="px-6 py-3 font-semibold">Ekip görevi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{p.full_name ?? '—'}</p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {formatDateTime(p.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    {busyId === p.id ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      <select
                        value={p.role}
                        onChange={(e) => changeRole(p.id, e.target.value as UserRole)}
                        className="gx-input !py-2 !px-3 text-xs w-36"
                        aria-label={`${p.email} yetki seviyesi`}
                      >
                        <option value="participant">Katılımcı</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.staff_role ?? ''}
                      disabled={p.role === 'participant' || busyId === p.id}
                      onChange={(e) => changeStaffRole(p.id, e.target.value as StaffRole | '')}
                      className="gx-input !py-2 !px-3 text-xs w-44 disabled:opacity-50"
                      aria-label={`${p.email} ekip görevi`}
                    >
                      <option value="">— görev yok —</option>
                      {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((key) => (
                        <option key={key} value={key}>
                          {STAFF_ROLE_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className="text-sm text-slate-500">Aramaya uyan kullanıcı yok.</p>
        )}
      </AdminCard>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const AnnouncementsPanel: React.FC<{ competitionId: string }> = ({ competitionId }) => {
  const { data, loading, error, reload } = useAsync(
    () => fetchAnnouncements(competitionId, 'participants'),
    [competitionId],
  );

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'public' | 'participants'>('participants');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || !body.trim()) {
      setFormError('Başlık ve içerik zorunludur.');
      return;
    }
    setBusy(true);
    try {
      await adminCreateAnnouncement({
        competition_id: competitionId,
        title: title.trim(),
        body: body.trim(),
        audience,
        is_pinned: pinned,
      });
      setTitle('');
      setBody('');
      setPinned(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Duyuru oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await adminDeleteAnnouncement(id);
    reload();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <form onSubmit={create} className="lg:col-span-5 gx-card p-6 sm:p-8 space-y-4">
        <h2 className="font-semibold text-slate-900">Yeni duyuru</h2>
        {formError && <Alert tone="error">{formError}</Alert>}

        <div>
          <label htmlFor="an-title" className="gx-label">Başlık</label>
          <input
            id="an-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="gx-input"
            placeholder="Konu açıklandı"
          />
        </div>

        <div>
          <label htmlFor="an-body" className="gx-label">İçerik</label>
          <textarea
            id="an-body"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="gx-input resize-none"
            placeholder="Duyuru metni…"
          />
        </div>

        <div>
          <label htmlFor="an-audience" className="gx-label">Hedef kitle</label>
          <select
            id="an-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as 'public' | 'participants')}
            className="gx-input"
          >
            <option value="participants">Katılımcılar (panel)</option>
            <option value="public">Herkese açık (yarışma sayfası)</option>
          </select>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900"
          />
          Üste sabitle
        </label>

        <button type="submit" disabled={busy} className="gx-btn-primary w-full">
          {busy ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          Yayınla
        </button>
      </form>

      <div className="lg:col-span-7 space-y-4">
        {loading ? (
          <CardGridSkeleton count={3} cols="grid-cols-1" />
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : (data ?? []).length === 0 ? (
          <EmptyState title="Henüz duyuru yok" />
        ) : (
          (data ?? []).map((a) => (
            <article key={a.id} className="gx-card p-6 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(a.published_at)} ·{' '}
                    {a.audience === 'public' ? 'Herkese açık' : 'Katılımcılar'}
                    {a.is_pinned ? ' · Sabit' : ''}
                  </p>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="w-8 h-8 rounded-full border border-rose-200 bg-rose-50 text-rose-600 grid place-items-center shrink-0 hover:bg-rose-100"
                  aria-label="Duyuruyu sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{a.body}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: { value: CompetitionStatus; label: string }[] = [
  { value: 'upcoming', label: 'Yakında' },
  { value: 'registration_open', label: 'Başvurular açık' },
  { value: 'topic_revealed', label: 'Konu açıklandı' },
  { value: 'in_progress', label: 'Üretim sürüyor' },
  { value: 'voting', label: 'Oylama' },
  { value: 'completed', label: 'Tamamlandı' },
];

/** Every field is kept as a string so the form maps 1:1 onto the inputs. */
interface CompetitionForm {
  status: string;
  topic: string;
  registration_closes_at: string;
  topic_reveal_at: string;
  submission_deadline_at: string;
  voting_opens_at: string;
  voting_closes_at: string;
  results_at: string;
}

export const CompetitionPanel: React.FC<{ competition: Competition; onSaved: () => void }> = ({
  competition,
  onSaved,
}) => {
  const [form, setForm] = useState<CompetitionForm>({
    status: competition.status,
    topic: competition.topic ?? '',
    registration_closes_at: toLocalInput(competition.registration_closes_at),
    topic_reveal_at: toLocalInput(competition.topic_reveal_at),
    submission_deadline_at: toLocalInput(competition.submission_deadline_at),
    voting_opens_at: toLocalInput(competition.voting_opens_at),
    voting_closes_at: toLocalInput(competition.voting_closes_at),
    results_at: toLocalInput(competition.results_at),
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof CompetitionForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  /** Keeps the 24h rule intact: deadline is always reveal + 24h. */
  const syncDeadline = () => {
    const reveal = fromLocalInput(form.topic_reveal_at);
    if (!reveal) return;
    const deadline = new Date(new Date(reveal).getTime() + 86_400_000);
    setForm((f) => ({ ...f, submission_deadline_at: toLocalInput(deadline.toISOString()) }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      await adminUpdateCompetition(competition.id, {
        status: form.status as CompetitionStatus,
        topic: form.topic.trim() || null,
        registration_closes_at: fromLocalInput(form.registration_closes_at),
        topic_reveal_at: fromLocalInput(form.topic_reveal_at),
        submission_deadline_at: fromLocalInput(form.submission_deadline_at),
        voting_opens_at: fromLocalInput(form.voting_opens_at),
        voting_closes_at: fromLocalInput(form.voting_closes_at),
        results_at: fromLocalInput(form.results_at),
      });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  const DATES: { key: keyof CompetitionForm; label: string }[] = [
    { key: 'registration_closes_at', label: 'Başvuru kapanış' },
    { key: 'topic_reveal_at', label: 'Konu açıklanma' },
    { key: 'submission_deadline_at', label: 'Teslim son tarihi' },
    { key: 'voting_opens_at', label: 'Oylama açılış' },
    { key: 'voting_closes_at', label: 'Oylama kapanış' },
    { key: 'results_at', label: 'Sonuç açıklanma' },
  ];

  return (
    <form onSubmit={save} className="gx-card p-6 sm:p-8 space-y-5 max-w-3xl">
      <div>
        <h2 className="font-semibold text-slate-900">{competition.title}</h2>
        <p className="text-sm text-slate-600 mt-1">
          Konu alanı boş bırakıldığında katılımcı panelinde “henüz açıklanmadı” görünür.
        </p>
      </div>

      {saved && <Alert tone="success">Yarışma ayarları güncellendi.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div>
        <label htmlFor="cp-status" className="gx-label">Durum</label>
        <select id="cp-status" value={form.status} onChange={set('status')} className="gx-input">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cp-topic" className="gx-label">Yarışma konusu</label>
        <textarea
          id="cp-topic"
          rows={3}
          value={form.topic}
          onChange={set('topic')}
          className="gx-input resize-none"
          placeholder="Konu, açıklanma saatinde katılımcı panelinde görünür."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {DATES.map(({ key, label }) => (
          <div key={key}>
            <label htmlFor={`cp-${key}`} className="gx-label">{label}</label>
            <input
              id={`cp-${key}`}
              type="datetime-local"
              value={form[key]}
              onChange={set(key)}
              className="gx-input"
            />
          </div>
        ))}
      </div>

      <button type="button" onClick={syncDeadline} className="gx-btn-ghost">
        Teslim tarihini konu + 24 saat yap
      </button>

      <button type="submit" disabled={busy} className="gx-btn-primary w-full !py-3">
        {busy ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        Kaydet
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */

export const CertificatesPanel: React.FC<{ competitionId: string; eventCode: string; year: number }> = ({
  competitionId,
  eventCode,
  year,
}) => {
  const { data, loading, error, reload } = useAsync(
    () => adminListCertificates(competitionId),
    [competitionId],
  );
  const { data: applications } = useAsync(
    () => adminListApplications(competitionId),
    [competitionId],
  );

  const [userId, setUserId] = useState('');
  const [awardType, setAwardType] = useState<AwardTypeCode>('02');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const approved = (applications ?? []).filter((a) => a.status === 'approved');

  const issueOne = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMessage(null);
    const app = approved.find((a) => a.user_id === userId);
    if (!app || app.participant_no === null) {
      setFormError('Katılımcı seçin. Katılımcı numarası atanmamış başvurulara sertifika verilemez.');
      return;
    }
    setBusy(true);
    try {
      const cert = await adminIssueCertificate({
        competitionId,
        userId: app.user_id,
        recipientName: app.full_name,
        participantNo: app.participant_no,
        awardType,
        eventCode,
        year,
      });
      setMessage(`Sertifika verildi: ${cert.code}`);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sertifika verilemedi.');
    } finally {
      setBusy(false);
    }
  };

  const issueAll = async () => {
    setFormError(null);
    setMessage(null);
    setBusy(true);
    try {
      const count = await adminIssueAttendeeCertificates(competitionId, eventCode, year);
      setMessage(`${count} katılım sertifikası oluşturuldu / güncellendi.`);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Toplu işlem başarısız.');
    } finally {
      setBusy(false);
    }
  };

  const toggleRevoke = async (id: string, revoked: boolean) => {
    await adminSetCertificateRevoked(id, revoked);
    reload();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <form onSubmit={issueOne} className="lg:col-span-5 gx-card p-6 sm:p-8 space-y-4">
        <h2 className="font-semibold text-slate-900">Sertifika ver</h2>
        {message && <Alert tone="success">{message}</Alert>}
        {formError && <Alert tone="error">{formError}</Alert>}

        <div>
          <label htmlFor="ct-user" className="gx-label">Katılımcı</label>
          <select
            id="ct-user"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="gx-input"
          >
            <option value="">Seçin…</option>
            {approved.map((a) => (
              <option key={a.id} value={a.user_id}>
                {String(a.participant_no ?? 0).padStart(4, '0')} · {a.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ct-award" className="gx-label">Ödül türü</label>
          <select
            id="ct-award"
            value={awardType}
            onChange={(e) => setAwardType(e.target.value as AwardTypeCode)}
            className="gx-input"
          >
            {AWARD_LIST.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} · {a.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={busy} className="gx-btn-primary w-full">
          {busy ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          Sertifika oluştur
        </button>

        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2">
            Teslim yapmış tüm onaylı katılımcılara katılım belgesi (01) üretir.
          </p>
          <button type="button" onClick={issueAll} disabled={busy} className="gx-btn-ghost w-full">
            Toplu katılım sertifikası ver
          </button>
        </div>
      </form>

      <div className="lg:col-span-7 space-y-4">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : (data ?? []).length === 0 ? (
          <EmptyState title="Henüz sertifika verilmemiş" />
        ) : (
          <AdminCard title="Verilen sertifikalar">
            <ul className="divide-y divide-slate-100">
              {(data ?? []).map((c) => (
                <li key={c.id} className="py-3 flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-slate-900">{c.code}</p>
                    <p className="text-xs text-slate-500">
                      {c.recipient_name} · {formatDateTime(c.issued_at)}
                    </p>
                  </div>
                  <Link
                    to={`/certificate/verify/${c.code}`}
                    className="text-xs font-semibold text-slate-700 hover:underline shrink-0"
                  >
                    Doğrula
                  </Link>
                  <button
                    onClick={() => toggleRevoke(c.id, !c.revoked)}
                    className={`text-xs font-semibold rounded-full border px-3 py-1.5 shrink-0 ${
                      c.revoked
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.revoked ? 'İptal edildi' : 'İptal et'}
                  </button>
                </li>
              ))}
            </ul>
          </AdminCard>
        )}
      </div>
    </div>
  );
};
