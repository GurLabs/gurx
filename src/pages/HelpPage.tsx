import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  Image as ImageIcon,
  LifeBuoy,
  LockKeyhole,
  Rocket,
  Search,
  Upload,
  Wand2,
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Section, SectionHeading } from '../components/ui/Section';
import { AiStudioLockup } from '../components/ui/AiStudioLockup';
import { FaqSection, DEFAULT_FAQ } from '../components/FaqSection';
import { useSeo } from '../hooks/useSeo';
import { AI_STUDIO } from '../lib/brand';

const STEPS = [
  {
    n: '1',
    icon: Wand2,
    title: 'Google AI Studio’da tasarlayın',
    body: (
      <>
        <a
          href={AI_STUDIO.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-900 underline underline-offset-2"
        >
          aistudio.google.com
        </a>{' '}
        adresine gidin ve Google hesabınızla giriş yapın. Yeni bir uygulama oluşturup konuyu
        anlatan bir prompt yazın. Vibe Coding, tek seferde mükemmel sonuç almak değil; küçük
        adımlarla iterasyon yapmaktır.
      </>
    ),
    tips: [
      'Önce yapıyı isteyin (bölümler, hiyerarşi), sonra görsel dili.',
      'Her turda tek bir şeyi değiştirin; sonucu görün, sonra devam edin.',
      'Mobil görünümü ayrıca kontrol ettirin.',
    ],
  },
  {
    n: '2',
    icon: Search,
    title: 'SEO iyileştirmelerini yapın',
    body: 'Sayfanın arama motorları tarafından doğru anlaşılması, puanlamanın üç ana başlığından biridir.',
    tips: [
      'Anlamlı bir <title> ve meta description yazın.',
      'Tek bir <h1> kullanın, alt başlıkları sırayla ilerletin.',
      'Open Graph ve Twitter kartı etiketlerini ekleyin.',
      'Görsellere alt metni ve width/height verin, lazy-load kullanın.',
      'Canonical bağlantı ve JSON-LD yapılandırılmış veri ekleyin.',
    ],
  },
  {
    n: '3',
    icon: LockKeyhole,
    title: 'Güvenlik iyileştirmelerini yapın',
    body: 'Küçük bir tanıtım sitesinde bile güvenliği ciddiye almanız beklenir.',
    tips: [
      'API anahtarlarını istemci koduna koymayın.',
      'Formlarda girdi doğrulaması yapın ve kullanıcı içeriğini kaçışlayın.',
      'Dış bağlantılarda rel="noopener noreferrer" kullanın.',
      'Sadece HTTPS üzerinden kaynak yükleyin.',
      'Güvenlik başlıklarını ekleyin (CSP, X-Content-Type-Options, Referrer-Policy).',
    ],
  },
  {
    n: '4',
    icon: Rocket,
    title: 'Vercel veya Netlify’a yayınlayın',
    body: 'AI Studio’daki işiniz bittiğinde projeyi dışa aktarın ve bir hosting servisine yükleyin.',
    tips: [
      'Vercel: vercel.com → Add New → Project → projeyi içe aktarın → Deploy.',
      'Netlify: app.netlify.com → Add new site → projeyi bağlayın veya klasörü sürükleyip bırakın.',
      'Yayın sonrası verilen adresi tarayıcıda açıp çalıştığını doğrulayın.',
      'Bağlantı, sonuçlar açıklanana kadar erişilebilir kalmalıdır.',
    ],
  },
  {
    n: '5',
    icon: ImageIcon,
    title: 'Hero ekran görüntüsünü hazırlayın',
    body: 'Oylama sayfasında projeniz bu görselle listelenir, dolayısıyla ilk izlenimi belirler.',
    tips: [
      'Sayfanın en üst bölümünü (hero) tam genişlikte yakalayın.',
      '16:9 oranı ve en az 1200 piksel genişlik önerilir.',
      'Görseli bir yerde barındırıp doğrudan bağlantısını kullanın.',
    ],
  },
  {
    n: '6',
    icon: Upload,
    title: 'Sonuç linkini panelden gönderin',
    body: (
      <>
        Katılımcı panelindeki <strong>Sonuç Yükleme</strong> bölümüne canlı bağlantınızı, hero
        görselinizi ve kısa açıklamanızı girin. Süre dolmadan önce gönderdiğinizden emin olun.
      </>
    ),
    tips: [
      'Teslimi süre dolmadan yapın; sistem süre sonunda otomatik kapanır.',
      'Süre bitene kadar teslimi güncelleyebilirsiniz.',
      'Teslim ettikten sonra oylama sayfasına erişiminiz açılır.',
    ],
  },
];

const TROUBLESHOOT = [
  {
    q: 'AI Studio’da proje açılmıyor',
    a: 'Google hesabınızla giriş yaptığınızdan emin olun ve tarayıcı önbelleğini temizleyip yeniden deneyin. Kurumsal/okul hesaplarında erişim kısıtlı olabilir; kişisel bir Google hesabı kullanın.',
  },
  {
    q: 'Vercel dağıtımı hata veriyor',
    a: 'Genellikle eksik bağımlılık veya derleme hatasıdır. Dağıtım günlüğündeki (build log) ilk hatayı okuyun; hata mesajını AI Studio’ya yapıştırıp düzeltmesini isteyebilirsiniz.',
  },
  {
    q: 'Teslim formu kapalı görünüyor',
    a: 'Teslim yalnızca konu açıklandıktan sonra ve 24 saatlik süre içinde açıktır. Ayrıca başvurunuzun onaylanmış olması gerekir.',
  },
  {
    q: 'Oylama sayfasına giremiyorum',
    a: 'Oylama, projesini teslim etmiş katılımcılara açılır ve yalnızca oylama penceresi içinde erişilebilir.',
  },
  {
    q: 'Sertifikamı göremiyorum',
    a: 'Sertifikalar sonuçlar açıklandıktan sonra panelinizdeki Ödüllerim bölümünde görünür. Kodunuzla doğrulama sayfasından da kontrol edebilirsiniz.',
  },
];

export const HelpPage: React.FC = () => {
  useSeo({
    title: 'Yardım Merkezi — GurX™ Design Awards',
    description:
      'Google AI Studio ile nasıl tasarlanır, Vercel veya Netlify’a nasıl yayınlanır, sonuç linki nasıl gönderilir? GurX Youth Design adım adım yardım rehberi.',
    path: '/yardim',
  });

  return (
    <>
      <PageHero
        eyebrow={
          <>
            <LifeBuoy className="w-3.5 h-3.5 text-slate-600" />
            Yardım merkezi
          </>
        }
        title="Nasıl yapılır?"
        description="Tasarımdan yayına, yayından teslime kadar tüm süreç altı adımda. İlk kez katılıyorsanız bu sayfayı sırayla takip etmeniz yeterli."
        actions={
          <>
            <Link to="/youth-design" className="gx-btn-ghost">
              Yarışma sayfası
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link to="/kurallar" className="gx-btn-ghost">
              Kurallar & Şartlar
            </Link>
          </>
        }
      />

      <Section className="!py-6">
        <AiStudioLockup />
      </Section>

      <Section id="adimlar">
        <div className="space-y-6">
          <SectionHeading
            eyebrow={
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Adım adım
              </>
            }
            title="Altı adımda teslim"
          />

          <div className="space-y-4">
            {STEPS.map(({ n, icon: Icon, title, body, tips }) => (
              <article key={n} className="gx-card p-6 sm:p-8 grid gap-5 sm:grid-cols-12">
                <div className="sm:col-span-4 flex sm:flex-col gap-4 sm:gap-3 items-start">
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white grid place-items-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-slate-400">ADIM {n}</p>
                    <h3 className="font-semibold text-slate-900 mt-0.5">{title}</h3>
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                  <ul className="space-y-2">
                    {tips.map((tip) => (
                      <li key={tip} className="flex gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="min-w-0">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="sorun-giderme">
        <div className="space-y-6">
          <SectionHeading
            eyebrow={
              <>
                <CircleHelp className="w-3.5 h-3.5 text-slate-600" />
                Sorun giderme
              </>
            }
            title="Sık karşılaşılan durumlar"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {TROUBLESHOOT.map((t) => (
              <article key={t.q} className="gx-card p-6 space-y-2">
                <h3 className="font-semibold text-slate-900 text-sm">{t.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t.a}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <FaqSection items={DEFAULT_FAQ.slice(0, 6)} id="yardim-sss" />
    </>
  );
};
