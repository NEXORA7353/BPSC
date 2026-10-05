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
  ChevronDown,
  ChevronUp
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

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
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

  // Score percentage for SVG Donut ring
  const scorePercent = Math.min(100, Math.max(0, Math.round((result.score / result.totalMarks) * 100)));
  const circumference = 2 * Math.PI * 54; // radius 54 => ~339.29
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  // Grade color role
  const gradeColor =
    scorePercent >= 75
      ? '#10B981' // emerald
      : scorePercent >= 50
      ? '#F5A524' // amber
      : '#F43F5E'; // rose

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
    <div className="min-h-screen bg-midnight grid-lines-44 text-slate-100 font-sans pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8 relative z-10">
        <BackButton onClick={onGoHome} label="Back to Mock Tests" variant="subtle" />

        {/* HERO SCORE DONUT CARD */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* SVG Donut Ring & Score */}
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-white/10"
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
                  <span className="text-2xl font-black font-mono text-white leading-none">
                    {scorePercent}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    SCORE
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>OFFICIAL BPSC TRE 4.0 SCORECARD</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {result.setTitle}
                </h1>
                <div className="text-xs text-slate-400 font-medium">
                  Candidate: <strong className="text-white">{userName}</strong> • Completed on{' '}
                  {new Date(result.completedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onReattempt}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 fill-slate-950" />
                <span>Retake Full Test</span>
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
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share</span>
              </button>

              <button
                onClick={() => onDownloadHtml(testSet)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>HTML</span>
              </button>
            </div>
          </div>

          {/* 6-TILE STAT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-white/10">
            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Net Score
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-0.5">
                {result.score.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">Out of {result.totalMarks}</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Accuracy
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                {result.accuracy}%
              </div>
              <div className="text-[10px] text-slate-400">Attempt Accuracy</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Correct (+1)
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5">
                {result.correctCount}
              </div>
              <div className="text-[10px] text-emerald-400/80">+{result.correctCount}.00</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Incorrect (-{negPenalty.toFixed(2)})
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 mt-0.5">
                {result.incorrectCount}
              </div>
              <div className="text-[10px] text-rose-400/80">
                -{(result.incorrectCount * negPenalty).toFixed(2)}
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Safe Skip (Opt E)
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-sky-400 mt-0.5">
                {result.safeSkipCount}
              </div>
              <div className="text-[10px] text-sky-400/80">0.00 Penalty</div>
            </div>

            <div className="glass-panel p-3.5 rounded-2xl text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Blank Penalty
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-500 mt-0.5">
                {result.blankPenaltyCount}
              </div>
              <div className="text-[10px] text-rose-500/80">
                -{(result.blankPenaltyCount * negPenalty).toFixed(2)}
              </div>
            </div>
          </div>

          {/* HORIZONTAL BAR-CHART SECTION WITH TARGET LINE */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>Performance Breakdown vs Target (75%)</span>
              <span className="font-mono text-amber-300">Avg Speed: {avgSeconds}s / Q</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-400">Correct Answers</span>
                  <span className="font-mono text-emerald-400">
                    {Math.round((result.correctCount / result.totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(result.correctCount / result.totalQuestions) * 100}%`
                    }}
                  />
                  <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-amber-400 shadow-sm" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-400">Incorrect Attempts</span>
                  <span className="font-mono text-rose-400">
                    {Math.round((result.incorrectCount / result.totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(result.incorrectCount / result.totalQuestions) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTIONS REVIEW ACCORDION SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Detailed Hindi Solutions & Review</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-amber-300 border border-white/10">
                {filteredQuestions.length} Questions
              </span>
            </h2>

            {/* Filter Pills */}
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
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => {
              const resp = result.responses[q.id];
              const sel = resp?.selectedOption;
              const isCorrect = sel === q.correctOption;
              const isSafeSkip = sel === 'e' && q.correctOption !== 'e';
              const isBlank = sel === null;
              const isBookmarked = bookmarkedIds.includes(q.id);
              const isExpanded = expandedAccordionId === q.id;

              let statusChip = (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Correct (+1.00)
                </span>
              );
              if (isBlank) {
                statusChip = (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25">
                    Blank Penalty (-{negPenalty.toFixed(2)})
                  </span>
                );
              } else if (isSafeSkip) {
                statusChip = (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25">
                    Safe Skip (0.00)
                  </span>
                );
              } else if (!isCorrect) {
                statusChip = (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25">
                    Incorrect (-{negPenalty.toFixed(2)})
                  </span>
                );
              }

              return (
                <div
                  key={q.id}
                  className="glass-panel rounded-2xl overflow-hidden transition-all"
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() =>
                      setExpandedAccordionId(isExpanded ? null : q.id)
                    }
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-xs text-amber-400 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="font-semibold text-sm sm:text-base text-white truncate font-sans">
                        {q.questionText}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {statusChip}
                      <button className="p-1 text-slate-400 hover:text-white">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Body Reveal */}
                  {isExpanded && (
                    <div className="p-5 border-t border-white/10 bg-white/2 space-y-4 animate-in fade-in duration-200">
                      {/* Options Review */}
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isCandidateChoice = sel === opt.key;
                          const isKeyCorrect = q.correctOption === opt.key;

                          let optionStyle = 'bg-white/5 border-white/10 text-slate-300';
                          if (isKeyCorrect) {
                            optionStyle =
                              'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold';
                          } else if (isCandidateChoice && !isKeyCorrect) {
                            optionStyle =
                              'bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold';
                          }

                          return (
                            <div
                              key={opt.key}
                              className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${optionStyle}`}
                            >
                              <span className="w-6 h-6 rounded-lg bg-white/10 font-bold text-xs uppercase flex items-center justify-center shrink-0">
                                {opt.key}
                              </span>
                              <div className="flex-1 font-sans">
                                {opt.text}
                                {isCandidateChoice && (
                                  <span className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                                    Your Choice
                                  </span>
                                )}
                                {isKeyCorrect && (
                                  <span className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                                    Official Key
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Step-by-Step Hindi Solution */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm space-y-2">
                        <div className="font-bold text-amber-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>विस्तृत चरणबद्ध हल (Hindi Explanation):</span>
                        </div>
                        <div className="text-slate-200 whitespace-pre-line leading-relaxed font-sans">
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
