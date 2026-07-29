import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ScrollText, ShieldAlert } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Section } from '../components/ui/Section';
import { useSeo } from '../hooks/useSeo';
import { RULE_ARTICLES } from '../data/rules';

export const RulesPage: React.FC = () => {
  useSeo({
    title: 'Kurallar ve Şartlar — GurX Youth Design 2026',
    description:
      'GurX Youth Design 2026 yarışmasının katılım koşulları, teslim kuralları, açık puanlama sistemi, sertifika kodu yapısı, gizlilik ve KVKK metni.',
    path: '/kurallar',
  });

  return (
    <>
      <PageHero
        eyebrow={
          <>
            <ScrollText className="w-3.5 h-3.5 text-slate-600" />
            Resmî metin
          </>
        }
        title="Kurallar ve Şartlar"
        description="GurX Youth Design 2026 yarışmasına katılan herkes bu metni kabul etmiş sayılır. Son güncelleme: 28 Temmuz 2026."
        actions={
          <Link to="/youth-design" className="gx-btn-ghost">
            Yarışma sayfasına dön
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        }
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Table of contents */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <nav
              aria-label="İçindekiler"
              className="gx-card p-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-900 mb-3">
                İçindekiler
              </h2>
              <ol className="space-y-1.5">
                {RULE_ARTICLES.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
                    >
                      {a.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="lg:col-span-8 xl:col-span-9 space-y-5">
            <div className="gx-card p-6 flex items-start gap-3 bg-amber-50/60 border-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed">
                Başvuru formunu gönderdiğinizde bu metnin tamamını kabul etmiş olursunuz. Lütfen
                özellikle <a href="#arac" className="underline font-semibold">zorunlu tasarım ortamı</a>{' '}
                ve <a href="#puanlama" className="underline font-semibold">açık puanlama</a>{' '}
                maddelerini dikkatle okuyun.
              </p>
            </div>

            {RULE_ARTICLES.map((article) => (
              <article key={article.id} id={article.id} className="gx-card p-8 sm:p-10 scroll-mt-24 space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 leading-snug">
                  {article.title}
                </h2>

                {article.paragraphs?.map((p, i) => (
                  <p key={i} className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {p}
                  </p>
                ))}

                {article.items ? (
                  <ul className="space-y-2.5 pt-1">
                    {article.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2.5" />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}

            <div className="gx-card p-8 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Sorularınız mı var? Yardım merkezinde adım adım anlatımlar bulabilirsiniz.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/yardim" className="gx-btn-primary">
                  Yardım merkezi
                </Link>
                <Link to="/kayit" className="gx-btn-ghost">
                  Başvuru yap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};
