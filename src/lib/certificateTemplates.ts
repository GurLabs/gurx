import type { AwardTypeCode } from '../types';

/**
 * Sertifika metinleri ve süsleme renkleri, GurLabs tarafından sağlanan
 * örnek PDF'lerden birebir alınmıştır. Yeni bir ödül türü eklenecekse
 * yalnızca bu tablo genişletilir.
 */
export type CornerVariant = 'dark' | 'gold' | 'blue';

export interface CertificateTemplate {
  /** Ortadaki büyük serif başlık. */
  title: string;
  /** Başlığın altındaki kalın alt başlık. */
  subtitle: string;
  /** İsmin altındaki üç satırlık gerekçe metni. `{event}` etkinlik adıyla değişir. */
  body: string;
  corner: CornerVariant;
}

export const CERTIFICATE_TEMPLATES: Record<AwardTypeCode, CertificateTemplate> = {
  '01': {
    title: 'CERTIFICATE OF PARTICIPATION',
    subtitle: 'This is proudly presented to',
    body: 'For active participation, creative contribution, and outstanding effort during the {event} event.',
    corner: 'dark',
  },
  '02': {
    title: 'BEST DESIGN AWARD',
    subtitle: 'Certificate of Excellence',
    body: 'In recognition of exceptional creativity, superior UI/UX execution, and visual excellence in the Best Design category.',
    corner: 'gold',
  },
  '03': {
    title: 'BEST SEO AWARD',
    subtitle: 'Certificate of Excellence',
    body: 'In recognition of outstanding technical optimization, search visibility strategy, and overall excellence in the Best SEO category.',
    corner: 'gold',
  },
  '04': {
    title: 'BEST SECURITY AWARD',
    subtitle: 'Certificate of Excellence',
    body: 'In recognition of robust architecture, secure coding practices, and high-level data protection standards in the Best Security category.',
    corner: 'gold',
  },
  '05': {
    // Örnek PDF'teki yazım birebir korunmuştur.
    title: 'GRAND WINNER AWWARD',
    subtitle: 'Certificate of Superior Achievement',
    body: 'Awarded to the overall champion for demonstrating unmatched excellence across design, security, and optimization in {event}.',
    corner: 'gold',
  },
  '06': {
    title: 'CERTIFICATE OF HONOR',
    subtitle: 'Presented with Highest Distinction',
    body: 'In recognition of exceptional leadership, invaluable mentorship, and distinguished contributions to the empowerment of young talents at {event}.',
    corner: 'blue',
  },
};

export const CORNER_ASSET: Record<CornerVariant, string> = {
  dark: '/certificate/corner-dark.png',
  gold: '/certificate/corner-gold.png',
  blue: '/certificate/corner-blue.png',
};

export function templateFor(code: AwardTypeCode): CertificateTemplate {
  return CERTIFICATE_TEMPLATES[code] ?? CERTIFICATE_TEMPLATES['01'];
}

/** "GurX™ Youth Design '26 Awards" — sağ üstteki etkinlik satırı. */
export function eventHeadline(eventName: string, year: number): string {
  const yy = String(year % 100).padStart(2, '0');
  return `${eventName} '${yy} Awards`;
}
