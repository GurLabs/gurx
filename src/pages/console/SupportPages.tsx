import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Plus, Send, Ticket as TicketIcon } from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import {Alert, EmptyState, Spinner} from '../../components/ui/Feedback';
import { ConsolePageSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useSeo } from '../../hooks/useSeo';
import {
  TICKET_CATEGORIES,
  TICKET_STATUS_LABEL,
  addTicketMessage,
  createTicket,
  fetchAllTickets,
  fetchMyTickets,
  fetchTicket,
  fetchTicketMessages,
  setTicketStatus,
} from '../../lib/support';
import { formatDateTime } from '../../lib/format';
import type { Ticket, TicketCategory, TicketStatus } from '../../types';

const StatusChip: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const s = TICKET_STATUS_LABEL[status];
  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${s.tone}`}>
      {s.label}
    </span>
  );
};

const TicketList: React.FC<{ tickets: Ticket[]; base: string }> = ({ tickets, base }) => (
  <ul className="space-y-3">
    {tickets.map((t) => (
      <li key={t.id}>
        <Link
          to={`${base}/${t.id}`}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 truncate">{t.subject}</p>
            <p className="text-xs text-slate-500 font-mono">{t.reference}</p>
          </div>
          <span className="text-xs text-slate-500">{formatDateTime(t.last_message_at)}</span>
          <StatusChip status={t.status} />
        </Link>
      </li>
    ))}
  </ul>
);

/* ------------------------------------------------------------------ */

export const MyTicketsPage: React.FC = () => {
  const { user, profile } = useAuth();
  useSeo({ title: 'Destek — Katılımcı Paneli', noindex: true });

  const { data, loading, error, reload } = useAsync<Ticket[]>(
    () => (user ? fetchMyTickets(user.id) : Promise.resolve([])),
    [user?.id],
  );

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('general');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!user) return;
    if (!subject.trim() || !body.trim()) {
      setFormError('Konu ve mesaj zorunludur.');
      return;
    }

    setBusy(true);
    try {
      await createTicket({
        user_id: user.id,
        email: profile?.email ?? user.email ?? '',
        full_name: profile?.full_name ?? 'Katılımcı',
        subject: subject.trim(),
        category,
        body: body.trim(),
      });
      setSubject('');
      setBody('');
      setOpen(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Talep oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConsolePage
      eyebrow="Destek"
      title="Destek taleplerim"
      description="Sorularınızı buradan iletin; yazışmanın tamamı bu sayfada kalır."
      actions={
        <button onClick={() => setOpen((v) => !v)} className="gx-btn-primary">
          <Plus className="w-4 h-4" />
          Yeni talep
        </button>
      }
    >
      {open && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Yeni destek talebi</h2>
          {formError && <Alert tone="error">{formError}</Alert>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tk-subject" className="gx-label">
                Konu
              </label>
              <input
                id="tk-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="gx-input"
                placeholder="Kısa bir başlık"
              />
            </div>
            <div>
              <label htmlFor="tk-category" className="gx-label">
                Kategori
              </label>
              <select
                id="tk-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="gx-input"
              >
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tk-body" className="gx-label">
              Mesajınız
            </label>
            <textarea
              id="tk-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="gx-input resize-none"
              placeholder="Sorununuzu olabildiğince açık yazın."
            />
          </div>

          <button type="submit" disabled={busy} className="gx-btn-primary">
            {busy ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            Talebi gönder
          </button>
        </form>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={<TicketIcon className="w-6 h-6" />}
          title="Henüz destek talebiniz yok"
          description="Bir sorunuz olduğunda “Yeni talep” ile bize yazabilirsiniz."
        />
      ) : (
        <TicketList tickets={data ?? []} base="/dashboard/destek" />
      )}
    </ConsolePage>
  );
};

/* ------------------------------------------------------------------ */

export const TicketThreadPage: React.FC<{ staffView?: boolean }> = ({ staffView = false }) => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isStaff } = useAuth();
  useSeo({ title: 'Destek talebi', noindex: true });

  const { data: ticket, loading, reload: reloadTicket } = useAsync(
    () => (id ? fetchTicket(id) : Promise.resolve(null)),
    [id],
  );
  const { data: messages, reload: reloadMessages } = useAsync(
    () => (id ? fetchTicketMessages(id) : Promise.resolve([])),
    [id],
  );

  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = staffView ? '/staff/destek' : '/dashboard/destek';

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!id || !user || !reply.trim()) return;

    setBusy(true);
    try {
      await addTicketMessage({
        ticket_id: id,
        author_id: user.id,
        author_name: profile?.full_name ?? (isStaff ? 'GurX Ekibi' : 'Katılımcı'),
        is_staff: isStaff,
        body: reply.trim(),
      });
      setReply('');
      reloadMessages();
      reloadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mesaj gönderilemedi.');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status: TicketStatus) => {
    if (!id) return;
    await setTicketStatus(id, status);
    reloadTicket();
  };

  if (loading) return <ConsolePageSkeleton label="Talep yükleniyor" />;

  if (!ticket) {
    return (
      <ConsolePage eyebrow="Destek" title="Talep bulunamadı">
        <Link to={base} className="gx-btn-primary">
          Taleplere dön
        </Link>
      </ConsolePage>
    );
  }

  return (
    <ConsolePage
      eyebrow={ticket.reference}
      title={ticket.subject}
      description={`Oluşturulma: ${formatDateTime(ticket.created_at)}`}
      actions={
        <Link to={base} className="gx-btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          Taleplerim
        </Link>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusChip status={ticket.status} />
        <span className="text-xs text-slate-500">{ticket.full_name} · {ticket.email}</span>

        {isStaff && (
          <div className="ml-auto flex flex-wrap gap-2">
            {(['open', 'pending', 'resolved', 'closed'] as TicketStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  ticket.status === s
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {TICKET_STATUS_LABEL[s].label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ConsoleSection id="yazisma" title="Yazışma">
        <ul className="space-y-3">
          {(messages ?? []).map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border p-5 ${
                m.is_staff ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  {m.author_name}
                  {m.is_staff && (
                    <span className="rounded-full bg-slate-900 text-white text-[0.6rem] font-bold px-2 py-0.5">
                      EKİP
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-500">{formatDateTime(m.created_at)}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{m.body}</p>
            </li>
          ))}
        </ul>
      </ConsoleSection>

      {ticket.status !== 'closed' && (
        <form onSubmit={send} className="space-y-3">
          {error && <Alert tone="error">{error}</Alert>}
          <label htmlFor="tk-reply" className="gx-label">
            Yanıt yaz
          </label>
          <textarea
            id="tk-reply"
            rows={5}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="gx-input resize-none"
            placeholder="Mesajınızı yazın…"
          />
          <button type="submit" disabled={busy || !reply.trim()} className="gx-btn-primary">
            {busy ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            Gönder
          </button>
        </form>
      )}
    </ConsolePage>
  );
};

/* ------------------------------------------------------------------ */

export const StaffTicketsPage: React.FC = () => {
  useSeo({ title: 'Destek Talepleri — Yönetim', noindex: true });
  const { data, loading, error } = useAsync<Ticket[]>(fetchAllTickets, []);

  const open = (data ?? []).filter((t) => t.status === 'open').length;

  return (
    <ConsolePage
      eyebrow="Yönetim"
      title="Destek talepleri"
      description={`${(data ?? []).length} talep · ${open} tanesi yanıt bekliyor`}
    >
      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={<TicketIcon className="w-6 h-6" />} title="Henüz talep yok" />
      ) : (
        <TicketList tickets={data ?? []} base="/staff/destek" />
      )}
    </ConsolePage>
  );
};
