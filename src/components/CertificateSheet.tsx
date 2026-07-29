import React from 'react';
import { qrImageUrl } from '../lib/certificate';
import { CORNER_ASSET, eventHeadline, templateFor } from '../lib/certificateTemplates';
import type { AwardTypeCode } from '../types';

export interface CertificateSheetProps {
  recipientName: string;
  awardType: AwardTypeCode;
  eventName: string;
  /** Örnek PDF'lerdeki gibi gün/ay/yıl — "28/7/2026". */
  issuedAt: string;
  code: string;
  verifyUrl: string;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/**
 * Örnek PDF'lerin birebir yeniden üretimi.
 *
 * Ölçüler 1348×953 px'lik referans görüntüden alınmış, konumlar yüzde,
 * punto değerleri `cqw` (kapsayıcı genişliğinin yüzdesi) cinsinden yazılmıştır;
 * böylece ekranda ve A4 yatay baskıda aynı yerleşim korunur.
 */
export const CertificateSheet: React.FC<CertificateSheetProps> = ({
  recipientName,
  awardType,
  eventName,
  issuedAt,
  code,
  verifyUrl,
}) => {
  const tpl = templateFor(awardType);
  const corner = CORNER_ASSET[tpl.corner];
  const year = new Date(issuedAt).getFullYear() || new Date().getFullYear();
  const body = tpl.body.replace('{event}', eventName);

  return (
    <div
      className="cert-sheet-root relative w-full bg-white text-[#3f3f3f] overflow-hidden"
      style={{ aspectRatio: '1348 / 953', containerType: 'inline-size' }}
    >
      {/* Köşe süslemeleri — tek varlık, dört yöne aynalanıyor */}
      <img
        src={corner}
        alt=""
        aria-hidden
        className="absolute"
        style={{ left: '8.3%', top: '5.4%', width: '7.42%', transform: 'scaleY(-1)' }}
      />
      <img
        src={corner}
        alt=""
        aria-hidden
        className="absolute"
        style={{ right: '8.3%', top: '5.4%', width: '7.42%', transform: 'scale(-1, -1)' }}
      />
      <img
        src={corner}
        alt=""
        aria-hidden
        className="absolute"
        style={{ left: '8.3%', bottom: '5.0%', width: '7.42%' }}
      />
      <img
        src={corner}
        alt=""
        aria-hidden
        className="absolute"
        style={{ right: '8.3%', bottom: '5.0%', width: '7.42%', transform: 'scaleX(-1)' }}
      />

      {/* Üst bant: sol Foundation kilidi, sağ etkinlik adı */}
      <img
        src="/certificate/foundation-lockup.png"
        alt="GurLabs Foundation™"
        className="absolute"
        style={{ left: '13.7%', top: '14.4%', width: '27.4%' }}
      />
      <div
        className="absolute text-right font-bold"
        style={{
          right: '13.6%',
          top: '16.4%',
          fontFamily: 'Poppins, Inter, sans-serif',
          fontSize: '1.62cqw',
          letterSpacing: '-0.01em',
          color: '#3f3f3f',
        }}
      >
        {eventHeadline(eventName, year)}
      </div>

      {/* Başlık */}
      <div
        className="absolute left-0 right-0 text-center"
        style={{
          top: '31.4%',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 700,
          fontSize: '3.45cqw',
          letterSpacing: '0.01em',
          color: '#3f3f3f',
        }}
      >
        {tpl.title}
      </div>

      {/* Alt başlık */}
      <div
        className="absolute left-0 right-0 text-center font-bold"
        style={{
          top: '41.4%',
          fontFamily: 'Poppins, Inter, sans-serif',
          fontSize: '1.72cqw',
          color: '#3f3f3f',
        }}
      >
        {tpl.subtitle}
      </div>

      {/* İsim */}
      <div
        className="absolute left-0 right-0 text-center whitespace-nowrap"
        style={{
          top: '46.5%',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: '6.1cqw',
          lineHeight: 1.15,
          color: '#3f3f3f',
        }}
      >
        {recipientName}
      </div>

      {/* Gerekçe metni */}
      <div
        className="absolute text-center"
        style={{
          left: '35%',
          right: '35%',
          top: '60.5%',
          fontFamily: 'Poppins, Inter, sans-serif',
          fontSize: '1.18cqw',
          lineHeight: 1.6,
          color: '#5a5a5a',
        }}
      >
        {body}
      </div>

      {/* Mühür */}
      <img
        src="/certificate/seal.png"
        alt=""
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: '73.2%', width: '12.4%' }}
      />

      {/* Tarih */}
      <div
        className="absolute"
        style={{
          left: '15.6%',
          top: '83.2%',
          fontFamily: 'Poppins, Inter, sans-serif',
          fontSize: '1.12cqw',
          color: '#3f3f3f',
        }}
      >
        Date {shortDate(issuedAt)}
      </div>

      {/* Doğrulama kimliği */}
      <div
        className="absolute text-right"
        style={{
          right: '20.4%',
          top: '81.8%',
          fontFamily: 'Poppins, Inter, sans-serif',
          fontSize: '1.12cqw',
          lineHeight: 1.7,
          color: '#3f3f3f',
        }}
      >
        <div>Verification ID</div>
        <div>{code}</div>
      </div>

      <img
        src={qrImageUrl(verifyUrl, 240)}
        alt="Doğrulama QR kodu"
        className="absolute"
        style={{ right: '14.4%', top: '81.0%', width: '4.9%' }}
      />
    </div>
  );
};
