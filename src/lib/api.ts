import { supabase } from './supabase';
import { YOUTH_SLUG } from './brand';
import {
  SEED_ANNOUNCEMENTS,
  SEED_CERTIFICATES,
  SEED_LEADERBOARD,
  SEED_SUBMISSIONS,
  YOUTH_COMPETITION,
} from '../data/seed';
import type {
  Announcement,
  Application,
  Certificate,
  Competition,
  LeaderboardRow,
  PublicProfile,
  Submission,
  Vote,
} from '../types';

/**
 * Every reader falls back to seed content when Supabase is not configured
 * (or a table is still empty), so the public site never renders blank.
 * Writers throw instead — silently pretending to save would be worse.
 */

/**
 * The seed competition id is not a UUID, so sending it to Postgres produces a
 * 400 on every uuid column. Whenever we are running on fallback content we skip
 * the user-scoped queries entirely.
 */
function isSeedId(id: string): boolean {
  return id.startsWith('seed-');
}

export async function fetchYouthCompetition(): Promise<Competition> {
  if (!supabase) return YOUTH_COMPETITION;

  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('slug', YOUTH_SLUG)
    .maybeSingle();

  if (error) {
    console.warn('[api] competitions okunamadı, örnek içerik gösteriliyor:', error.message);
    return YOUTH_COMPETITION;
  }
  return (data as Competition) ?? YOUTH_COMPETITION;
}

export async function fetchCompetitions(): Promise<Competition[]> {
  if (!supabase) return [YOUTH_COMPETITION];

  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .order('registration_opens_at', { ascending: false });

  if (error) {
    console.warn('[api] competitions listesi okunamadı:', error.message);
    return [YOUTH_COMPETITION];
  }
  const rows = (data as Competition[]) ?? [];
  return rows.length ? rows : [YOUTH_COMPETITION];
}

export async function fetchCompetitionBySlug(slug: string): Promise<Competition | null> {
  if (!supabase) return slug === YOUTH_COMPETITION.slug ? YOUTH_COMPETITION : null;

  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.warn('[api] competition okunamadı:', error.message);
    return slug === YOUTH_COMPETITION.slug ? YOUTH_COMPETITION : null;
  }
  return (data as Competition) ?? (slug === YOUTH_COMPETITION.slug ? YOUTH_COMPETITION : null);
}

export async function fetchAnnouncements(
  competitionId: string,
  audience: 'public' | 'participants',
): Promise<Announcement[]> {
  if (!supabase || isSeedId(competitionId)) {
    return SEED_ANNOUNCEMENTS.filter((a) =>
      audience === 'participants' ? true : a.audience === 'public',
    );
  }

  let query = supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false });

  if (competitionId) query = query.eq('competition_id', competitionId);
  if (audience === 'public') query = query.eq('audience', 'public');

  const { data, error } = await query;
  if (error) {
    console.warn('[api] announcements okunamadı:', error.message);
    return SEED_ANNOUNCEMENTS;
  }
  return (data as Announcement[]) ?? [];
}

export async function fetchPublishedSubmissions(competitionId: string): Promise<Submission[]> {
  if (!supabase || isSeedId(competitionId)) return SEED_SUBMISSIONS;

  const { data, error } = await supabase
    .from('public_submissions')
    .select('*')
    .eq('competition_id', competitionId)
    .order('submitted_at', { ascending: true });

  if (error) {
    console.warn('[api] submissions okunamadı:', error.message);
    return SEED_SUBMISSIONS;
  }
  return ((data as Submission[]) ?? []).length ? (data as Submission[]) : SEED_SUBMISSIONS;
}

export async function fetchLeaderboard(competitionId: string): Promise<LeaderboardRow[]> {
  if (!supabase || isSeedId(competitionId)) return SEED_LEADERBOARD;

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('competition_id', competitionId)
    .order('rank', { ascending: true });

  if (error) {
    console.warn('[api] leaderboard okunamadı:', error.message);
    return SEED_LEADERBOARD;
  }
  return ((data as LeaderboardRow[]) ?? []).length ? (data as LeaderboardRow[]) : SEED_LEADERBOARD;
}

