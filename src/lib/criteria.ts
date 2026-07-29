/**
 * Değerlendirme ölçütlerinin tek kaynağı.
 *
 * Ölçütleri değiştirmek istediğinizde yalnızca bu diziyi düzenlemeniz yeterli:
 * oylama sayfası, sıralama tablosu ve landing'deki ölçüt kartları buradan beslenir.
 *
 * Not: `key` alanları `votes` tablosundaki sütun adlarıyla eşleşir
 * (design_score / seo_score / security_score). Ölçüt adını değiştirmek
 * serbesttir; `key` değiştirilecekse şema da güncellenmelidir.
 */
export interface Criterion {
  key: 'design' | 'seo' | 'security';
  column: 'design_score' | 'seo_score' | 'security_score';
  label: string;
  short: string;
  description: string;
}

export const CRITERIA: Criterion[] = [
  {
    key: 'design',
    column: 'design_score',
    label: 'Tasarım & Deneyim',
    short: 'Tasarım',
    description: 'Görsel hiyerarşi, tipografi, düzen, erişilebilirlik ve akışın netliği.',
  },
  {
    key: 'seo',
    column: 'seo_score',
    label: 'SEO',
    short: 'SEO',
    description: 'Semantik işaretleme, meta yapısı, yapılandırılmış veri, canonical ve sayfa hızı.',
  },
  {
    key: 'security',
    column: 'security_score',
    label: 'Güvenlik',
    short: 'Güvenlik',
    description: 'Güvenlik başlıkları, girdi doğrulama, gizli anahtar hijyeni ve güvenli dağıtım.',
  },
];

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;
