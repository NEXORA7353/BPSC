import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'subtle' | 'compact';
}

export function BackButton({
  onClick,
  label = 'Back / वापस',
  className = '',
  variant = 'default'
}: BackButtonProps) {
  const baseStyles =
    'inline-flex items-center gap-2 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer select-none';

  let variantStyles = '';
  switch (variant) {
    case 'outline':
      variantStyles =
        'px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs';
      break;
    case 'subtle':
      variantStyles =
        'px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700';
      break;
    case 'compact':
      variantStyles =
        'px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700';
      break;
    case 'default':
    default:
      variantStyles =
        'px-4 py-2 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 shadow-2xs';
      break;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}
