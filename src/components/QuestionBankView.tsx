import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Shuffle,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowLeft,
  FileDown,
  Upload,
  CheckCircle2,
  BookOpen,
  Database,
  RefreshCw,
  Edit2,
  Cloud,
  Calendar,
  Image as ImageIcon,
  AlertTriangle
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
  getQuestionCorrectDisplay
} from '../utils/questionBankStorage';
import { syncFromFirestore, seedAllQuestionsToCloud, clearCloudDatabase } from '../services/firebaseSyncService';
import { auditQuestionBatch } from '../utils/questionQualityAudit';
import { SmartQualityReviewModal } from './SmartQualityReviewModal';
import { MathText } from './MathText';
import { BackButton } from './BackButton';
import { ImageKitUploadModal } from './ImageKitUploadModal';

interface QuestionBankViewProps {
  onBackToTests: () => void;
  onOpenBulkImport: (topicKey?: string) => void;
  onOpenCustomTest: () => void;
}

export function QuestionBankView({
  onBackToTests,
  onOpenBulkImport,
  onOpenCustomTest
}: QuestionBankViewProps) {
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
  const [isBankAuditOpen, setIsBankAuditOpen] = useState(false);

  const bankAuditReport = useMemo(
    () => auditQuestionBatch(allQuestions),
    [allQuestions]
  );

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

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingFormState, setEditingFormState] = useState<Question | null>(null);

  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditingFormState({
      ...q,
      options: q.options.map((o) => ({ ...o })),
      correctOptions: getQuestionCorrectKeys(q)
    });
  };

  const handleToggleFormCorrectKey = (key: 'a' | 'b' | 'c' | 'd' | 'e') => {
    if (!editingFormState) return;
    const currentKeys = getQuestionCorrectKeys(editingFormState);
    let nextKeys: ('a' | 'b' | 'c' | 'd' | 'e')[];
    if (currentKeys.includes(key)) {
      nextKeys = currentKeys.length > 1 ? currentKeys.filter((k) => k !== key) : currentKeys;
    } else {
      nextKeys = [...currentKeys, key];
    }
    setEditingFormState({
      ...editingFormState,
      correctOption: nextKeys.join(','),
      correctOptions: nextKeys
    });
  };

  const handleSaveQuestionEdit = () => {
    if (!editingFormState) return;
    updateQuestionInBank(editingFormState);
    setEditingQuestionId(null);
    setEditingFormState(null);
    refreshData();
    setDbNotification('प्रश्न सफलतापूर्वक संशोधित (Updated) किया गया!');
    setTimeout(() => setDbNotification(null), 3000);
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    try {
      await syncFromFirestore();
      refreshData();
      setDbNotification('Successfully synced with Firestore Cloud Database!');
    } catch {
      setDbNotification('Cloud sync failed.');
    } finally {
      setIsCloudSyncing(false);
      setTimeout(() => setDbNotification(null), 3500);
    }
  };

  const handleToggleBookmark = (id: string) => {
    toggleBookmarkQuestion(id);
    setBookmarkedIds(getBookmarkedIds());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this question from your Question Bank?')) {
      deleteCustomQuestion(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      refreshData();
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `क्या आप सचमुच इन ${selectedIds.length} चुने हुए प्रश्नों को हटाना चाहते हैं?\n(Are you sure you want to permanently delete ${selectedIds.length} selected questions?)`
      )
    ) {
      deleteMultipleQuestions(selectedIds);
      const count = selectedIds.length;
      setSelectedIds([]);
      refreshData();
      setDbNotification(`Successfully deleted ${count} questions from Question Bank!`);
      setTimeout(() => setDbNotification(null), 3500);
    }
  };

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Full Database Export
  const handleExportDb = () => {
    const jsonStr = exportFullDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bpsc_tre4_full_database_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDbNotification('Database backup exported successfully!');
    setTimeout(() => setDbNotification(null), 3000);
  };

  // Full Database Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFullDatabaseJson(content);
      if (res.success) {
        refreshData();
        setDbNotification('Database imported & restored successfully!');
      } else {
        alert(res.message);
      }
      setTimeout(() => setDbNotification(null), 3000);
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Clear Entire Database
  const handleClearDatabase = async () => {
    if (
      window.confirm(
        'चेतावनी: क्या आप पूरा डेटाबेस खाली (Wipe/Clear All Data) करना चाहते हैं?\n(WARNING: This will permanently delete all custom questions, mock tests, attempt history, and bookmarks. This action cannot be undone!)'
      )
    ) {
      await clearCloudDatabase();
      clearEntireDatabase();
      refreshData();
      setDbNotification('पूरा डेटाबेस सफलतापूर्वक साफ़ (Database Cleared) हो गया है!');
      setTimeout(() => setDbNotification(null), 4000);
    }
  };

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (!q) return false;
      const searchLower = searchTerm.toLowerCase();
      const textMatch = String(q.questionText || '').toLowerCase().includes(searchLower);
      const examMatch = String(q.exam || '').toLowerCase().includes(searchLower);
      const expMatch = q.explanation ? String(q.explanation).toLowerCase().includes(searchLower) : false;
      const matchesSearch = !searchTerm || textMatch || examMatch || expMatch;

      const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(q.id);

      return matchesSearch && matchesTopic && matchesBookmark;
    });
  }, [allQuestions, searchTerm, selectedTopic, onlyBookmarked, bookmarkedIds]);

  // Topic metrics
  const statsByTopic = useMemo(() => {
    const counts: Record<string, number> = { all: allQuestions.length };
    allQuestions.forEach((q) => {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    });
    return counts;
  }, [allQuestions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-slate-900 dark:text-slate-100 font-sans">
      {/* Hidden File Input for Database Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <BackButton onClick={onBackToTests} label="Back to Mock Tests / वापस" variant="subtle" />

          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex flex-wrap items-center gap-2.5">
            <span>Question Repository & Database</span>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {allQuestions.length} Questions
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5" title="Firestore Cloud Database Active - No Sign In Needed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud Auto-Sync Live</span>
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, edit, bookmark, or import authentic questions across all mathematics topics
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onOpenBulkImport(selectedTopic !== 'all' ? selectedTopic : undefined)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bulk Paste / Import</span>
          </button>

          <button
            onClick={() => setIsImageKitModalOpen(true)}
            title="Upload Diagram/PNG to ImageKit CDN"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-xs sm:text-sm font-bold shadow-2xs active:scale-95"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Upload Diagram</span>
          </button>

          <button
            onClick={onOpenCustomTest}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <Shuffle className="w-4 h-4" />
            <span>Create Custom Test</span>
          </button>

          {/* Smart Quality & Duplicate Audit Button */}
          <button
            onClick={() => setIsBankAuditOpen(true)}
            title="Scan & Clean Duplicates or Blank Explanations (डुप्लीकेट व अधूरी व्याख्या स्कैन व साफ़ करें)"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-xs sm:text-sm font-bold shadow-2xs active:scale-95"
          >
            <AlertTriangle className={`w-4 h-4 text-amber-600 dark:text-amber-400 ${bankAuditReport.problemCount > 0 ? 'animate-pulse' : ''}`} />
            <span>Audit & Clean ({bankAuditReport.problemCount})</span>
          </button>

          {/* Backup Export Button */}
          <button
            onClick={handleExportDb}
            title="Download / Backup Database to JSON (डेटाबेस बैकअप डाउनलोड करें)"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold shadow-2xs"
          >
            <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline">Backup</span>
          </button>

          {/* Backup Restore Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Restore Database from JSON File (बैकअप रिस्टोर करें)"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold shadow-2xs"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden lg:inline">Restore</span>
          </button>

          {/* Clear Entire Database Button */}
          <button
            onClick={handleClearDatabase}
            title="Wipe & Clear Entire Database (सभी प्रश्न और टेस्ट हटाएँ)"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors text-xs font-bold shadow-xs active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Clear Database</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={handleCloudSync}
            disabled={isCloudSyncing}
            title="Sync with Firestore Cloud Database"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-xs font-bold shadow-2xs disabled:opacity-50"
          >
            <Cloud className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isCloudSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isCloudSyncing ? 'Syncing...' : 'Cloud Sync'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {dbNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dbNotification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions in Hindi or English (ल.स., प्रतिशत, क्रय मूल्य, STET 2024)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Bookmarked Filter */}
          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-colors shrink-0 ${
              onlyBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${onlyBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Bookmarked ({bookmarkedIds.length})</span>
          </button>
        </div>

        {/* Dynamic Registered Topics Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              selectedTopic === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Topics ({allQuestions.length})
          </button>

          {registeredTopics.map((topic) => {
            const count = statsByTopic[topic.key] || 0;
            return (
              <button
                key={topic.key}
                onClick={() => setSelectedTopic(topic.key)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTopic === topic.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {topic.labelEnglish} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results & Bulk Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold px-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Select All ({filteredQuestions.length})</span>
          </label>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 dark:text-slate-400">
            Showing {filteredQuestions.length} of {allQuestions.length} Questions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all active:scale-95 animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No questions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try changing the search keywords, topic tabs, or click "Bulk Paste / Import" to add questions from PDFs.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isBookmarked = bookmarkedIds.includes(q.id);
            const isSelected = selectedIds.includes(q.id);
            const isSolExpanded = expandedSolutions[q.id];

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(q.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Select question"
                    />
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {q.topicNameHindi}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {q.exam}
                    </span>
                    {q.createdAt && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{q.createdAt}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleStartEditQuestion(q)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      title="Edit Question (प्रश्न सुधारें)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Question from Bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingQuestionId === q.id && editingFormState ? (
                  /* Inline Edit Form */
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                      <span>प्रश्न संपादन (Editing Question)</span>
                      <span>1 या 2 (अधिक) उत्तर चुन सकते हैं</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                        प्रश्न विवरण (Question Text):
                      </label>
                      <textarea
                        rows={2}
                        value={editingFormState.questionText}
                        onChange={(e) =>
                          setEditingFormState({ ...editingFormState, questionText: e.target.value })
                        }
                        className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {editingFormState.options.map((opt, oIdx) => (
                        <div key={opt.key} className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500">
                            Option ({opt.key}):
                          </label>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...editingFormState.options];
                              updated[oIdx] = { ...opt, text: e.target.value };
                              setEditingFormState({ ...editingFormState, options: updated });
                            }}
                            className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            सही उत्तर कुंजी (Correct Answer Keys):
                          </label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(['a', 'b', 'c', 'd', 'e'] as const).map((k) => {
                            const activeKeys = getQuestionCorrectKeys(editingFormState);
                            const isSelected = activeKeys.includes(k);
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handleToggleFormCorrectKey(k)}
                                className={`w-8 h-8 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400 scale-105'
                                    : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                                }`}
                              >
                                {k}
                              </button>
                            );
                          })}
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                            ({getQuestionCorrectDisplay(editingFormState)})
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                          विस्तृत व्याख्या (Explanation):
                        </label>
                        <textarea
                          rows={2}
                          value={editingFormState.explanation}
                          onChange={(e) =>
                            setEditingFormState({ ...editingFormState, explanation: e.target.value })
                          }
                          className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuestionId(null);
                          setEditingFormState(null);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        रद्द करें (Cancel)
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveQuestionEdit}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm"
                      >
                        सहेजें (Save Question)
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Question Text in Hindi */}
                    <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                      <MathText text={q.questionText} />
                    </div>

                    {q.imageUrl && !q.questionText?.includes(q.imageUrl) && (
                      <div className="my-3 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs max-w-md mx-auto">
                        <img
                          src={q.imageUrl}
                          alt="प्रश्न आकृति / Diagram"
                          className="max-h-60 w-auto object-contain rounded-xl"
                        />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                          प्रश्न संबंधित आकृति (Diagram)
                        </span>
                      </div>
                    )}

                    {q.svgContent && (
                      <div
                        className="my-3 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs max-w-xs sm:max-w-sm mx-auto overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: q.svgContent }}
                      />
                    )}

                    {/* Options Grid in Hindi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(Array.isArray(q.options) ? q.options : []).map((opt) => {
                        const optKey = String(opt?.key || '').toLowerCase();
                        const correctKeys = getQuestionCorrectKeys(q);
                        const isCorrect = correctKeys.includes(optKey as any);
                        return (
                          <div
                            key={optKey || Math.random().toString()}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition-colors ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold shadow-2xs'
                                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="flex-1 font-sans">
                              <MathText text={String(opt?.text || '')} />
                            </span>
                            {isCorrect && (
                              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                                Official Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Solution Toggle & Box */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => toggleSolution(q.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>{isSolExpanded ? 'Hide Solution' : 'View Detailed Solution (व्याख्या)'}</span>
                        {isSolExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isSolExpanded && (
                        <div className="mt-3 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5">
                          <div className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>सही उत्तर: विकल्प ({getQuestionCorrectDisplay(q)})</span>
                          </div>
                          <div className="whitespace-pre-line pt-1 text-slate-800 dark:text-slate-200 font-sans">
                            <MathText text={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ImageKit Cloud Upload Modal */}
      <ImageKitUploadModal
        isOpen={isImageKitModalOpen}
        onClose={() => setIsImageKitModalOpen(false)}
      />

      {/* Smart Quality & Duplicate Attention Modal */}
      {isBankAuditOpen && (
        <SmartQualityReviewModal
          isOpen={isBankAuditOpen}
          onClose={() => setIsBankAuditOpen(false)}
          auditReport={bankAuditReport}
          onUpdateQuestions={(updated) => {
            saveCustomQuestions(updated);
            refreshData();
            setDbNotification('प्रश्न बैंक सफलतापूर्वक अपडेट किया गया!');
            setTimeout(() => setDbNotification(null), 3000);
          }}
        />
      )}
    </div>
  );
}
