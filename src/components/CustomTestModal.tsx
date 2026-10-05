import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Play,
  Shuffle,
  Clock,
  Layers,
  CheckCircle2,
  Sparkles,
  Plus,
  ShieldAlert,
  Search,
  CheckSquare,
  Square,
  FileText,
  Upload,
  BookOpen,
  Trash2,
  Bookmark,
  Zap,
  Filter,
  Save
} from 'lucide-react';
import { CustomTestConfig, MockTestSet, RegisteredTopic, Question } from '../types';
import {
  getAllQuestionBank,
  createCustomMockTest,
  getAllRegisteredTopics,
  registerNewTopic,
  deleteMultipleQuestions,
  getBookmarkedIds
} from '../utils/questionBankStorage';
import { parseBulkQuestionText } from '../utils/questionParser';

interface CustomTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomTest: (testSet: MockTestSet) => void;
  onOpenBulkImport?: (topicKey?: string) => void;
}

export function CustomTestModal({
  isOpen,
  onClose,
  onStartCustomTest,
  onOpenBulkImport
}: CustomTestModalProps) {
  const [creationMode, setCreationMode] = useState<'topic_distribution' | 'handpick' | 'direct_paste'>('topic_distribution');

  // Topics & Questions
  const [registeredTopics, setRegisteredTopics] = useState<RegisteredTopic[]>(() => getAllRegisteredTopics());
  const [allBankQuestions, setAllBankQuestions] = useState<Question[]>(() => getAllQuestionBank());
  const bookmarkedIds = useMemo(() => getBookmarkedIds(), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setRegisteredTopics(getAllRegisteredTopics());
      setAllBankQuestions(getAllQuestionBank());
    }
    const handleUpdate = () => {
      setRegisteredTopics(getAllRegisteredTopics());
      setAllBankQuestions(getAllQuestionBank());
    };
    window.addEventListener('bpsc_cloud_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('bpsc_cloud_data_updated', handleUpdate);
    };
  }, [isOpen]);

  // Topic Counts in DB
  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allBankQuestions.forEach((q) => {
      map[q.topic] = (map[q.topic] || 0) + 1;
    });
    return map;
  }, [allBankQuestions]);

  // Topic Distribution state: topicKey -> quantity
  const [topicDistribution, setTopicDistribution] = useState<Record<string, number>>(() => ({
    lcm_hcf: 10,
    percentage: 10,
    profit_loss: 10
  }));

  // Handpick state: set of question IDs
  const [handpickedIds, setHandpickedIds] = useState<string[]>([]);
  const [handpickSearch, setHandpickSearch] = useState('');
  const [handpickTopicFilter, setHandpickTopicFilter] = useState('all');
  const [handpickExamFilter, setHandpickExamFilter] = useState('all');
  const [handpickOnlyBookmarks, setHandpickOnlyBookmarks] = useState(false);

  // Direct paste state
  const [directPasteText, setDirectPasteText] = useState('');
  const [directParsedQuestions, setDirectParsedQuestions] = useState<Question[]>([]);

  // Common Settings
  const [testTitle, setTestTitle] = useState('BPSC TRE 4.0 Custom Practice Test');
  const [timeMode, setTimeMode] = useState<'auto' | 'custom'>('auto');
  const [customTimeMinutes, setCustomTimeMinutes] = useState<number>(30);
  const [selectionMode, setSelectionMode] = useState<'random' | 'sequential'>('random');
  const [negativeMarking, setNegativeMarking] = useState<number>(0.33);

  // New Topic In-place state
  const [isAddingNewTopic, setIsAddingNewTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // Bulk operation status notification
  const [bulkStatusMsg, setBulkStatusMsg] = useState<string | null>(null);

  // Calculate total questions in current mode (Must be called unconditionally before early return)
  const totalQuestionsCount = useMemo(() => {
    if (creationMode === 'topic_distribution') {
      return Object.values(topicDistribution).reduce((sum, val) => sum + (val || 0), 0);
    }
    if (creationMode === 'handpick') {
      return handpickedIds.length;
    }
    if (creationMode === 'direct_paste') {
      return directParsedQuestions.length;
    }
    return 0;
  }, [creationMode, topicDistribution, handpickedIds, directParsedQuestions]);

  const filteredHandpickQuestions = useMemo(() => {
    return allBankQuestions.filter((q) => {
      const matchesTopic = handpickTopicFilter === 'all' || q.topic === handpickTopicFilter;
      const matchesExam =
        handpickExamFilter === 'all' ||
        (handpickExamFilter === 'custom' && q.isUserAdded) ||
        q.exam.toLowerCase().includes(handpickExamFilter.toLowerCase());
      const matchesBookmark = !handpickOnlyBookmarks || bookmarkedIds.includes(q.id);
      const matchesSearch =
        !handpickSearch ||
        q.questionText.toLowerCase().includes(handpickSearch.toLowerCase()) ||
        q.exam.toLowerCase().includes(handpickSearch.toLowerCase());
      return matchesTopic && matchesExam && matchesBookmark && matchesSearch;
    });
  }, [allBankQuestions, handpickTopicFilter, handpickExamFilter, handpickOnlyBookmarks, handpickSearch, bookmarkedIds]);

  if (!isOpen) return null;

  const updateAutoTitleFromDist = (dist: Record<string, number>) => {
    const activeKeys = Object.keys(dist).filter((k) => (dist[k] || 0) > 0);
    if (activeKeys.length === 0) return;

    const topicsObj = registeredTopics.filter((t) => activeKeys.includes(t.key));
    const names = topicsObj.map((t) => t.labelHindi.split('(')[0].trim());

    if (names.length === 1) {
      setTestTitle(`BPSC TRE 4.0 - ${names[0]} स्पेशल टेस्ट`);
    } else if (names.length === 2) {
      setTestTitle(`BPSC TRE 4.0 - ${names[0]} तथा ${names[1]} स्पेशल मॉक टेस्ट`);
    } else if (names.length === 3) {
      setTestTitle(`BPSC TRE 4.0 - ${names[0]}, ${names[1]} तथा ${names[2]} कंबाइंड टेस्ट`);
    } else if (names.length > 3) {
      setTestTitle(`BPSC TRE 4.0 - ${names[0]}, ${names[1]} + ${names.length - 2} अन्य अध्याय टेस्ट`);
    }
  };

  const handleDistributionChange = (topicKey: string, count: number) => {
    const updated = {
      ...topicDistribution,
      [topicKey]: Math.max(0, count)
    };
    setTopicDistribution(updated);
    updateAutoTitleFromDist(updated);
  };

  const handleCreateNewTopic = () => {
    if (!newTopicHindi.trim()) return;
    const key = newTopicHindi.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const created = registerNewTopic(key, newTopicHindi, newTopicEnglish || newTopicHindi);
    setRegisteredTopics(getAllRegisteredTopics());
    const updated = { ...topicDistribution, [created.key]: 10 };
    setTopicDistribution(updated);
    updateAutoTitleFromDist(updated);
    setIsAddingNewTopic(false);
    setNewTopicHindi('');
    setNewTopicEnglish('');
  };

  // Direct paste parser handler
  const handleDirectPasteChange = (text: string) => {
    setDirectPasteText(text);
    if (text.trim().length > 15) {
      const res = parseBulkQuestionText(text, 'custom', 'विविध गणित');
      setDirectParsedQuestions(res.questions);
    } else {
      setDirectParsedQuestions([]);
    }
  };

  // Handpick toggle
  const toggleHandpickId = (id: string) => {
    setHandpickedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Batch Selection Functions
  const handleSelectCount = (count: number) => {
    const idsToSelect = filteredHandpickQuestions.slice(0, count).map((q) => q.id);
    setHandpickedIds(idsToSelect);
    setBulkStatusMsg(`Selected first ${idsToSelect.length} questions from the filtered list.`);
    setTimeout(() => setBulkStatusMsg(null), 2500);
  };

  const handleSelectAllHandpick = () => {
    const ids = filteredHandpickQuestions.map((q) => q.id);
    setHandpickedIds(Array.from(new Set([...handpickedIds, ...ids])));
    setBulkStatusMsg(`Selected all ${ids.length} filtered questions.`);
    setTimeout(() => setBulkStatusMsg(null), 2500);
  };

  const handleClearHandpick = () => {
    setHandpickedIds([]);
  };

  // Bulk Delete Questions from Bank
  const handleBulkDeleteFromBank = () => {
    if (handpickedIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to permanently delete these ${handpickedIds.length} selected questions from your Question Bank?`
      )
    ) {
      const deletedCount = deleteMultipleQuestions(handpickedIds);
      setAllBankQuestions(getAllQuestionBank());
      setHandpickedIds([]);
      setBulkStatusMsg(`Successfully deleted ${deletedCount} questions from Question Bank.`);
      setTimeout(() => setBulkStatusMsg(null), 3000);
    }
  };

  // Quick Preset Handlers
  const applyPreset = (count: number, titleSuffix: string) => {
    setCreationMode('topic_distribution');
    setTestTitle(`BPSC TRE 4.0 ${titleSuffix}`);
    setTimeMode('auto');
    const perTopic = Math.floor(count / 3);
    const remainder = count % 3;
    setTopicDistribution({
      lcm_hcf: perTopic + remainder,
      percentage: perTopic,
      profit_loss: perTopic
    });
  };

  const handleCreateTestSet = (autoStart: boolean = false) => {
    const finalTime = timeMode === 'auto' ? Math.max(5, totalQuestionsCount) : customTimeMinutes;

    const activeTopics = Object.keys(topicDistribution).filter((k) => (topicDistribution[k] || 0) > 0);

    const config: CustomTestConfig = {
      title: testTitle.trim() || `Custom Test (${totalQuestionsCount} Qs)`,
      creationMode,
      selectedTopics: activeTopics.length > 0 ? activeTopics : Object.keys(topicDistribution),
      topicDistribution: creationMode === 'topic_distribution' ? topicDistribution : undefined,
      specificQuestionIds: creationMode === 'handpick' ? handpickedIds : undefined,
      directQuestions: creationMode === 'direct_paste' ? directParsedQuestions : undefined,
      questionCount: totalQuestionsCount,
      timeMinutes: finalTime,
      selectionMode,
      negativeMarking,
      targetExam: 'BPSC TRE 4.0 Mathematics (Custom Studio)'
    };

    const newTestSet = createCustomMockTest(config);

    if (autoStart) {
      onStartCustomTest(newTestSet);
      onClose();
    } else {
      setBulkStatusMsg('✅ Custom Test Created & Saved to My Tests!');
      setTimeout(() => {
        setBulkStatusMsg(null);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight">
                Advanced Test Creator Studio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mix topics, select 10/15/20 questions in batch, filter, delete, or paste directly
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

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs shrink-0">
          <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Presets:</span>
          </span>
          <button
            type="button"
            onClick={() => applyPreset(10, '10 Qs Rapid Sprint')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            ⚡ 10 Qs Rapid (10m)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(15, '15 Qs Speed Mock')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            🎯 15 Qs Speed (15m)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(20, '20 Qs Power Test')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            🚀 20 Qs Power (20m)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(30, '30 Qs Grand CBT Simulation')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            🏆 30 Qs Grand Mock (30m)
          </button>
        </div>

        {/* Creation Modes Bar */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 bg-slate-50/60 dark:bg-slate-900/40 text-xs sm:text-sm font-bold shrink-0">
          <button
            onClick={() => setCreationMode('topic_distribution')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              creationMode === 'topic_distribution'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Mix by Topics & Quantities</span>
          </button>

          <button
            onClick={() => setCreationMode('handpick')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              creationMode === 'handpick'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Hand-Pick & Batch Select ({handpickedIds.length})</span>
          </button>

          <button
            onClick={() => setCreationMode('direct_paste')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              creationMode === 'direct_paste'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Direct PDF / Question Paste</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Notification Toast */}
          {bulkStatusMsg && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{bulkStatusMsg}</span>
            </div>
          )}

          {/* Test Name & Negative Penalty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Test Title
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. Speed Mock 01 (LCM & Profit)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Negative Penalty</span>
              </label>
              <select
                value={negativeMarking}
                onChange={(e) => setNegativeMarking(parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value={0.33}>-0.33 (BPSC TRE 4.0 Standard)</option>
                <option value={0.25}>-0.25 (1/4 Penalty)</option>
                <option value={0.0}>0.00 (No Negative)</option>
              </select>
            </div>
          </div>

          {/* MODE 1: MIX BY TOPICS & QUANTITIES */}
          {creationMode === 'topic_distribution' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Set Questions per Topic
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose how many questions to pull from each mathematics chapter
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingNewTopic(!isAddingNewTopic)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Topic</span>
                </button>
              </div>

              {/* In-place Topic Adder */}
              {isAddingNewTopic && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    Add New Topic to Question Bank:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Topic Name in Hindi (e.g. समय और कार्य / Time & Work)"
                      value={newTopicHindi}
                      onChange={(e) => setNewTopicHindi(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Topic Name in English (e.g. Time & Work)"
                      value={newTopicEnglish}
                      onChange={(e) => setNewTopicEnglish(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewTopic(false)}
                      className="px-3 py-1 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewTopic}
                      disabled={!newTopicHindi.trim()}
                      className="px-4 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create Topic
                    </button>
                  </div>
                </div>
              )}

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {registeredTopics.map((topic) => {
                  const availableCount = topicCounts[topic.key] || 0;
                  const currentSelected = topicDistribution[topic.key] || 0;

                  return (
                    <div
                      key={topic.key}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {topic.labelHindi}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {availableCount} Available in Bank
                        </div>

                        {availableCount === 0 && onOpenBulkImport && (
                          <button
                            type="button"
                            onClick={() => onOpenBulkImport(topic.key)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-0.5"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Import questions for this topic</span>
                          </button>
                        )}
                      </div>

                      {/* Question Count Stepper */}
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={Math.max(availableCount, 100)}
                          value={currentSelected}
                          onChange={(e) =>
                            handleDistributionChange(topic.key, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-center text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-slate-500">Qs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: HAND-PICK & BATCH SELECT 10, 15, 20 + BULK DELETE */}
          {creationMode === 'handpick' && (
            <div className="space-y-3.5">
              {/* Batch Select Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>Quick Batch Select (एक साथ चुनें):</span>
                  </span>

                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {handpickedIds.length} Selected of {filteredHandpickQuestions.length} Questions
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectCount(10)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
                  >
                    + First 10 Qs
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCount(15)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
                  >
                    + First 15 Qs
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCount(20)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
                  >
                    + First 20 Qs
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCount(25)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
                  >
                    + First 25 Qs
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectAllHandpick}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Select All ({filteredHandpickQuestions.length})
                  </button>

                  <button
                    type="button"
                    onClick={handleClearHandpick}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Clear Selection
                  </button>

                  {/* Bulk Delete Button */}
                  {handpickedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteFromBank}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                      title="Delete all selected questions from bank"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({handpickedIds.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* Search */}
                <div className="relative sm:col-span-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={handpickSearch}
                    onChange={(e) => setHandpickSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                {/* Topic filter */}
                <select
                  value={handpickTopicFilter}
                  onChange={(e) => setHandpickTopicFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="all">All Topics</option>
                  {registeredTopics.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.labelHindi}
                    </option>
                  ))}
                </select>

                {/* Exam Tag filter */}
                <select
                  value={handpickExamFilter}
                  onChange={(e) => setHandpickExamFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="all">All Exam Years</option>
                  <option value="2024">Bihar STET 2024</option>
                  <option value="2023">Bihar STET 2023</option>
                  <option value="Tre 3.0">BPSC TRE 3.0</option>
                  <option value="Tre 2.0">BPSC TRE 2.0</option>
                  <option value="Tre 1.0">BPSC TRE 1.0</option>
                  <option value="custom">Custom Added Questions</option>
                </select>
              </div>

              {/* Questions Picker List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredHandpickQuestions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No questions match current filters. Try changing the topic or exam filter.
                  </div>
                ) : (
                  filteredHandpickQuestions.map((q, idx) => {
                    const isChecked = handpickedIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleHandpickId(q.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer flex items-start gap-3 transition-colors ${
                          isChecked
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-950 dark:text-blue-100 shadow-2xs'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-500">#{idx + 1}</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {q.topicNameHindi}
                              </span>
                              <span className="text-[11px] text-slate-400">{q.exam}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this question from your Question Bank?')) {
                                  deleteMultipleQuestions([q.id]);
                                  setAllBankQuestions(getAllQuestionBank());
                                  setHandpickedIds((prev) => prev.filter((id) => id !== q.id));
                                  setBulkStatusMsg('Question deleted from Question Bank.');
                                  setTimeout(() => setBulkStatusMsg(null), 2500);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete Question from Question Bank"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                            {q.questionText}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* MODE 3: DIRECT PDF / RAW TEXT PASTE */}
          {creationMode === 'direct_paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Paste Questions to Instantly Generate Test
              </label>
              <textarea
                rows={7}
                value={directPasteText}
                onChange={(e) => handleDirectPasteChange(e.target.value)}
                placeholder={`Paste questions with 5 options (a, b, c, d, e), answer keys, and Hindi explanations directly here.\n\nExample:\nप्रश्न 1. दो संख्याओं का म.स. 16 है...\n(a) 100 (b) 200 (c) 300 (d) 400 (e) उपर्युक्त में से कोई नहीं\nउत्तर: (b)\nव्याख्या: म.स. × ल.स. = दो संख्याओं का गुणनफल`}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-y"
              />

              {directParsedQuestions.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{directParsedQuestions.length} Questions successfully parsed & ready for test!</span>
                </div>
              )}
            </div>
          )}

          {/* Time Duration & Randomization Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Timer Duration</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTimeMode('auto')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    timeMode === 'auto'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  1 Min / Question ({totalQuestionsCount} Mins)
                </button>

                <button
                  type="button"
                  onClick={() => setTimeMode('custom')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                    timeMode === 'custom'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>Custom:</span>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={customTimeMinutes}
                    onChange={(e) => setCustomTimeMinutes(parseInt(e.target.value, 10) || 20)}
                    className="w-12 bg-white dark:bg-slate-900 border border-emerald-400 rounded px-1 text-center"
                  />
                  <span>Mins</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Question Order
              </label>
              <select
                value={selectionMode}
                onChange={(e) => setSelectionMode(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="random">🎲 Random Shuffle (Every attempt unpredictable)</option>
                <option value="sequential">📋 Sequential Order (From Start)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Total Test Size:{' '}
            <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
              {totalQuestionsCount} Questions
            </span>{' '}
            ·{' '}
            <span className="text-emerald-600 dark:text-emerald-400">
              {timeMode === 'auto' ? totalQuestionsCount : customTimeMinutes} Minutes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              disabled={totalQuestionsCount === 0}
              onClick={() => handleCreateTestSet(false)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-emerald-500" />
              <span>Save to My Tests</span>
            </button>

            <button
              disabled={totalQuestionsCount === 0}
              onClick={() => handleCreateTestSet(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Save & Start Test Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
