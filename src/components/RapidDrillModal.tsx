import { useState } from 'react';
import {
  X,
  Zap,
  Clock,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Play,
  Flame
} from 'lucide-react';
import { RegisteredTopic, MockTestSet, CustomTestConfig } from '../types';
import { getAllRegisteredTopics, createCustomMockTest } from '../utils/questionBankStorage';

interface RapidDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTest: (testSet: MockTestSet) => void;
}

export function RapidDrillModal({ isOpen, onClose, onStartTest }: RapidDrillModalProps) {
  const registeredTopics = getAllRegisteredTopics();
  const [selectedTopicKey, setSelectedTopicKey] = useState<string>('lcm_hcf');
  const [drillCount, setDrillCount] = useState<number>(5);

  if (!isOpen) return null;

  const currentTopicObj = registeredTopics.find((t) => t.key === selectedTopicKey);
  const topicNameHindi = currentTopicObj?.labelHindi || 'विविध गणित';

  const handleStartRapidDrill = () => {
    const topicObj = registeredTopics.find((t) => t.key === selectedTopicKey);
    const topicEn = topicObj?.labelEnglish || 'Mathematics';

    const config: CustomTestConfig = {
      title: `BPSC TRE 4.0: 5-Min Rapid Drill - ${topicEn} (${drillCount} Qs)`,
      creationMode: 'topic_distribution',
      selectedTopics: [selectedTopicKey],
      topicDistribution: { [selectedTopicKey]: drillCount },
      questionCount: drillCount,
      timeMinutes: 5,
      selectionMode: 'random',
      negativeMarking: 0.33,
      targetExam: 'BPSC TRE 4.0 Rapid Drill'
    };

    const drillTest = createCustomMockTest(config);
    onStartTest(drillTest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 text-slate-900 dark:text-slate-100 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
                <span>Chapter-Wise 5-Min Rapid Drill Mode</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" />
                  <span>5-MIN SPRINT</span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-speed 5-question chapter drills for quick daily revision
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

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Chapter for Rapid Revision *
            </label>
            <select
              value={selectedTopicKey}
              onChange={(e) => setSelectedTopicKey(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {registeredTopics.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.labelEnglish} ({t.labelHindi})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Drill Length
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {[5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setDrillCount(cnt)}
                  className={`py-2.5 rounded-xl border text-center transition-all ${
                    drillCount === cnt
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{cnt} Questions (5 Min)</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Rapid Sprint Rules:</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You will have <strong>5 minutes</strong>. Solve each problem as fast as possible to build calculation reflexes and exam speed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleStartRapidDrill}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Rapid Drill Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
