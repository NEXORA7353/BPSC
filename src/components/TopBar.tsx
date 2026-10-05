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
  Download
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
  onGoBack?: () => void;
  canGoBack?: boolean;
  onInstallApp?: () => void;
  isAppInstallable?: boolean;
  isTesting: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeView: 'intro' | 'testing' | 'results' | 'bank' | 'history';
  totalQuestionsCount?: number;
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
  onGoBack,
  canGoBack,
  onInstallApp,
  isAppInstallable,
  isTesting,
  theme,
  onToggleTheme,
  activeView,
  totalQuestionsCount = 0
}: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Single source of truth — same number everywhere
  const qCount = totalQuestionsCount > 0 ? totalQuestionsCount : 0;
  const qLabel = qCount > 0 ? `${qCount}` : '…';

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Back button & Brand Identity */}
        <div className="flex items-center gap-2 shrink-0">
          {!isTesting && canGoBack && onGoBack && (
            <BackButton onClick={onGoBack} label="Back / वापस" variant="compact" />
          )}

          <div
            onClick={!isTesting ? onGoHome : undefined}
            className={`flex items-center gap-2.5 ${!isTesting ? 'cursor-pointer' : ''}`}
          >
            <img
              src="/logo.svg"
              alt="BPSC Logo"
              className="w-9 h-9 rounded-xl shadow-md shadow-blue-500/20 object-contain bg-blue-600"
            />
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight flex items-center gap-2">
                <span>BPSC TRE 4.0 Maths Portal</span>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                  CBT 2026
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {qCount > 0
                  ? `${qCount}+ STET & TRE Previous Year Mathematics Questions`
                  : 'STET & TRE Previous Year Mathematics Questions'}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        {!isTesting && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={onGoHome}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'intro'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Mock Tests</span>
            </button>

            <button
              onClick={onOpenQuestionBank}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'bank'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={onOpenCustomTest}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-500" />
              <span>Create Custom Test</span>
            </button>

            <button
              onClick={onOpenResultsHistory}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'history'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Results & History</span>
            </button>

            <button
              onClick={onOpenBulkImport}
              className="px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-white/60 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Paste</span>
            </button>
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onInstallApp && (
            <button
              onClick={onInstallApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 transition-all shadow-xs cursor-pointer"
              title="Install Mobile Web App to Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* ✅ Cloud DB — same dynamic count */}
          <button
            onClick={onOpenCloudModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 transition-all shadow-xs"
            title="Cloud Database: Google Firestore Connected (Auto-Sync Active)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Cloud DB ({qLabel} Qs)</span>
          </button>

          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
            title="Get Shareable Link & QR Code"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Share Portal</span>
          </button>

          {!isTesting && (
            <>
              <button
                onClick={onOpenRules}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Pattern & Rules</span>
              </button>

              <button
                onClick={() => onDownloadHtml(currentSet)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
                title="Download Standalone Offline HTML for this test"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download HTML</span>
              </button>
            </>
          )}

          {!isTesting && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {!isTesting && mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 animate-in slide-in-from-top duration-200 text-xs font-bold">
          <button
            onClick={() => {
              onGoHome();
              setMobileMenuOpen(false);
            }}
            className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2 ${
              activeView === 'intro'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>All Mock Tests ({availableSets.length})</span>
          </button>

          <button
            onClick={() => {
              onOpenQuestionBank();
              setMobileMenuOpen(false);
            }}
            className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2 ${
              activeView === 'bank'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Bank (Search & Browse)</span>
          </button>

          <button
            onClick={() => {
              onOpenCustomTest();
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl text-left flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Shuffle className="w-4 h-4" />
            <span>Create Custom / Random Test</span>
          </button>

          <button
            onClick={() => {
              onOpenResultsHistory();
              setMobileMenuOpen(false);
            }}
            className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2 ${
              activeView === 'history'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Results & History (स्कोरकार्ड)</span>
          </button>

          {/* ✅ Mobile Cloud DB — same dynamic count */}
          <button
            onClick={() => {
              onOpenCloudModal();
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl text-left flex items-center justify-between text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cloud Database ({qLabel} Qs Live)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => {
              onOpenBulkImport();
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl text-left flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bulk Paste Questions (Auto-Extract)</span>
          </button>

          <button
            onClick={() => {
              onOpenRules();
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl text-left flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Exam Rules & Marking Scheme</span>
          </button>

          <button
            onClick={() => {
              onDownloadHtml(currentSet);
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl text-left flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileDown className="w-4 h-4" />
            <span>
              Download Standalone HTML (
              {(currentSet?.title ?? 'Test').slice(0, 18)}
              ...)
            </span>
          </button>
        </div>
      )}
    </header>
  );
}