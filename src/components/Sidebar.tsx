import {
  Home,
  FileText,
  Monitor,
  BarChart3,
  BookOpen,
  History,
  Sparkles,
  Database,
  Smartphone,
  Moon,
  Sun,
  User,
  X,
  RotateCcw,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { ThemeMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'intro' | 'testing' | 'results' | 'bank' | 'history' | 'progress';
  onNavigateView: (view: 'intro' | 'testing' | 'results' | 'bank' | 'history' | 'progress') => void;
  onOpenRules: () => void;
  onOpenCustomTest: () => void;
  onOpenBulkImport: () => void;
  onOpenCloudModal: () => void;
  onRestoreTests: () => void;
  onOpenAiWeakSpots: () => void;
  onOpenRapidDrills: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onInstallApp?: () => void;
  userName?: string;
}

export function Sidebar({
  isOpen,
  onClose,
  activeView,
  onNavigateView,
  onOpenRules,
  onOpenCustomTest,
  onOpenBulkImport,
  onOpenCloudModal,
  onRestoreTests,
  onOpenAiWeakSpots,
  onOpenRapidDrills,
  theme,
  onToggleTheme,
  onInstallApp,
  userName = 'PrIyA PaTeL'
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for Mobile / Drawer */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 lg:hidden"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-slate-950 text-slate-100 border-r border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
        <div className="p-5 space-y-6">
          {/* Header & Logo */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-amber-500/20">
                BPSC
              </div>
              <div>
                <div className="font-black text-sm text-white tracking-tight">TRE 4.0 MATHS</div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  CBT MOCK ENGINE
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-md">
              PP
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white truncate tracking-tight flex items-center gap-1.5">
                <span>{userName}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">BPSC TRE 4.0 Aspirant</div>
              <div className="text-[9px] text-amber-400 font-mono mt-0.5 font-bold uppercase tracking-wider">
                ROLL: TRE4-2026-MATH
              </div>
            </div>
          </div>

          {/* Core Navigation Links */}
          <div className="space-y-1.5">
            <div className="px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
              Main Pages
            </div>

            <button
              onClick={() => {
                onNavigateView('intro');
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                activeView === 'intro'
                  ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-amber-400" />
                <span>Home & Mock Tests</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onOpenRules();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Exam Rules & Pattern</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onNavigateView('testing');
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                activeView === 'testing'
                  ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/40 text-blue-300 shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span>Test Interface (CBT View)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onNavigateView('results');
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                activeView === 'results'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Score Analytics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onNavigateView('bank');
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                activeView === 'bank'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Question Bank Repository</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onNavigateView('history');
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                activeView === 'history'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-amber-400" />
                <span>Attempt History</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onNavigateView('progress');
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                activeView === 'progress'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Progress Trend Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>

          {/* Quick Creator Tools */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
              AI Tools & Speed Drills
            </div>

            <button
              onClick={() => {
                onOpenAiWeakSpots();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-rose-400" />
                <span>AI Weakness Diagnostic</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                AI v2
              </span>
            </button>

            <button
              onClick={() => {
                onOpenRapidDrills();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>5-Min Rapid Chapter Drills</span>
              </div>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">
                FAST
              </span>
            </button>

            <button
              onClick={() => {
                onOpenCustomTest();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-4 h-4 text-blue-400" />
                <span>Create Custom Mock Test</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onOpenBulkImport();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Bulk Import Questions</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onOpenCloudModal();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Cloud Firestore Sync</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Restore all default mock tests that were deleted?')) {
                  onRestoreTests();
                }
                onClose();
              }}
              className="w-full p-2.5 rounded-xl font-bold text-xs flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Restore Deleted Tests</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 space-y-3 bg-white/2">
          {onInstallApp && (
            <button
              onClick={() => {
                onInstallApp();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install Mobile Web App</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1 text-xs font-bold">
            <span className="text-slate-400">Appearance Mode:</span>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition-colors flex items-center gap-2"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="capitalize text-white text-[11px]">{theme}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
