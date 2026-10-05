import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function ThemeToggle({ theme, onToggleTheme }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggleTheme}
      type="button"
      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in zoom-in duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 animate-in zoom-in duration-200" />
      )}
    </button>
  );
}
