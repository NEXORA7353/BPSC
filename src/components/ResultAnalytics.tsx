import { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  FileDown,
  AlertTriangle,
  MinusCircle,
  Home,
  Target,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { MockTestSet, TestResult } from '../types';
import {
  createReattemptMissedQuestionsTest,
  toggleBookmarkQuestion,
  getBookmarkedIds
} from '../utils/questionBankStorage';
import { BackButton } from './BackButton';

interface ResultAnalyticsProps {
  result: TestResult;
  testSet: MockTestSet;
  onReattempt: () => void;
  onReattemptMissed: (newTestSet: MockTestSet) => void;
  onNextSet?: () => void;
  onGoHome: () => void;
  onDownloadHtml: (set: MockTestSet) => void;
  onOpenShareModal: () => void;
  userName?: string;
}

export function ResultAnalytics({
  result,
  testSet,
  onReattempt,
  onReattemptMissed,
  onNextSet,
  onGoHome,
  onDownloadHtml,
  onOpenShareModal,
  userName = 'PrIyA PaTeL'
}: ResultAnalyticsProps) {
  const [filterType, setFilterType] = useState<
    'all' | 'correct' | 'incorrect' | 'blank_penalty' | 'safe_skip' | 'bookmarked'
  >('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => getBookmarkedIds());
  const [expandedAccordionId, setExpandedAccordionId] = useState<string | null>(null);

  const negPenalty = result.negativeMarkingValue ?? testSet.negativeMarkingValue ?? 0.33;

  const handleToggleBookmark = (id: string) => {
    toggleBookmarkQuestion(id);
    setBookmarkedIds(getBookmarkedIds());
  };

  const avgSeconds = Math.round(result.totalTimeSpentSeconds / Math.max(1, result.totalQuestions));

  // Identify missed questions
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

  // Topic Breakdown Matrix
  const topicStats: Record<string, { total: number; correct: number; incorrect: number; name: string }> = {};
  testSet.questions.forEach((q) => {
    const topicKey = q.topic || 'custom';
    const topicName = q.topicNameHindi || 'सामान्य';
    if (!topicStats[topicKey]) {
      topicStats[topicKey] = { total: 0, correct: 0, incorrect: 0, name: topicName };
    }
    topicStats[topicKey].total += 1;
    const resp = result.responses[q.id];
    if (resp?.selectedOption === q.correctOption) {
      topicStats[topicKey].correct += 1;
    } else if (resp?.selectedOption !== null && !(resp?.selectedOption === 'e' && q.correctOption !== 'e')) {
      topicStats[topicKey].incorrect += 1;
    }
  });

  const scorePercent = Math.min(100, Math.max(0, Math.round((result.score / result.totalMarks) * 100)));
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  const gradeColor =
    scorePercent >= 75
      ? '#10B981'
      : scorePercent >= 50
      ? '#F5A524'
      : '#F43F5E';

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
    <div className="min-h-screen bg-app-canvas grid-lines-44 text-slate-900 dark:text-slate-100 font-sans pb-16 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8 relative z-10">
        <BackButton onClick={onGoHome} label="Back to Mock Tests" variant="subtle" />

        {/* HERO SCORE DONUT CARD */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-slate-200 dark:stroke-white/10"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke={gradeColor}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 12px ${gradeColor})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">
                    {scorePercent}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                    SCORE
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>OFFICIAL BPSC TRE 4.0 SCORECARD</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {result.setTitle}
                </h1>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Candidate: <strong className="text-slate-900 dark:text-white">{userName}</strong> • Completed on{' '}
                  {new Date(result.completedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onReattempt}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 fill-slate-950" />
                <span>Retake Test</span>
              </button>

              {missedQuestionIds.length > 0 && (
                <button
                  onClick={handleStartMissedReattempt}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Re-attempt Weak Spots ({missedQuestionIds.length} Qs)</span>
                </button>
              )}

              <button
                onClick={onOpenShareModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Share</span>
              </button>

              <button
                onClick={() => onDownloadHtml(testSet)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>HTML</span>
              </button>
            </div>
          </div>

          {/* 6-TILE STAT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Net Score
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {result.score.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Out of {result.totalMarks}</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Accuracy
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                {result.accuracy}%
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Attempt Accuracy</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Correct (+1)
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {result.correctCount}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400/80">+{result.correctCount}.00</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Incorrect (-{negPenalty.toFixed(2)})
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                {result.incorrectCount}
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400/80">
                -{(result.incorrectCount * negPenalty).toFixed(2)}
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Safe Skip (Opt E)
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-sky-600 dark:text-sky-400 mt-0.5">
                {result.safeSkipCount}
              </div>
              <div className="text-[10px] text-sky-600 dark:text-sky-400/80">0.00 Penalty</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Blank Penalty
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-500 mt-0.5">
                {result.blankPenaltyCount}
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-500/80">
                -{(result.blankPenaltyCount * negPenalty).toFixed(2)}
              </div>
            </div>
          </div>

          {/* TIME & OVERTIME ANALYSIS BANNER */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Total Time Taken: {Math.floor(result.totalTimeSpentSeconds / 60)}m {result.totalTimeSpentSeconds % 60}s
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">
                  Allotted Time Limit: {testSet.totalTimeMinutes} mins · Avg Speed per Question: {avgSeconds}s / Q
                </div>
              </div>
            </div>

            <div>
              {result.totalTimeSpentSeconds > testSet.totalTimeMinutes * 60 ? (
                <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>
                    Overtime: +{Math.floor((result.totalTimeSpentSeconds - testSet.totalTimeMinutes * 60) / 60)}m{' '}
                    {(result.totalTimeSpentSeconds - testSet.totalTimeMinutes * 60) % 60}s
                  </span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Completed On Schedule</span>
                </span>
              )}
            </div>
          </div>

          {/* ADVANCED TOPIC MASTERY BREAKDOWN MATRIX */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Topic Mastery & Accuracy Breakdown</span>
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-300">Avg Speed: {avgSeconds}s / Q</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(topicStats).map(([tKey, stats]) => {
                const topicPct = Math.round((stats.correct / Math.max(1, stats.total)) * 100);
                return (
                  <div key={tKey} className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-slate-100">{stats.name}</span>
                      <span className="font-mono text-amber-600 dark:text-amber-300">{topicPct}% Mastery</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${topicPct}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-mono">
                      <span>Correct: {stats.correct}/{stats.total}</span>
                      <span>Incorrect: {stats.incorrect}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SOLUTIONS REVIEW ACCORDION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Detailed Hindi Solutions & Review</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-white/10">
                {filteredQuestions.length} Questions
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {[
                { id: 'all', label: `All (${result.totalQuestions})` },
                { id: 'correct', label: `Correct (${result.correctCount})` },
                { id: 'incorrect', label: `Incorrect (${result.incorrectCount})` },
                { id: 'safe_skip', label: `Safe Skip (${result.safeSkipCount})` },
                { id: 'blank_penalty', label: `Blank (${result.blankPenaltyCount})` },
                { id: 'bookmarked', label: `Bookmarked (${bookmarkedIds.length})` }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    filterType === pill.id
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-white/5'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => {
              const resp = result.responses[q.id];
              const sel = resp?.selectedOption;
              const isCorrect = sel === q.correctOption;
              const isSafeSkip = sel === 'e' && q.correctOption !== 'e';
              const isBlank = sel === null;
              const isExpanded = expandedAccordionId === q.id;

              let statusChip = (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  Correct (+1.00)
                </span>
              );
              if (isBlank) {
                statusChip = (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                    Blank Penalty (-{negPenalty.toFixed(2)})
                  </span>
                );
              } else if (isSafeSkip) {
                statusChip = (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/25">
                    Safe Skip (0.00)
                  </span>
                );
              } else if (!isCorrect) {
                statusChip = (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                    Incorrect (-{negPenalty.toFixed(2)})
                  </span>
                );
              }

              return (
                <div
                  key={q.id}
                  className="glass-panel rounded-2xl overflow-hidden transition-all"
                >
                  <div
                    onClick={() =>
                      setExpandedAccordionId(isExpanded ? null : q.id)
                    }
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate font-sans">
                        {q.questionText}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {resp?.timeSpentSeconds !== undefined && resp.timeSpentSeconds > 0 && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center gap-1" title="Time spent on this question">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{resp.timeSpentSeconds}s</span>
                        </span>
                      )}
                      {statusChip}
                      <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2 space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isCandidateChoice = sel === opt.key;
                          const isKeyCorrect = q.correctOption === opt.key;

                          let optionStyle = 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300';
                          if (isKeyCorrect) {
                            optionStyle =
                              'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold';
                          } else if (isCandidateChoice && !isKeyCorrect) {
                            optionStyle =
                              'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-300 font-bold';
                          }

                          return (
                            <div
                              key={opt.key}
                              className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${optionStyle}`}
                            >
                              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 font-bold text-xs uppercase flex items-center justify-center shrink-0">
                                {opt.key}
                              </span>
                              <div className="flex-1 font-sans">
                                {opt.text}
                                {isCandidateChoice && (
                                  <span className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                    Your Choice
                                  </span>
                                )}
                                {isKeyCorrect && (
                                  <span className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                    Official Key
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm space-y-2">
                        <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>विस्तृत चरणबद्ध हल (Hindi Explanation):</span>
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
