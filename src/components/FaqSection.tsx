import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Section, SectionHeading } from './ui/Section';

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
  /** Plain-text version used for the FAQPage structured data. */
  plain: string;
}

export const DEFAULT_FAQ: FaqItem[] = [
  {
    question: 'GurX™ Design Awards nedir?',
    answer:
      'GurX™ Design Awards, GurLabs Foundation™ tarafından düzenlenen uluslararası UI/UX ve Vibe Coding tasarım yarışmaları programıdır. Amacı gençlere görünürlük, geri bildirim ve kariyerlerinde kullanabilecekleri doğrulanabilir belgeler kazandırmaktır.',
    plain:
      'GurX Design Awards, GurLabs Foundation tarafından düzenlenen uluslararası UI/UX ve Vibe Coding tasarım yarışmaları programıdır.',
  },
  {
    question: 'Katılım ücretli mi?',
    answer:
      'Hayır. GurLabs Foundation™ bünyesindeki tüm GurX™ yarışmaları tamamen ücretsizdir. Katılım, değerlendirme, sertifika ve rozetler için hiçbir ücret talep edilmez.',
    plain: 'Hayır, tüm GurX yarışmaları tamamen ücretsizdir.',
  },
  {
    question: 'Kimler katılabilir?',
    answer:
      'GurX Youth Design için yaş aralığı 15–21’dir; katılımcılar 22 yaşından küçük olmalıdır. 15 yaşında veya daha küçükseniz başvuru sırasında veli izni onayını işaretlemeniz gerekir.',
    plain:
      'GurX Youth Design için yaş aralığı 15-21’dir. 15 yaş ve altındaki katılımcılar veli izni onayı vermelidir.',
  },
  {
    question: 'Başvuru için neler gerekiyor?',
    answer:
      'Referans olarak 1 adet Vibe Coding ile yapılmış web sitesi ve 1 adet portfolyo bağlantısı istiyoruz. Portfolyo olarak kendi siteniz, LinkedIn veya GitHub profiliniz kabul edilir.',
    plain:
      'Başvuru için 1 adet Vibe Coding web sitesi ve 1 adet portfolyo (kendi siteniz, LinkedIn veya GitHub) bağlantısı gereklidir.',
  },
  {
    question: 'Yarışma nasıl işliyor?',
    answer:
      'Konu, ilan edilen saatte katılımcı panelinde açıklanır. O andan itibaren 24 saatiniz vardır. Projenizi Google AI Studio üzerinde Vibe Coding ile tasarlar, SEO ve güvenlik iyileştirmelerini yapar, Vercel veya Netlify’a yayınlayıp canlı bağlantıyı panelden gönderirsiniz.',
    plain:
      'Konu açıklandıktan sonra 24 saatiniz olur. Projeyi Google AI Studio ile tasarlar, Vercel veya Netlify’a yayınlar ve bağlantıyı panelden gönderirsiniz.',
  },
  {
    question: 'Değerlendirme nasıl yapılır?',
    answer:
      'Açık puanlama uygulanır: tüm katılımcılar birbirlerinin projelerini tasarım, SEO ve güvenlik başlıklarında puanlar. Kimse kendi projesine oy veremez. Puanlar ve sıralama herkese açık şekilde yayınlanır.',
    plain:
      'Açık puanlama uygulanır; katılımcılar birbirlerinin projelerini puanlar ve kimse kendi projesine oy veremez.',
  },
  {
    question: 'Ödüller neler?',
    answer:
      'Nakit ödül yoktur. Tüm katılımcılara Katılım Sertifikası ve rozeti; Best Design, Best SEO, Best Security ve Grand Winner kategorilerinde ayrıca özel rozet ve sertifika verilir.',
    plain:
      'Nakit ödül yoktur. Katılım sertifikası ve rozeti ile Best Design, Best SEO, Best Security ve Grand Winner rozetleri verilir.',
  },
  {
    question: 'Sertifikamı nasıl doğrularım?',
    answer:
      'Her sertifikanın benzersiz bir kodu vardır (örn. GYD-26-0001-01). Bu kodu doğrulama sayfasına girerek veya rozetteki QR kodu okutarak sertifikanın sahibini, türünü ve veriliş tarihini 7/24 teyit edebilirsiniz.',
    plain:
      'Sertifika kodunu (örn. GYD-26-0001-01) doğrulama sayfasına girerek veya QR kodu okutarak teyit edebilirsiniz.',
  },
  {
    question: 'Google AI Studio kullanmak zorunlu mu?',
    answer:
      'Evet. GurX Youth Design projeleri aistudio.google.com üzerinde tasarlanmalıdır. Bu, tüm katılımcıların aynı araç setiyle yarışmasını sağlar. Farklı bir ortamda üretilen projeler değerlendirmeye alınmaz.',
    plain: 'Evet, GurX Youth Design projeleri aistudio.google.com üzerinde tasarlanmak zorundadır.',
  },
];

export const FaqSection: React.FC<{ items?: FaqItem[]; id?: string }> = ({
  items = DEFAULT_FAQ,
  id = 'sss',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.plain },
    })),
  };

  return (
    <Section id={id}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="gx-card p-6 sm:p-10 lg:p-12 space-y-8">
        <SectionHeading
          eyebrow={
            <>
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              Sıkça Sorulan Sorular
            </>
          }
          title="Merak edilenler"
          description="Başvuru, işleyiş, puanlama, sertifika ve rozetler hakkında en sık sorulan sorular."
        />

        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <h3>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-5 sm:px-6 py-4 text-left font-semibold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <span
                      className={`w-8 h-8 rounded-full border grid place-items-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-200/60">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
