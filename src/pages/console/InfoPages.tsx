import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  LockKeyhole,
  Rocket,
  Search,
  Upload,
  Wand2,
} from 'lucide-react';
import { ConsolePage, ConsoleSection } from '../../components/console/ConsolePage';
import { AiStudioLockup } from '../../components/ui/AiStudioLockup';
import { Alert } from '../../components/ui/Feedback';
import { RULE_ARTICLES } from '../../data/rules';
import { useSeo } from '../../hooks/useSeo';
import { AI_STUDIO, DEPLOY_TARGETS } from '../../lib/brand';

/** Shared renderer so the panel and the public page never drift apart. */
export const RulesArticleList: React.FC = () => (
  <div className="space-y-8">
    {RULE_ARTICLES.map((article) => (
      <article key={article.id} id={article.id} className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{article.title}</h2>
        {article.paragraphs?.map((p, i) => (
          <p key={i} className="text-sm text-slate-600 leading-relaxed">
            {p}
          </p>
        ))}
        {article.items ? (
          <ul className="space-y-2">
            {article.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    ))}
  </div>
);

export const ConsoleRulesPage: React.FC = () => {
  useSeo({ title: 'Kurallar — Katılımcı Paneli', noindex: true });

  return (
    <ConsolePage
      eyebrow="Bilgi"
      title="Kurallar ve Şartlar"
      description="Başvuru formunu gönderdiğinizde bu metnin tamamını kabul etmiş olursunuz."
      actions={
        <Link to="/kurallar" className="gx-btn-ghost" target="_blank">
          Herkese açık sürüm
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      }
      toc={RULE_ARTICLES.map((a) => ({ id: a.id, label: a.title }))}
    >
      <Alert tone="warning">
        Özellikle <a href="#arac" className="underline font-semibold">zorunlu tasarım ortamı</a> ve{' '}
        <a href="#puanlama" className="underline font-semibold">açık puanlama</a> maddelerini dikkatle
        okuyun.
      </Alert>
      <RulesArticleList />
    </ConsolePage>
  );
};

const HELP_STEPS = [
  {
    id: 'tasarim',
    icon: Wand2,
    title: '1. Google AI Studio’da tasarlayın',
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
        adresine gidip Google hesabınızla giriş yapın, yeni bir uygulama oluşturun ve konuyu
        anlatan bir prompt yazın. Vibe Coding tek seferde mükemmel sonuç almak değil, küçük
        adımlarla iterasyon yapmaktır.
      </>
    ),
    tips: [
      'Önce yapıyı isteyin (bölümler, hiyerarşi), sonra görsel dili.',
      'Her turda tek bir şeyi değiştirin, sonucu görün, sonra devam edin.',
      'Mobil görünümü ayrıca kontrol ettirin.',
    ],
  },
  {
    id: 'seo',
    icon: Search,
    title: '2. SEO iyileştirmelerini yapın',
    body: 'Sayfanın arama motorlarınca doğru anlaşılması, puanlamanın üç ana başlığından biridir.',
    tips: [
      'Anlamlı bir <title> ve meta description yazın.',
      'Tek bir <h1> kullanın, alt başlıkları sırayla ilerletin.',
      'Open Graph ve Twitter kartı etiketlerini ekleyin.',
      'Görsellere alt metni, width/height ve lazy-load verin.',
      'Canonical bağlantı ve JSON-LD yapılandırılmış veri ekleyin.',
    ],
  },
  {
    id: 'guvenlik',
    icon: LockKeyhole,
    title: '3. Güvenlik iyileştirmelerini yapın',
    body: 'Küçük bir tanıtım sitesinde bile güvenliği ciddiye almanız beklenir.',
    tips: [
      'API anahtarlarını istemci koduna koymayın.',
      'Formlarda girdi doğrulaması yapın, kullanıcı içeriğini kaçışlayın.',
      'Dış bağlantılarda rel="noopener noreferrer" kullanın.',
      'Güvenlik başlıklarını ekleyin (CSP, X-Content-Type-Options, Referrer-Policy).',
    ],
  },
  {
    id: 'yayin',
    icon: Rocket,
    title: '4. Vercel veya Netlify’a yayınlayın',
    body: 'AI Studio’daki işiniz bittiğinde projeyi dışa aktarın ve bir hosting servisine yükleyin.',
    tips: [
      'Vercel: Add New → Project → projeyi içe aktarın → Deploy.',
      'Netlify: Add new site → projeyi bağlayın veya klasörü sürükleyip bırakın.',
      'Yayın sonrası adresi tarayıcıda açıp çalıştığını doğrulayın.',
      'Bağlantı, sonuçlar açıklanana kadar erişilebilir kalmalıdır.',
    ],
  },
  {
    id: 'gorsel',
    icon: ImageIcon,
    title: '5. Hero ekran görüntüsünü hazırlayın',
    body: 'Oylama sayfasında projeniz bu görselle listelenir, ilk izlenimi bu belirler.',
    tips: [
      'Sayfanın en üst bölümünü tam genişlikte yakalayın.',
      '16:9 oranı ve en az 1200 piksel genişlik önerilir.',
      'Görseli bir yerde barındırıp doğrudan bağlantısını kullanın.',
    ],
  },
  {
    id: 'teslim',
    icon: Upload,
    title: '6. Sonuç linkini panelden gönderin',
    body: 'Sonuç Yükleme bölümüne canlı bağlantınızı, hero görselinizi ve kısa açıklamanızı girin.',
    tips: [
      'Teslimi süre dolmadan yapın; sistem süre sonunda otomatik kapanır.',
      'Süre bitene kadar teslimi güncelleyebilirsiniz.',
      'Teslim ettikten sonra oylamaya katılabilirsiniz.',
    ],
  },
];

export const ConsoleHelpPage: React.FC = () => {
  useSeo({ title: 'Yardım — Katılımcı Paneli', noindex: true });

  return (
    <ConsolePage
      eyebrow="Bilgi"
      title="Yardım"
      description="Tasarımdan yayına, yayından teslime kadar tüm süreç altı adımda."
      toc={HELP_STEPS.map((s) => ({ id: s.id, label: s.title }))}
    >
      <AiStudioLockup />

      {HELP_STEPS.map(({ id, icon: Icon, title, body, tips }) => (
        <ConsoleSection key={id} id={id} title={title}>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-3 min-w-0">
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
          </div>
        </ConsoleSection>
      ))}

      <ConsoleSection id="baglantilar" title="Hızlı bağlantılar">
        <div className="flex flex-wrap gap-2.5">
          <a href={AI_STUDIO.url} target="_blank" rel="noopener noreferrer" className="gx-btn-ghost">
            Google AI Studio
            <ExternalLink className="w-4 h-4" />
          </a>
          {DEPLOY_TARGETS.map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gx-btn-ghost"
            >
              {t.name}
              <ExternalLink className="w-4 h-4" />
            </a>
          ))}
          <Link to="/yardim" className="gx-btn-ghost" target="_blank">
            Genişletilmiş yardım merkezi
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </ConsoleSection>
    </ConsolePage>
  );
};

