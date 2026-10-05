import { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Bookmark,
  Send,
  User,
  ShieldAlert,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MockTestSet, QuestionResponse, TestResult } from '../types';
import { toggleBookmarkQuestion, getBookmarkedIds } from '../utils/questionBankStorage';

interface CBTTestViewProps {
  testSet: MockTestSet;
  onSubmitTest: (result: TestResult) => void;
  onExitTest: () => void;
  onViewResultsHistory?: () => void;
  userName?: string;
}

export function CBTTestView({
  testSet,
  onSubmitTest,
  onExitTest,
  onViewResultsHistory,
  userName = 'PrIyA PaTeL'
}: CBTTestViewProps) {
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

  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  return (
    <div className="flex flex-col min-h-screen blueprint-grid-34 text-slate-900 font-sans">
      {/* Contrasting Deep Navy Header (#0E1B34) */}
      <header className="bg-[#0E1B34] text-white sticky top-0 z-40 shadow-xl border-b border-white/10">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Exit test? Unsaved progress will be lost.')) {
                  onExitTest();
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-bold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
              BPSC CBT
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold tracking-tight line-clamp-1 text-white">
                {testSet.title}
              </div>
              <div className="text-[10px] text-amber-300 font-mono hidden sm:block">
                Candidate: {userName}
              </div>
            </div>
          </div>

          {/* Timers & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Question Counter Pill */}
            <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-200">
              Q: <span className="text-amber-300">{currentIdx + 1}</span> / {totalQuestions}
            </div>

            {/* Timer Chip */}
            <div
              className={`px-3.5 py-1 rounded-lg font-mono text-xs font-black transition-all ${
                remainingTime <= 60
                  ? 'bg-rose-600 text-white animate-bounce ring-2 ring-rose-400'
                  : remainingTime <= 300
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-400/50'
                  : 'bg-white/10 text-amber-300 border border-white/10'
              }`}
            >
              <span className="text-[9px] uppercase tracking-widest text-slate-400 block text-[8px] leading-none mb-0.5">
                TIME REMAINING
              </span>
              <span>{formatTime(remainingTime)}</span>
            </div>

            {/* Primary Submit CTA */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* 4px Animated Progress Hairline */}
        <div className="w-full bg-white/10 h-1">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Paper Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-3 sm:p-5 gap-4 overflow-hidden">
        {/* Left Side: Paper Question Card */}
        <section className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
          {/* Question Meta Bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="text-base sm:text-lg font-black text-slate-900">
                Question No. {currentIdx + 1}
              </div>
              <button
                onClick={handleToggleCurrentBookmark}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                  isCurrentBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                    : 'border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isCurrentBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {currentQ.exam}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {currentQ.topicNameHindi}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Warning Callout Strip */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>BPSC TRE 4.0 Rule:</strong> Select <strong>Option (E)</strong> to skip safely without negative penalty. Unselected blank questions incur a <strong>-{negPenalty.toFixed(2)} penalty</strong>.
              </div>
            </div>

            {/* Question Text in Hindi */}
            <div className={`font-semibold text-slate-900 font-sans ${getTextClass()}`}>
              {currentQ.questionText}
            </div>

            {/* 5 Option Tiles */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Option (A, B, C, D, E):
              </div>

              {currentQ.options.map((opt) => {
                const isSelected = currentResp.selectedOption === opt.key;
                const isOptionE = opt.key === 'e';

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      isOptionE
                        ? isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-950 font-bold shadow-md ring-2 ring-amber-400'
                          : 'bg-amber-50/40 border-dashed border-amber-300 text-amber-900 hover:bg-amber-50'
                        : isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Square Letter Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs uppercase transition-colors ${
                        isSelected
                          ? isOptionE
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-indigo-950'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {opt.key}
                    </div>

                    <div className="flex-1 text-sm sm:text-base font-medium leading-relaxed font-sans">
                      {opt.text}
                      {isOptionE && (
                        <span className="block text-[11px] font-bold text-amber-600 mt-1">
                          (Safe Skip Option E - No Penalty)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="border-t border-slate-200 p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearResponse}
                disabled={currentResp.selectedOption === null}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                Clear Response
              </button>

              <button
                onClick={handleMarkForReviewAndNext}
                className="px-3.5 py-2 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors"
              >
                Mark for Review & Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleSaveAndNext}
                className="px-6 py-2 text-xs sm:text-sm font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Candidate Profile & Dense Palette Panel */}
        <aside
          className={`lg:w-80 w-full bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col overflow-hidden shrink-0 ${
            isMobilePaletteOpen ? 'block fixed inset-4 z-50 lg:static' : 'hidden lg:flex'
          }`}
        >
          {/* Candidate Profile Box */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
              PP
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">
                Candidate: {userName}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Roll: TRE4-2026-MATH
              </div>
            </div>
          </div>

          {/* Palette Grid & Legend */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="font-mono text-emerald-600 font-bold">
                {answeredCount + answeredMarkedCount} / {totalQuestions} Done
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {testSet.questions.map((q, idx) => {
                const r = responses[q.id];
                const isCurrent = idx === currentIdx;

                let stateClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (r.status === 'answered') {
                  stateClass = 'bg-emerald-600 text-white border-emerald-600';
                } else if (r.status === 'not_answered') {
                  stateClass = 'bg-rose-500 text-white border-rose-500';
                } else if (r.status === 'marked_review') {
                  stateClass = 'bg-violet-600 text-white border-violet-600';
                } else if (r.status === 'answered_marked_review') {
                  stateClass = 'bg-violet-800 text-white border-violet-800';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center border transition-all relative ${stateClass} ${
                      isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 scale-105 z-10' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {r.status === 'answered_marked_review' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 6 Mini Legend Items Beneath */}
            <div className="pt-3 border-t border-slate-100 text-[11px] grid grid-cols-2 gap-2 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 shrink-0" />
                <span>Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-violet-600 shrink-0" />
                <span>Marked Review ({markedReviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-violet-800 shrink-0" />
                <span>Ans & Marked ({answeredMarkedCount})</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 shrink-0" />
                <span>Not Visited ({notVisitedCount})</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 rounded-2xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Test</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 text-slate-900 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Submit Test Examination?</h3>
              <p className="text-xs text-slate-500">
                Are you ready to submit your test and view score analytics for {userName}?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
              <div>Total: <strong>{totalQuestions}</strong></div>
              <div className="text-emerald-600 font-bold">Answered: {answeredCount + answeredMarkedCount}</div>
              <div className="text-rose-600 font-bold">Not Answered: {notAnsweredCount}</div>
              <div>Not Visited: {notVisitedCount}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Resume Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-2.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md"
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
