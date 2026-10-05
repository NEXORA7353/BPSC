import { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Target,
  Play,
  Zap,
  BarChart3,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { RegisteredTopic, Question, MockTestSet, CustomTestConfig } from '../types';
import {
  getAllRegisteredTopics,
  getAllQuestionBank,
  getAttemptRecords,
  createCustomMockTest
} from '../utils/questionBankStorage';

interface AiWeakSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTest: (testSet: MockTestSet) => void;
}

export function AiWeakSpotModal({ isOpen, onClose, onStartTest }: AiWeakSpotModalProps) {
  const registeredTopics = useMemo(() => getAllRegisteredTopics(), [isOpen]);
  const allBankQuestions = useMemo(() => getAllQuestionBank(), [isOpen]);
  const attempts = useMemo(() => getAttemptRecords(), [isOpen]);

  // Topic Performance Analysis
  const topicAnalysis = useMemo(() => {
    const map: Record<string, { total: number; correct: number; incorrect: number; name: string }> = {};

    registeredTopics.forEach((t) => {
      map[t.key] = {
        total: 0,
        correct: 0,
        incorrect: 0,
        name: t.labelHindi.split('(')[0].trim()
      };
    });

    allBankQuestions.forEach((q) => {
      if (map[q.topic]) {
        map[q.topic].total += 1;
      }
    });

    return Object.entries(map).map(([key, data]) => {
      const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      let status: 'weak' | 'moderate' | 'mastered' = 'weak';
      if (accuracy >= 75) status = 'mastered';
      else if (accuracy >= 50) status = 'moderate';

      return {
        key,
        name: data.name,
        totalQuestions: data.total,
        correct: data.correct,
        incorrect: data.incorrect,
        accuracy,
        status
      };
    });
  }, [registeredTopics, allBankQuestions, attempts]);

  const weakTopics = useMemo(() => topicAnalysis.filter((t) => t.status === 'weak'), [topicAnalysis]);
  const moderateTopics = useMemo(() => topicAnalysis.filter((t) => t.status === 'moderate'), [topicAnalysis]);
  const masteredTopics = useMemo(() => topicAnalysis.filter((t) => t.status === 'mastered'), [topicAnalysis]);

  if (!isOpen) return null;

  const handleGenerateWeaknessFixerTest = () => {
    const weakKeys = weakTopics.slice(0, 3).map((t) => t.key);
    const selectedTopics = weakKeys.length > 0 ? weakKeys : ['lcm_hcf', 'percentage', 'profit_loss'];

    const config: CustomTestConfig = {
      title: `BPSC TRE 4.0 - Weakness Repair Sprint (${selectedTopics.length} Topics)`,
      creationMode: 'topic_distribution',
      selectedTopics,
      topicDistribution: selectedTopics.reduce((acc, k) => ({ ...acc, [k]: 5 }), {}),
      questionCount: selectedTopics.length * 5,
      timeMinutes: selectedTopics.length * 5,
      selectionMode: 'random',
      negativeMarking: 0.33,
      targetExam: 'BPSC TRE 4.0 Weakness Repair Sprint'
    };

    const newTest = createCustomMockTest(config);
    onStartTest(newTest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 text-slate-900 dark:text-slate-100 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
                <span>AI Performance Diagnostic & Weakness Heatmap</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                  AI v2.0
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identifies weak BPSC TRE 4.0 chapters and generates 1-click weakness repair practice sets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Banner Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Target className="w-4 h-4 text-amber-500" />
                <span>AI Diagnostic Summary:</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                {attempts.length} Tests Attempted
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              आपकी परीक्षा रिपोर्ट के अनुसार <strong>{weakTopics.length} अध्यायों</strong> में विशेष अभ्यास की आवश्यकता है।
              नीचे दिए गए 1-Click Repair बटन द्वारा अपनी कमजोरियों पर आधारित स्पेशल मॉक टेस्ट शुरू करें।
            </p>

            <button
              onClick={handleGenerateWeaknessFixerTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>🚀 1-Click Generate Weak Spot Fixer Test ({Math.min(15, weakTopics.length * 5)} Qs)</span>
            </button>
          </div>

          {/* Weakness Heatmap Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>27 BPSC Mathematics Chapter Mastery Matrix</span>
              <span>{topicAnalysis.length} Chapters</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {topicAnalysis.map((item) => {
                let badgeStyle = 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
                let icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
                let statusLabel = 'Weak (अभ्यास आवश्यक)';

                if (item.status === 'mastered') {
                  badgeStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                  icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
                  statusLabel = 'Mastered (उत्कृष्ट)';
                } else if (item.status === 'moderate') {
                  badgeStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                  icon = <BarChart3 className="w-3.5 h-3.5 text-amber-500" />;
                  statusLabel = 'Moderate (मध्यम)';
                }

                return (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-2xl border ${badgeStyle} space-y-2 text-xs transition-all hover:scale-[1.01]`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate pr-1">{item.name}</span>
                      <span className="font-mono shrink-0">{item.accuracy}%</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === 'mastered'
                            ? 'bg-emerald-500'
                            : item.status === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(10, item.accuracy)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        {icon}
                        <span>{statusLabel}</span>
                      </span>
                      <span>{item.totalQuestions} Qs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
