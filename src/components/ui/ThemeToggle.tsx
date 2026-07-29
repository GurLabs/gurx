import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '../../context/ThemeContext';

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Açık tema', icon: Sun },
  { value: 'dark', label: 'Koyu tema', icon: Moon },
  { value: 'system', label: 'Sistem teması', icon: Monitor },
];

/** Three-state segmented control: light · dark · system. */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={`inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 ${className}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={mode === value}
          aria-label={label}
          title={label}
          onClick={() => setMode(value)}
          className={`w-7 h-7 rounded-full grid place-items-center transition-colors ${
            mode === value
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
};

/** Compact single-button variant for tight toolbars. */
export const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { resolved, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={resolved === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      className={`w-9 h-9 rounded-lg border border-slate-200 grid place-items-center text-slate-600 hover:bg-slate-50 transition-colors ${className}`}
    >
      {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
