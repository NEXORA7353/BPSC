import { useState } from 'react';
import {
  Play,
  FileDown,
  Clock,
  Layers,
  Trash2,
  Sparkles,
  Shuffle,
  ArrowRight,
  Edit3,
  BookOpen
} from 'lucide-react';
import { MockTestSet } from '../types';
import { BackButton } from './BackButton';
import { ScratchpadModal } from './ScratchpadModal';
import { FormulaSheetModal } from './FormulaSheetModal';

interface TestIntroViewProps {
  currentSet: MockTestSet;
  availableSets: MockTestSet[];
  onSelectSet: (setId: string) => void;
  onStartTest: (setId?: string) => void;
  onDownloadHtml: (set: MockTestSet) => void;
  onDownloadAllHtml: () => void;
  onOpenQuestionBank: () => void;
  onOpenCustomTest: () => void;
  onOpenBulkImport: (topicKey?: string) => void;
  onOpenShareModal: () => void;
  onOpenResultsHistory?: () => void;
  onDeleteTest: (testId: string) => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  onInstallApp?: () => void;
  isAppInstallable?: boolean;
  totalQuestionsCount?: number;
  userName?: string;
}

export function TestIntroView({
  currentSet,
  availableSets,
  onSelectSet,
  onStartTest,
  onDownloadHtml,
  onDownloadAllHtml,
  onOpenQuestionBank,
  onOpenCustomTest,
  onOpenBulkImport,
  onOpenShareModal,
  onOpenResultsHistory,
  onDeleteTest,
  onGoBack,
  canGoBack,
  onInstallApp,
  isAppInstallable,
  totalQuestionsCount,
  userName = 'PrIyA PaTeL'
}: TestIntroViewProps) {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'tri_topic' | 'profit_loss' | 'lcm_percentage' | 'custom'
  >('all');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isFormulaSheetOpen, setIsFormulaSheetOpen] = useState(false);

  const safeSets = Array.isArray(availableSets)
    ? availableSets.filter((s): s is MockTestSet => Boolean(s && typeof s === 'object' && s.id))
    : [];

  const filteredSets = safeSets.filter((s) => {
    if (!s) return false;
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  const currentTitle = currentSet?.title ?? 'Mock Test';
  const currentId = currentSet?.id ?? '';
  const qCount = totalQuestionsCount !== undefined ? totalQuestionsCount : 0;

  const marqueeItems = [
    'BPSC TRE 4.0 MATHEMATICS',
    'CLASS 6-8 & 9-10 TEACHER EXAM 2026',
    'NEGATIVE MARKING -0.33',
    'OPTION (E) SAFE SKIP',
    'REAL CBT TIMER (1 MIN/Q)',
    'BIHAR STET & TRE PREVIOUS PAPERS',
    'FULL SOLUTION IN HINDI & ENGLISH',
    'REALTIME SCORE ANALYTICS'
  ];

  return (
    <div className="min-h-screen bg-app-canvas grid-lines-44 text-slate-900 dark:text-slate-100 font-sans pb-16 relative overflow-hidden transition-colors duration-200">
      {/* Background Mesh Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-10 relative z-10">
        {canGoBack && onGoBack && (
          <div>
            <BackButton onClick={onGoBack} label="Back to Previous" variant="subtle" />
          </div>
        )}

        {/* HERO SECTION */}
        <section className="space-y-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-300 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="uppercase tracking-widest text-[10px]">
              BPSC TRE 4.0 MATHS • REAL CBT ENGINE
            </span>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
              Master BPSC TRE 4.0 <br />
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 dark:from-amber-300 dark:via-amber-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Mathematics Exam
              </span> <br />
              With Real CBT Practice
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-2xl pt-2">
              Welcome back, <strong className="text-slate-900 dark:text-white font-bold">{userName}</strong>! Practice {qCount}+ authentic Bihar STET & BPSC TRE Mathematics questions with real exam timer, option (E) safe skip, and step-by-step Hindi solutions.
            </p>
          </div>

          {/* 4 Glass Stat Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Total Questions
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                {qCount}+
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">STET & TRE Papers</div>
            </div>

            <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Active Mock Sets
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {safeSets.length} Sets
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Preset + Custom</div>
            </div>

            <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Speed Target
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                1 Min / Q
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Real CBT Pace</div>
            </div>

            <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Marking Scheme
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                -0.33
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Option (E) Safe Skip</div>
            </div>
          </div>
        </section>

        {/* Marquee Strip */}
        <div className="overflow-hidden py-3 bg-white/70 dark:bg-white/5 border-y border-slate-200 dark:border-white/10 backdrop-blur-md rounded-2xl">
          <div className="animate-marquee items-center gap-8 whitespace-nowrap text-xs font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div key={idx} className="flex items-center gap-6">
                <span>{item}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
              </div>
            ))}
          </div>
        </div>

        {/* HERO CTA ROW */}
        {safeSets.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 glass-panel rounded-3xl border border-amber-500/30 bg-amber-500/5">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>पोर्टल पूरी तरह खाली एवं फ्रेश है</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                नया टेस्ट या प्रश्न जोड़कर शुरुआत करें
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                डेटाबेस खाली कर दिया गया है। अब आप Bulk Paste से PDF या प्रश्न आयात कर सकते हैं, अथवा Custom Test Creator से तुरंत नया मॉक टेस्ट बना सकते हैं।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenBulkImport()}
                className="px-5 py-3 rounded-2xl font-black text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bulk Import Questions</span>
              </button>

              <button
                onClick={onOpenCustomTest}
                className="px-5 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                <span>Create Custom Test</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 glass-panel rounded-3xl">
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Ready to Start Practice?
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                Selected Set: {currentTitle}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {currentSet?.totalQuestions ?? 0} Questions · {currentSet?.totalTimeMinutes ?? 20} Minutes · Negative Marking -0.33
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsScratchpadOpen(true)}
                className="px-4 py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/5 hover:bg-slate-100 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Rough Sheet</span>
              </button>

              <button
                onClick={() => setIsFormulaSheetOpen(true)}
                className="px-4 py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/5 hover:bg-slate-100 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Formulas</span>
              </button>

              <button
                onClick={() => onStartTest(currentId)}
                className="px-8 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/25 transition-all active:scale-95 flex items-center gap-2 group"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Examination</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* TESTS CATALOG SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Available Mock Tests ({safeSets.length})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any test to select or start. Every test has a Delete button to remove it.
              </p>
            </div>

            <button
              onClick={onDownloadAllHtml}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-500" />
              <span>Download All HTML</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-2 text-xs font-bold">
            {[
              { id: 'all', label: `All Tests (${safeSets.length})` },
              { id: 'tri_topic', label: '3-Topic Mocks' },
              { id: 'profit_loss', label: 'Profit & Loss' },
              { id: 'lcm_percentage', label: 'LCM & Percentage' },
              { id: 'custom', label: `Custom Generated (${safeSets.filter((s) => s?.isCustom).length})` }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* TEST CARDS GRID */}
          {filteredSets.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl space-y-3">
              <Layers className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                No mock tests in this category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSets.map((test, index) => {
                const isSelected = test.id === currentId;
                const topicBadges = Array.isArray(test.topicBadges) ? test.topicBadges : [];
                const totalQuestions = test.totalQuestions ?? 0;
                const totalTimeMinutes = test.totalTimeMinutes ?? 0;
                const title = test.title ?? 'Untitled Test';
                const subtitle = test.subtitle ?? '';
                const categoryTitle = test.categoryTitle ?? 'General';
                const ghostNumber = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={test.id}
                    onClick={() => onSelectSet(test.id)}
                    className={`cursor-pointer rounded-3xl p-6 transition-all relative overflow-hidden flex flex-col justify-between gap-5 border ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-white/10 border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'glass-panel glass-panel-hover'
                    }`}
                  >
                    <div className="absolute -top-4 -right-2 font-black text-8xl ghost-numeral pointer-events-none opacity-20">
                      {ghostNumber}
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {categoryTitle}
                          </span>
                          {test.isCustom && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              Custom
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{totalTimeMinutes} Mins</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                          {title}
                        </h3>
                        {subtitle && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {subtitle}
                          </p>
                        )}
                      </div>

                      {topicBadges.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {topicBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 relative z-10">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="font-mono text-amber-600 dark:text-amber-300">{totalQuestions}</span> Qs
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">+{totalQuestions}.0 Marks</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete test "${title}"?`)) {
                              onDeleteTest(test.id);
                            }
                          }}
                          className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 transition-all cursor-pointer"
                          title="Delete Test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadHtml(test);
                          }}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all"
                          title="Download Offline HTML"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartTest(test.id);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Start</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Scratchpad & Formula Sheet Modals */}
      {isScratchpadOpen && (
        <ScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
        />
      )}

      {isFormulaSheetOpen && (
        <FormulaSheetModal
          isOpen={isFormulaSheetOpen}
          onClose={() => setIsFormulaSheetOpen(false)}
        />
      )}
    </div>
  );
}