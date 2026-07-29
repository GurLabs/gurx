/** Yetki seviyesi — neye erişebildiğini belirler. */
export type UserRole = 'participant' | 'staff' | 'admin';

/** Ekipteki görev — yalnızca staff/admin için anlamlıdır. */
export type StaffRole = 'co_organizer' | 'moderator' | 'developer' | 'marketing_lead' | 'jury';

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  co_organizer: 'Co-Organizer',
  moderator: 'Moderator',
  developer: 'Developer',
  marketing_lead: 'Marketing Lead',
  jury: 'Jüri',
};

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  /** Herkese açık profil adresi: /u/<username> */
  username: string | null;
  bio: string | null;
  /** Kapalıysa profil yalnızca sahibine görünür. */
  is_public: boolean;
  birth_year: number | null;
  avatar_url: string | null;
  role: UserRole;
  staff_role: StaffRole | null;
  staff_title: string | null;
  country: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

/** Herkese açık profil görünümünde e-posta ve doğum yılı yer almaz. */
export interface PublicProfile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  country: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  created_at: string;
}

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketCategory = 'general' | 'application' | 'submission' | 'certificate' | 'technical' | 'other';

export interface Ticket {
  id: string;
  reference: string;
  user_id: string | null;
  email: string;
  full_name: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string | null;
  author_name: string;
  is_staff: boolean;
  body: string;
  created_at: string;
}

export type CompetitionStatus =
  | 'upcoming'
  | 'registration_open'
  | 'topic_revealed'
  | 'in_progress'
  | 'voting'
  | 'completed';

export interface Competition {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  status: CompetitionStatus;
  cover_image: string | null;
  /** Registration window. */
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  /** The brief stays hidden until this moment, then the 24h clock starts. */
  topic_reveal_at: string | null;
  topic: string | null;
  /** Submissions close here — normally topic_reveal_at + 24h. */
  submission_deadline_at: string | null;
  voting_opens_at: string | null;
  voting_closes_at: string | null;
  results_at: string | null;
  min_age: number;
  max_age: number;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type ReferenceType = 'vibe_coding_site' | 'portfolio' | 'github' | 'linkedin';

export interface Application {
  id: string;
  user_id: string;
  competition_id: string;
  full_name: string;
  email: string;
  birth_year: number;
  guardian_consent: boolean;
  reference_design_url: string;
  reference_type: ReferenceType;
  portfolio_url: string | null;
  participant_no: number | null;
  status: ApplicationStatus;
  note: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  competition_id: string;
  title: string;
  description: string | null;
  live_url: string;
  repo_url: string | null;
  hero_screenshot_url: string;
  seo_notes: string | null;
  security_notes: string | null;
  is_published: boolean;
  submitted_at: string;
  /** Joined / aggregated fields coming from the public view. */
  author_name?: string | null;
  vote_count?: number;
  avg_score?: number;
}

export interface Vote {
  id: string;
  voter_id: string;
  submission_id: string;
  design_score: number;
  seo_score: number;
  security_score: number;
  created_at: string;
}

export interface Announcement {
  id: string;
  competition_id: string | null;
  title: string;
  body: string;
  is_pinned: boolean;
  published_at: string;
  audience: 'public' | 'participants';
}

/**
 * 01 Katılım · 02 Best Design · 03 Best SEO · 04 Best Security · 05 Grand Winner
 * 06 Yetkili / Görevli belgesi (jüri, moderatör, destekleyici)
 */
export type AwardTypeCode = '01' | '02' | '03' | '04' | '05' | '06';

export interface Certificate {
  id: string;
  code: string;
  user_id: string | null;
  competition_id: string | null;
  recipient_name: string;
  award_type: AwardTypeCode;
  event_code: string;
  issued_at: string;
  revoked: boolean;
  issuer: string;
}

export interface ParsedCertificateCode {
  raw: string;
  eventCode: string;
  year: number;
  participantId: string;
  awardType: AwardTypeCode;
  valid: boolean;
}

export interface LeaderboardRow {
  submission_id: string;
  title: string;
  author_name: string;
  hero_screenshot_url: string;
  live_url: string;
  design_score: number;
  seo_score: number;
  security_score: number;
  total_score: number;
  vote_count: number;
  rank: number;
  award_type: AwardTypeCode | null;
}
