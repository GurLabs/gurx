import type { AwardTypeCode } from '../types';

export const SITE_URL = 'https://gurx.gurlabs.com';

export const BRAND = {
  gurx: 'GurX™',
  foundation: 'GurLabs Foundation™',
  awards: 'GurX™ Design Awards',
  youth: 'GurX Youth Design',
} as const;

/** Google AI Studio is the mandatory design environment for Youth Design. */
export const AI_STUDIO = {
  url: 'https://aistudio.google.com/',
  logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU4bG3YWExmatSNF3tKyjazEqhMoFiMuxMYf4nP-J6aFM7UCEJzk_A33aK&s=10',
  label: 'Google AI Studio',
} as const;

export const DEPLOY_TARGETS = [
  { name: 'Vercel', url: 'https://vercel.com/new' },
  { name: 'Netlify', url: 'https://app.netlify.com/start' },
] as const;

export const ADMIN_EMAIL = 'zulfumirzagur23@gmail.com';

/** Jüri / moderatör / destekleyici başvuru formu. */
export const OFFICIAL_FORM_URL = 'https://forms.gle/HaKewYo2WsqdYocv7';

/** Destek adresi — ticket sistemi ve iletişim formu buraya düşer. */
export const SUPPORT_EMAIL = 'gurx@gurlabs.com';

export interface AwardMeta {
  code: AwardTypeCode;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  accent: string;
  ring: string;
}

export const AWARD_TYPES: Record<AwardTypeCode, AwardMeta> = {
  '01': {
    code: '01',
    name: 'Katılım Belgesi',
    shortName: 'Attendee',
    badge: '/gy-attendee.png',
    description:
      'Yarışmayı kurallara uygun şekilde tamamlayan ve projesini süresi içinde teslim eden her katılımcıya verilir.',
    accent: 'text-slate-700',
    ring: 'ring-slate-200',
  },
  '02': {
    code: '02',
    name: 'Best Design',
    shortName: 'Best Design',
    badge: '/gy-best-design.png',
    description:
      'Görsel hiyerarşi, tipografi, düzen ve kullanıcı deneyiminde en yüksek açık puanı alan projeye verilir.',
    accent: 'text-indigo-700',
    ring: 'ring-indigo-200',
  },
  '03': {
    code: '03',
    name: 'Best SEO',
    shortName: 'Best SEO',
    badge: '/gy-best-seo.png',
    description:
      'Teknik SEO, semantik işaretleme, meta yapısı ve performans optimizasyonunda öne çıkan projeye verilir.',
    accent: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
  '04': {
    code: '04',
    name: 'Best Security',
    shortName: 'Best Security',
    badge: '/gy-best-secure.png',
    description:
      'Güvenlik başlıkları, veri koruma, bağımlılık hijyeni ve güvenli dağıtım pratiklerinde en iyi projeye verilir.',
    accent: 'text-sky-700',
    ring: 'ring-sky-200',
  },
  '05': {
    code: '05',
    name: 'Grand Winner',
    shortName: 'Grand Winner',
    badge: '/gy-grand-winner.png',
    description:
      'Katılımcı oylaması sonucunda en yüksek oyu alan projeye verilen ana ödüldür.',
    accent: 'text-amber-700',
    ring: 'ring-amber-200',
  },
  '06': {
    code: '06',
    name: 'Yetkili Görev Belgesi',
    shortName: 'Yetkili',
    badge: '/gf-badge.png',
    description:
      'Yarışmada jüri, moderatör veya destekleyici olarak görev alan kişilere verilir.',
    accent: 'text-slate-700',
    ring: 'ring-slate-200',
  },
};

/** Katılımcılara verilen ödüller — yetkili belgesi bu listede yer almaz. */
export const PARTICIPANT_AWARDS = ['01', '02', '03', '04', '05'] as const;

export const AWARD_LIST = Object.values(AWARD_TYPES);

/** Herkese açık ödül vitrinlerinde yetkili belgesi gösterilmez. */
export const PARTICIPANT_AWARD_LIST = AWARD_LIST.filter((a) => a.code !== '06');

export const SAMPLE_CERTIFICATE_IMAGE = '/s-attendee-e.png';

export const YOUTH_SLUG = 'gurx-youth-design-2026';

/** Public-facing navigation shared by the header and footer. */
export const PUBLIC_NAV = [
  { label: 'Awards', to: '/#awards' },
  { label: 'Youth Design', to: '/youth-design' },
  { label: 'Kurallar & Şartlar', to: '/kurallar' },
  { label: 'Sertifika Doğrula', to: '/certificate/verify' },
  { label: 'Yardım', to: '/yardim' },
] as const;
