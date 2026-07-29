import React, { useEffect, useId, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** True when a site key is configured; pages gate their submit button on this. */
export const isTurnstileEnabled = Boolean(SITE_KEY);

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          action?: string;
          theme?: 'light' | 'dark' | 'auto';
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        },
      ) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Cloudflare Turnstile yüklenemedi.'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

/**
 * Cloudflare Turnstile widget.
 *
 * On signup the token is passed to Supabase, which verifies it against the
 * secret key when CAPTCHA protection is enabled in Auth settings — that path is
 * genuinely enforced. On the public verification page there is no server call to
 * attach it to, so there the widget only slows down casual scraping.
 */
export const Turnstile: React.FC<TurnstileProps> = ({ onVerify, onExpire, className = '' }) => {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resolved } = useTheme();
  const domId = useId();

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(holder.current, {
          sitekey: SITE_KEY,
          action: 'turnstile-spin-v2',
          theme: resolved,
          callback: (token) => onVerify(token),
          'expired-callback': () => onExpire?.(),
          'error-callback': () => setError('Doğrulama başarısız oldu. Sayfayı yenileyip deneyin.'),
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget already gone */
        }
        widgetId.current = null;
      }
    };
    // Re-rendering on theme change keeps the widget readable in both themes.
  }, [resolved, onVerify, onExpire]);

  if (!SITE_KEY) {
    return (
      <div
        className={`flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 ${className}`}
      >
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Bot koruması yapılandırılmamış. <code className="font-mono">VITE_TURNSTILE_SITE_KEY</code>{' '}
          tanımlanana kadar bu adım atlanır.
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={holder} id={`ts-${domId}`} />
      {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
    </div>
  );
};
