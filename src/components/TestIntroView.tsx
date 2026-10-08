import { useState, useMemo, useEffect } from 'react';
import {
  Play,
  FileDown,
  Clock,
  Layers,
  Trash2,
  Sparkles,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  Edit3,
  BookOpen,
  Printer,
  RotateCcw,
  Folder,
  Calendar,
  Trophy,
  CheckCircle2,
  Search,
  LayoutGrid,
  Calculator,
  Tag,
  Shapes,
  Compass,
  Percent,
  Hash,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Zap,
  Sparkle
} from 'lucide-react';
import { MockTestSet, TestAttemptRecord } from '../types';
import { BackButton } from './BackButton';
import { ScratchpadModal } from './ScratchpadModal';
import { FormulaSheetModal } from './FormulaSheetModal';
import {
  cleanTitleToEnglish,
  getTestTopicBreakdown,
  getAttemptRecords,
  isTodayAttempt,
  getAllQuestionBank,
  getAllRegisteredTopics
} from '../utils/questionBankStorage';
import { printQuestionPaperWithOmr } from '../utils/exportPdfOmr';
import {
  getTestAttempt,
  formatTestDateTime,
  groupTestsIntoChapters,
  GroupedChapterFolder
} from '../utils/testFolderUtils';

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
  // Navigation: null = Chapter Hub, or chapterId for dedicated chapter sub-page
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [tabView, setTabView] = useState<'chapters' | 'all'>('chapters');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'custom' | 'standard'>('all');

  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isFormulaSheetOpen, setIsFormulaSheetOpen] = useState(false);

  // Attempt records state (synced locally and with cloud)
  const [attemptRecords, setAttemptRecords] = useState<TestAttemptRecord[]>(() => getAttemptRecords());

  useEffect(() => {
    const updateAttempts = () => setAttemptRecords(getAttemptRecords());
    window.addEventListener('bpsc_attempt_saved', updateAttempts);
    window.addEventListener('bpsc_cloud_data_updated', updateAttempts);
    window.addEventListener('bpsc_history_updated', updateAttempts);
    window.addEventListener('bpsc_history_deleted', updateAttempts);
    window.addEventListener('bpsc_history_all_cleared', updateAttempts);
    return () => {
      window.removeEventListener('bpsc_attempt_saved', updateAttempts);
      window.removeEventListener('bpsc_cloud_data_updated', updateAttempts);
      window.removeEventListener('bpsc_history_updated', updateAttempts);
      window.removeEventListener('bpsc_history_deleted', updateAttempts);
      window.removeEventListener('bpsc_history_all_cleared', updateAttempts);
    };
  }, []);

  // Dashboard maintains today's attempts only
  const todayAttemptRecords = useMemo(() => {
    return attemptRecords.filter(isTodayAttempt);
  }, [attemptRecords]);

  const safeSets = useMemo(() => {
    return Array.isArray(availableSets)
      ? availableSets.filter((s): s is MockTestSet => Boolean(s && typeof s === 'object' && s.id))
      : [];
  }, [availableSets]);

  // Group tests into Chapter Folders using today's attempts, questions bank, and registered topics
  const allQuestionBank = useMemo(() => {
    return getAllQuestionBank();
  }, [safeSets]);

  const allRegisteredTopics = useMemo(() => {
    return getAllRegisteredTopics();
  }, []);

  const chapterFolders = useMemo(() => {
    return groupTestsIntoChapters(safeSets, todayAttemptRecords, allQuestionBank, allRegisteredTopics);
  }, [safeSets, todayAttemptRecords, allQuestionBank, allRegisteredTopics]);

  // Current active chapter group if inside sub-page
  const currentChapterGroup = useMemo(() => {
    if (!activeChapterId) return null;
    return chapterFolders.find((c) => c.definition.id === activeChapterId) || null;
  }, [chapterFolders, activeChapterId]);

  // Attempted count for today
  const attemptedTotalCount = useMemo(() => {
    return safeSets.filter((t) => Boolean(getTestAttempt(t, todayAttemptRecords))).length;
  }, [safeSets, todayAttemptRecords]);

  // Flat list filtered for "All Tests" tab or search
  const filteredAllSets = useMemo(() => {
    return safeSets.filter((s) => {
      if (!s) return false;
      if (activeFilter === 'custom' && !s.isCustom) return false;
      if (activeFilter === 'standard' && s.isCustom) return false;
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase().trim();
      return (
        s.title.toLowerCase().includes(query) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(query)) ||
        (s.topicBadges && s.topicBadges.some((b) => b.toLowerCase().includes(query)))
      );
    });
  }, [safeSets, activeFilter, searchTerm]);

  const currentTitle = currentSet?.title ?? 'Mock Test';
  const currentId = currentSet?.id ?? '';
  const currentAttempt = currentSet ? getTestAttempt(currentSet, todayAttemptRecords) : null;
  const currentCreationTime = currentSet ? formatTestDateTime(currentSet) : null;
  const qCount = totalQuestionsCount !== undefined ? totalQuestionsCount : 0;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'number_system':
        return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'lcm_hcf':
      case 'equations':
      case 'algebra':
      case 'progression':
        return <Hash className="w-5 h-5 text-cyan-400" />;
      case 'discount':
        return <Tag className="w-5 h-5 text-emerald-400" />;
      case 'mensuration':
        return <Shapes className="w-5 h-5 text-blue-400" />;
      case 'geometry':
      case 'coordinate_geometry':
        return <Compass className="w-5 h-5 text-purple-400" />;
      case 'trigonometry':
      case 'height_distance':
        return <Compass className="w-5 h-5 text-pink-400" />;
      case 'percentage':
        return <Percent className="w-5 h-5 text-rose-400" />;
      case 'profit_loss':
      case 'simple_interest':
      case 'compound_interest':
      case 'stocks_shares':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'average':
      case 'statistics':
        return <BarChart3 className="w-5 h-5 text-teal-400" />;
      case 'ratio_proportion':
      case 'partnership':
      case 'mixture':
        return <Layers className="w-5 h-5 text-violet-400" />;
      case 'age_problems':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'time_distance':
      case 'boats_stream':
        return <Clock className="w-5 h-5 text-orange-400" />;
      case 'time_work':
      case 'pipe_cistern':
        return <Zap className="w-5 h-5 text-sky-400" />;
      case 'grand':
      case 'grand_syllabus':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'custom':
      case 'custom_tests':
      case 'probability_perm_comb':
        return <Shuffle className="w-5 h-5 text-amber-400" />;
      default:
        return <Folder className="w-5 h-5 text-amber-400" />;
    }
  };

  // Reusable test card component (Mobile First)
  const renderTestCard = (test: MockTestSet, index: number) => {
    const isSelected = test.id === currentId;
    const totalQuestions = test.totalQuestions ?? 0;
    const totalTimeMinutes = test.totalTimeMinutes ?? 0;
    const title = test.title ?? 'Untitled Test';
    const subtitle = test.subtitle ?? '';
    const categoryTitle = test.categoryTitle ?? 'General Mock';
    const attempt = getTestAttempt(test, attemptRecords);
    const creationTime = formatTestDateTime(test);
    const breakdown = getTestTopicBreakdown(test);

    return (
      <div
        key={test.id}
        onClick={() => onSelectSet(test.id)}
        className={`rounded-2xl p-4 sm:p-5 transition-all relative overflow-hidden flex flex-col justify-between gap-4 border cursor-pointer ${
          isSelected
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/40'
            : 'glass-panel glass-panel-hover'
        }`}
      >
        <div className="space-y-3 relative z-10">
          {/* Top Meta: Category & Duration */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {categoryTitle}
              </span>
              {test.isCustom && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Custom
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{totalTimeMinutes} Mins</span>
            </div>
          </div>

          {/* Creation Date & Time */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Created: <strong className="text-slate-700 dark:text-slate-300 font-mono">{creationTime.formatted}</strong></span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Past Attempt Status (if attempted) */}
          {attempt && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Score: <strong className="font-mono">{attempt.score}/{attempt.totalMarks}</strong> ({attempt.accuracy}%)</span>
              </div>
              <span className="text-[11px] text-slate-400">{attempt.date}</span>
            </div>
          )}

          {/* Topic breakdown */}
          {breakdown.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {breakdown.slice(0, 3).map((item) => (
                <span
                  key={item.topicKey}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                >
                  <span>{item.topicName}</span>
                  <span className="font-mono text-amber-500 font-bold">({item.count}Q)</span>
                </span>
              ))}
              {breakdown.length > 3 && (
                <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5">
                  +{breakdown.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 relative z-10">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalQuestions} Qs</span>
            <span className="mx-1">·</span>
            <span>+{totalQuestions} Marks</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete test "${title}"?`)) {
                  onDeleteTest(test.id);
                }
              }}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
              title="Delete Test"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadHtml(test);
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
              title="Download HTML"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                printQuestionPaperWithOmr(test);
              }}
              className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 transition-all cursor-pointer"
              title="Print Paper + OMR PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {attempt ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTest(test.id);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reattempt</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTest(test.id);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Start</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-app-canvas grid-lines-44 text-slate-900 dark:text-slate-100 font-sans pb-16 relative overflow-hidden transition-colors duration-200 w-full max-w-full">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 space-y-6 sm:space-y-8 relative z-10 w-full max-w-full overflow-hidden">
        {canGoBack && onGoBack && (
          <div>
            <BackButton onClick={onGoBack} label="Back" variant="subtle" />
          </div>
        )}

        {/* 1. HERO HEADER (Clean & Mobile-Friendly) */}
        {!activeChapterId && (
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>BPSC TRE 4.0 MATHS · CBT EXAM ENGINE</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Authentic <span className="text-amber-500">Mock Tests</span> & Chapters
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Welcome, <strong className="text-amber-600 dark:text-amber-400">{userName}</strong>! Practice {qCount > 0 ? `${qCount}+` : ''} authentic Bihar STET & BPSC TRE Mathematics problems with real CBT timer, 1 min/question speed target, and negative marking (-0.33).
              </p>
            </div>

            {/* Metrics Chips Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl glass-panel space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Questions</div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{qCount > 0 ? `${qCount}+` : '677+'}</div>
              </div>
              <div className="p-3 rounded-2xl glass-panel space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Mock Sets</div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{safeSets.length} Sets</div>
              </div>
              <div className="p-3 rounded-2xl glass-panel space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Speed Target</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">1 Min / Q</div>
              </div>
              <div className="p-3 rounded-2xl glass-panel space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Marking</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">-0.33 / Q</div>
              </div>
            </div>
          </section>
        )}

        {/* 2. FEATURED SELECTED SET CARD */}
        {!activeChapterId && safeSets.length > 0 && (
          <section className="p-4 sm:p-6 glass-panel rounded-3xl border border-amber-500/40 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Selected Practice Set
                  </span>
                  {currentCreationTime && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      · Created: {currentCreationTime.formatted}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                  {currentTitle}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {currentSet?.totalQuestions ?? 0} Questions · {currentSet?.totalTimeMinutes ?? 20} Minutes · Negative Marking -0.33
                </p>

                {currentAttempt && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Past Score: <strong className="font-mono">{currentAttempt.score}/{currentAttempt.totalMarks}</strong> ({currentAttempt.accuracy}% Accuracy) · {currentAttempt.date}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => printQuestionPaperWithOmr(currentSet)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="Print Question Paper with 5-Option OMR Sheet (PDF)"
                >
                  <Printer className="w-4 h-4" />
                  <span>Paper PDF + OMR</span>
                </button>

                {currentAttempt ? (
                  <button
                    onClick={() => onStartTest(currentId)}
                    className="px-6 py-3 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reattempt Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => onStartTest(currentId)}
                    className="px-6 py-3 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Examination</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Helper Tools Bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-white/10 text-xs flex-wrap">
              <button
                onClick={() => setIsScratchpadOpen(true)}
                className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                <span>Rough Sheet</span>
              </button>

              <button
                onClick={() => setIsFormulaSheetOpen(true)}
                className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Formulas</span>
              </button>

              {onOpenResultsHistory && (
                <button
                  onClick={onOpenResultsHistory}
                  className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Scorecards & History</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* 3. MULTI-PAGE VIEW: DEDICATED CHAPTER DETAIL SUB-PAGE */}
        {activeChapterId && currentChapterGroup && (
          <section className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation & Back Button */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveChapterId(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-amber-500" />
                <span>Back to All Chapters</span>
              </button>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {currentChapterGroup.tests.length} Tests in Module
              </div>
            </div>

            {/* Chapter Hero Banner */}
            <div className={`p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-r ${currentChapterGroup.definition.color.gradient} text-white space-y-3 shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${currentChapterGroup.definition.color.iconBg}`}>
                  {renderIcon(currentChapterGroup.definition.iconType)}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentChapterGroup.definition.nameEnglish}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    {currentChapterGroup.definition.nameHindi}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                {currentChapterGroup.definition.description}
              </p>

              {/* Chapter Stats Strip */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-black/40 border border-white/20 font-bold text-white">
                  {currentChapterGroup.tests.length} Mock Tests
                </span>
                <span className="px-3 py-1 rounded-xl bg-black/40 border border-white/20 font-bold text-white">
                  {currentChapterGroup.totalQuestions} Questions
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/25 border border-emerald-400/40 font-bold text-emerald-300">
                  {currentChapterGroup.attemptedCount}/{currentChapterGroup.tests.length} Attempted
                </span>
              </div>
            </div>

            {/* Tests Grid inside this Chapter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Chapter Tests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChapterGroup.tests.map((test, idx) => renderTestCard(test, idx))}
              </div>
            </div>
          </section>
        )}

        {/* 4. MAIN DIRECTORY: CHAPTER HUB & ALL TESTS */}
        {!activeChapterId && (
          <section className="space-y-5">
            {/* Tab Navigation: Chapters vs All Tests */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
              {/* Segmented Control */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 w-full sm:w-auto">
                <button
                  onClick={() => setTabView('chapters')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    tabView === 'chapters'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span className="truncate">Chapters ({chapterFolders.length})</span>
                </button>

                <button
                  onClick={() => setTabView('all')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    tabView === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="truncate">All Tests ({safeSets.length})</span>
                </button>
              </div>

              {/* Search and Quick Download */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tests or topics..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 shadow-xs"
                  />
                </div>

                <button
                  onClick={onDownloadAllHtml}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  title="Download All HTML"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">HTML</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CHAPTER DIRECTORY */}
            {tabView === 'chapters' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chapterFolders.map((folderGroup) => {
                  const { definition, tests, totalQuestions, attemptedCount } = folderGroup;
                  const percentAttempted =
                    tests.length > 0 ? Math.round((attemptedCount / tests.length) * 100) : 0;

                  return (
                    <div
                      key={definition.id}
                      onClick={() => setActiveChapterId(definition.id)}
                      className="rounded-3xl p-5 border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900/95 backdrop-blur-md transition-all cursor-pointer flex flex-col justify-between gap-4 group hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 active:scale-[0.99] shadow-xs"
                    >
                      <div className="space-y-3">
                        {/* Icon & Count Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-md ${definition.color.iconBg}`}>
                            {renderIcon(definition.iconType)}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                              {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {definition.nameEnglish}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {definition.nameHindi}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {definition.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress & Open Action */}
                      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span>{totalQuestions} Questions</span>
                          {attemptedCount > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {attemptedCount}/{tests.length} Done ({percentAttempted}%)
                            </span>
                          ) : (
                            <span>0% Done</span>
                          )}
                        </div>

                        {/* Mini progress bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                            style={{ width: `${percentAttempted}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 pt-1">
                          <span>Explore Chapter</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: ALL TESTS FLAT LIST (With Quick Search & Filter) */}
            {tabView === 'all' && (
              <div className="space-y-4">
                {/* Filter Pills */}
                <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    All ({safeSets.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('standard')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeFilter === 'standard'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    Preset Sets
                  </button>
                  <button
                    onClick={() => setActiveFilter('custom')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeFilter === 'custom'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    Custom Tests
                  </button>
                </div>

                {filteredAllSets.length === 0 ? (
                  <div className="text-center py-12 glass-panel rounded-3xl space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">No tests matched your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAllSets.map((test, index) => renderTestCard(test, index))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
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