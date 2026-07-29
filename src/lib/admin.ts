import { requireSupabase } from './supabase';
import { buildCertificateCode } from './certificate';
import type {
  Announcement,
  Application,
  ApplicationStatus,
  AwardTypeCode,
  Certificate,
  Competition,
  Profile,
  StaffRole,
  Submission,
  UserRole,
} from '../types';

/**
 * Staff/admin operations. Every call goes through RLS — the policies in
 * supabase/schema.sql are the real gate, these helpers only shape the queries.
 */

export async function adminListApplications(competitionId: string): Promise<Application[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('applications')
    .select('*')
    .eq('competition_id', competitionId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Application[]) ?? [];
}

export async function adminSetApplicationStatus(
  id: string,
  status: ApplicationStatus,
  note?: string | null,
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from('applications')
    .update({ status, note: note ?? null })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminListSubmissions(competitionId: string): Promise<Submission[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('submissions')
    .select('*')
    .eq('competition_id', competitionId)
    .order('submitted_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Submission[]) ?? [];
}

export async function adminTogglePublish(id: string, isPublished: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('submissions').update({ is_published: isPublished }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminListProfiles(): Promise<Profile[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data as Profile[]) ?? [];
}

export async function adminSetRole(userId: string, role: UserRole): Promise<void> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('profiles')
    .update({ role })
    // Yetki düşürüldüğünde ekip görevi de temizlenir.
    .eq('id', userId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Rol güncellenemedi: satır bulunamadı veya izin yok.');

  if (role === 'participant') {
    await sb.from('profiles').update({ staff_role: null, staff_title: null }).eq('id', userId);
  }
}

export async function adminSetStaffRole(
  userId: string,
  staffRole: StaffRole | null,
  staffTitle?: string | null,
): Promise<void> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('profiles')
    .update({ staff_role: staffRole, staff_title: staffTitle ?? null })
    .eq('id', userId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Görev güncellenemedi: satır bulunamadı veya izin yok.');
}

export interface NewCompetitionInput {
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  event_code: string;
  cover_image: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  topic_reveal_at: string | null;
  submission_deadline_at: string | null;
  voting_opens_at: string | null;
  voting_closes_at: string | null;
  results_at: string | null;
  min_age: number;
  max_age: number;
}

export async function adminCreateCompetition(input: NewCompetitionInput): Promise<Competition> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('competitions')
    .insert({ ...input, status: 'upcoming' })
    .select()
    .single();

  if (error) {
    throw new Error(
      /duplicate key|unique/i.test(error.message)
        ? 'Bu adres (slug) zaten kullanılıyor. Farklı bir adres seçin.'
        : error.message,
    );
  }
  return data as Competition;
}

export async function adminDeleteCompetition(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('competitions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminCreateAnnouncement(input: {
  competition_id: string | null;
  title: string;
  body: string;
  audience: 'public' | 'participants';
  is_pinned: boolean;
}): Promise<Announcement> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('announcements')
    .insert({ ...input, published_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Announcement;
}

export async function adminDeleteAnnouncement(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('announcements').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminUpdateCompetition(
  id: string,
  patch: Partial<Competition>,
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('competitions').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminListCertificates(competitionId: string): Promise<Certificate[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('certificates')
    .select('*')
    .eq('competition_id', competitionId)
    .order('issued_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Certificate[]) ?? [];
}

export async function adminIssueCertificate(input: {
  competitionId: string;
  userId: string;
  recipientName: string;
  participantNo: number;
  awardType: AwardTypeCode;
  eventCode: string;
  year: number;
}): Promise<Certificate> {
  const sb = requireSupabase();
  const code = buildCertificateCode(
    input.eventCode,
    input.year,
    input.participantNo,
    input.awardType,
  );

  const { data, error } = await sb
    .from('certificates')
    .upsert(
      {
        code,
        user_id: input.userId,
        competition_id: input.competitionId,
        recipient_name: input.recipientName,
        award_type: input.awardType,
        event_code: input.eventCode,
        issued_at: new Date().toISOString(),
        revoked: false,
        issuer: 'GurX Youth Design & GurLabs Foundation™',
      },
      { onConflict: 'code' },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Certificate;
}

export async function adminSetCertificateRevoked(id: string, revoked: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('certificates').update({ revoked }).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Issues an attendee certificate to every approved applicant who submitted. */
export async function adminIssueAttendeeCertificates(
  competitionId: string,
  eventCode: string,
  year: number,
): Promise<number> {
  const sb = requireSupabase();

  const { data: apps, error } = await sb
    .from('applications')
    .select('user_id, full_name, participant_no')
    .eq('competition_id', competitionId)
    .eq('status', 'approved');
  if (error) throw new Error(error.message);

  const { data: subs, error: subErr } = await sb
    .from('submissions')
    .select('user_id')
    .eq('competition_id', competitionId);
  if (subErr) throw new Error(subErr.message);

  const submitted = new Set((subs ?? []).map((s: { user_id: string }) => s.user_id));
  const eligible = (apps ?? []).filter(
    (a: { user_id: string; participant_no: number | null }) =>
      submitted.has(a.user_id) && a.participant_no !== null,
  );

  for (const app of eligible as {
    user_id: string;
    full_name: string;
    participant_no: number;
  }[]) {
    await adminIssueCertificate({
      competitionId,
      userId: app.user_id,
      recipientName: app.full_name,
      participantNo: app.participant_no,
      awardType: '01',
      eventCode,
      year,
    });
  }

  return eligible.length;
}
