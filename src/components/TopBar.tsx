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
  activeView: 'intro' | 'testing' | 'results' | 'bank' | 'create-test' | 'bulk-import' | 'history' | 'progress';
  totalQuestionsCount?: number;
  userName?: string;
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
  activeView,
  totalQuestionsCount = 0,
  userName = 'PrIyA PaTeL'
}: TopBarProps) {
  const qCount = totalQuestionsCount > 0 ? totalQuestionsCount : 0;
  const qLabel = qCount > 0 ? `${qCount}` : '…';

  return (
    <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-40 shadow-xl text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Sidebar trigger & Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 transition-all flex items-center gap-2"
            title="Open Navigation Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold text-slate-200">Menu</span>
          </button>

          {!isTesting && canGoBack && onGoBack && (
            <BackButton onClick={onGoBack} label="Back" variant="compact" />
          )}

          <div
            onClick={!isTesting ? onGoHome : undefined}
            className={`flex items-center gap-2.5 ${!isTesting ? 'cursor-pointer' : ''}`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-amber-500/20">
              BPSC
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-white tracking-tight leading-tight flex items-center gap-2">
                <span>BPSC TRE 4.0 Maths</span>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  CBT PORTAL
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {qCount > 0 ? `${qCount}+ Mathematics Questions` : 'Mathematics Questions'}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        {!isTesting && (
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={onGoHome}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'intro'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Mock Tests</span>
            </button>

            <button
              onClick={onOpenQuestionBank}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'bank'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={onOpenCustomTest}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'create-test'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom Test</span>
            </button>

            <button
              onClick={onOpenResultsHistory}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'history'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>History</span>
            </button>

            <button
              onClick={onOpenBulkImport}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                activeView === 'bulk-import'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-indigo-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Import</span>
            </button>
          </nav>
        )}

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Name Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
              PP
            </div>
            <span>{userName}</span>
          </div>

          <button
            onClick={onOpenCloudModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-xs"
            title="Cloud Database: Google Firestore Live"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cloud DB ({qLabel})</span>
          </button>

          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Share Portal"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
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