const LEGAL_SECTIONS = RULE_ARTICLES.filter((a) => ['gizlilik', 'kvkk', 'sorumluluk', 'ozgunluk'].includes(a.id));

export const ConsoleLegalPage: React.FC = () => {
  useSeo({ title: 'Yasal — Katılımcı Paneli', noindex: true });

  return (
    <ConsolePage
      eyebrow="Bilgi"
      title="Yasal"
      description="Gizlilik, KVKK, fikri haklar ve sorumluluk sınırlarına dair maddeler."
      toc={LEGAL_SECTIONS.map((a) => ({ id: a.id, label: a.title }))}
    >
      <Alert tone="info">
        Veri sorumlusu GurLabs Foundation™’dır. Taleplerinizi{' '}
        <a href="mailto:gurx@gurlabs.com" className="underline font-semibold">
          gurx@gurlabs.com
        </a>{' '}
        adresine iletebilirsiniz.
      </Alert>

      <div className="space-y-8">
        {LEGAL_SECTIONS.map((article) => (
          <article key={article.id} id={article.id} className="scroll-mt-24 space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{article.title}</h2>
            {article.paragraphs?.map((p, i) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">
                {p}
              </p>
            ))}
            {article.items ? (
              <ul className="space-y-2">
                {article.items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <ConsoleSection id="tamami" title="Metnin tamamı">
        <Link to="/kurallar" target="_blank" className="gx-btn-ghost">
          Kurallar ve Şartlar sayfası
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </ConsoleSection>
    </ConsolePage>
  );
};

/** Per-competition rules view: same text, reached from inside the competition. */
export const CompetitionRulesPage: React.FC = () => {
  useSeo({ title: 'Yarışma kuralları', noindex: true });

  return (
    <ConsolePage
      eyebrow="Yarışma"
      title="Kurallar"
      description="Bu yarışmaya katılan herkes aşağıdaki kuralları kabul etmiş sayılır."
      toc={RULE_ARTICLES.map((a) => ({ id: a.id, label: a.title }))}
    >
      <RulesArticleList />
    </ConsolePage>
  );
};
