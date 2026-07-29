import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { StandalonePageSkeleton } from '../components/ui/Skeleton';
import { CertificateSheet } from '../components/CertificateSheet';
import { useAsync } from '../hooks/useAsync';
import { useSeo } from '../hooks/useSeo';
import { fetchCertificateByCode } from '../lib/api';
import { certificateVerifyUrl, eventNameFor } from '../lib/certificate';

/**
 * Yazdırılabilir sertifika. "PDF olarak indir" tarayıcının yazdırma
 * penceresini açar; kullanıcı "PDF olarak kaydet" seçer. A4 yatay,
 * kenar boşluksuz basılır.
 */
export const CertificateDocumentPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  useSeo({ title: `Sertifika ${code ?? ''}`, path: `/certificate/${code}/belge`, noindex: true });

  const { data: certificate, loading } = useAsync(
    () => (code ? fetchCertificateByCode(code) : Promise.resolve(null)),
    [code],
  );

  if (loading) return <StandalonePageSkeleton />;

  if (!certificate) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3 max-w-md">
          <h1 className="text-2xl font-serif text-slate-900">Sertifika bulunamadı</h1>
          <p className="text-sm text-slate-600">
            <span className="font-mono">{code}</span> koduna ait bir kayıt yok.
          </p>
          <Link to="/dogrula" className="gx-btn-primary">
            Doğrulama sayfası
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          .cert-frame { box-shadow: none !important; border: 0 !important; border-radius: 0 !important; max-width: none !important; }
          html, body { background: #fff !important; }
        }
      `}</style>

      <div className="no-print max-w-[1100px] mx-auto mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to={`/dogrula/${certificate.code}`} className="gx-btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          Doğrulama sayfası
        </Link>
        <button onClick={() => window.print()} className="gx-btn-primary">
          <Printer className="w-4 h-4" />
          PDF olarak indir / yazdır
        </button>
      </div>

      <div className="cert-frame max-w-[1100px] mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <CertificateSheet
          recipientName={certificate.recipient_name}
          awardType={certificate.award_type}
          eventName={eventNameFor(certificate.event_code)}
          issuedAt={certificate.issued_at}
          code={certificate.code}
          verifyUrl={certificateVerifyUrl(certificate.code)}
        />
      </div>
    </div>
  );
};
