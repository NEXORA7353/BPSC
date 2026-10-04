import { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  FileDown,
  ArrowRight,
  AlertTriangle,
  MinusCircle,
  Home,
  Target,
  Sparkles,
  Share2,
  Bookmark,
  Shuffle
} from 'lucide-react';
import { MockTestSet, TestResult } from '../types';
import {
  createReattemptMissedQuestionsTest,
  saveAttemptRecord,
  toggleBookmarkQuestion,
  getBookmarkedIds
} from '../utils/questionBankStorage';

interface ResultAnalyticsProps {
  result: TestResult;
  testSet: MockTestSet;
  onReattempt: () => void;
  onReattemptMissed: (newTestSet: MockTestSet) => void;
  onNextSet?: () => void;
  onGoHome: () => void;
  onDownloadHtml: (set: MockTestSet) => void;
  onOpenShareModal: () => void;
}

export function ResultAnalytics({
  result,
  testSet,
  onReattempt,
  onReattemptMissed,
  onNextSet,
  onGoHome,
  onDownloadHtml,
  onOpenShareModal
}: ResultAnalyticsProps) {
  const [filterType, setFilterType] = useState<
    'all' | 'correct' | 'incorrect' | 'blank_penalty' | 'safe_skip' | 'bookmarked'
  >('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => getBookmarkedIds());

  const negPenalty = result.negativeMarkingValue ?? testSet.negativeMarkingValue ?? 0.33;

  const handleToggleBookmark = (id: string) => {
    toggleBookmarkQuestion(id);
    setBookmarkedIds(getBookmarkedIds());
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const avgSeconds = Math.round(result.totalTimeSpentSeconds / Math.max(1, result.totalQuestions));

  // Identify missed questions (incorrect or unselected)
  const missedQuestionIds = testSet.questions
    .filter((q) => {
      const resp = result.responses[q.id];
      const sel = resp?.selectedOption;
      return sel === null || (sel !== q.correctOption && !(sel === 'e' && q.correctOption !== 'e'));
    })
    .map((q) => q.id);

  const handleStartMissedReattempt = () => {
    if (missedQuestionIds.length === 0) return;
    const miniTest = createReattemptMissedQuestionsTest(testSet, missedQuestionIds);
    onReattemptMissed(miniTest);
  };

  // Filter questions for review
  const filteredQuestions = testSet.questions.filter((q) => {
    const resp = result.responses[q.id];
    const sel = resp?.selectedOption;
    if (filterType === 'all') return true;
    if (filterType === 'correct') return sel === q.correctOption;
    if (filterType === 'incorrect')
      return sel !== null && sel !== q.correctOption && !(sel === 'e' && q.correctOption !== 'e');
    if (filterType === 'blank_penalty') return sel === null;
    if (filterType === 'safe_skip') return sel === 'e' && q.correctOption !== 'e';
    if (filterType === 'bookmarked') return bookmarkedIds.includes(q.id);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Top Banner & Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>BPSC TRE 4.0 Scorecard & Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug">
              {result.setTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Total Questions: {result.totalQuestions} · Total Marks: {result.totalMarks} · Negative Marking: -{negPenalty.toFixed(2)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>All Tests</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Share Score</span>
            </button>

            <button
              onClick={() => onDownloadHtml(testSet)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={onReattempt}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Full Test</span>
            </button>

            {missedQuestionIds.length > 0 && (
              <button
                onClick={handleStartMissedReattempt}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs active:scale-95"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Re-attempt Weak Spots ({missedQuestionIds.length} Qs)</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Key Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-6">
          {/* Net Marks */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 rounded-xl text-center">
            <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
              Net Score
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1">
              {result.score.toFixed(2)}
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
              Out of {result.totalMarks} Marks
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Accuracy
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {result.accuracy}%
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Attempted Accuracy</div>
          </div>

          {/* Correct Answers */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 rounded-xl text-center">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Correct (+1)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {result.correctCount}
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
              +{result.correctCount}.00 Marks
            </div>
          </div>

          {/* Incorrect Answers */}
          <div className="bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 rounded-xl text-center">
            <div className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
              Incorrect (-{negPenalty.toFixed(2)})
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-1">
              {result.incorrectCount}
            </div>
            <div className="text-[10px] text-red-700 dark:text-red-400 font-semibold mt-0.5">
              -{(result.incorrectCount * negPenalty).toFixed(2)} Penalty
            </div>
          </div>

          {/* Safe Skip (Option E) */}
          <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl text-center">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Safe Skip (Opt E)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {result.safeSkipCount}
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">0.00 (No Penalty)</div>
          </div>

          {/* Blank Penalty */}
          <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 rounded-xl text-center">
            <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Blank Penalty
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {result.blankPenaltyCount}
            </div>
            <div className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold mt-0.5">
              -{(result.blankPenaltyCount * negPenalty).toFixed(2)} Blank Penalty
            </div>
          </div>
        </div>

        {/* Speed & Time Analysis Bar */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Total Time Spent:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatSeconds(result.totalTimeSpentSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Average Speed per Question:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
              {avgSeconds} Seconds
            </span>
          </div>

          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Standard Exam Allocation: 60 Seconds / Question
          </div>
        </div>
      </div>

      {/* Solutions & Question-by-Question Review */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Detailed Question Review & Solutions</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredQuestions.length} Questions
            </span>
          </h2>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({result.totalQuestions})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Correct ({result.correctCount})
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'incorrect'
                  ? 'bg-red-600 text-white'
                  : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              Incorrect ({result.incorrectCount})
            </button>
            <button
              onClick={() => setFilterType('safe_skip')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'safe_skip'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              Safe Skip ({result.safeSkipCount})
            </button>
            <button
              onClick={() => setFilterType('blank_penalty')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'blank_penalty'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              Blank ({result.blankPenaltyCount})
            </button>
            <button
              onClick={() => setFilterType('bookmarked')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'bookmarked'
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              Bookmarked ({bookmarkedIds.length})
            </button>
          </div>
        </div>

        {/* Question Cards with Hindi Content & Explanations */}
        <div className="space-y-5">
          {filteredQuestions.map((q, idx) => {
            const resp = result.responses[q.id];
            const sel = resp?.selectedOption;
            const isCorrect = sel === q.correctOption;
            const isSafeSkip = sel === 'e' && q.correctOption !== 'e';
            const isBlank = sel === null;
            const isBookmarked = bookmarkedIds.includes(q.id);
            const timeSpent = resp?.timeSpentSeconds || 0;

            let cardBorder = 'border-slate-200 dark:border-slate-800';
            let statusBadge = (
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Correct (+1.00)</span>
              </span>
            );

            if (isBlank) {
              cardBorder = 'border-rose-300 dark:border-rose-900/60 bg-rose-50/10';
              statusBadge = (
                <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center gap-1">
                  <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Blank Penalty (-{negPenalty.toFixed(2)})</span>
                </span>
              );
            } else if (isSafeSkip) {
              cardBorder = 'border-amber-300 dark:border-amber-900/60 bg-amber-50/10';
              statusBadge = (
                <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Safe Skip Option (E) (0.00)</span>
                </span>
              );
            } else if (!isCorrect) {
              cardBorder = 'border-red-300 dark:border-red-900/60 bg-red-50/10';
              statusBadge = (
                <span className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold text-xs flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Incorrect (-{negPenalty.toFixed(2)})</span>
                </span>
              );
            }

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${cardBorder} shadow-sm p-5 sm:p-6 space-y-4`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {q.topicNameHindi}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {q.exam}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Time Spent Badge */}
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      Time: {timeSpent}s
                    </span>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark Question'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>

                    {statusBadge}
                  </div>
                </div>

                {/* Question Text in Hindi */}
                <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                  {q.questionText}
                </div>

                {/* 5 Options in Hindi */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isCandidateChoice = sel === opt.key;
                    const isKeyCorrect = q.correctOption === opt.key;

                    let optStyle =
                      'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';

                    if (isKeyCorrect) {
                      optStyle =
                        'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/20';
                    } else if (isCandidateChoice && !isKeyCorrect) {
                      optStyle =
                        'bg-red-50 dark:bg-red-950/40 border-red-400 text-red-900 dark:text-red-100 font-bold';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-colors ${optStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 mt-0.5 ${
                            isKeyCorrect
                              ? 'bg-emerald-600 text-white'
                              : isCandidateChoice
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.key}
                        </span>

                        <div className="flex-1 font-sans leading-relaxed">
                          {opt.text}
                          {isCandidateChoice && (
                            <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                              Your Choice
                            </span>
                          )}
                          {isKeyCorrect && (
                            <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                              Official Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Step-by-Step Hindi Explanation */}
                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm leading-relaxed space-y-2">
                  <div className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>विस्तृत व्याख्या एवं हल (Step-by-Step Solution):</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans">
                    {q.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
