import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Shuffle,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  FileDown,
  Upload,
  CheckCircle2,
  BookOpen,
  Database,
  RefreshCw,
  Edit2,
  Cloud,
  Layers,
  Image as ImageIcon,
  AlertTriangle,
  ArrowRight,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Wand2,
  Copy,
  FolderOpen,
  Folder,
  ShieldCheck,
  Zap,
  HelpCircle,
  Edit3,
  Languages,
  Play,
  ArrowLeft,
  Trophy,
  FileText,
  Clock,
  Target,
  ExternalLink,
  History,
  X,
  Printer
} from 'lucide-react';
import { Question, RegisteredTopic, MockTestSet, CustomTestConfig } from '../types';
import {
  getAllQuestionBank,
  deleteCustomQuestion,
  deleteMultipleQuestions,
  toggleBookmarkQuestion,
  getBookmarkedIds,
  getAllRegisteredTopics,
  exportFullDatabaseJson,
  importFullDatabaseJson,
  clearEntireDatabase,
  saveCustomQuestions,
  updateQuestionInBank,
  getQuestionCorrectKeys,
  getQuestionCorrectDisplay,
  registerNewTopic,
  updateRegisteredTopic,
  cleanTitleToEnglish,
  getAllAvailableTests,
  getTestsForTopic,
  createCustomMockTest,
  saveCustomTest,
  getUsedQuestionsInfo
} from '../utils/questionBankStorage';
import { syncFromFirestore, seedAllQuestionsToCloud } from '../services/firebaseSyncService';
import { auditQuestionBatch, autoHealQuestion } from '../utils/questionQualityAudit';
import { MathText } from './MathText';
import { BackButton } from './BackButton';
import { ImageKitUploadModal } from './ImageKitUploadModal';
import { printQuestionPaperWithOmr } from '../utils/exportPdfOmr';

interface QuestionBankViewProps {
  onBackToTests: () => void;
  onOpenBulkImport: (topicKey?: string) => void;
  onOpenCustomTest: (topicKey?: string) => void;
  onStartTest?: (testId: string) => void;
}

