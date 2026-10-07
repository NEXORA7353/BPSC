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
  Edit3,
  BookOpen,
  Printer,
  RotateCcw,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trophy,
  CheckCircle2,
  Search,
  LayoutGrid,
  FolderKanban,
  Calculator,
  Tag,
  Shapes,
  Compass,
  Percent,
  Hash,
  Eye,
  Check
} from 'lucide-react';
import { MockTestSet, TestAttemptRecord } from '../types';
import { BackButton } from './BackButton';
import { ScratchpadModal } from './ScratchpadModal';
import { FormulaSheetModal } from './FormulaSheetModal';
import { cleanTitleToEnglish, getTestTopicBreakdown, getAttemptRecords } from '../utils/questionBankStorage';
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
  // Navigation & Category states
  const [viewMode, setViewMode] = useState<'folders' | 'grid'>('folders');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'tri_topic' | 'profit_loss' | 'lcm_percentage' | 'custom'
  >('all');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isFormulaSheetOpen, setIsFormulaSheetOpen] = useState(false);

  // Attempt records state (synced locally and with cloud)
  const [attemptRecords, setAttemptRecords] = useState<TestAttemptRecord[]>(() => getAttemptRecords());

  // Folder expanded/collapsed state: default all open
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateAttempts = () => setAttemptRecords(getAttemptRecords());
    window.addEventListener('bpsc_attempt_saved', updateAttempts);
    window.addEventListener('bpsc_cloud_data_updated', updateAttempts);
    window.addEventListener('bpsc_history_updated', updateAttempts);
    window.addEventListener('bpsc_history_deleted', updateAttempts);
    return () => {
      window.removeEventListener('bpsc_attempt_saved', updateAttempts);
      window.removeEventListener('bpsc_cloud_data_updated', updateAttempts);
      window.removeEventListener('bpsc_history_updated', updateAttempts);
      window.removeEventListener('bpsc_history_deleted', updateAttempts);
    };
  }, []);

  const safeSets = useMemo(() => {
    return Array.isArray(availableSets)
      ? availableSets.filter((s): s is MockTestSet => Boolean(s && typeof s === 'object' && s.id))
      : [];
  }, [availableSets]);

  // Group tests into intelligent Chapter Folders
  const chapterFolders = useMemo(() => {
    return groupTestsIntoChapters(safeSets, attemptRecords);
  }, [safeSets, attemptRecords]);

  // Total attempted count
  const attemptedTotalCount = useMemo(() => {
    return safeSets.filter((t) => Boolean(getTestAttempt(t, attemptRecords))).length;
  }, [safeSets, attemptRecords]);

  // Filtered chapter folders based on search term
  const filteredChapterFolders = useMemo(() => {
    if (!searchTerm.trim()) return chapterFolders;
    const query = searchTerm.toLowerCase().trim();
    return chapterFolders
      .map((folder) => {
        const matchesChapter =
          folder.definition.nameHindi.toLowerCase().includes(query) ||
          folder.definition.nameEnglish.toLowerCase().includes(query);
        const matchingTests = folder.tests.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            (t.subtitle && t.subtitle.toLowerCase().includes(query)) ||
            (t.topicBadges && t.topicBadges.some((b) => b.toLowerCase().includes(query)))
        );
        if (matchesChapter) {
          return folder;
        }
        if (matchingTests.length > 0) {
          return {
            ...folder,
            tests: matchingTests
          };
        }
        return null;
      })
      .filter((f): f is GroupedChapterFolder => f !== null);
  }, [chapterFolders, searchTerm]);

  // Flat list filtered for Grid View
  const filteredGridSets = useMemo(() => {
    return safeSets.filter((s) => {
      if (!s) return false;
      const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase().trim();
      return (
        s.title.toLowerCase().includes(query) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(query)) ||
        (s.topicBadges && s.topicBadges.some((b) => b.toLowerCase().includes(query)))
      );
    });
  }, [safeSets, activeCategory, searchTerm]);

  const toggleFolder = (folderId: string) => {
    setOpenFolderIds((prev) => {
      const isCurrentlyOpen = prev[folderId] !== false; // default true
      return { ...prev, [folderId]: !isCurrentlyOpen };
    });
  };

  const expandAllFolders = () => {
    const allOpen: Record<string, boolean> = {};
    chapterFolders.forEach((f) => {
      allOpen[f.definition.id] = true;
    });
    setOpenFolderIds(allOpen);
  };

  const collapseAllFolders = () => {
    const allClosed: Record<string, boolean> = {};
    chapterFolders.forEach((f) => {
      allClosed[f.definition.id] = false;
    });
    setOpenFolderIds(allClosed);
  };

  const currentTitle = currentSet?.title ?? 'Mock Test';
  const currentId = currentSet?.id ?? '';
  const currentAttempt = currentSet ? getTestAttempt(currentSet, attemptRecords) : null;
  const currentCreationTime = currentSet ? formatTestDateTime(currentSet) : null;
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

  const renderChapterIcon = (type: string) => {
    switch (type) {
      case 'number_system':
        return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'discount':
        return <Tag className="w-5 h-5 text-emerald-400" />;
      case 'mensuration':
        return <Shapes className="w-5 h-5 text-blue-400" />;
      case 'geometry':
        return <Compass className="w-5 h-5 text-purple-400" />;
      case 'percentage':
        return <Percent className="w-5 h-5 text-rose-400" />;
      case 'algebra':
        return <Hash className="w-5 h-5 text-cyan-400" />;
      case 'grand':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'custom':
        return <Shuffle className="w-5 h-5 text-amber-400" />;
      default:
        return <Folder className="w-5 h-5 text-slate-400" />;
    }
  };

  // Reusable test item card renderer
  const renderTestCard = (test: MockTestSet, index: number) => {
    const isSelected = test.id === currentId;
    const topicBadges = Array.isArray(test.topicBadges) ? test.topicBadges : [];
    const totalQuestions = test.totalQuestions ?? 0;
    const totalTimeMinutes = test.totalTimeMinutes ?? 0;
    const title = test.title ?? 'Untitled Test';
    const subtitle = test.subtitle ?? '';
    const categoryTitle = test.categoryTitle ?? 'General';
    const ghostNumber = String(index + 1).padStart(2, '0');
    const attempt = getTestAttempt(test, attemptRecords);
    const creationTime = formatTestDateTime(test);

    return (
      <div
        key={test.id}
        onClick={() => onSelectSet(test.id)}
        className={`cursor-pointer rounded-3xl p-5 sm:p-6 transition-all relative overflow-hidden flex flex-col justify-between gap-4 border ${
          isSelected
            ? 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/60 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/40'
            : 'glass-panel glass-panel-hover'
        }`}
      >
        <div className="absolute -top-4 -right-2 font-black text-8xl ghost-numeral pointer-events-none opacity-15">
          {ghostNumber}
        </div>

        <div className="space-y-3 relative z-10">
          {/* Card Top Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {categoryTitle}
              </span>
              {test.isCustom && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  Custom
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{totalTimeMinutes} Mins</span>
              </span>
            </div>
          </div>

          {/* Test Creation Date & Time Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
            <span>बनाया गया: <strong className="text-slate-700 dark:text-slate-300 font-mono font-semibold">{creationTime.formatted}</strong></span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Past Attempt Status Strip (if attempted) */}
          {attempt && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  दिया गया: <strong className="font-mono text-emerald-600 dark:text-emerald-300">{attempt.score}/{attempt.totalMarks}</strong> ({attempt.accuracy}% शुद्धता)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{attempt.date}</span>
            </div>
          )}

          {/* Topic Breakdown */}
          {(() => {
            const breakdown = getTestTopicBreakdown(test);
            if (breakdown.length > 1) {
              return (
                <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-500" />
                      <span>{breakdown.length} अध्याय कंबाइंड:</span>
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                      {totalQuestions} Qs
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {breakdown.map((item) => (
                      <span
                        key={item.topicKey}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <span className="text-blue-600 dark:text-blue-400">{item.topicName}:</span>
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-black text-[10px]">
                          {item.count} Qs
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            if (breakdown.length === 1) {
              return (
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">अध्याय:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                    <span>{breakdown[0].topicName}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-black text-[10px]">
                      {breakdown[0].count} Qs
                    </span>
                  </span>
                </div>
              );
            }
            if (topicBadges.length > 0) {
              return (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {topicBadges.map((badge, bIdx) => (
                    <span
                      key={bIdx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                    >
                      {cleanTitleToEnglish(badge)}
                    </span>
                  ))}
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 relative z-10">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="font-mono text-amber-600 dark:text-amber-300">{totalQuestions}</span> Qs
            <span className="text-slate-400 mx-1">•</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">+{totalQuestions}.0 M</span>
          </div>

          <div className="flex items-center gap-1.5">
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
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadHtml(test);
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
              title="Download Offline HTML"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                printQuestionPaperWithOmr(test);
              }}
              className="p-2 rounded-xl text-amber-700 dark:text-amber-400 hover:text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
              title="Download/Print Question Paper + 5-Option OMR Sheet (PDF)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Start or Reattempt Button */}
            {attempt ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTest(test.id);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-md shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="You already attempted this test. Click to Retake."
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                <span>Reattempt</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTest(test.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
              Master <span className="text-amber-500">BPSC TRE 4.0</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
                Mathematics Exam
              </span>
              <br />
              With Real CBT Practice
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium pt-2">
              Welcome back, <strong className="text-amber-500">{userName}</strong>! Practice {qCount > 0 ? `${qCount}+` : ''} authentic Bihar STET & BPSC TRE Mathematics questions with real exam timer, option (E) safe skip, and step-by-step Hindi solutions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl pt-2">
            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Questions
              </div>
              <div className="text-2xl font-black text-amber-500 font-mono">
                {qCount > 0 ? `${qCount}+` : '677+'}
              </div>
              <div className="text-[11px] text-slate-400">STET & TRE Papers</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Mock Sets
              </div>
              <div className="text-2xl font-black text-indigo-400 font-mono">
                {safeSets.length} Sets
              </div>
              <div className="text-[11px] text-slate-400">In {chapterFolders.length} Folders</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Speed Target
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                1 Min / Q
              </div>
              <div className="text-[11px] text-slate-400">Real CBT Pace</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Marking Scheme
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">
                -0.33
              </div>
              <div className="text-[11px] text-slate-400">Option (E) Safe Skip</div>
            </div>
          </div>
        </section>

        {/* Marquee Ticker */}
        <div className="py-2.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 overflow-hidden relative">
          <div className="flex gap-8 whitespace-nowrap animate-marquee text-xs font-black tracking-wider text-amber-800 dark:text-amber-300">
            {marqueeItems.concat(marqueeItems).map((text, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span>{text}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              </span>
            ))}
          </div>
        </div>

        {/* SELECTED SET LAUNCHPAD CARD */}
        {safeSets.length === 0 ? (
          <div className="p-8 glass-panel rounded-3xl border border-dashed border-amber-500/40 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-lg mx-auto">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                No Mock Tests Available Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Database is ready. You can import questions from text/PDF or generate brand new mock tests with the Custom Test Creator.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => onOpenBulkImport()}
                className="px-5 py-3 rounded-2xl font-black text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bulk Import Questions</span>
              </button>

              <button
                onClick={onOpenCustomTest}
                className="px-5 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Create Custom Test</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-7 glass-panel rounded-3xl space-y-4 border border-amber-500/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Ready to Start Practice?
                  </span>
                  {currentCreationTime && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      <span>बनाया गया: <strong className="text-slate-700 dark:text-slate-300 font-mono font-semibold">{currentCreationTime.formatted}</strong></span>
                    </span>
                  )}
                </div>

                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Selected Set: {currentTitle}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentSet?.totalQuestions ?? 0} Questions · {currentSet?.totalTimeMinutes ?? 20} Minutes · Negative Marking -0.33
                </div>

                {/* Past Attempt Status in Selected Set */}
                {currentAttempt && (
                  <div className="inline-flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <Trophy className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        आपका पिछला स्कोर: <strong className="font-mono text-emerald-600 dark:text-emerald-200 text-sm">{currentAttempt.score}/{currentAttempt.totalMarks}</strong> ({currentAttempt.accuracy}% शुद्धता)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">तारीख: {currentAttempt.date}</span>
                    {onOpenResultsHistory && (
                      <button
                        onClick={onOpenResultsHistory}
                        className="ml-auto text-[11px] font-bold text-amber-500 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>रिजल्ट देखें (View Results)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Topic Breakdown in Selected Set */}
                {(() => {
                  const breakdown = getTestTopicBreakdown(currentSet);
                  if (breakdown.length === 0) return null;
                  return (
                    <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 space-y-1.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {breakdown.length > 1
                            ? `अध्यायवार प्रश्न संख्या (${breakdown.length} Topics Combined):`
                            : 'अध्याय (Topic):'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.map((item) => (
                          <span
                            key={item.topicKey}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                          >
                            <span className="text-blue-600 dark:text-blue-400">{item.topicName}:</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-black text-[11px]">
                              {item.count} Qs
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                <button
                  onClick={() => setIsScratchpadOpen(true)}
                  className="px-3.5 py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/5 hover:bg-slate-100 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  <span>Rough Sheet</span>
                </button>

                <button
                  onClick={() => setIsFormulaSheetOpen(true)}
                  className="px-3.5 py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/5 hover:bg-slate-100 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Formulas</span>
                </button>

                <button
                  onClick={() => printQuestionPaperWithOmr(currentSet)}
                  className="px-3.5 py-3 rounded-2xl font-bold text-xs text-amber-950 dark:text-amber-200 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Download or Print Question Paper with Official 5-Option BPSC OMR Sheet as PDF"
                >
                  <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Paper + 5-Option OMR (PDF)</span>
                </button>

                {currentAttempt ? (
                  <button
                    onClick={() => onStartTest(currentId)}
                    className="px-7 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-xl shadow-amber-400/25 transition-all active:scale-95 flex items-center gap-2 group cursor-pointer"
                    title="यह टेस्ट आप पहले दे चुके हैं। दोबारा देने के लिए क्लिक करें।"
                  >
                    <RotateCcw className="w-4 h-4 fill-slate-950 group-hover:-rotate-90 transition-transform" />
                    <span>Reattempt Examination (पुनः परीक्षा)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => onStartTest(currentId)}
                    className="px-8 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/25 transition-all active:scale-95 flex items-center gap-2 group cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Examination</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TESTS CATALOG SECTION (CHAPTER FOLDERS & GRID SYSTEM) */}
        <section className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  अध्यायवार मॉक टेस्ट फोल्डर्स ({safeSets.length} Tests in {chapterFolders.length} Folders)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                सभी टेस्ट अध्यायवार फोल्डर्स में सुव्यवस्थित हैं। निर्माण समय (Creation Date) व पूर्व प्रयास स्कोर (Past Score) साथ में प्रदर्शित है।
              </p>
            </div>

            {/* Actions: Download HTML, View Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Mode Switch */}
              <div className="p-1 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1 text-xs font-bold">
                <button
                  onClick={() => setViewMode('folders')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'folders'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Chapter Folders (अध्याय फोल्डर)</span>
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>All Grid (सभी सूची)</span>
                </button>
              </div>

              <button
                onClick={onDownloadAllHtml}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-500" />
                <span>Download All HTML</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Quick Folder Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="खोजें: अध्याय, टेस्ट नाम या टॉपिक..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            {/* Folder Controls */}
            {viewMode === 'folders' && (
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {attemptedTotalCount}/{safeSets.length} Tests Attempted
                </span>
                <span className="text-slate-400">·</span>
                <button
                  onClick={expandAllFolders}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Expand All (सभी खोलें)
                </button>
                <span className="text-slate-400">·</span>
                <button
                  onClick={collapseAllFolders}
                  className="font-bold text-slate-500 hover:underline cursor-pointer"
                >
                  Collapse All (समेटें)
                </button>
              </div>
            )}
          </div>

          {/* VIEW MODE 1: ADVANCED CHAPTER FOLDERS (DEFAULT) */}
          {viewMode === 'folders' && (
            <div className="space-y-6">
              {filteredChapterFolders.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-3xl space-y-3">
                  <Folder className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    कोई अध्याय या टेस्ट नहीं मिला
                  </p>
                </div>
              ) : (
                filteredChapterFolders.map((folderGroup) => {
                  const { definition, tests, totalQuestions, attemptedCount } = folderGroup;
                  const isFolderOpen = openFolderIds[definition.id] !== false; // default open
                  const percentAttempted =
                    tests.length > 0 ? Math.round((attemptedCount / tests.length) * 100) : 0;

                  return (
                    <div
                      key={definition.id}
                      className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all shadow-sm"
                    >
                      {/* Folder Header Bar */}
                      <div
                        onClick={() => toggleFolder(definition.id)}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                          isFolderOpen ? 'bg-white/50 dark:bg-white/5' : 'hover:bg-white/40 dark:hover:bg-white/5'
                        }`}
                      >
                        {/* Folder Info */}
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-md ${definition.color.iconBg}`}
                          >
                            {renderChapterIcon(definition.iconType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                {definition.nameHindi}
                              </h3>
                              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {definition.nameEnglish} · {totalQuestions} Questions
                            </p>
                          </div>
                        </div>

                        {/* Folder Badges & Toggle */}
                        <div className="flex items-center gap-3 ml-auto sm:ml-0">
                          {attemptedCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>
                                {attemptedCount}/{tests.length} Attempted ({percentAttempted}%)
                              </span>
                            </span>
                          )}

                          <button
                            type="button"
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 transition-all"
                            title={isFolderOpen ? 'Collapse Folder' : 'Expand Folder'}
                          >
                            {isFolderOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Folder Content (Test Cards Grid) */}
                      {isFolderOpen && (
                        <div className="p-4 sm:p-5 pt-2 border-t border-slate-200/60 dark:border-white/5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tests.map((test, idx) => renderTestCard(test, idx))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW MODE 2: FLAT ALL TESTS GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="space-y-6">
              {/* Category Filter Tabs */}
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
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs'
                        : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {filteredGridSets.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-3xl space-y-3">
                  <Layers className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    No mock tests in this category
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredGridSets.map((test, index) => renderTestCard(test, index))}
                </div>
              )}
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