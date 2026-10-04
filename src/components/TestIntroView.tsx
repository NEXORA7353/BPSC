import { useState, useMemo } from 'react';
import {
  Play,
  FileDown,
  Clock,
  Award,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Shuffle,
  BookOpen,
  Trash2,
  Share2,
  History,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { MockTestSet, TestAttemptRecord } from '../types';
import { getAttemptRecords } from '../utils/questionBankStorage';

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
  onDeleteCustomTest?: (testId: string) => void;
  totalQuestionsCount?: number;
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
  onDeleteCustomTest,
  totalQuestionsCount
}: TestIntroViewProps) {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'tri_topic' | 'profit_loss' | 'lcm_percentage' | 'custom'
  >('all');

  const attemptRecords: TestAttemptRecord[] = useMemo(() => {
    try {
      return getAttemptRecords() || [];
    } catch {
      return [];
    }
  }, []);

  const safeSets = Array.isArray(availableSets) ? availableSets : [];

  const filteredSets = safeSets.filter((s) => {
    if (!s) return false;
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  const currentTitle = currentSet?.title ?? 'Mock Test';
  const currentId = currentSet?.id ?? '';
  
  // ✅ Dynamic Count Logic (No hardcoded 157 or 167)
  const qCount = totalQuestionsCount && totalQuestionsCount > 0 ? totalQuestionsCount : null;
  const displayCountText = qCount ? `${qCount}+ ` : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-900 dark:text-slate-100 font-sans">
      {/* Hero Exam Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>BPSC TRE 4.0 Teacher Exam 2026 (Maths Class 6-8 / 9-10)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Real CBT Examination & Practice Portal
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {displayCountText}authentic questions from Bihar STET (2020–2024) and BPSC TRE (1.0–3.0) with real-time Cloud Auto-Sync. Authentic 5-option interface with negative marking (-0.33), Option (E) Safe Skip, and step-by-step Hindi solutions.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore Cloud Live ({qCount ?? '...'} Qs)</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                LCM & HCF
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Percentage
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Profit & Loss
              </span>
              <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                Custom Test Studio
              </span>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onStartTest(currentId)}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start {currentTitle.slice(0, 16)}{currentTitle.length > 16 ? '...' : ''}</span>
            </button>

            <button
              onClick={onOpenCustomTest}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-2xl text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              <span>Create Custom Test</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-2xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>Share Portal Link</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{displayCountText}STET & TRE Questions</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
            <span>1 Min / Question CBT Timer</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span>-0.33 Negative Marking Rules</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <FileDown className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Standalone Offline HTML Export</span>
          </div>
        </div>
      </div>

      {/* Database Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Database Connected · Import Any Exam Paper</span>
          </div>
          <h3 className="text-base sm:text-xl font-black tracking-tight leading-snug">
            Paste raw questions from any PDF or document to add new chapters
          </h3>
          <p className="text-xs text-indigo-200 leading-relaxed font-normal">
            Auto-extracts Hindi text, 5 options, correct answer keys, and solutions. Saved permanently into your database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onOpenBulkImport()}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Bulk Paste Questions</span>
          </button>

          <button
            onClick={onOpenQuestionBank}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-800/80 hover:bg-indigo-700 text-white border border-indigo-600/60 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Repository</span>
          </button>
        </div>
      </div>

      {/* Tests Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Available Mock Test Series ({safeSets.length})</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select any test to begin practicing in the official CBT test environment
            </p>
          </div>

          <button
            onClick={onDownloadAllHtml}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Download All Tests (HTML)</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
          {[
            { id: 'all', label: `All Tests (${safeSets.length})` },
            { id: 'tri_topic', label: '3-Topic Mega Mocks' },
            { id: 'profit_loss', label: 'Profit & Loss Tests' },
            { id: 'lcm_percentage', label: 'LCM & Percentage Tests' },
            {
              id: 'custom',
              label: `Custom Generated (${safeSets.filter((s) => s?.isCustom).length})`
            }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 rounded-2xl transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Test Cards Grid */}
        {filteredSets.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              No tests found in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredSets.map((test) => {
              const isSelected = test.id === currentId;
              const topicBadges = Array.isArray(test.topicBadges) ? test.topicBadges : [];
              const totalQuestions = test.totalQuestions ?? 0;
              const totalTimeMinutes = test.totalTimeMinutes ?? 0;
              const title = test.title ?? 'Untitled Test';
              const subtitle = test.subtitle ?? '';
              const categoryTitle = test.categoryTitle ?? 'General';

              return (
                <div
                  key={test.id}
                  onClick={() => onSelectSet(test.id)}
                  className={`cursor-pointer rounded-3xl border p-5 sm:p-6 transition-all flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900 uppercase">
                          {categoryTitle}
                        </span>
                        {test.isCustom && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300">
                            Custom
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{totalTimeMinutes} Mins</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                      {title}
                    </h3>

                    {subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {topicBadges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {topicBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{totalQuestions} Questions</span>
                      <span className="text-slate-400 dark:text-slate-600 font-normal"> · </span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal">
                        +{totalQuestions}.00 Marks
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {test.isCustom && onDeleteCustomTest && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this custom test?')) {
                              onDeleteCustomTest(test.id);
                            }
                          }}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Custom Test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadHtml(test);
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Download Standalone Offline HTML"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartTest(test.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Test</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attempt History */}
      {attemptRecords.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Saved Attempt History ({attemptRecords.length})</span>
            </h3>
            {onOpenResultsHistory && (
              <button
                type="button"
                onClick={onOpenResultsHistory}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Results & Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attemptRecords.slice(0, 6).map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {rec?.date ?? 'N/A'}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Accuracy: {rec?.accuracy ?? 0}%
                  </span>
                </div>

                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
                  {rec?.testTitle ?? 'Untitled'}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Score: <strong className="text-slate-900 dark:text-slate-100">{(rec?.score ?? 0).toFixed(2)}</strong> / {rec?.totalMarks ?? 0}
                  </span>
                  <span className="text-emerald-600 font-bold">
                    +{rec?.correctCount ?? 0} / -{rec?.incorrectCount ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}