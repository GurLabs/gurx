import React, { useState } from 'react';
import { ArrowUpRight, Wand2 } from 'lucide-react';
import { GurxMark } from './Logo';
import { AI_STUDIO } from '../../lib/brand';

/**
 * Google AI Studio's own mark is served from a Google CDN that blocks
 * hotlinking from some networks, so it falls back to a drawn version of the
 * same glyph rather than an empty box.
 */
const AiStudioMark: React.FC = () => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M12 2.4 14.1 8a6.4 6.4 0 0 0 3.8 3.8l5.7 2.1-5.7 2.1a6.4 6.4 0 0 0-3.8 3.8L12 25.4 9.9 19.8a6.4 6.4 0 0 0-3.8-3.8L0.4 13.9l5.7-2.1A6.4 6.4 0 0 0 9.9 8L12 2.4Z"
          transform="scale(0.85) translate(2 1)"
        />
      </svg>
    );
  }

  return (
    <img
      src={AI_STUDIO.logo}
      alt={AI_STUDIO.label}
      width={32}
      height={32}
      referrerPolicy="no-referrer"
      className="h-8 w-8 object-contain"
      onError={() => setFailed(true)}
    />
  );
};

export const AiStudioLockup: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = '',
}) => (
  <div className={`gx-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 ${className}`}>
    <div className="flex items-center gap-4 shrink-0">
      <div className="h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 grid place-items-center">
        <GurxMark className="h-6" />
      </div>
      <span className="text-slate-300 text-xl font-light" aria-hidden>
        ×
      </span>
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 grid place-items-center overflow-hidden">
        <AiStudioMark />
      </div>
    </div>

    <div className="flex-1 min-w-0 space-y-1">
      <p className="text-sm font-semibold text-slate-900">Zorunlu tasarım ortamı: Google AI Studio</p>
      {!compact && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          GurX Youth Design projeleri <strong>aistudio.google.com</strong> üzerinde Vibe Coding ile
          tasarlanmalıdır. Farklı bir ortamda üretilen projeler değerlendirmeye alınmaz.
        </p>
      )}
    </div>

    <a
      href={AI_STUDIO.url}
      target="_blank"
      rel="noopener noreferrer"
      className="gx-btn-primary shrink-0 whitespace-nowrap"
    >
      <Wand2 className="w-4 h-4" />
      AI Studio'ya git
      <ArrowUpRight className="w-4 h-4" />
    </a>
  </div>
);