export async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  if (error) {
    console.warn('[api] public_profiles okunamadı:', error.message);
    return null;
  }
  return (data as PublicProfile) ?? null;
}

export async function fetchProfileCertificates(userId: string): Promise<Certificate[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('revoked', false)
    .order('issued_at', { ascending: false });
  if (error) {
    console.warn('[api] sertifikalar okunamadı:', error.message);
    return [];
  }
  return (data as Certificate[]) ?? [];
}

export async function fetchProfileSubmissions(userId: string): Promise<Submission[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('public_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });
  if (error) {
    console.warn('[api] projeler okunamadı:', error.message);
    return [];
  }
  return (data as Submission[]) ?? [];
}

export async function fetchCertificateByCode(code: string): Promise<Certificate | null> {
  const normalized = code.trim().toUpperCase();

  if (!supabase) {
    return SEED_CERTIFICATES.find((c) => c.code === normalized) ?? null;
  }

  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (error) {
    console.warn('[api] certificates okunamadı:', error.message);
    return SEED_CERTIFICATES.find((c) => c.code === normalized) ?? null;
  }
  return (data as Certificate) ?? null;
}

export async function fetchMyCertificates(userId: string): Promise<Certificate[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('revoked', false)
    .order('issued_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Certificate[]) ?? [];
}

export async function fetchMyApplication(
  userId: string,
  competitionId: string,
): Promise<Application | null> {
  if (!supabase || isSeedId(competitionId)) return null;
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .eq('competition_id', competitionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Application) ?? null;
}

export async function fetchMySubmission(
  userId: string,
  competitionId: string,
): Promise<Submission | null> {
  if (!supabase || isSeedId(competitionId)) return null;
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('competition_id', competitionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Submission) ?? null;
}

export async function fetchMyVotes(userId: string, competitionId: string): Promise<Vote[]> {
  if (!supabase || isSeedId(competitionId)) return [];
  const { data, error } = await supabase
    .from('votes')
    .select('*, submissions!inner(competition_id)')
    .eq('voter_id', userId)
    .eq('submissions.competition_id', competitionId);
  if (error) throw new Error(error.message);
  return (data as unknown as Vote[]) ?? [];
}

export async function castVote(input: {
  voterId: string;
  submissionId: string;
  design: number;
  seo: number;
  security: number;
}): Promise<void> {
  if (!supabase) throw new Error('Oylama için Supabase bağlantısı gereklidir.');
  const { error } = await supabase.from('votes').upsert(
    {
      voter_id: input.voterId,
      submission_id: input.submissionId,
      design_score: input.design,
      seo_score: input.seo,
      security_score: input.security,
    },
    { onConflict: 'voter_id,submission_id' },
  );
  if (error) throw new Error(error.message);
}

export async function submitApplication(
  payload: Omit<Application, 'id' | 'created_at' | 'participant_no' | 'status' | 'note'>,
): Promise<Application> {
  if (!supabase) throw new Error('Başvuru için Supabase bağlantısı gereklidir.');
  const { data, error } = await supabase
    .from('applications')
    .upsert({ ...payload, status: 'pending' }, { onConflict: 'user_id,competition_id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Application;
}

export async function upsertSubmission(payload: {
  user_id: string;
  competition_id: string;
  title: string;
  description: string | null;
  live_url: string;
  repo_url: string | null;
  hero_screenshot_url: string;
  seo_notes: string | null;
  security_notes: string | null;
}): Promise<Submission> {
  if (!supabase) throw new Error('Teslim için Supabase bağlantısı gereklidir.');
  const { data, error } = await supabase
    .from('submissions')
    .upsert({ ...payload, submitted_at: new Date().toISOString() }, {
      onConflict: 'user_id,competition_id',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Submission;
}