export function QuestionBankView({
  onBackToTests,
  onOpenBulkImport,
  onOpenCustomTest,
  onStartTest
}: QuestionBankViewProps) {
  // Navigation Tabs: 'browse' | 'chapters' | 'audit' | 'data'
  const [activeTab, setActiveTab] = useState<'browse' | 'chapters' | 'audit' | 'data'>('browse');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => getBookmarkedIds());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => getAllQuestionBank());
  const [registeredTopics, setRegisteredTopics] = useState<RegisteredTopic[]>(() => getAllRegisteredTopics());
  const [dbNotification, setDbNotification] = useState<string | null>(null);
  const [isImageKitModalOpen, setIsImageKitModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Chapter Folder System State
  const [chapterLangMode, setChapterLangMode] = useState<'en' | 'hi'>('en');
  const [selectedFolderKey, setSelectedFolderKey] = useState<string | null>(null);
  const [folderTab, setFolderTab] = useState<'questions' | 'tests' | 'quick_sprint'>('questions');
  const [folderSearch, setFolderSearch] = useState('');
  const [chapterSearchQuery, setChapterSearchQuery] = useState('');
  const [editingTopic, setEditingTopic] = useState<RegisteredTopic | null>(null);
  const [editHindiName, setEditHindiName] = useState('');
  const [editEnglishName, setEditEnglishName] = useState('');
  const [allAvailableTests, setAllAvailableTests] = useState<MockTestSet[]>(() => getAllAvailableTests());

  // In-line Chapter Creator
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // In-line Edit Question State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingFormState, setEditingFormState] = useState<Question | null>(null);

  // Question Usage in Tests Tracker
  const { usedIds, usedTextSet, questionUsageMap } = useMemo(() => {
    return getUsedQuestionsInfo();
  }, [allQuestions, allAvailableTests]);

  const isQuestionUsed = (q: Question) => {
    if (usedIds.has(q.id)) return true;
    const norm = q.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
    return norm.length > 5 && usedTextSet.has(norm);
  };

  const [usageFilter, setUsageFilter] = useState<'all' | 'fresh' | 'used'>('all');

  // Pagination & Display Limit State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Folder tab pagination & usage filter
  const [folderUsageFilter, setFolderUsageFilter] = useState<'all' | 'fresh' | 'used'>('all');
  const [folderPageSize, setFolderPageSize] = useState<number>(25);
  const [folderCurrentPage, setFolderCurrentPage] = useState<number>(1);

  // Bank Quality Audit - Lazy computed ONLY when audit tab is active
  const bankAuditReport = useMemo(() => {
    if (activeTab !== 'audit') {
      return {
        totalQuestions: allQuestions.length,
        healthyCount: allQuestions.length,
        problemCount: 0,
        duplicateCount: 0,
        blankOptionCount: 0,
        blankExplanationCount: 0,
        items: []
      };
    }
    return auditQuestionBatch(allQuestions);
  }, [allQuestions, activeTab]);

  const cleanPercentage = useMemo(() => {
    if (bankAuditReport.totalQuestions === 0) return 100;
    return Math.round((bankAuditReport.healthyCount / bankAuditReport.totalQuestions) * 100);
  }, [bankAuditReport]);

  const refreshData = () => {
    setAllQuestions(getAllQuestionBank());
    setRegisteredTopics(getAllRegisteredTopics());
    setBookmarkedIds(getBookmarkedIds());
    setAllAvailableTests(getAllAvailableTests());
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('bpsc_cloud_data_updated', handleUpdate);
    window.addEventListener('bpsc_questions_added', handleUpdate);
    window.addEventListener('bpsc_questions_deleted', handleUpdate);
    window.addEventListener('bpsc_question_updated', handleUpdate);
    window.addEventListener('bpsc_topic_updated', handleUpdate);
    window.addEventListener('bpsc_topic_added', handleUpdate);
    window.addEventListener('bpsc_test_saved', handleUpdate);
    window.addEventListener('bpsc_test_deleted', handleUpdate);
    return () => {
      window.removeEventListener('bpsc_cloud_data_updated', handleUpdate);
      window.removeEventListener('bpsc_questions_added', handleUpdate);
      window.removeEventListener('bpsc_questions_deleted', handleUpdate);
      window.removeEventListener('bpsc_question_updated', handleUpdate);
      window.removeEventListener('bpsc_topic_updated', handleUpdate);
      window.removeEventListener('bpsc_topic_added', handleUpdate);
      window.removeEventListener('bpsc_test_saved', handleUpdate);
      window.removeEventListener('bpsc_test_deleted', handleUpdate);
    };
  }, []);

  // Stats calculation
  const statsByTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach((q) => {
      const k = q.topic || 'custom';
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [allQuestions]);

  // Folder System Computations
  const testsByTopic = useMemo(() => {
    const map: Record<string, MockTestSet[]> = {};
    registeredTopics.forEach((t) => {
      map[t.key] = getTestsForTopic(t.key, t.labelEnglish, t.labelHindi);
    });
    return map;
  }, [registeredTopics, allAvailableTests]);

  const activeTopicObj = useMemo(() => {
    if (!selectedFolderKey) return null;
    return registeredTopics.find((t) => t.key === selectedFolderKey) || null;
  }, [selectedFolderKey, registeredTopics]);

  const questionsInCurrentFolder = useMemo(() => {
    if (!selectedFolderKey) return [];
    return allQuestions.filter((q) => q.topic === selectedFolderKey);
  }, [selectedFolderKey, allQuestions]);

  const testsInCurrentFolder = useMemo(() => {
    if (!selectedFolderKey || !activeTopicObj) return [];
    return testsByTopic[selectedFolderKey] || [];
  }, [selectedFolderKey, activeTopicObj, testsByTopic]);

  const filteredFolderQuestions = useMemo(() => {
    return questionsInCurrentFolder.filter((item) => {
      const used = isQuestionUsed(item);
      if (folderUsageFilter === 'fresh' && used) return false;
      if (folderUsageFilter === 'used' && !used) return false;
      if (!folderSearch.trim()) return true;
      const q = folderSearch.toLowerCase().trim();
      return (
        item.questionText.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.options.some((opt) => opt.text.toLowerCase().includes(q))
      );
    });
  }, [questionsInCurrentFolder, folderSearch, folderUsageFilter, usedIds, usedTextSet]);

  const folderTotalPages = useMemo(() => {
    if (folderPageSize >= 999999) return 1;
    return Math.max(1, Math.ceil(filteredFolderQuestions.length / folderPageSize));
  }, [filteredFolderQuestions.length, folderPageSize]);

  const safeFolderPage = Math.min(folderCurrentPage, folderTotalPages);

  const paginatedFolderQuestions = useMemo(() => {
    if (folderPageSize >= 999999) return filteredFolderQuestions;
    const start = (safeFolderPage - 1) * folderPageSize;
    return filteredFolderQuestions.slice(start, start + folderPageSize);
  }, [filteredFolderQuestions, safeFolderPage, folderPageSize]);

  useEffect(() => {
    setFolderCurrentPage(1);
  }, [selectedFolderKey, folderSearch, folderUsageFilter, folderPageSize]);

  const filteredChapters = useMemo(() => {
    if (!chapterSearchQuery.trim()) return registeredTopics;
    const q = chapterSearchQuery.toLowerCase().trim();
    return registeredTopics.filter(
      (t) =>
        t.labelHindi.toLowerCase().includes(q) ||
        t.labelEnglish.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q)
    );
  }, [registeredTopics, chapterSearchQuery]);

  const handleOpenEditTopic = (topic: RegisteredTopic, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTopic(topic);
    setEditHindiName(topic.labelHindi);
    setEditEnglishName(topic.labelEnglish || topic.labelHindi);
  };

  const handleSaveEditTopic = () => {
    if (!editingTopic) return;
    const updated = updateRegisteredTopic(editingTopic.key, editHindiName, editEnglishName);
    setRegisteredTopics(getAllRegisteredTopics());
    setAllQuestions(getAllQuestionBank());
    setEditingTopic(null);
    setDbNotification(`Chapter updated to "${updated.labelEnglish}"!`);
    setTimeout(() => setDbNotification(null), 3000);
  };

  const handleLaunchQuickSprint = (count: number, minutes: number) => {
    if (!activeTopicObj) return;
    const cleanEng = cleanTitleToEnglish(activeTopicObj.labelEnglish || activeTopicObj.labelHindi);
    const config: CustomTestConfig = {
      title: `BPSC TRE 4.0: ${cleanEng} Sprint (${count} Qs)`,
      creationMode: 'topic_distribution',
      selectedTopics: [activeTopicObj.key],
      topicDistribution: { [activeTopicObj.key]: count },
      questionCount: count,
      timeMinutes: minutes,
      selectionMode: 'random',
      negativeMarking: 0.33,
      targetExam: 'BPSC TRE 4.0 Mathematics',
      preferUnused: true
    };
    const testSet = createCustomMockTest(config);
    saveCustomTest(testSet);
    refreshData();
    if (onStartTest) {
      onStartTest(testSet.id);
    } else {
      onOpenCustomTest(activeTopicObj.key);
    }
  };

  const handlePrintChapterPaperWithOmr = (topic: RegisteredTopic) => {
    let chapterQs: Question[] = [];
    if (selectedIds.length > 0) {
      chapterQs = allQuestions.filter((q) => selectedIds.includes(q.id));
    } else if (selectedFolderKey === topic.key && filteredFolderQuestions.length > 0) {
      chapterQs = [...filteredFolderQuestions];
    } else {
      chapterQs = allQuestions.filter((q) => q.topic === topic.key);
    }

    if (chapterQs.length === 0) {
      alert(`इस अध्याय (${topic.labelHindi}) में कोई प्रश्न उपलब्ध नहीं है।`);
      return;
    }

    // Always random shuffle questions for realistic exam simulation
    const shuffledQs = [...chapterQs].sort(() => Math.random() - 0.5);
    const hindiName = topic.labelHindi.split('(')[0].trim() || topic.labelEnglish;
    const testSet: MockTestSet = {
      id: `chapter_${topic.key}_${Date.now()}`,
      title: `BPSC TRE 4.0: ${hindiName} स्पेशल मॉक टेस्ट (${shuffledQs.length} प्रश्न)`,
      subtitle: `${topic.labelEnglish || topic.labelHindi} Chapter Practice Paper`,
      targetExam: 'BPSC TRE 4.0 Mathematics',
      category: 'custom',
      categoryTitle: hindiName,
      topicBadges: [topic.labelHindi],
      totalQuestions: shuffledQs.length,
      totalTimeMinutes: Math.max(20, Math.round(shuffledQs.length * 1.25)),
      questions: shuffledQs
    };
    printQuestionPaperWithOmr(testSet);
  };

  const handlePrintSelectedQuestionsWithOmr = () => {
    const selectedQs = allQuestions.filter((q) => selectedIds.includes(q.id));
    if (selectedQs.length === 0) return;
    const testSet: MockTestSet = {
      id: `selected_${Date.now()}`,
      title: `BPSC TRE 4.0: चयनित प्रश्न अभ्यास पत्र (${selectedQs.length} प्रश्न)`,
      subtitle: `Handpicked Questions Set`,
      targetExam: 'BPSC TRE 4.0 Mathematics',
      category: 'custom',
      categoryTitle: 'चयनित प्रश्न',
      topicBadges: ['Selected Practice'],
      totalQuestions: selectedQs.length,
      totalTimeMinutes: Math.max(15, Math.round(selectedQs.length * 1.25)),
      questions: selectedQs
    };
    printQuestionPaperWithOmr(testSet);
  };

  // Filtered Questions in Browse tab
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(q.id);
      const used = isQuestionUsed(q);
      const matchesUsage =
        usageFilter === 'all' ||
        (usageFilter === 'fresh' && !used) ||
        (usageFilter === 'used' && used);
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        q.questionText.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query) ||
        (q.topicNameHindi && q.topicNameHindi.toLowerCase().includes(query)) ||
        (q.exam && q.exam.toLowerCase().includes(query));
      return matchesTopic && matchesBookmark && matchesUsage && matchesSearch;
    });
  }, [allQuestions, selectedTopic, onlyBookmarked, bookmarkedIds, searchTerm, usageFilter, usedIds, usedTextSet]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTopic, onlyBookmarked, usageFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / (pageSize === 999999 ? filteredQuestions.length || 1 : pageSize)));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedQuestions = useMemo(() => {
    if (pageSize === 999999) return filteredQuestions;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredQuestions.slice(startIndex, startIndex + pageSize);
  }, [filteredQuestions, safeCurrentPage, pageSize]);

  // Actions
  const handleToggleBookmark = (id: string) => {
    toggleBookmarkQuestion(id);
    setBookmarkedIds(getBookmarkedIds());
  };

  const toggleExpandSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditingFormState({
      ...q,
      options: q.options.map((o) => ({ ...o })),
      correctOptions: getQuestionCorrectKeys(q)
    });
  };

  const handleSaveQuestionEdit = () => {
    if (!editingFormState) return;
    updateQuestionInBank(editingFormState);
    setEditingQuestionId(null);
    setEditingFormState(null);
    refreshData();
    setDbNotification('Question updated successfully!');
    setTimeout(() => setDbNotification(null), 3000);
  };

  const handleDeleteSingleQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteCustomQuestion(id);
      refreshData();
      setDbNotification('Question deleted!');
      setTimeout(() => setDbNotification(null), 3000);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected questions?`)) {
      const count = deleteMultipleQuestions(selectedIds);
      setSelectedIds([]);
      refreshData();
      setDbNotification(`${count} questions deleted!`);
      setTimeout(() => setDbNotification(null), 3000);
    }
  };

  const handleCreateNewChapter = () => {
    if (!newTopicHindi.trim()) return;
    registerNewTopic('', newTopicHindi, newTopicEnglish || newTopicHindi);
    setRegisteredTopics(getAllRegisteredTopics());
    setIsAddingTopic(false);
    setNewTopicHindi('');
    setNewTopicEnglish('');
    setDbNotification(`New chapter "${newTopicEnglish || newTopicHindi}" registered!`);
    setTimeout(() => setDbNotification(null), 3000);
  };

  const handleExportDb = () => {
    const jsonStr = exportFullDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BPSC_QuestionBank_Backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDbNotification('Database JSON backup downloaded!');
    setTimeout(() => setDbNotification(null), 3000);
  };

  const handleImportDb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFullDatabaseJson(content);
      if (res.success) {
        refreshData();
        setDbNotification(`Database restore successful: ${res.message}`);
      } else {
        alert('Database restore failed: ' + res.message);
      }
      setTimeout(() => setDbNotification(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearDatabase = () => {
    const conf = window.prompt(
      'WARNING: This will clear the entire database! Type "CLEAR" to proceed:'
    );
    if (conf === 'CLEAR') {
      clearEntireDatabase();
      refreshData();
      setDbNotification('Database cleared completely!');
      setTimeout(() => setDbNotification(null), 4000);
    }
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    try {
      await syncFromFirestore();
      refreshData();
      setDbNotification('Google Firestore cloud database sync successful!');
    } catch (err: any) {
      alert('Cloud sync failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsCloudSyncing(false);
      setTimeout(() => setDbNotification(null), 3000);
    }
  };

  const handleAutoHealAuditIssues = () => {
    const healed = allQuestions.map((q) => autoHealQuestion(q));
    saveCustomQuestions(healed);
    refreshData();
    setDbNotification('All questions quality auto-healed!');
    setTimeout(() => setDbNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-app-canvas grid-lines-44 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BackButton onClick={onBackToTests} label="Back to Tests" variant="compact" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span>BPSC Question Bank Repository</span>
                  </h1>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                    {allQuestions.length} Questions
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search, manage, edit, and organize authentic BPSC TRE & Bihar STET mathematics questions
                </p>
              </div>
            </div>

            {/* Two Primary Action CTAs */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenBulkImport(selectedTopic !== 'all' ? selectedTopic : undefined)}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bulk Import Questions</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCustomTest(selectedTopic !== 'all' ? selectedTopic : undefined)}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4 fill-slate-950" />
                <span>Create Custom Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {dbNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{dbNotification}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-[10px] font-black uppercase text-slate-400">Total Questions</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {allQuestions.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">In Master Question Bank</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-[10px] font-black uppercase text-slate-400">Chapters Registered</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-500 mt-1">
              {registeredTopics.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Mathematics Topics</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-[10px] font-black uppercase text-slate-400">Bookmarked</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-500 mt-1">
              {bookmarkedIds.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Saved for Practice</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-[10px] font-black uppercase text-slate-400">Quality Health</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-teal-500 mt-1">
              {cleanPercentage}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {bankAuditReport.problemCount === 0 ? 'Zero Issues' : `${bankAuditReport.problemCount} Issues to Fix`}
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip (Uncongested, Clean Tabs) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'browse'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>1. Browse Questions ({allQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'chapters'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Chapters & Syllabus ({registeredTopics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${bankAuditReport.problemCount > 0 ? 'text-amber-500 animate-pulse' : ''}`} />
            <span>3. Quality Audit & Clean ({bankAuditReport.problemCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'data'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>4. Cloud Sync & Backup Studio</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: BROWSE QUESTIONS REPOSITORY                       */}
        {/* ======================================================== */}
        {activeTab === 'browse' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search & Filter Bar */}
            <div className="glass-panel p-5 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search in Hindi or English (ल.स., प्रतिशत, क्रय मूल्य, STET 2024)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden font-medium"
                  />
                </div>

                {/* Question Usage Filter */}
                <select
                  value={usageFilter}
                  onChange={(e) => setUsageFilter(e.target.value as any)}
                  className="px-3.5 py-3 rounded-2xl border text-xs sm:text-sm font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-hidden shrink-0"
                >
                  <option value="all">All Status (सभी प्रश्न)</option>
                  <option value="fresh">Fresh Only (अप्रयुक्त प्रश्न)</option>
                  <option value="used">Used in Tests (टेस्ट में प्रयुक्त)</option>
                </select>

                {/* Display Limit / Per Page Selector */}
                <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-1.5">
                  <span className="text-xs font-bold text-slate-500">Display:</span>
                  <select
                    value={pageSize === 999999 ? 'all' : pageSize}
                    onChange={(e) => {
                      const val = e.target.value === 'all' ? 999999 : Number(e.target.value);
                      setPageSize(val);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    <option value={10}>10 / page</option>
                    <option value={15}>15 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={30}>30 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                    <option value="all">All ({filteredQuestions.length})</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                  className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shrink-0 ${
                    onlyBookmarked
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${onlyBookmarked ? 'fill-amber-500' : ''}`} />
                  <span>Bookmarks ({bookmarkedIds.length})</span>
                </button>
              </div>

              {/* Chapter Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTopic('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedTopic === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  All Topics ({allQuestions.length})
                </button>

                {registeredTopics.map((topic) => {
                  const count = statsByTopic[topic.key] || 0;
                  return (
                    <button
                      key={topic.key}
                      type="button"
                      onClick={() => setSelectedTopic(topic.key)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        selectedTopic === topic.key
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {topic.labelHindi} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Batch Action Strip */}
              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <span>Selected {selectedIds.length} Questions</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrintSelectedQuestionsWithOmr}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Print Selected Questions + 5-Option OMR Sheet"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Paper + OMR ({selectedIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchDelete}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Questions Cards List */}
            {filteredQuestions.length === 0 ? (
              <div className="glass-panel p-16 rounded-3xl text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">
                  No questions match your search or filter
                </h3>
                <p className="text-xs text-slate-500">
                  Try clearing the search term, or click "Bulk Import Questions" to add new questions.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                {paginatedQuestions.map((q, idx) => {
                  const isBookmarked = bookmarkedIds.includes(q.id);
                  const isSolutionOpen = Boolean(expandedSolutions[q.id]);
                  const isEditing = editingQuestionId === q.id;
                  const itemNumber = (safeCurrentPage - 1) * pageSize + idx + 1;

                  return (
                    <div
                      key={q.id}
                      className="glass-panel p-6 rounded-3xl space-y-4 border transition-all"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs flex items-center justify-center">
                            #{itemNumber}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {cleanTitleToEnglish(q.topicNameHindi || q.topic)}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            {q.exam}
                          </span>
                          {/* Used vs Fresh Question Badge */}
                          {isQuestionUsed(q) ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                              title={(questionUsageMap.get(q.id) || []).length > 0 ? `Used in tests: ${(questionUsageMap.get(q.id) || []).join(', ')}` : 'Previously used in mock test'}
                            >
                              <History className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>Used in Test {(questionUsageMap.get(q.id) || []).length > 0 ? `(${(questionUsageMap.get(q.id) || []).length})` : ''}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>Fresh / Unused</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Bookmark */}
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(q.id)}
                            className={`p-2 rounded-xl transition-colors ${
                              isBookmarked
                                ? 'text-amber-500 bg-amber-500/10'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                            title="Bookmark question"
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleStartEditQuestion(q)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            title="Edit question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleQuestion(q.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content or Edit Form */}
                      {!isEditing ? (
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                            <MathText text={q.questionText} />
                          </div>

                          {/* 5 Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 text-xs">
                            {q.options.map((opt) => {
                              const isCorrect = q.correctOption?.includes(opt.key);
                              return (
                                <div
                                  key={opt.key}
                                  className={`p-2.5 rounded-xl border font-medium ${
                                    isCorrect
                                      ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-800 dark:text-emerald-200 font-bold'
                                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="uppercase font-bold">({opt.key})</span>{' '}
                                  <MathText text={opt.text} />
                                </div>
                              );
                            })}
                          </div>

                          {/* Expand Solution Button & View */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => toggleExpandSolution(q.id)}
                              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
                            >
                              <span>{isSolutionOpen ? 'Hide Solution' : 'View Detailed Solution & Explanation'}</span>
                              {isSolutionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {isSolutionOpen && (
                              <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-1 animate-in fade-in">
                                <div className="font-bold text-amber-600 dark:text-amber-400">
                                  BPSC Official Explanation:
                                </div>
                                <MathText text={q.explanation || 'No explanation provided.'} />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Inline Editor for this question */
                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/30 space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Edit Question Text:</label>
                            <textarea
                              rows={3}
                              value={editingFormState?.questionText || ''}
                              onChange={(e) =>
                                setEditingFormState({
                                  ...editingFormState!,
                                  questionText: e.target.value
                                })
                              }
                              className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden font-medium"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {editingFormState?.options.map((opt, oIdx) => (
                              <div key={opt.key} className="space-y-1">
                                <label className="text-[11px] font-bold uppercase text-slate-500">
                                  Option ({opt.key}):
                                </label>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const opts = [...editingFormState.options];
                                    opts[oIdx] = { ...opt, text: e.target.value };
                                    setEditingFormState({ ...editingFormState, options: opts });
                                  }}
                                  className="w-full p-2 rounded-xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Explanation / Solution:</label>
                            <textarea
                              rows={3}
                              value={editingFormState?.explanation || ''}
                              onChange={(e) =>
                                setEditingFormState({
                                  ...editingFormState!,
                                  explanation: e.target.value
                                })
                              }
                              className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden font-medium"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSaveQuestionEdit}
                              className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                            >
                              Save Updates
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestionId(null);
                                setEditingFormState(null);
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ultra-Fast Responsive Pagination Bar */}
              {filteredQuestions.length > pageSize && (
                <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border border-slate-200 dark:border-white/10 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Showing <span className="text-amber-600 dark:text-amber-400 font-mono">{(safeCurrentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-mono">{Math.min(safeCurrentPage * pageSize, filteredQuestions.length)}</span> of{' '}
                    <span className="text-slate-900 dark:text-white font-mono">{filteredQuestions.length}</span> questions
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      disabled={safeCurrentPage === 1}
                      className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safeCurrentPage === 1}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                        .reduce((acc: (number | string)[], p, i, arr) => {
                          if (i > 0 && p - (arr[i - 1] as number) > 1) {
                            acc.push('...');
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) => {
                          if (item === '...') {
                            return (
                              <span key={`dots_${idx}`} className="px-1 text-xs text-slate-400">
                                …
                              </span>
                            );
                          }
                          const pNum = Number(item);
                          const isActive = pNum === safeCurrentPage;
                          return (
                            <button
                              key={pNum}
                              type="button"
                              onClick={() => setCurrentPage(pNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                                isActive
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {pNum}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={safeCurrentPage === totalPages}
                      className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-slate-400">Per page:</span>
                    <select
                      value={pageSize === 999999 ? 'all' : pageSize}
                      onChange={(e) => {
                        const val = e.target.value === 'all' ? 999999 : Number(e.target.value);
                        setPageSize(val);
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={25}>25</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="all">All ({filteredQuestions.length})</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

        {/* ======================================================== */}
        {/* TAB 2: CHAPTERS & SYLLABUS DIRECTORY (FOLDER FORMAT)     */}
        {/* ======================================================== */}
        {activeTab === 'chapters' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Toolbar / Breadcrumbs */}
            {selectedFolderKey === null ? (
              /* ROOT DIRECTORY HEADER */
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Folder className="w-6 h-6 text-amber-500 fill-amber-500/20" />
                    <span>Mathematics Chapters Directory ({registeredTopics.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interactive chapter folder format. Open any chapter to explore questions, view existing mock tests, edit titles, or create dedicated exams.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Hindi / English Language Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xs">
                    <Languages className="w-4 h-4 text-indigo-500 ml-1.5" />
                    <span className="text-[11px] font-bold text-slate-500 hidden sm:inline px-1">Display:</span>
                    <button
                      type="button"
                      onClick={() => setChapterLangMode('en')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        chapterLangMode === 'en'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setChapterLangMode('hi')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        chapterLangMode === 'hi'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>

                  {/* Chapter Filter / Search */}
                  <div className="relative min-w-[190px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search chapters..."
                      value={chapterSearchQuery}
                      onChange={(e) => setChapterSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold focus:outline-hidden"
                    />
                  </div>

                  {/* Add New Chapter */}
                  <button
                    type="button"
                    onClick={() => setIsAddingTopic(!isAddingTopic)}
                    className="px-4 py-2 rounded-2xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Chapter</span>
                  </button>
                </div>
              </div>
            ) : (
              /* FOLDER VIEW BREADCRUMB */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFolderKey(null);
                      setFolderSearch('');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4 text-amber-500" />
                    <span>All Chapters</span>
                  </button>
                  <span className="text-slate-400 text-sm">/</span>
                  <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                    <FolderOpen className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                    <span>
                      {chapterLangMode === 'en'
                        ? activeTopicObj?.labelEnglish || activeTopicObj?.labelHindi
                        : activeTopicObj?.labelHindi}
                    </span>
                  </div>
                </div>

                {/* Switch Language Inside Folder */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-xs text-slate-400 font-bold">Language:</span>
                  <button
                    type="button"
                    onClick={() => setChapterLangMode(chapterLangMode === 'en' ? 'hi' : 'en')}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-400/50 flex items-center gap-1 transition-colors"
                  >
                    <Languages className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{chapterLangMode === 'en' ? 'Switch to हिंदी' : 'Switch to English'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-place Chapter Registration */}
            {isAddingTopic && (
              <div className="glass-panel p-6 rounded-3xl space-y-4 border-indigo-500/40">
                <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Register New Chapter Folder:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Chapter Hindi Name (e.g. प्रायिकता)"
                    value={newTopicHindi}
                    onChange={(e) => setNewTopicHindi(e.target.value)}
                    className="p-3 rounded-2xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Chapter English Name (e.g. Probability)"
                    value={newTopicEnglish}
                    onChange={(e) => setNewTopicEnglish(e.target.value)}
                    className="p-3 rounded-2xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden font-bold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCreateNewChapter}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 text-white"
                  >
                    Confirm & Save Chapter
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingTopic(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW A: ROOT CHAPTER FOLDERS GRID                       */}
            {/* ======================================================== */}
            {selectedFolderKey === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredChapters.map((topic) => {
                  const count = statsByTopic[topic.key] || 0;
                  const testList = testsByTopic[topic.key] || [];
                  const primaryTitle = chapterLangMode === 'en'
                    ? (topic.labelEnglish || topic.labelHindi)
                    : topic.labelHindi;
                  const secondaryTitle = chapterLangMode === 'en'
                    ? topic.labelHindi
                    : (topic.labelEnglish || topic.labelHindi);

                  return (
                    <div
                      key={topic.key}
                      onClick={() => {
                        setSelectedFolderKey(topic.key);
                        setFolderTab('questions');
                      }}
                      className="group glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-slate-200 dark:border-white/10 hover:border-amber-400/50 hover:shadow-lg dark:hover:shadow-amber-500/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                      {/* Top Bar of Folder */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-500 transition-colors shrink-0">
                          <Folder className="w-6 h-6 fill-amber-500/30" />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{count} Qs</span>
                          </span>

                          <span className={`font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            testList.length > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                          }`}>
                            <Trophy className="w-3 h-3" />
                            <span>{testList.length} Tests</span>
                          </span>
                        </div>
                      </div>

                      {/* Folder Content / Names */}
                      <div className="space-y-1">
                        <h4 className="font-black text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-2">
                          {primaryTitle}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {secondaryTitle}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-white/5"
                      >
                        {/* Open Folder */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFolderKey(topic.key);
                            setFolderTab('questions');
                          }}
                          className="flex-1 min-w-[90px] py-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                          <span>Open</span>
                        </button>

                        {/* Create Test */}
                        <button
                          type="button"
                          onClick={() => onOpenCustomTest(topic.key)}
                          className="flex-1 min-w-[100px] py-2 rounded-xl text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors text-center shadow-xs"
                          title={`Create Mock Test for ${topic.labelEnglish || topic.labelHindi}`}
                        >
                          Create Test
                        </button>

                        {/* Edit Chapter */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditTopic(topic, e)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                          title="Edit Chapter Hindi & English Name"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Import Qs */}
                        <button
                          type="button"
                          onClick={() => onOpenBulkImport(topic.key)}
                          className="py-2 px-2.5 rounded-xl text-[11px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-colors"
                          title="Import Questions into this Chapter"
                        >
                          + Import
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ======================================================== */
              /* VIEW B: OPENED CHAPTER FOLDER DETAILS                   */
              /* ======================================================== */
              activeTopicObj && (
                <div className="space-y-6">
                  {/* Folder Hero Banner */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-indigo-500/5 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
                          <FolderOpen className="w-7 h-7 fill-amber-500/30" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                              {chapterLangMode === 'en'
                                ? activeTopicObj.labelEnglish || activeTopicObj.labelHindi
                                : activeTopicObj.labelHindi}
                            </h2>
                            <button
                              type="button"
                              onClick={() => handleOpenEditTopic(activeTopicObj)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                              title="Edit Chapter Name"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {chapterLangMode === 'en'
                              ? activeTopicObj.labelHindi
                              : activeTopicObj.labelEnglish || activeTopicObj.labelHindi}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              key: {activeTopicObj.key}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              {questionsInCurrentFolder.length} Questions in Folder
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              {testsInCurrentFolder.length} Mock Tests Created
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handlePrintChapterPaperWithOmr(activeTopicObj)}
                          className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 dark:text-amber-300 transition-colors border border-amber-500/30 flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Print Chapter Question Paper with 5-Option BPSC OMR Sheet (PDF)"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>Paper + 5-Option OMR (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenCustomTest(activeTopicObj.key)}
                          className="px-4 py-2.5 rounded-2xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md shadow-amber-400/20 flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Mock Test</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenBulkImport(activeTopicObj.key)}
                          className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Import Questions</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-Tabs Selector */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setFolderTab('questions')}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                          folderTab === 'questions'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Chapter Questions ({questionsInCurrentFolder.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFolderTab('tests')}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                          folderTab === 'tests'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Mock Tests for this Chapter ({testsInCurrentFolder.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFolderTab('quick_sprint')}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                          folderTab === 'quick_sprint'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>1-Click Quick Sprint</span>
                      </button>
                    </div>
                  </div>

                  {/* SUB-TAB 1: QUESTIONS IN FOLDER */}
                  {folderTab === 'questions' && (
                    <div className="space-y-4">
                      {/* Search Bar & Filters inside Folder */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <div className="relative flex-1 min-w-[220px]">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Filter questions in this chapter..."
                            value={folderSearch}
                            onChange={(e) => setFolderSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold focus:outline-hidden"
                          />
                        </div>

                        {/* Folder Usage Filter */}
                        <select
                          value={folderUsageFilter}
                          onChange={(e) => setFolderUsageFilter(e.target.value as any)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                        >
                          <option value="all">All Status (सभी प्रश्न)</option>
                          <option value="fresh">Fresh Only (अप्रयुक्त)</option>
                          <option value="used">Used in Tests (प्रयुक्त)</option>
                        </select>

                        {/* Folder Per-Page Display Limit */}
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs">
                          <span className="font-bold text-slate-400">Display:</span>
                          <select
                            value={folderPageSize === 999999 ? 'all' : folderPageSize}
                            onChange={(e) => {
                              const val = e.target.value === 'all' ? 999999 : Number(e.target.value);
                              setFolderPageSize(val);
                            }}
                            className="bg-transparent font-black text-amber-600 dark:text-amber-400 focus:outline-hidden cursor-pointer"
                          >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                            <option value="all">All ({filteredFolderQuestions.length})</option>
                          </select>
                        </div>

                        <span className="text-xs font-bold text-slate-500">
                          Showing {filteredFolderQuestions.length} of {questionsInCurrentFolder.length} questions
                        </span>
                      </div>

                      {filteredFolderQuestions.length === 0 ? (
                        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
                          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                          <h4 className="font-bold text-base text-slate-700 dark:text-slate-300">
                            {questionsInCurrentFolder.length === 0
                              ? 'This chapter folder has no questions yet'
                              : 'No questions match your filter'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Import questions into this chapter using the Bulk Import tool.
                          </p>
                          <button
                            type="button"
                            onClick={() => onOpenBulkImport(activeTopicObj.key)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                          >
                            + Import Questions to {activeTopicObj.labelEnglish || activeTopicObj.labelHindi}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {paginatedFolderQuestions.map((q, idx) => {
                            const isBookmarked = bookmarkedIds.includes(q.id);
                            const isSolutionOpen = Boolean(expandedSolutions[q.id]);
                            const isEditing = editingQuestionId === q.id;
                            const isUsed = isQuestionUsed(q);
                            const usageTests = questionUsageMap.get(q.id) || [];
                            const itemNumber = (safeFolderPage - 1) * (folderPageSize === 999999 ? 0 : folderPageSize) + idx + 1;

                            return (
                              <div
                                key={q.id}
                                className="glass-panel p-6 rounded-3xl space-y-4 border transition-all"
                              >
                                {/* Question Header */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs flex items-center justify-center">
                                      #{itemNumber}
                                    </span>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                      {cleanTitleToEnglish(q.topicNameHindi || q.topic)}
                                    </span>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                      {q.exam}
                                    </span>
                                    {/* Used vs Fresh Question Badge */}
                                    {isUsed ? (
                                      <span
                                        className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                                        title={usageTests.length > 0 ? `Used in tests: ${usageTests.join(', ')}` : 'Previously used in mock test'}
                                      >
                                        <History className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span>Used in Test {usageTests.length > 0 ? `(${usageTests.length})` : ''}</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                        <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                                        <span>Fresh / Unused</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Bookmark */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleBookmark(q.id)}
                                      className={`p-2 rounded-xl transition-colors ${
                                        isBookmarked
                                          ? 'text-amber-500 bg-amber-500/10'
                                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10'
                                      }`}
                                      title="Bookmark question"
                                    >
                                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                                    </button>

                                    {/* Edit */}
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditQuestion(q)}
                                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                      title="Edit question"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSingleQuestion(q.id)}
                                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                      title="Delete question"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Content or Edit Form */}
                                {!isEditing ? (
                                  <div className="space-y-3">
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                                      <MathText text={q.questionText} />
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 text-xs">
                                      {q.options.map((opt) => {
                                        const isCorrect = q.correctOption?.includes(opt.key);
                                        return (
                                          <div
                                            key={opt.key}
                                            className={`p-2.5 rounded-xl border font-medium ${
                                              isCorrect
                                                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-800 dark:text-emerald-200 font-bold'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                                            }`}
                                          >
                                            <span className="uppercase font-bold">({opt.key})</span>{' '}
                                            <MathText text={opt.text} />
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Solution toggle */}
                                    <div className="pt-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleExpandSolution(q.id)}
                                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
                                      >
                                        <span>{isSolutionOpen ? 'Hide Solution' : 'View Detailed Solution & Explanation'}</span>
                                        {isSolutionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                      </button>

                                      {isSolutionOpen && (
                                        <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-1 animate-in fade-in">
                                          <div className="font-bold text-amber-600 dark:text-amber-400">
                                            BPSC Official Explanation:
                                          </div>
                                          <MathText text={q.explanation || 'No explanation provided.'} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  /* Inline Editor */
                                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/30 space-y-4">
                                    <div className="space-y-1">
                                      <label className="text-xs font-bold text-slate-500">Edit Question Text:</label>
                                      <textarea
                                        rows={3}
                                        value={editingFormState?.questionText || ''}
                                        onChange={(e) =>
                                          setEditingFormState((prev) =>
                                            prev ? { ...prev, questionText: e.target.value } : null
                                          )
                                        }
                                        className="w-full p-3 rounded-xl text-xs bg-white dark:bg-slate-900 border font-bold"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={handleSaveQuestionEdit}
                                        className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white"
                                      >
                                        Save Changes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingQuestionId(null);
                                          setEditingFormState(null);
                                        }}
                                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Folder Pagination Bar */}
                      {folderTotalPages > 1 && folderPageSize < 999999 && (
                        <div className="glass-panel p-3 rounded-2xl flex items-center justify-between gap-3 text-xs mt-4">
                          <span className="font-bold text-slate-500">
                            Showing {(safeFolderPage - 1) * folderPageSize + 1} to{' '}
                            {Math.min(safeFolderPage * folderPageSize, filteredFolderQuestions.length)} of{' '}
                            {filteredFolderQuestions.length} questions
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setFolderCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={safeFolderPage === 1}
                              className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span>Prev</span>
                            </button>

                            <span className="px-3 py-1 rounded-lg bg-amber-400/20 font-mono font-black text-amber-700 dark:text-amber-300">
                              {safeFolderPage} / {folderTotalPages}
                            </span>

                            <button
                              type="button"
                              onClick={() => setFolderCurrentPage((p) => Math.min(folderTotalPages, p + 1))}
                              disabled={safeFolderPage === folderTotalPages}
                              className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 2: TESTS FOR THIS CHAPTER */}
                  {folderTab === 'tests' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <span>Mock Tests Registered for this Chapter ({testsInCurrentFolder.length})</span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            Tests that include questions from {activeTopicObj.labelEnglish || activeTopicObj.labelHindi}. Click "Start Test" to begin immediately.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenCustomTest(activeTopicObj.key)}
                          className="px-4 py-2 rounded-2xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New Test</span>
                        </button>
                      </div>

                      {testsInCurrentFolder.length === 0 ? (
                        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
                          <Trophy className="w-12 h-12 text-slate-400 mx-auto" />
                          <h4 className="font-bold text-base text-slate-700 dark:text-slate-300">
                            No Dedicated Mock Tests Found for this Chapter
                          </h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            You haven't generated a mock test specifically for {activeTopicObj.labelEnglish || activeTopicObj.labelHindi} yet. Click below to generate one automatically!
                          </p>
                          <button
                            type="button"
                            onClick={() => onOpenCustomTest(activeTopicObj.key)}
                            className="px-5 py-2.5 rounded-2xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md shadow-amber-400/20"
                          >
                            Generate {activeTopicObj.labelEnglish || activeTopicObj.labelHindi} Mock Test Now
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {testsInCurrentFolder.map((test) => {
                            const qCount = test.totalQuestions || (Array.isArray(test.questions) ? test.questions.length : 0);
                            const tMins = test.totalTimeMinutes || 20;

                            return (
                              <div
                                key={test.id}
                                className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between border hover:border-amber-400/50 transition-all"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      {test.targetExam || 'BPSC TRE 4.0'}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{tMins} Mins</span>
                                    </span>
                                  </div>

                                  <h4 className="font-black text-base text-slate-900 dark:text-white line-clamp-2">
                                    {test.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 line-clamp-1">
                                    {test.subtitle || 'Chapter Specific Mock Test'}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-mono font-bold text-slate-700 dark:text-slate-300">
                                      {qCount} Questions
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-mono font-bold text-slate-700 dark:text-slate-300">
                                      {qCount} Marks
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => printQuestionPaperWithOmr(test)}
                                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                                    title="Print Question Paper with 5-Option OMR Sheet (PDF)"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onStartTest) {
                                        onStartTest(test.id);
                                      } else {
                                        onOpenCustomTest(activeTopicObj.key);
                                      }
                                    }}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20"
                                  >
                                    <Play className="w-4 h-4 fill-slate-950" />
                                    <span>Start Test Now</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: QUICK 1-CLICK SPRINT */}
                  {folderTab === 'quick_sprint' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          <span>1-Click Chapter Sprint Generator</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Launch a test immediately from {activeTopicObj.labelEnglish || activeTopicObj.labelHindi} without configuring parameters.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Sprint Option 1 */}
                        <div className="glass-panel p-6 rounded-3xl space-y-4 border flex flex-col justify-between hover:border-amber-400/50 transition-all">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              Rapid Practice
                            </span>
                            <h5 className="font-black text-lg text-slate-900 dark:text-white">
                              10 Qs Quick Sprint
                            </h5>
                            <p className="text-xs text-slate-500">
                              10 questions from this chapter in 10 minutes. Perfect for fast revision.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleLaunchQuickSprint(10, 10)}
                            className="w-full py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Launch 10 Qs Sprint</span>
                          </button>
                        </div>

                        {/* Sprint Option 2 */}
                        <div className="glass-panel p-6 rounded-3xl space-y-4 border flex flex-col justify-between hover:border-amber-400/50 transition-all">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              Standard Drill
                            </span>
                            <h5 className="font-black text-lg text-slate-900 dark:text-white">
                              25 Qs Standard Test
                            </h5>
                            <p className="text-xs text-slate-500">
                              25 questions in 25 minutes. Ideal benchmark for speed & accuracy.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleLaunchQuickSprint(25, 25)}
                            className="w-full py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Launch 25 Qs Test</span>
                          </button>
                        </div>

                        {/* Sprint Option 3 */}
                        <div className="glass-panel p-6 rounded-3xl space-y-4 border flex flex-col justify-between hover:border-amber-400/50 transition-all">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              Chapter Mastery
                            </span>
                            <h5 className="font-black text-lg text-slate-900 dark:text-white">
                              40 Qs Deep Exam
                            </h5>
                            <p className="text-xs text-slate-500">
                              40 questions in 40 minutes covering all difficulty tiers in this topic.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleLaunchQuickSprint(40, 40)}
                            className="w-full py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Launch 40 Qs Exam</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* EDIT CHAPTER MODAL */}
            {editingTopic && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 border border-amber-400/40 shadow-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-amber-500" />
                      <span>Edit Chapter Details</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingTopic(null)}
                      className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Update the Hindi and English display names for this chapter across the entire mock portal.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Chapter Hindi Name (हिंदी नाम):
                      </label>
                      <input
                        type="text"
                        value={editHindiName}
                        onChange={(e) => setEditHindiName(e.target.value)}
                        placeholder="e.g. संख्या पद्धति"
                        className="w-full p-3 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Chapter English Name (English Name):
                      </label>
                      <input
                        type="text"
                        value={editEnglishName}
                        onChange={(e) => setEditEnglishName(e.target.value)}
                        placeholder="e.g. Number System"
                        className="w-full p-3 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTopic(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditTopic}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md shadow-amber-400/20"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: QUALITY AUDIT & CLEANER                          */}
        {/* ======================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Question Quality & Duplicate Scanner</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scans database for duplicate questions, missing 5th option (e), or missing Hindi solutions
                </p>
              </div>

              {bankAuditReport.problemCount > 0 && (
                <button
                  type="button"
                  onClick={handleAutoHealAuditIssues}
                  className="px-5 py-2.5 rounded-2xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-2 self-start"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>1-Click Auto-Fix All ({bankAuditReport.problemCount} Issues)</span>
                </button>
              )}
            </div>

            {/* Audit Status Card */}
            {bankAuditReport.problemCount === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-3 bg-emerald-500/5 border-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-black text-emerald-700 dark:text-emerald-300">
                  Question Bank 100% Validated & Clean!
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Every question has valid options A-E, an answer key, and an explanation. No duplicates found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bankAuditReport.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-5 rounded-3xl space-y-3 border-amber-500/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {item.issues.map((iss) => iss.title).join(' · ')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleQuestion(item.question.id)}
                        className="text-xs text-rose-500 font-bold hover:underline"
                      >
                        Delete Question
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <MathText text={item.question.questionText} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CLOUD SYNC & BACKUP MANAGEMENT                   */}
        {/* ======================================================== */}
        {activeTab === 'data' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <span>Cloud Sync & Database Backup Studio</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export offline JSON backups, restore databases, or synchronize with Google Cloud Firestore
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Firestore Cloud Sync */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      Google Cloud Firestore Live Sync
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sync question bank across multiple devices and browsers in realtime
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloudSync}
                  disabled={isCloudSyncing}
                  className="w-full py-3 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span>{isCloudSyncing ? 'Syncing...' : 'Sync with Cloud Database Now'}</span>
                </button>
              </div>

              {/* JSON Backup & Export */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-black">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      Offline JSON Backup & Restore
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Export questions to local file or restore from a previously saved JSON
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleExportDb}
                    className="py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4 text-emerald-500" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-indigo-500" />
                    <span>Restore JSON</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportDb}
                  accept=".json"
                  className="hidden"
                />
              </div>

              {/* Upload Diagrams to CDN */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      ImageKit Mathematics Diagrams
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload geometric figures, graphs, and triangle diagrams to ImageKit CDN
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsImageKitModalOpen(true)}
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>Upload & Generate Diagram Markdown</span>
                </button>
              </div>

              {/* Wipe & Reset Database */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 border-rose-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-black">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-rose-600 dark:text-rose-400">
                      Danger Zone: Clear Database
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Permanently wipes all local questions and restores default template
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearDatabase}
                  className="w-full py-3 rounded-2xl font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Wipe All Questions & Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ImageKit Upload Helper Modal */}
      {isImageKitModalOpen && (
        <ImageKitUploadModal
          isOpen={isImageKitModalOpen}
          onClose={() => setIsImageKitModalOpen(false)}
          onImageUploaded={(markdownSnippet: string) => {
            navigator.clipboard.writeText(markdownSnippet);
            setDbNotification('Diagram Markdown Copied to Clipboard!');
            setIsImageKitModalOpen(false);
            setTimeout(() => setDbNotification(null), 3000);
          }}
        />
      )}
    </div>
  );
}
