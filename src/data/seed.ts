import type {
  Announcement,
  Certificate,
  Competition,
  LeaderboardRow,
  Submission,
} from '../types';
import { YOUTH_SLUG } from '../lib/brand';

/**
 * Fallback content so every public page renders before Supabase is wired up
 * (and as a safety net if a query returns empty). Once the DB has rows the
 * live data always wins.
 */

const now = new Date();
const inDays = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString();

export const YOUTH_COMPETITION: Competition = {
  id: 'seed-youth-2026',
  slug: YOUTH_SLUG,
  title: 'GurX Youth Design 2026',
  subtitle: '24 saatlik Vibe Coding tasarım maratonu',
  category: 'Vibe Coding · UI/UX',
  status: 'registration_open',
  cover_image:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  registration_opens_at: inDays(-12),
  registration_closes_at: inDays(9),
  topic_reveal_at: inDays(11),
  topic: null,
  submission_deadline_at: inDays(12),
  voting_opens_at: inDays(12),
  voting_closes_at: inDays(15),
  results_at: inDays(17),
  min_age: 15,
  max_age: 21,
};

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    competition_id: YOUTH_COMPETITION.id,
    title: 'Başvurular açıldı',
    body: 'GurX Youth Design 2026 başvuruları açıldı. Referans tasarımınızı ve portfolyo bağlantınızı hazırlayın; kontenjan sınırlıdır.',
    is_pinned: true,
    published_at: inDays(-12),
    audience: 'public',
  },
  {
    id: 'a2',
    competition_id: YOUTH_COMPETITION.id,
    title: 'Konu açıklanma saati',
    body: 'Yarışma konusu, geri sayım sıfırlandığı anda katılımcı panelinde ve e-posta ile aynı anda paylaşılacaktır. Konu açıklandıktan sonra 24 saatlik süreniz başlar.',
    is_pinned: false,
    published_at: inDays(-6),
    audience: 'participants',
  },
  {
    id: 'a3',
    competition_id: YOUTH_COMPETITION.id,
    title: 'Teslim formatı',
    body: 'Projelerinizi Vercel veya Netlify üzerinde yayına alıp canlı bağlantıyı panelden gönderin. Hero ekran görüntüsü zorunludur.',
    is_pinned: false,
    published_at: inDays(-3),
    audience: 'participants',
  },
];

export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 's1',
    user_id: 'u1',
    competition_id: YOUTH_COMPETITION.id,
    title: 'Atlas — Şehir İçi Mikro Mobilite',
    description: 'Şehir içi ulaşım için erişilebilirlik öncelikli bir arayüz denemesi.',
    live_url: 'https://example.vercel.app',
    repo_url: null,
    hero_screenshot_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    seo_notes: 'Semantik başlık hiyerarşisi, OG etiketleri, sitemap.',
    security_notes: 'CSP, HSTS, form doğrulama.',
    is_published: true,
    submitted_at: inDays(-1),
    author_name: 'Demo Katılımcı 1',
    vote_count: 18,
    avg_score: 8.6,
  },
  {
    id: 's2',
    user_id: 'u2',
    competition_id: YOUTH_COMPETITION.id,
    title: 'Verde — İklim Verisi Paneli',
    description: 'Açık veri kaynaklarını sade bir panelde toplayan bir gösterge tablosu.',
    live_url: 'https://example.netlify.app',
    repo_url: null,
    hero_screenshot_url:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    seo_notes: 'JSON-LD, canonical, görsel lazy-load.',
    security_notes: 'Bağımlılık denetimi, güvenli başlıklar.',
    is_published: true,
    submitted_at: inDays(-1),
    author_name: 'Demo Katılımcı 2',
    vote_count: 15,
    avg_score: 8.1,
  },
  {
    id: 's3',
    user_id: 'u3',
    competition_id: YOUTH_COMPETITION.id,
    title: 'Nota — Öğrenci Ders Planlayıcı',
    description: 'Lise öğrencileri için haftalık planlama ve odak takibi.',
    live_url: 'https://example.vercel.app',
    repo_url: null,
    hero_screenshot_url:
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop',
    seo_notes: 'Meta açıklama, hız optimizasyonu.',
    security_notes: 'XSS temizliği, HTTPS zorunluluğu.',
    is_published: true,
    submitted_at: inDays(-1),
    author_name: 'Demo Katılımcı 3',
    vote_count: 12,
    avg_score: 7.8,
  },
];

export const SEED_LEADERBOARD: LeaderboardRow[] = [
  {
    submission_id: 's1',
    title: 'Atlas — Şehir İçi Mikro Mobilite',
    author_name: 'Demo Katılımcı 1',
    hero_screenshot_url: SEED_SUBMISSIONS[0].hero_screenshot_url,
    live_url: SEED_SUBMISSIONS[0].live_url,
    design_score: 9.1,
    seo_score: 8.4,
    security_score: 8.3,
    total_score: 25.8,
    vote_count: 18,
    rank: 1,
    award_type: '05',
  },
  {
    submission_id: 's2',
    title: 'Verde — İklim Verisi Paneli',
    author_name: 'Demo Katılımcı 2',
    hero_screenshot_url: SEED_SUBMISSIONS[1].hero_screenshot_url,
    live_url: SEED_SUBMISSIONS[1].live_url,
    design_score: 8.2,
    seo_score: 9.0,
    security_score: 8.0,
    total_score: 25.2,
    vote_count: 15,
    rank: 2,
    award_type: '03',
  },
  {
    submission_id: 's3',
    title: 'Nota — Öğrenci Ders Planlayıcı',
    author_name: 'Demo Katılımcı 3',
    hero_screenshot_url: SEED_SUBMISSIONS[2].hero_screenshot_url,
    live_url: SEED_SUBMISSIONS[2].live_url,
    design_score: 7.9,
    seo_score: 7.6,
    security_score: 9.2,
    total_score: 24.7,
    vote_count: 12,
    rank: 3,
    award_type: '04',
  },
];

/** Örnek doğrulama kaydı — /certificate/verify/GYD-26-0001-01 */
export const SEED_CERTIFICATES: Certificate[] = [
  {
    id: 'c1',
    code: 'GYD-26-0001-01',
    user_id: null,
    competition_id: YOUTH_COMPETITION.id,
    recipient_name: 'Örnek Katılımcı',
    award_type: '01',
    event_code: 'GYD',
    issued_at: '2026-07-15T10:00:00.000Z',
    revoked: false,
    issuer: 'GurX Youth Design & GurLabs Foundation™',
  },
];
