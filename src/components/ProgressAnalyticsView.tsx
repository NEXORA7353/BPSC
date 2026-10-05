import { useState, useMemo } from 'react';
import {
  Trophy,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Target,
  Award,
  BookOpen,
  Trash2,
  Calendar,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { TestAttemptRecord, RegisteredTopic } from '../types';
import {
  getAttemptRecords,
  getAllRegisteredTopics,
  getAllQuestionBank,
  saveAttemptRecord
} from '../utils/questionBankStorage';
import { BackButton } from './BackButton';

interface ProgressAnalyticsViewProps {
  onBackToTests: () => void;
  onOpenCustomTest: () => void;
  onOpenRapidDrills: () => void;
}

export function ProgressAnalyticsView({
  onBackToTests,
  onOpenCustomTest,
  onOpenRapidDrills
}: ProgressAnalyticsViewProps) {
  const [attempts, setAttempts] = useState<TestAttemptRecord[]>(() => getAttemptRecords());
  const registeredTopics = useMemo(() => getAllRegisteredTopics(), []);
  const allBankQuestions = useMemo(() => getAllQuestionBank(), []);

  const totalAttempts = attempts.length;

  const avgScore = useMemo(() => {
    if (totalAttempts === 0) return 0;
    const sum = attempts.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / totalAttempts) * 100) / 100;
  }, [attempts, totalAttempts]);

  const avgAccuracy = useMemo(() => {
    if (totalAttempts === 0) return 0;
    const sum = attempts.reduce((acc, curr) => acc + curr.accuracy, 0);
    return Math.round(sum / totalAttempts);
  }, [attempts, totalAttempts]);

  const bestScore = useMemo(() => {
    if (totalAttempts === 0) return 0;
    return Math.max(...attempts.map((a) => a.score));
  }, [attempts, totalAttempts]);

  const handleClearHistory = () => {
    if (window.confirm('Clear all historical attempt record logs? (Custom tests & question bank will remain intact)')) {
      try {
        localStorage.removeItem('bpsc_attempt_records');
        setAttempts([]);
      } catch (err) {
        console.error('Failed to clear attempt records', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-app-canvas grid-lines-44 text-slate-900 dark:text-slate-100 font-sans pb-16 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8 relative z-10">
        <BackButton onClick={onBackToTests} label="Back to Mock Tests" variant="subtle" />

        {/* HEADER HERO */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>STUDENT PERFORMANCE TREND DASHBOARD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                BPSC TRE 4.0 Progress & Score Tracker
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Comprehensive analytics tracking score trends, overall accuracy, attempt history, and chapter mastery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRapidDrills}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Rapid Drills</span>
              </button>

              <button
                onClick={onOpenCustomTest}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Create Test</span>
              </button>
            </div>
          </div>

          {/* 4 STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Tests Completed
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                {totalAttempts}
              </div>
              <div className="text-[10px] text-slate-400">Mock Tests Taken</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Average Accuracy
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {avgAccuracy}%
              </div>
              <div className="text-[10px] text-emerald-500">Attempt Precision</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Average Score
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                {avgScore}
              </div>
              <div className="text-[10px] text-slate-400">Per Test Average</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl text-center space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Best Score
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {bestScore}
              </div>
              <div className="text-[10px] text-slate-400">Personal Peak</div>
            </div>
          </div>
        </section>

        {/* ATTEMPT HISTORY TIMELINE TABLE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Mock Test Attempt History Timeline</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-white/10">
                {attempts.length} Records
              </span>
            </h2>

            {attempts.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History Logs</span>
              </button>
            )}
          </div>

          {attempts.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No attempts logged yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Take any mock test or rapid drill to start tracking your performance trend history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((rec, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                        #{attempts.length - idx}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {rec.testTitle}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        <span>{new Date(rec.date).toLocaleDateString()}</span>
                      </span>
                      <span>• {rec.totalQuestions} Questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono font-bold shrink-0">
                    <div className="text-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="text-[10px] font-sans text-slate-400 font-normal">Score</div>
                      <div className="text-sm text-amber-600 dark:text-amber-400">{rec.score} / {rec.totalMarks}</div>
                    </div>

                    <div className="text-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="text-[10px] font-sans text-slate-400 font-normal">Accuracy</div>
                      <div className="text-sm text-emerald-600 dark:text-emerald-400">{rec.accuracy}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
