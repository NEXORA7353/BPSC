import React from 'react';
import { Languages } from 'lucide-react';
import { PortalLanguage } from '../utils/language';

interface LanguageToggleProps {
  language: PortalLanguage;
  onToggleLanguage: () => void;
  variant?: 'compact' | 'expanded';
}

export function LanguageToggle({
  language,
  onToggleLanguage,
  variant = 'compact'
}: LanguageToggleProps) {
  const isEnglish = language === 'en';

  if (variant === 'expanded') {
    return (
      <button
        onClick={onToggleLanguage}
        type="button"
        className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
        title="Switch Portal Language (English / हिन्दी)"
      >
        <div className="flex items-center gap-3">
          <Languages className="w-4 h-4 text-indigo-500" />
          <span>Language (भाषा)</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-md font-bold">
          <span className={isEnglish ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-500 dark:text-slate-400'}>EN</span>
          <span className="text-slate-400">/</span>
          <span className={!isEnglish ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-500 dark:text-slate-400'}>HI</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onToggleLanguage}
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-xs cursor-pointer"
      title={isEnglish ? 'Switch to Hindi (हिन्दी में बदलें)' : 'Switch to English'}
      aria-label="Toggle Portal Language"
    >
      <Languages className="w-3.5 h-3.5 text-indigo-500" />
      <span className="font-mono font-black text-[11px] text-amber-600 dark:text-amber-400 uppercase">
        {isEnglish ? 'EN' : 'HI'}
      </span>
    </button>
  );
}
