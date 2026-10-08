import { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Calendar,
  Search,
  Trash2,
  TrendingUp,
  BarChart3,
  Layers,
  ChevronRight
} from 'lucide-react';
import { MockTestSet, SavedTestResult, TestResult, Question } from '../types';
import {
  getSavedTestResults,
  deleteSavedTestResult,
  clearAllHistoryRecords,
  getAllAvailableTests,
  getAllQuestionBank
} from '../utils/questionBankStorage';
import { BackButton } from './BackButton';

interface ResultsHistoryViewProps {
  onBackToTests: () => void;
  onReviewResult: (result: TestResult, testSet: MockTestSet) => void;
  onRetakeTest: (testSetId: string) => void;
  onStartAnyTest: () => void;
}

export function ResultsHistoryView({
  onBackToTests,
  onReviewResult,
  onRetakeTest,
  onStartAnyTest
}: ResultsHistoryViewProps) {
  const [resultsList, setResultsList] = useState<SavedTestResult[]>(() => getSavedTestResults());
  const [searchTerm, setSearchTerm] = useState('');
  const availableTests = useMemo(() => getAllAvailableTests(), []);

  useEffect(() => {
    const handleUpdate = () => setResultsList(getSavedTestResults());
    window.addEventListener('bpsc_history_deleted', handleUpdate);
    window.addEventListener('bpsc_history_all_cleared', handleUpdate);
    window.addEventListener('bpsc_history_updated', handleUpdate);
    window.addEventListener('bpsc_cloud_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('bpsc_history_deleted', handleUpdate);
      window.removeEventListener('bpsc_history_all_cleared', handleUpdate);
      window.removeEventListener('bpsc_history_updated', handleUpdate);
      window.removeEventListener('bpsc_cloud_data_updated', handleUpdate);
    };
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    if (resultsList.length === 0) {
      return { total: 0, avgAccuracy: 0, avgScore: 0, bestScore: 0, totalCorrect: 0 };
    }
    const total = resultsList.length;
    const avgAccuracy = Math.round(
      resultsList.reduce((acc, r) => acc + (r.accuracy || 0), 0) / total
    );
    const avgScore = Number(
      (resultsList.reduce((acc, r) => acc + (r.score || 0), 0) / total).toFixed(2)
    );
    const bestScore = Number(
      Math.max(...resultsList.map((r) => r.score || 0)).toFixed(2)
    );
    const totalCorrect = resultsList.reduce((acc, r) => acc + (r.correctCount || 0), 0);
    return { total, avgAccuracy, avgScore, bestScore, totalCorrect };
  }, [resultsList]);

  const filteredResults = useMemo(() => {
    return resultsList.filter((r) => {
      const query = searchTerm.toLowerCase();
      return (
        !searchTerm ||
        r.setTitle.toLowerCase().includes(query) ||
        r.dateFormatted.toLowerCase().includes(query)
      );
    });
  }, [resultsList, searchTerm]);

  const handleDeleteResult = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this attempt record from your history?')) {
      deleteSavedTestResult(id);
      setResultsList(getSavedTestResults());
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL past test attempt records? This action cannot be undone.')) {
      clearAllHistoryRecords();
      setResultsList([]);
    }
  };

  const handleOpenReview = (saved: SavedTestResult) => {
    // 1. If saved test result already has questions embedded, use them directly
    if (Array.isArray(saved.questions) && saved.questions.length > 0) {
      const customSet: MockTestSet = {
        id: saved.setId,
        title: saved.setTitle,
        subtitle: `Attempted on ${saved.dateFormatted || new Date(saved.completedAt).toLocaleDateString()}`,
        targetExam: 'BPSC TRE 4.0',
        category: 'custom',
        categoryTitle: 'Attempt Review',
        topicBadges: ['Review Set'],
        totalQuestions: saved.questions.length,
        totalTimeMinutes: Math.max(5, Math.round((saved.totalTimeSpentSeconds || 60) / 60)),
        questions: saved.questions,
        negativeMarkingValue: saved.negativeMarkingValue ?? 0.33
      };
      onReviewResult(saved, customSet);
      return;
    }

    // 2. Find matching test in current available tests
    let matchingTest = availableTests.find((t) => t.id === saved.setId);
    if (!matchingTest && saved.setTitle) {
      matchingTest = availableTests.find((t) => t.title === saved.setTitle);
    }

    // 3. Fallback: Recover questions by response IDs from question bank
    if (!matchingTest || !Array.isArray(matchingTest.questions) || matchingTest.questions.length === 0) {
      const qIds = Object.keys(saved.responses || {});
      if (qIds.length > 0) {
        const bank = getAllQuestionBank();
        const idMap = new Map(bank.map((q) => [q.id, q]));
        const recoveredQuestions = qIds.map((id) => idMap.get(id)).filter(Boolean) as Question[];
        if (recoveredQuestions.length > 0) {
          matchingTest = {
            id: saved.setId,
            title: saved.setTitle,
            subtitle: 'Recovered Questions Review',
            targetExam: 'BPSC TRE 4.0',
            category: 'custom',
            categoryTitle: 'Recovered Review',
            topicBadges: ['Recovered'],
            totalQuestions: recoveredQuestions.length,
            totalTimeMinutes: Math.max(5, Math.round((saved.totalTimeSpentSeconds || 60) / 60)),
            questions: recoveredQuestions,
            negativeMarkingValue: saved.negativeMarkingValue ?? 0.33
          };
        }
      }
    }

    if (!matchingTest) {
      matchingTest = availableTests[0];
    }
    onReviewResult(saved, matchingTest);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <BackButton onClick={onBackToTests} label="Back to Mock Tests" variant="subtle" />

          <h1 className="text-xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <span>Results & Performance Analytics</span>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {resultsList.length} Tests Attempted
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review detailed question-by-question solutions, Hindi explanations, accuracy trends, and retake past tests
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {resultsList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 hover:bg-red-100 transition-colors"
              title="Delete all past test history"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All History</span>
            </button>
          )}

          <button
            onClick={onStartAnyTest}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <span>Attempt New Test</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregate Performance Cards */}
      {resultsList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats.total}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Tests Completed
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.avgAccuracy}%
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Average Accuracy
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.avgScore}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Average Score
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-center">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.bestScore}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Highest Score
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {resultsList.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test attempts by test name or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {resultsList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No Test Attempts Recorded Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Once you start and complete any mock test or custom test, your detailed scorecard, accuracy, time analysis, and question responses will be archived here.
            </p>
            <div className="pt-2">
              <button
                onClick={onStartAnyTest}
                className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                Start First Mock Test
              </button>
            </div>
          </div>
        ) : (
          filteredResults.map((res) => {
            const negPenalty = res.negativeMarkingValue ?? 0.33;

            return (
              <div
                key={res.id}
                onClick={() => handleOpenReview(res)}
                className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl p-5 sm:p-6 shadow-sm transition-all space-y-4 group"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 uppercase">
                        BPSC CBT Attempt
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {res.dateFormatted}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {res.setTitle}
                    </h3>
                  </div>

                  {/* Score & Accuracy Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right px-3 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900">
                      <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                        Net Score
                      </div>
                      <div className="text-base sm:text-lg font-black text-blue-900 dark:text-blue-200">
                        {res.score.toFixed(2)} / {res.totalMarks}
                      </div>
                    </div>

                    <div className="text-right px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900">
                      <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        Accuracy
                      </div>
                      <div className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-200">
                        {res.accuracy}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Pills & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2 font-semibold">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{res.correctCount} Correct</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{res.incorrectCount} Incorrect (-{(res.incorrectCount * negPenalty).toFixed(2)})</span>
                    </span>

                    {res.safeSkipCount > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{res.safeSkipCount} Option E Skip</span>
                      </span>
                    )}

                    <span className="text-slate-400 font-mono text-[11px]">
                      Time: {Math.floor(res.totalTimeSpentSeconds / 60)}m {res.totalTimeSpentSeconds % 60}s
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteResult(res.id, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete attempt record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetakeTest(res.setId);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>

                    <button
                      onClick={() => handleOpenReview(res)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review Solutions</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
