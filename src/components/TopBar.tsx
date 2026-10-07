import { useState } from 'react';
import {
  FileDown,
  HelpCircle,
  Home,
  Share2,
  BookOpen,
  Shuffle,
  Menu,
  X,
  Sparkles,
  Trophy,
  Database,
  Smartphone,
  User,
  PanelLeftOpen
} from 'lucide-react';
import { MockTestSet, ThemeMode } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { PortalLanguage } from '../utils/language';
import { BackButton } from './BackButton';

interface TopBarProps {
  currentSet: MockTestSet;
  availableSets: MockTestSet[];
  onSelectSet: (setId: string) => void;
  onOpenRules: () => void;
  onDownloadHtml: (set: MockTestSet) => void;
  onGoHome: () => void;
  onOpenQuestionBank: () => void;
  onOpenCustomTest: () => void;
  onOpenBulkImport: () => void;
  onOpenShareModal: () => void;
  onOpenResultsHistory: () => void;
  onOpenCloudModal: () => void;
  onOpenSidebar: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  onInstallApp?: () => void;
  isAppInstallable?: boolean;
  isTesting: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  language?: PortalLanguage;
  onToggleLanguage?: () => void;
  activeView: 'intro' | 'testing' | 'results' | 'bank' | 'create-test' | 'bulk-import' | 'history' | 'progress';
  totalQuestionsCount?: number;
  userName?: string;
  onOpenProfileModal?: () => void;
}

export function TopBar({
  currentSet,
  availableSets,
  onSelectSet,
  onOpenRules,
  onDownloadHtml,
  onGoHome,
  onOpenQuestionBank,
  onOpenCustomTest,
  onOpenBulkImport,
  onOpenShareModal,
  onOpenResultsHistory,
  onOpenCloudModal,
  onOpenSidebar,
  onGoBack,
  canGoBack,
  onInstallApp,
  isAppInstallable,
  isTesting,
  theme,
  onToggleTheme,
  language = 'en',
  onToggleLanguage = () => {},
  activeView,
  totalQuestionsCount = 0,
  userName = 'PrIyA PaTeL',
  onOpenProfileModal
}: TopBarProps) {
  const qCount = totalQuestionsCount > 0 ? totalQuestionsCount : 0;
  const qLabel = qCount > 0 ? `${qCount}` : '…';

  return (
    <header className="border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40 shadow-xs dark:shadow-xl text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 overflow-x-hidden">
        {/* Left: Sidebar trigger & Brand Identity */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSidebar}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-500 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open Navigation Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-200">Menu</span>
          </button>

          {!isTesting && canGoBack && onGoBack && (
            <BackButton onClick={onGoBack} label="Back" variant="compact" />
          )}

          <div
            onClick={!isTesting ? onGoHome : undefined}
            className={`flex items-center gap-2 ${!isTesting ? 'cursor-pointer' : ''}`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-black text-white text-[11px] sm:text-xs shadow-md shadow-amber-500/20">
              BPSC
            </div>
            <div>
              <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1">
                <span>BPSC 4.0</span>
                <span className="hidden sm:inline">Maths</span>
                <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  CBT
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {qCount > 0 ? `${qCount}+ Questions` : 'Mathematics'}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        {!isTesting && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold">
            <button
              onClick={onGoHome}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'intro'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Mock Tests</span>
            </button>

            <button
              onClick={onOpenQuestionBank}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'bank'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={onOpenCustomTest}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'create-test'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-500" />
              <span>Custom Test</span>
            </button>

            <button
              onClick={onOpenResultsHistory}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'history'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>History</span>
            </button>

            <button
              onClick={onOpenBulkImport}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                activeView === 'bulk-import'
                  ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40'
                  : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Import</span>
            </button>
          </nav>
        )}

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Name Badge / Sync Profile Trigger */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-amber-300 transition-all cursor-pointer shadow-xs"
            title="Click to view & sync Universal Candidate ID"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[9px] sm:text-[10px]">
              PP
            </div>
            <span className="hidden md:inline">{userName}</span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              Sync
            </span>
          </button>

          {/* Cloud DB: hidden on mobile, visible on sm: */}
          <button
            onClick={onOpenCloudModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-xs"
            title="Cloud Database: Google Firestore Live"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cloud DB ({qLabel})</span>
          </button>

          <LanguageToggle language={language} onToggleLanguage={onToggleLanguage} />

          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

          <button
            onClick={onOpenShareModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            title="Share Portal"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {!isTesting && (
            <button
              onClick={() => onDownloadHtml(currentSet)}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20"
              title="Download Standalone Offline HTML"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}