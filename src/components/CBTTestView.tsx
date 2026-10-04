import { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Send,
  User,
  ShieldAlert,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Layers,
  X,
  Sparkles,
  Trophy
} from 'lucide-react';
import { MockTestSet, QuestionResponse, TestResult } from '../types';
import { toggleBookmarkQuestion, getBookmarkedIds } from '../utils/questionBankStorage';

interface CBTTestViewProps {
  testSet: MockTestSet;
  onSubmitTest: (result: TestResult) => void;
  onExitTest: () => void;
  onViewResultsHistory?: () => void;
}

export function CBTTestView({ testSet, onSubmitTest, onExitTest, onViewResultsHistory }: CBTTestViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const totalQuestions = testSet.questions.length;
  const totalDurationSeconds = testSet.totalTimeMinutes * 60;
  const negPenalty = testSet.negativeMarkingValue ?? 0.33;

  const [remainingTime, setRemainingTime] = useState(totalDurationSeconds);
  const [questionTimes, setQuestionTimes] = useState<number[]>(() =>
    new Array(totalQuestions).fill(0)
  );

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => getBookmarkedIds());

  const [responses, setResponses] = useState<Record<string, QuestionResponse>>(() => {
    const init: Record<string, QuestionResponse> = {};
    testSet.questions.forEach((q, idx) => {
      init[q.id] = {
        questionId: q.id,
        selectedOption: null,
        status: idx === 0 ? 'not_answered' : 'not_visited',
        timeSpentSeconds: 0
      };
    });
    return init;
  });

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  const currentQ = testSet.questions[currentIdx];
  const currentResp = responses[currentQ.id];
  const isCurrentBookmarked = bookmarkedIds.includes(currentQ.id);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });

      setQuestionTimes((prev) => {
        const next = [...prev];
        next[currentIdx] = (next[currentIdx] || 0) + 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIdx, totalQuestions]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleCurrentBookmark = () => {
    toggleBookmarkQuestion(currentQ.id);
    setBookmarkedIds(getBookmarkedIds());
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (key: 'a' | 'b' | 'c' | 'd' | 'e') => {
    setResponses((prev) => {
      const existing = prev[currentQ.id];
      const newStatus =
        existing.status === 'marked_review' ? 'answered_marked_review' : 'answered';
      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          selectedOption: key,
          status: newStatus
        }
      };
    });
  };

  const handleClearResponse = () => {
    setResponses((prev) => {
      const existing = prev[currentQ.id];
      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          selectedOption: null,
          status: 'not_answered'
        }
      };
    });
  };

  const handleSaveAndNext = () => {
    setResponses((prev) => {
      const existing = prev[currentQ.id];
      let newStatus = existing.status;
      if (existing.selectedOption !== null && existing.status !== 'answered_marked_review') {
        newStatus = 'answered';
      } else if (existing.selectedOption === null && existing.status !== 'marked_review') {
        newStatus = 'not_answered';
      }
      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          status: newStatus
        }
      };
    });

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handleMarkForReviewAndNext = () => {
    setResponses((prev) => {
      const existing = prev[currentQ.id];
      const newStatus =
        existing.selectedOption !== null ? 'answered_marked_review' : 'marked_review';
      return {
        ...prev,
        [currentQ.id]: {
          ...existing,
          status: newStatus
        }
      };
    });

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (targetIdx: number) => {
    setResponses((prev) => {
      const targetQ = testSet.questions[targetIdx];
      const existing = prev[targetQ.id];
      if (existing.status === 'not_visited') {
        return {
          ...prev,
          [targetQ.id]: {
            ...existing,
            status: 'not_answered'
          }
        };
      }
      return prev;
    });
    setCurrentIdx(targetIdx);
    setIsMobilePaletteOpen(false);
  };

  // Palette counts
  let answeredCount = 0;
  let notAnsweredCount = 0;
  let markedReviewCount = 0;
  let answeredMarkedCount = 0;
  let notVisitedCount = 0;

  Object.values(responses).forEach((r) => {
    if (r.status === 'answered') answeredCount++;
    else if (r.status === 'not_answered') notAnsweredCount++;
    else if (r.status === 'marked_review') markedReviewCount++;
    else if (r.status === 'answered_marked_review') answeredMarkedCount++;
    else if (r.status === 'not_visited') notVisitedCount++;
  });

  const handleFinalSubmit = () => {
    setIsSubmitModalOpen(false);

    let correctCount = 0;
    let incorrectCount = 0;
    let safeSkipCount = 0;
    let blankPenaltyCount = 0;

    const finalResponses: Record<string, QuestionResponse> = {};

    testSet.questions.forEach((q, idx) => {
      const userResp = responses[q.id];
      const timeSpent = questionTimes[idx] || 0;
      finalResponses[q.id] = {
        ...userResp,
        timeSpentSeconds: timeSpent
      };

      const sel = userResp.selectedOption;
      if (sel === null) {
        blankPenaltyCount++;
      } else if (sel === q.correctOption) {
        correctCount++;
      } else if (sel === 'e' && q.correctOption !== 'e') {
        safeSkipCount++;
      } else {
        incorrectCount++;
      }
    });

    const penaltyCount = incorrectCount + blankPenaltyCount;
    const finalScore = Math.max(0, correctCount * 1 - penaltyCount * negPenalty);
    const accuracy =
      correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;
    const totalTimeSpentSeconds = totalDurationSeconds - remainingTime;

    const result: TestResult = {
      setId: testSet.id,
      setTitle: testSet.title,
      totalQuestions: testSet.questions.length,
      totalMarks: testSet.questions.length,
      score: finalScore,
      correctCount,
      incorrectCount,
      safeSkipCount,
      blankPenaltyCount,
      totalTimeSpentSeconds,
      accuracy,
      responses: finalResponses,
      completedAt: new Date().toISOString(),
      negativeMarkingValue: negPenalty
    };

    onSubmitTest(result);
  };

  const getTextClass = () => {
    if (fontSize === 'large') return 'text-lg sm:text-xl leading-relaxed';
    if (fontSize === 'xlarge') return 'text-xl sm:text-2xl leading-loose';
    return 'text-base sm:text-lg leading-relaxed';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* English CBT Header Bar */}
      <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider">
            BPSC CBT
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold tracking-tight line-clamp-1">
              {testSet.title}
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              {testSet.targetExam}
            </div>
          </div>
        </div>

        {/* Timers & Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Font Resizer */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 text-[10px] mr-1">Font:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-1.5 py-0.5 rounded ${
                fontSize === 'normal' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-1.5 py-0.5 rounded ${
                fontSize === 'large' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-1.5 py-0.5 rounded ${
                fontSize === 'xlarge' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
              }`}
            >
              A++
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Question Timer */}
          <div className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-right hidden sm:block">
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">
              Question Time
            </div>
            <div className="text-xs font-mono font-bold text-blue-400 mt-0.5">
              {formatTime(questionTimes[currentIdx] || 0)}
            </div>
          </div>

          {/* Total Exam Timer */}
          <div
            className={`border px-3 py-1 rounded-lg text-right ${
              remainingTime <= 300
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-white'
            }`}
          >
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">
              Time Left
            </div>
            <div className="text-sm sm:text-base font-mono font-black text-amber-400 mt-0.5">
              {formatTime(remainingTime)}
            </div>
          </div>

          {/* Mobile Palette Button */}
          <button
            onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}
            className="lg:hidden px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs"
          >
            Palette ({answeredCount + answeredMarkedCount}/{totalQuestions})
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-2 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
        {/* Left Side: Question Pane */}
        <section className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          {/* Section Bar in English */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-700 dark:text-slate-300 gap-2">
            <div className="font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Section: Mathematics (TRE 4.0 Standard)</span>
            </div>
            <div className="font-semibold text-slate-600 dark:text-slate-400">
              Positive: <span className="text-emerald-600 dark:text-emerald-400 font-bold">+1.00</span> | Negative:{' '}
              <span className="text-red-600 dark:text-red-400 font-bold">-{negPenalty.toFixed(2)}</span>
            </div>
          </div>

          {/* Question Header */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/40 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                Question No. {currentIdx + 1}
              </div>
              <button
                onClick={handleToggleCurrentBookmark}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  isCurrentBookmarked
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={isCurrentBookmarked ? 'Bookmarked' : 'Bookmark Question'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-amber-500' : ''}`} />
                <span>{isCurrentBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {currentQ.exam}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {currentQ.topicNameHindi}
              </span>
            </div>
          </div>

          {/* Question Body Scrollable */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6">
            {/* Critical BPSC Rule Warning Banner */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Important BPSC Rule:</strong> If you wish to skip this question safely without negative penalty, you MUST select <strong>Option (E)</strong>. Leaving all options unselected will incur a <strong>-{negPenalty.toFixed(2)} penalty</strong>!
              </div>
            </div>

            {/* Question Text in Hindi */}
            <div className={`font-semibold text-slate-900 dark:text-slate-100 font-sans ${getTextClass()}`}>
              {currentQ.questionText}
            </div>

            {/* 5 Options in Hindi */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Your Answer (5 Options):
              </div>

              {currentQ.options.map((opt) => {
                const isSelected = currentResp.selectedOption === opt.key;
                const isOptionE = opt.key === 'e';

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? isOptionE
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 shadow-sm ring-2 ring-amber-400/40'
                          : 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-blue-100 shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Radio Indicator */}
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs uppercase transition-colors ${
                        isSelected
                          ? isOptionE
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {opt.key}
                    </div>

                    {/* Option Text in Hindi */}
                    <div className="flex-1 text-sm sm:text-base font-medium leading-relaxed font-sans">
                      {opt.text}
                      {isOptionE && (
                        <span className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                          (Safe Skip Option - No Blank Penalty)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer in English */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearResponse}
                disabled={currentResp.selectedOption === null}
                className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Clear Response
              </button>

              <button
                onClick={handleMarkForReviewAndNext}
                className="px-3 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 transition-colors"
              >
                Mark for Review & Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleSaveAndNext}
                className="inline-flex items-center gap-1 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Candidate Profile & Question Palette */}
        <aside
          className={`lg:w-80 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden shrink-0 ${
            isMobilePaletteOpen ? 'block fixed inset-4 z-50 lg:static lg:inset-auto' : 'hidden lg:flex'
          }`}
        >
          {/* Mobile Palette Close Bar */}
          <div className="lg:hidden p-3 bg-slate-900 text-white flex items-center justify-between">
            <span className="font-bold text-sm">Question Palette</span>
            <button onClick={() => setIsMobilePaletteOpen(false)}>
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          {/* Candidate Profile Box */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-black text-sm border border-blue-200 dark:border-blue-900 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                Candidate: BPSC Aspirant
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Roll No: TRE4-2026-MATH
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Exam Live</span>
              </div>
            </div>
          </div>

          {/* Official TCS iON Style Palette Legend in English */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-xs space-y-1.5">
            <div className="font-bold text-[11px] text-slate-500 uppercase tracking-wider mb-1">
              Question Legend
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {answeredCount}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Answered</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {notAnsweredCount}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Not Answered</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {markedReviewCount}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Marked Review</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-purple-800 text-white font-bold text-[10px] flex items-center justify-center relative">
                  {answeredMarkedCount}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5"></span>
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Ans & Marked</span>
              </div>

              <div className="flex items-center gap-1.5 col-span-2">
                <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                  {notVisitedCount}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Not Visited</span>
              </div>
            </div>
          </div>

          {/* Question Grid Numbers */}
          <div className="flex-1 p-3.5 overflow-y-auto">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Questions (1 to {totalQuestions})</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {answeredCount + answeredMarkedCount} Completed
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {testSet.questions.map((q, idx) => {
                const r = responses[q.id];
                const isCurrent = idx === currentIdx;
                const isBookmarked = bookmarkedIds.includes(q.id);

                let badgeColor =
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                if (r.status === 'answered') {
                  badgeColor = 'bg-emerald-600 text-white border-emerald-600 shadow-2xs';
                } else if (r.status === 'not_answered') {
                  badgeColor = 'bg-red-600 text-white border-red-600 shadow-2xs';
                } else if (r.status === 'marked_review') {
                  badgeColor = 'bg-purple-600 text-white border-purple-600 shadow-2xs';
                } else if (r.status === 'answered_marked_review') {
                  badgeColor = 'bg-purple-800 text-white border-purple-800 shadow-2xs';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center border transition-all relative ${badgeColor} ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {r.status === 'answered_marked_review' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 absolute top-1 right-1"></span>
                    )}
                    {isBookmarked && (
                      <span className="text-amber-400 text-[8px] absolute top-0.5 left-1 font-bold">★</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Test & Results History Buttons */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Test (परीक्षा समाप्त)</span>
            </button>

            {onViewResultsHistory && (
              <button
                type="button"
                onClick={onViewResultsHistory}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                title="View previous test attempts and score history"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Results & History (स्कोरकार्ड)</span>
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal in English */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-5 text-slate-900 dark:text-slate-100">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Confirm Test Submission</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to finish and view your performance scorecard?
              </p>
            </div>

            {/* Live Count Statistics */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-1.5">
                <span className="text-slate-500">Total Questions:</span>
                <span className="font-bold font-mono">{totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between p-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Answered:</span>
                <span className="font-bold font-mono text-emerald-600">{answeredCount + answeredMarkedCount}</span>
              </div>
              <div className="flex items-center justify-between p-1.5">
                <span className="text-red-500 font-semibold">Not Answered:</span>
                <span className="font-bold font-mono text-red-500">{notAnsweredCount}</span>
              </div>
              <div className="flex items-center justify-between p-1.5">
                <span className="text-slate-500">Not Visited:</span>
                <span className="font-bold font-mono">{notVisitedCount}</span>
              </div>
            </div>

            {notAnsweredCount + notVisitedCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>Penalty Reminder:</strong> {notAnsweredCount + notVisitedCount} questions have no option selected. In BPSC TRE 4.0, each unselected question carries a <strong>-{negPenalty.toFixed(2)} blank penalty</strong>.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Resume Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
