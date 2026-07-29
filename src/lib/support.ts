import { requireSupabase, supabase } from './supabase';
import type { Ticket, TicketCategory, TicketMessage, TicketStatus } from '../types';

export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'general', label: 'Genel' },
  { value: 'application', label: 'Başvuru' },
  { value: 'submission', label: 'Teslim / sonuç yükleme' },
  { value: 'certificate', label: 'Sertifika & rozet' },
  { value: 'technical', label: 'Teknik sorun' },
  { value: 'other', label: 'Diğer' },
];

export const TICKET_STATUS_LABEL: Record<TicketStatus, { label: string; tone: string }> = {
  open: { label: 'Açık', tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  pending: { label: 'Yanıtlandı', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Çözüldü', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Kapalı', tone: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export async function createContactMessage(input: {
  full_name: string;
  email: string;
  subject: string;
  body: string;
}): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('contact_messages').insert(input);
  if (error) throw new Error(error.message);
}

export async function fetchMyTickets(userId: string): Promise<Ticket[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Ticket[]) ?? [];
}

export async function fetchAllTickets(): Promise<Ticket[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data as Ticket[]) ?? [];
}

export async function fetchTicket(id: string): Promise<Ticket | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('tickets').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Ticket) ?? null;
}

export async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as TicketMessage[]) ?? [];
}

export async function createTicket(input: {
  user_id: string;
  email: string;
  full_name: string;
  subject: string;
  category: TicketCategory;
  body: string;
}): Promise<Ticket> {
  const sb = requireSupabase();

  const { data, error } = await sb
    .from('tickets')
    .insert({
      user_id: input.user_id,
      email: input.email,
      full_name: input.full_name,
      subject: input.subject,
      category: input.category,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const ticket = data as Ticket;
  await addTicketMessage({
    ticket_id: ticket.id,
    author_id: input.user_id,
    author_name: input.full_name,
    is_staff: false,
    body: input.body,
  });

  return ticket;
}

export async function addTicketMessage(input: {
  ticket_id: string;
  author_id: string;
  author_name: string;
  is_staff: boolean;
  body: string;
}): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('ticket_messages').insert(input);
  if (error) throw new Error(error.message);
}

export async function setTicketStatus(id: string, status: TicketStatus): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
