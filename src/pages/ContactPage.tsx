import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Mail, MessageSquare, Send, Ticket as TicketIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Section } from '../components/ui/Section';
import { Alert, Spinner } from '../components/ui/Feedback';
import { Turnstile, isTurnstileEnabled } from '../components/ui/Turnstile';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../hooks/useSeo';
import { createContactMessage } from '../lib/support';
import { SUPPORT_EMAIL } from '../lib/brand';

export const ContactPage: React.FC = () => {
  const { user, profile, configured } = useAuth();

  useSeo({
    title: 'İletişim — GurX™ Design Awards',
    description:
      'GurX™ ekibine ulaşın. Hesabınız varsa destek talebi açarak yazışmanızı panelinizden takip edebilirsiniz.',
    path: '/iletisim',
  });

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !subject.trim() || !body.trim()) {
      setError('Tüm alanları doldurun.');
      return;
    }
    if (isTurnstileEnabled && !token) {
      setError('Devam etmeden önce “insan olduğumu doğrula” adımını tamamlayın.');
      return;
    }

    setBusy(true);
    try {
      await createContactMessage({
        full_name: fullName.trim(),
        email: email.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });
      setSent(true);
      setSubject('');
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mesaj gönderilemedi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={
          <>
            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
            İletişim
          </>
        }
        title="Bize yazın"
        description="Yarışma, başvuru, teslim veya sertifika konusundaki sorularınızı buradan iletebilirsiniz. Hesabınız varsa destek talebi açmanız daha hızlı yanıt almanızı sağlar."
        actions={
          <>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="gx-btn-ghost">
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </a>
            {user && (
              <Link to="/dashboard/destek" className="gx-btn-primary">
                <TicketIcon className="w-4 h-4" />
                Destek talebi aç
              </Link>
            )}
          </>
        }
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-12">
          <form onSubmit={submit} className="lg:col-span-7 gx-card p-6 sm:p-10 space-y-5">
            <h2 className="font-semibold text-slate-900">İletişim formu</h2>

            {!configured && (
              <Alert tone="warning">
                Supabase bağlantısı olmadan form gönderilemez. Bu arada{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-semibold">
                  {SUPPORT_EMAIL}
                </a>{' '}
                adresine yazabilirsiniz.
              </Alert>
            )}
            {sent && (
              <Alert tone="success">
                Mesajınız alındı. En kısa sürede {email} adresine dönüş yapacağız.
              </Alert>
            )}
            {error && <Alert tone="error">{error}</Alert>}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ct-name" className="gx-label">
                  Ad Soyad <span className="text-rose-500">*</span>
                </label>
                <input
                  id="ct-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="gx-input"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label htmlFor="ct-email" className="gx-label">
                  E-posta <span className="text-rose-500">*</span>
                </label>
                <input
                  id="ct-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="gx-input"
                  placeholder="ornek@eposta.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ct-subject" className="gx-label">
                Konu <span className="text-rose-500">*</span>
              </label>
              <input
                id="ct-subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="gx-input"
                placeholder="Kısa bir başlık"
              />
            </div>

            <div>
              <label htmlFor="ct-body" className="gx-label">
                Mesajınız <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="ct-body"
                required
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="gx-input resize-none"
                placeholder="Sorununuzu veya sorunuzu olabildiğince açık yazın."
              />
            </div>

            <Turnstile onVerify={setToken} onExpire={() => setToken(null)} />

            <button type="submit" disabled={busy || !configured} className="gx-btn-primary !py-3">
              {busy ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              Gönder
            </button>
          </form>

          <aside className="lg:col-span-5 space-y-5">
            <div className="gx-card p-6 space-y-3">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <TicketIcon className="w-4.5 h-4.5 text-slate-500" />
                Destek talebi mi açmalısınız?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hesabınız varsa destek talebi açın: yazışmanın tamamı panelinizde kalır, durumunu
                takip edebilir ve aynı konu üzerinden yanıt yazabilirsiniz.
              </p>
              <Link
                to={user ? '/dashboard/destek' : '/giris?next=/dashboard/destek'}
                className="gx-btn-ghost w-full"
              >
                {user ? 'Destek taleplerim' : 'Giriş yapıp talep aç'}
              </Link>
            </div>

            <div className="gx-card p-6 space-y-3">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-4.5 h-4.5 text-slate-500" />
                Önce yardım merkezine bakın
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tasarım, yayınlama ve teslim adımlarının çoğu yardım merkezinde adım adım anlatılıyor.
              </p>
              <Link to="/yardim" className="gx-btn-ghost w-full">
                Yardım merkezi
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
};
