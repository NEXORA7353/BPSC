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
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Question, RegisteredTopic } from '../types';
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
  cleanTitleToEnglish
} from '../utils/questionBankStorage';
import { syncFromFirestore, seedAllQuestionsToCloud } from '../services/firebaseSyncService';
import { auditQuestionBatch, autoHealQuestion } from '../utils/questionQualityAudit';
import { MathText } from './MathText';
import { BackButton } from './BackButton';
import { ImageKitUploadModal } from './ImageKitUploadModal';

interface QuestionBankViewProps {
  onBackToTests: () => void;
  onOpenBulkImport: (topicKey?: string) => void;
  onOpenCustomTest: (topicKey?: string) => void;
}

export function QuestionBankView({
  onBackToTests,
  onOpenBulkImport,
  onOpenCustomTest
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

  // In-line Chapter Creator
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // In-line Edit Question State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingFormState, setEditingFormState] = useState<Question | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('bpsc_cloud_data_updated', handleUpdate);
    window.addEventListener('bpsc_questions_added', handleUpdate);
    window.addEventListener('bpsc_questions_deleted', handleUpdate);
    window.addEventListener('bpsc_question_updated', handleUpdate);
    return () => {
      window.removeEventListener('bpsc_cloud_data_updated', handleUpdate);
      window.removeEventListener('bpsc_questions_added', handleUpdate);
      window.removeEventListener('bpsc_questions_deleted', handleUpdate);
      window.removeEventListener('bpsc_question_updated', handleUpdate);
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

  // Filtered Questions in Browse tab
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(q.id);
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        q.questionText.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query) ||
        (q.topicNameHindi && q.topicNameHindi.toLowerCase().includes(query)) ||
        (q.exam && q.exam.toLowerCase().includes(query));
      return matchesTopic && matchesBookmark && matchesSearch;
    });
  }, [allQuestions, selectedTopic, onlyBookmarked, bookmarkedIds, searchTerm]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTopic, onlyBookmarked]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedQuestions = useMemo(() => {
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
    setDbNotification('प्रश्न सफलतापूर्वक अपडेट हुआ!');
    setTimeout(() => setDbNotification(null), 3000);
  };

  const handleDeleteSingleQuestion = (id: string) => {
    if (window.confirm('क्या आप वाकई इस प्रश्न को हटाना चाहते हैं?')) {
      deleteCustomQuestion(id);
      refreshData();
      setDbNotification('प्रश्न हटाया गया!');
      setTimeout(() => setDbNotification(null), 3000);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`क्या आप चयनित ${selectedIds.length} प्रश्नों को हटाना चाहते हैं?`)) {
      const count = deleteMultipleQuestions(selectedIds);
      setSelectedIds([]);
      refreshData();
      setDbNotification(`${count} प्रश्न हटाए गए!`);
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
    setDbNotification(`नया अध्याय "${newTopicHindi}" पंजीकृत हुआ!`);
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
    setDbNotification('डेटाबेस JSON बैकअप डाउनलोड हुआ!');
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
        setDbNotification(`डेटाबेस रिस्टोर सफल: ${res.message}`);
      } else {
        alert('डेटाबेस रिस्टोर विफल: ' + res.message);
      }
      setTimeout(() => setDbNotification(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearDatabase = () => {
    const conf = window.prompt(
      'चेतावनी: यह संपूर्ण डेटाबेस साफ़ कर देगा! जारी रखने के लिए "CLEAR" टाइप करें:'
    );
    if (conf === 'CLEAR') {
      clearEntireDatabase();
      refreshData();
      setDbNotification('डेटाबेस पूरी तरह साफ़ कर दिया गया है!');
      setTimeout(() => setDbNotification(null), 4000);
    }
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    try {
      await syncFromFirestore();
      refreshData();
      setDbNotification('Google Firestore क्लाउड डेटाबेस सिंक सफल!');
    } catch (err: any) {
      alert('क्लाउड सिंक विफल: ' + (err?.message || 'अज्ञात त्रुटि'));
    } finally {
      setIsCloudSyncing(false);
      setTimeout(() => setDbNotification(null), 3000);
    }
  };

  const handleAutoHealAuditIssues = () => {
    const healed = allQuestions.map((q) => autoHealQuestion(q));
    saveCustomQuestions(healed);
    refreshData();
    setDbNotification('सभी प्रश्नों की गुणवत्ता स्वतः ठीक कर दी गई!');
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search in Hindi or English (ल.स., प्रतिशत, क्रय मूल्य, STET 2024)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden font-medium"
                  />
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
                  <span>Bookmarked Only ({bookmarkedIds.length})</span>
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
                              <span>{isSolutionOpen ? 'व्याख्या छुपाएं' : 'विस्तृत हल व व्याख्या देखें (Hindi Solution)'}</span>
                              {isSolutionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {isSolutionOpen && (
                              <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-1 animate-in fade-in">
                                <div className="font-bold text-amber-600 dark:text-amber-400">
                                  BPSC आधिकारिक व्याख्या:
                                </div>
                                <MathText text={q.explanation || 'व्याख्या उपलब्ध नहीं है।'} />
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
                            <label className="text-xs font-bold text-slate-500">Explanation (व्याख्या):</label>
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
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

        {/* ======================================================== */}
        {/* TAB 2: CHAPTERS & SYLLABUS MANAGEMENT                    */}
        {/* ======================================================== */}
        {activeTab === 'chapters' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Mathematics Chapters ({registeredTopics.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage syllabus topics and launch topic-specific mock tests directly
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingTopic(!isAddingTopic)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Chapter</span>
              </button>
            </div>

            {/* In-place Chapter Registration */}
            {isAddingTopic && (
              <div className="glass-panel p-6 rounded-3xl space-y-4 border-indigo-500/40">
                <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                  Register New Chapter (नया अध्याय जोड़ें):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Chapter Hindi Name (e.g. द्विघात समीकरण)"
                    value={newTopicHindi}
                    onChange={(e) => setNewTopicHindi(e.target.value)}
                    className="p-3 rounded-2xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Chapter English Name (e.g. Quadratic Equations)"
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
                    Confirm & Save
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

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {registeredTopics.map((topic) => {
                const count = statsByTopic[topic.key] || 0;

                return (
                  <div
                    key={topic.key}
                    className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-black text-base text-slate-900 dark:text-white">
                          {topic.labelHindi}
                        </h4>
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {count} Qs
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{topic.labelEnglish}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => onOpenCustomTest(topic.key)}
                        className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors text-center"
                      >
                        Create Test
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenBulkImport(topic.key)}
                        className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-colors text-center"
                      >
                        + Import Qs
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
