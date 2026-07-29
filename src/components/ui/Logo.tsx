import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

/**
 * Lock-up order is fixed everywhere: GurX first, GurLabs Foundation second.
 * The wordmark swaps to its white cut in dark mode.
 */
export const GurxMark: React.FC<{ className?: string }> = ({ className = 'h-8' }) => {
  const { resolved } = useTheme();
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <span className="font-serif text-3xl text-slate-900 leading-none flex items-start">
        GurX
        <span className="text-[0.5rem] font-sans font-semibold text-slate-500 mt-1 ml-0.5">™</span>
      </span>
    );
  }

  return (
    <img
      src={resolved === 'dark' ? '/gurx-logo-white.png' : '/gurx-logo.png'}
      alt="GurX™"
      width={120}
      height={32}
      className={`${className} w-auto object-contain`}
      onError={() => setFailed(true)}
    />
  );
};

export const FoundationLogo: React.FC<{ className?: string }> = ({ className = 'h-8' }) => {
  const { resolved } = useTheme();
  return (
    <img
      src={resolved === 'dark' ? '/gf-logo-white.png' : '/gf-l.png'}
      alt="GurLabs Foundation™"
      width={32}
      height={32}
      className={`${className} w-auto object-contain`}
    />
  );
};

interface LogoProps {
  className?: string;
  /** Landing header shows GurX alone; everywhere else both marks appear. */
  withFoundation?: boolean;
  size?: 'sm' | 'md';
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  withFoundation = true,
  size = 'md',
  to = '/',
}) => {
  const h = size === 'sm' ? 'h-6' : 'h-8';

  return (
    <Link to={to} className={`flex items-center gap-3 select-none group ${className}`}>
      <GurxMark className={`${h} transition-transform group-hover:scale-[1.03]`} />
      {withFoundation && (
        <>
          <span className="w-px h-6 bg-slate-200" aria-hidden />
          <FoundationLogo className={h} />
        </>
      )}
    </Link>
  );
};

export const FoundationMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`font-semibold text-slate-900 ${className}`}>
    GurLabs Foundation<span className="align-super text-[0.6em]">™</span>
  </span>
);
