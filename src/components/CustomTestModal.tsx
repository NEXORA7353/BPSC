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
  Trash2,
  Zap,
  Save,
  Target,
  Flame,
  Trophy,
  History,
  ListOrdered,
  Check,
  RotateCcw,
  SlidersHorizontal,
  CheckCheck
} from 'lucide-react';
import { CustomTestConfig, MockTestSet, RegisteredTopic, Question } from '../types';
import {
  getAllQuestionBank,
  createCustomMockTest,
  getAllRegisteredTopics,
  registerNewTopic,
  deleteMultipleQuestions,
  getBookmarkedIds,
  getUsedQuestionsInfo
} from '../utils/questionBankStorage';
import { parseBulkQuestionText } from '../utils/questionParser';

interface CustomTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomTest: (testSet: MockTestSet) => void;
  onOpenBulkImport?: (topicKey?: string) => void;
}

type TitleStyle = 'mock' | 'sprint' | 'grand' | 'drill';

// Quick Topic Group Definitions for fast multi-topic selection
const TOPIC_PRESETS = [
  {
    id: 'arithmetic',
    name: 'अंकगणित कोर (Core Arithmetic)',
    keys: ['number_system', 'lcm_hcf', 'percentage', 'profit_loss', 'ratio_proportion', 'average']
  },
  {
    id: 'commercial',
    name: 'व्यावसायिक गणित (Commercial)',
    keys: ['simple_interest', 'compound_interest', 'discount', 'partnership']
  },
  {
    id: 'work_motion',
    name: 'समय, कार्य एवं गति (Motion & Work)',
    keys: ['time_work', 'pipe_cistern', 'time_distance', 'boats_stream']
  },
  {
    id: 'adv_math',
    name: 'बीजगणित व ज्यामिति (Advanced)',
    keys: ['equations', 'progression', 'trigonometry', 'mensuration', 'geometry', 'coordinate_geometry']
  }
];

export function CustomTestModal({
  isOpen,
  onClose,
  onStartCustomTest,
  onOpenBulkImport
}: CustomTestModalProps) {
  const [creationMode, setCreationMode] = useState<'topic_distribution' | 'handpick' | 'direct_paste'>('topic_distribution');

  // Topics & Questions State
  const [registeredTopics, setRegisteredTopics] = useState<RegisteredTopic[]>(() => getAllRegisteredTopics());
  const [allBankQuestions, setAllBankQuestions] = useState<Question[]>(() => getAllQuestionBank());
  const bookmarkedIds = useMemo(() => getBookmarkedIds(), [isOpen]);

  // Used Questions Tracker
  const { usedIds, usedTextSet, questionUsageMap } = useMemo(() => {
    return getUsedQuestionsInfo();
  }, [isOpen, allBankQuestions]);

  const isQuestionUsed = (q: Question) => {
    if (usedIds.has(q.id)) return true;
    const norm = q.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
    return norm.length > 5 && usedTextSet.has(norm);
  };

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

  // Topic Breakdown in DB (Total, Fresh, Used)
  const topicStats = useMemo(() => {
    const map: Record<string, { total: number; fresh: number; used: number }> = {};
    allBankQuestions.forEach((q) => {
      if (!map[q.topic]) map[q.topic] = { total: 0, fresh: 0, used: 0 };
      map[q.topic].total += 1;
      if (isQuestionUsed(q)) {
        map[q.topic].used += 1;
      } else {
        map[q.topic].fresh += 1;
      }
    });
    return map;
  }, [allBankQuestions, usedIds, usedTextSet]);

  // Multi-Topic Selection & Distribution State
  const [selectedTopicKeys, setSelectedTopicKeys] = useState<string[]>(['lcm_hcf', 'percentage', 'profit_loss']);
  const [topicDistribution, setTopicDistribution] = useState<Record<string, number>>(() => ({
    lcm_hcf: 10,
    percentage: 10,
    profit_loss: 10
  }));
  const [preferUnused, setPreferUnused] = useState<boolean>(true);
  const [topicSearchQuery, setTopicSearchQuery] = useState('');

  // Handpick state: set of question IDs
  const [handpickedIds, setHandpickedIds] = useState<string[]>([]);
  const [handpickSearch, setHandpickSearch] = useState('');
  const [handpickTopicFilter, setHandpickTopicFilter] = useState('all');
  const [handpickExamFilter, setHandpickExamFilter] = useState('all');
  const [handpickUsageFilter, setHandpickUsageFilter] = useState<'all' | 'fresh' | 'used'>('all');
  const [handpickOnlyBookmarks, setHandpickOnlyBookmarks] = useState(false);

  // Direct paste state
  const [directPasteText, setDirectPasteText] = useState('');
  const [directParsedQuestions, setDirectParsedQuestions] = useState<Question[]>([]);

  // Common Test Settings & Smart Title
  const [testTitle, setTestTitle] = useState('BPSC TRE 4.0: स्पेशल मॉक टेस्ट');
  const [isTitleCustomLocked, setIsTitleCustomLocked] = useState(false);
  const [titleStyle, setTitleStyle] = useState<TitleStyle>('mock');
  const [timeMode, setTimeMode] = useState<'auto' | 'custom'>('auto');
  const [customTimeMinutes, setCustomTimeMinutes] = useState<number>(30);
  const [selectionMode, setSelectionMode] = useState<'random' | 'sequential'>('random');
  const [negativeMarking, setNegativeMarking] = useState<number>(0.33);

  // In-place New Topic Creator
  const [isAddingNewTopic, setIsAddingNewTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // Status message toast
  const [bulkStatusMsg, setBulkStatusMsg] = useState<string | null>(null);

  // Total questions count calculation
  const totalQuestionsCount = useMemo(() => {
    if (creationMode === 'topic_distribution') {
      return selectedTopicKeys.reduce((sum, key) => sum + (topicDistribution[key] || 0), 0);
    }
    if (creationMode === 'handpick') {
      return handpickedIds.length;
    }
    if (creationMode === 'direct_paste') {
      return directParsedQuestions.length;
    }
    return 0;
  }, [creationMode, selectedTopicKeys, topicDistribution, handpickedIds, directParsedQuestions]);

  // SMART TITLE GENERATOR ENGINE
  const generateSmartTitle = (
    keys: string[],
    count: number,
    style: TitleStyle = titleStyle,
    customSubject?: string
  ): string => {
    const prefix = 'BPSC TRE 4.0';
    let suffix = 'स्पेशल मॉक टेस्ट';
    if (style === 'sprint') suffix = 'रैपिड स्पीड टेस्ट';
    else if (style === 'grand') suffix = 'महा-मॉक CBT सिमुलेशन';
    else if (style === 'drill') suffix = 'अध्यायवार गहन अभ्यास';

    const countLabel = count > 0 ? ` (${count} प्रश्न)` : '';

    if (customSubject) {
      return `${prefix}: ${customSubject} ${suffix}${countLabel}`;
    }

    if (keys.length === 0) {
      return `${prefix}: कस्टम गणित ${suffix}${countLabel}`;
    }

    const topicNames = keys
      .map((k) => registeredTopics.find((t) => t.key === k)?.labelHindi.split('(')[0].trim())
      .filter(Boolean) as string[];

    if (topicNames.length === 1) {
      return `${prefix}: ${topicNames[0]} ${suffix}${countLabel}`;
    }
    if (topicNames.length === 2) {
      return `${prefix}: ${topicNames[0]} एवं ${topicNames[1]} कंबाइंड टेस्ट${countLabel}`;
    }
    if (topicNames.length === 3) {
      return `${prefix}: ${topicNames[0]}, ${topicNames[1]} व ${topicNames[2]} संयुक्त मॉक${countLabel}`;
    }
    if (topicNames.length >= 4 && topicNames.length <= 6) {
      return `${prefix}: ${topicNames[0]}, ${topicNames[1]} + ${topicNames.length - 2} अध्याय महा-मॉक${countLabel}`;
    }
    return `${prefix}: गणित संपूर्ण पाठ्यक्रम फुल लेंथ मॉक${countLabel}`;
  };

  // Sync auto title when topics or counts change (if not manually locked by user)
  useEffect(() => {
    if (isTitleCustomLocked) return;

    if (creationMode === 'topic_distribution') {
      const activeKeys = selectedTopicKeys.filter((k) => (topicDistribution[k] || 0) > 0);
      setTestTitle(generateSmartTitle(activeKeys, totalQuestionsCount, titleStyle));
    } else if (creationMode === 'handpick') {
      const pickedQuestions = allBankQuestions.filter((q) => handpickedIds.includes(q.id));
      const distinctTopicKeys = Array.from(new Set(pickedQuestions.map((q) => q.topic)));
      setTestTitle(generateSmartTitle(distinctTopicKeys, handpickedIds.length, titleStyle));
    } else if (creationMode === 'direct_paste') {
      setTestTitle(generateSmartTitle([], directParsedQuestions.length, titleStyle, 'इंपोर्टेड नोट्स'));
    }
  }, [
    creationMode,
    selectedTopicKeys,
    topicDistribution,
    handpickedIds,
    directParsedQuestions.length,
    titleStyle,
    isTitleCustomLocked,
    registeredTopics
  ]);

  // Topic Multi-Select Toggle
  const toggleTopicSelection = (topicKey: string) => {
    if (selectedTopicKeys.includes(topicKey)) {
      const newKeys = selectedTopicKeys.filter((k) => k !== topicKey);
      setSelectedTopicKeys(newKeys);
      const updatedDist = { ...topicDistribution, [topicKey]: 0 };
      setTopicDistribution(updatedDist);
    } else {
      const newKeys = [...selectedTopicKeys, topicKey];
      setSelectedTopicKeys(newKeys);
      const currentCount = topicDistribution[topicKey] || 10;
      setTopicDistribution({ ...topicDistribution, [topicKey]: currentCount });
    }
  };

  // Handle distribution count update
  const handleDistributionCountChange = (topicKey: string, count: number) => {
    const val = Math.max(0, count);
    setTopicDistribution((prev) => ({ ...prev, [topicKey]: val }));
    if (val > 0 && !selectedTopicKeys.includes(topicKey)) {
      setSelectedTopicKeys((prev) => [...prev, topicKey]);
    }
  };

  // Quick Distribute Question Count across selected topics
  const distributeEqually = (targetTotal: number) => {
    const targets = selectedTopicKeys.length > 0 ? selectedTopicKeys : ['lcm_hcf', 'percentage', 'profit_loss'];
    if (selectedTopicKeys.length === 0) {
      setSelectedTopicKeys(targets);
    }
    const perTopic = Math.floor(targetTotal / targets.length);
    const rem = targetTotal % targets.length;

    const newDist: Record<string, number> = {};
    targets.forEach((key, idx) => {
      newDist[key] = perTopic + (idx < rem ? 1 : 0);
    });

    setTopicDistribution((prev) => ({ ...prev, ...newDist }));
    setBulkStatusMsg(`Distributed ${targetTotal} questions equally across ${targets.length} selected chapters.`);
    setTimeout(() => setBulkStatusMsg(null), 2500);
  };

  // Preset Group Applicator
  const applyTopicGroupPreset = (presetKeys: string[]) => {
    setSelectedTopicKeys(presetKeys);
    const perTopic = Math.max(5, Math.floor(30 / presetKeys.length));
    const newDist: Record<string, number> = {};
    presetKeys.forEach((key) => {
      newDist[key] = perTopic;
    });
    setTopicDistribution((prev) => ({ ...prev, ...newDist }));
    setIsTitleCustomLocked(false);
    setBulkStatusMsg(`Selected ${presetKeys.length} chapters.`);
    setTimeout(() => setBulkStatusMsg(null), 2000);
  };

  // Filtered Handpick Questions
  const filteredHandpickQuestions = useMemo(() => {
    return allBankQuestions.filter((q) => {
      const matchesTopic = handpickTopicFilter === 'all' || q.topic === handpickTopicFilter;
      const matchesExam =
        handpickExamFilter === 'all' ||
        (handpickExamFilter === 'custom' && q.isUserAdded) ||
        q.exam.toLowerCase().includes(handpickExamFilter.toLowerCase());
      const matchesBookmark = !handpickOnlyBookmarks || bookmarkedIds.includes(q.id);
      const isUsed = isQuestionUsed(q);
      const matchesUsage =
        handpickUsageFilter === 'all' ||
        (handpickUsageFilter === 'fresh' && !isUsed) ||
        (handpickUsageFilter === 'used' && isUsed);
      const matchesSearch =
        !handpickSearch ||
        q.questionText.toLowerCase().includes(handpickSearch.toLowerCase()) ||
        q.exam.toLowerCase().includes(handpickSearch.toLowerCase());

      return matchesTopic && matchesExam && matchesBookmark && matchesUsage && matchesSearch;
    });
  }, [
    allBankQuestions,
    handpickTopicFilter,
    handpickExamFilter,
    handpickOnlyBookmarks,
    handpickUsageFilter,
    handpickSearch,
    bookmarkedIds,
    usedIds,
    usedTextSet
  ]);

  if (!isOpen) return null;

  // Handpick Selection Helpers
  const toggleHandpickId = (id: string) => {
    setHandpickedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectCount = (count: number, onlyFresh: boolean = false) => {
    const pool = onlyFresh
      ? filteredHandpickQuestions.filter((q) => !isQuestionUsed(q))
      : filteredHandpickQuestions;

    const idsToSelect = pool.slice(0, count).map((q) => q.id);
    setHandpickedIds((prev) => Array.from(new Set([...prev, ...idsToSelect])));
    setBulkStatusMsg(`Added ${idsToSelect.length} ${onlyFresh ? 'Fresh' : ''} questions to selection.`);
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

  // In-place New Topic Creation
  const handleCreateNewTopic = () => {
    if (!newTopicHindi.trim()) return;
    const created = registerNewTopic('', newTopicHindi, newTopicEnglish || newTopicHindi);
    setRegisteredTopics(getAllRegisteredTopics());
    setSelectedTopicKeys((prev) => [...prev, created.key]);
    setTopicDistribution((prev) => ({ ...prev, [created.key]: 10 }));
    setIsAddingNewTopic(false);
    setNewTopicHindi('');
    setNewTopicEnglish('');
  };

  // Quick Preset Test Sprints
  const applySprintPreset = (count: number, style: TitleStyle, customTitleSuffix: string) => {
    setCreationMode('topic_distribution');
    setTimeMode('auto');
    setTitleStyle(style);
    setIsTitleCustomLocked(false);

    const activeKeys = selectedTopicKeys.length > 0 ? selectedTopicKeys : ['number_system', 'percentage', 'profit_loss'];
    if (selectedTopicKeys.length === 0) setSelectedTopicKeys(activeKeys);

    const perTopic = Math.floor(count / activeKeys.length);
    const rem = count % activeKeys.length;
    const newDist: Record<string, number> = {};
    activeKeys.forEach((k, i) => {
      newDist[k] = perTopic + (i < rem ? 1 : 0);
    });
    setTopicDistribution((prev) => ({ ...prev, ...newDist }));
    setTestTitle(`BPSC TRE 4.0: ${customTitleSuffix} (${count} प्रश्न)`);
    setIsTitleCustomLocked(true);
  };

  // Create Mock Test
  const handleCreateTestSet = (autoStart: boolean = false) => {
    const finalTime = timeMode === 'auto' ? Math.max(5, totalQuestionsCount) : customTimeMinutes;

    const activeTopics = creationMode === 'topic_distribution'
      ? selectedTopicKeys.filter((k) => (topicDistribution[k] || 0) > 0)
      : undefined;

    const config: CustomTestConfig = {
      title: testTitle.trim() || `BPSC TRE 4.0 Custom Test (${totalQuestionsCount} Qs)`,
      creationMode,
      selectedTopics: activeTopics && activeTopics.length > 0 ? activeTopics : selectedTopicKeys,
      topicDistribution: creationMode === 'topic_distribution' ? topicDistribution : undefined,
      specificQuestionIds: creationMode === 'handpick' ? handpickedIds : undefined,
      directQuestions: creationMode === 'direct_paste' ? directParsedQuestions : undefined,
      questionCount: totalQuestionsCount,
      timeMinutes: finalTime,
      selectionMode,
      negativeMarking,
      targetExam: 'BPSC TRE 4.0 Mathematics (Custom Studio)',
      preferUnused: preferUnused
    };

    const newTestSet = createCustomMockTest(config);

    if (autoStart) {
      onStartCustomTest(newTestSet);
      onClose();
    } else {
      setBulkStatusMsg('Custom Test Created & Saved to My Tests!');
      setTimeout(() => {
        setBulkStatusMsg(null);
        onClose();
      }, 700);
    }
  };

  // Filtered topics for search in distribution view
  const visibleRegisteredTopics = registeredTopics.filter((t) => {
    if (!topicSearchQuery) return true;
    const q = topicSearchQuery.toLowerCase();
    return (
      t.labelHindi.toLowerCase().includes(q) ||
      t.labelEnglish.toLowerCase().includes(q) ||
      t.key.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight">
                  Custom Test Studio & Creator
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  BPSC TRE 4.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-chapter selector, fresh vs used question intelligence, and smart title generator
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

        {/* Quick Presets Bar (Clean Lucide Icons, NO Emojis) */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs shrink-0">
          <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mr-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Presets:</span>
          </span>
          <button
            type="button"
            onClick={() => applySprintPreset(10, 'sprint', '10 Qs Rapid Sprint')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>10 Qs Rapid (10m)</span>
          </button>
          <button
            type="button"
            onClick={() => applySprintPreset(15, 'sprint', '15 Qs Speed Mock')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>15 Qs Speed Mock (15m)</span>
          </button>
          <button
            type="button"
            onClick={() => applySprintPreset(20, 'mock', '20 Qs Power Test')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>20 Qs Power Test (20m)</span>
          </button>
          <button
            type="button"
            onClick={() => applySprintPreset(30, 'grand', '30 Qs Grand CBT Simulation')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>30 Qs Grand Mock (30m)</span>
          </button>
        </div>

        {/* Creation Modes Tabs */}
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
            <span>Multi-Topic Chapter Selection ({selectedTopicKeys.length})</span>
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
            <span>Direct PDF / Notes Paste</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Notification Toast */}
          {bulkStatusMsg && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{bulkStatusMsg}</span>
            </div>
          )}

          {/* Test Title & Smart Auto Generator Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Title & Smart Generator</span>
              </label>

              <div className="flex items-center gap-2">
                {isTitleCustomLocked ? (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Custom Title
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Auto-Generated
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsTitleCustomLocked(false);
                    const activeKeys = creationMode === 'topic_distribution'
                      ? selectedTopicKeys.filter((k) => (topicDistribution[k] || 0) > 0)
                      : [];
                    setTestTitle(generateSmartTitle(activeKeys, totalQuestionsCount, titleStyle));
                    setBulkStatusMsg('Smart title updated based on chosen chapters.');
                    setTimeout(() => setBulkStatusMsg(null), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Regenerate Title Automatically"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Auto-Generate</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testTitle}
                onChange={(e) => {
                  setTestTitle(e.target.value);
                  setIsTitleCustomLocked(true);
                }}
                placeholder="Enter custom test title or let smart system auto-generate..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={titleStyle}
                onChange={(e) => {
                  const newStyle = e.target.value as TitleStyle;
                  setTitleStyle(newStyle);
                  setIsTitleCustomLocked(false);
                  const activeKeys = creationMode === 'topic_distribution' ? selectedTopicKeys : [];
                  setTestTitle(generateSmartTitle(activeKeys, totalQuestionsCount, newStyle));
                }}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                title="Choose Title Format Style"
              >
                <option value="mock">मॉक टेस्ट (Mock Test)</option>
                <option value="sprint">रैपिड टेस्ट (Speed Sprint)</option>
                <option value="grand">महा-मॉक (Grand CBT)</option>
                <option value="drill">गहन अभ्यास (Chapter Drill)</option>
              </select>
            </div>
          </div>

          {/* MODE 1: MULTI-TOPIC SELECTION & DISTRIBUTION */}
          {creationMode === 'topic_distribution' && (
            <div className="space-y-4">
              {/* Quick Multi-Topic Presets & Controls */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-blue-600" />
                    <span>Multi-Topic Chapter Selection (अध्याय चुनें):</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allKeys = registeredTopics.map((t) => t.key);
                        setSelectedTopicKeys(allKeys);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Select All ({registeredTopics.length})
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTopicKeys([])}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Chapter Group Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_PRESETS.map((p) => {
                    const isAllSelected = p.keys.every((k) => selectedTopicKeys.includes(k));
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyTopicGroupPreset(p.keys)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isAllSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>

                {/* Equal Distribution Short-Cuts */}
                <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <span>Quick Distribute Total Qs:</span>
                    <button
                      type="button"
                      onClick={() => distributeEqually(15)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600"
                    >
                      15 Qs
                    </button>
                    <button
                      type="button"
                      onClick={() => distributeEqually(25)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600"
                    >
                      25 Qs
                    </button>
                    <button
                      type="button"
                      onClick={() => distributeEqually(30)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600"
                    >
                      30 Qs
                    </button>
                    <button
                      type="button"
                      onClick={() => distributeEqually(50)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600"
                    >
                      50 Qs
                    </button>
                  </div>

                  {/* Prioritize Fresh / Unused Questions Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-700 dark:text-emerald-400">
                    <input
                      type="checkbox"
                      checked={preferUnused}
                      onChange={(e) => setPreferUnused(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Prioritize Fresh Questions (नए अप्रयुक्त प्रश्न पहले लें)</span>
                  </label>
                </div>
              </div>

              {/* Topic Search & Add In-place Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search chapters..."
                    value={topicSearchQuery}
                    onChange={(e) => setTopicSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingNewTopic(!isAddingNewTopic)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Chapter</span>
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

              {/* Topics Grid with Interactive Multi-Selection and Fresh/Used Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleRegisteredTopics.map((topic) => {
                  const stat = topicStats[topic.key] || { total: 0, fresh: 0, used: 0 };
                  const isSelected = selectedTopicKeys.includes(topic.key);
                  const currentSelected = isSelected ? (topicDistribution[topic.key] || 0) : 0;

                  return (
                    <div
                      key={topic.key}
                      onClick={() => toggleTopicSelection(topic.key)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="pt-0.5 shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className={`text-xs font-bold truncate ${isSelected ? 'text-blue-950 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                            {topic.labelHindi}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                              {stat.total} Total
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {stat.fresh} Fresh
                            </span>
                            {stat.used > 0 && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700">·</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                  {stat.used} Used
                                </span>
                              </>
                            )}
                          </div>

                          {stat.total === 0 && onOpenBulkImport && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenBulkImport(topic.key);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-0.5"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Import questions</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Count Stepper for this Topic */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleDistributionCountChange(topic.key, Math.max(0, currentSelected - 5))}
                          disabled={!isSelected || currentSelected <= 0}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min={0}
                          max={Math.max(stat.total, 100)}
                          value={currentSelected}
                          onChange={(e) =>
                            handleDistributionCountChange(topic.key, parseInt(e.target.value, 10) || 0)
                          }
                          disabled={!isSelected}
                          className="w-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-center text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                        />

                        <button
                          type="button"
                          onClick={() => handleDistributionCountChange(topic.key, currentSelected + 5)}
                          disabled={!isSelected}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                        >
                          +
                        </button>

                        <span className="text-xs font-semibold text-slate-500">Qs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: HAND-PICK WITH USED/FRESH MARKERS */}
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
                    {handpickedIds.length} Selected of {filteredHandpickQuestions.length} Filtered
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectCount(10, true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>+ 10 Fresh Qs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCount(20, true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>+ 20 Fresh Qs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCount(10, false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
                  >
                    + First 10 Qs (All)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCount(20, false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
                  >
                    + First 20 Qs (All)
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

              {/* Filters Bar including Usage Filter (Fresh vs Used) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
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

                {/* Usage Filter: Fresh vs Used */}
                <select
                  value={handpickUsageFilter}
                  onChange={(e) => setHandpickUsageFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="all">All Status (Fresh & Used)</option>
                  <option value="fresh">Fresh Only (Never Tested)</option>
                  <option value="used">Used in Tests Only</option>
                </select>

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
                  <option value="all">All Exam Sources</option>
                  <option value="2024">Bihar STET 2024</option>
                  <option value="2023">Bihar STET 2023</option>
                  <option value="Tre 3.0">BPSC TRE 3.0</option>
                  <option value="Tre 2.0">BPSC TRE 2.0</option>
                  <option value="Tre 1.0">BPSC TRE 1.0</option>
                  <option value="custom">Custom Added Questions</option>
                </select>
              </div>

              {/* Questions Picker List with Clear Used / Fresh Badges */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredHandpickQuestions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No questions match current filters. Try changing status or topic filters.
                  </div>
                ) : (
                  filteredHandpickQuestions.map((q, idx) => {
                    const isChecked = handpickedIds.includes(q.id);
                    const isUsed = isQuestionUsed(q);
                    const testsList = questionUsageMap.get(q.id) || [];

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
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-500">#{idx + 1}</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {q.topicNameHindi}
                              </span>

                              {/* Fresh vs Used Marker Badge */}
                              {isUsed ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold"
                                  title={testsList.length > 0 ? `Already used in: ${testsList.join(', ')}` : 'Used in mock test'}
                                >
                                  <History className="w-3 h-3 text-amber-500" />
                                  <span>Used in Mock {testsList.length > 0 ? `(${testsList.length})` : ''}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                  <Sparkles className="w-3 h-3 text-emerald-500" />
                                  <span>Fresh Question</span>
                                </span>
                              )}

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

          {/* MODE 3: DIRECT RAW TEXT PASTE */}
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

          {/* Time Duration, Order & Negative Penalty Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            {/* Timer Duration */}
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
                  1 Min / Q ({totalQuestionsCount} Mins)
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

            {/* Question Order (Clean text, No emojis) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-blue-500" />
                <span>Question Order</span>
              </label>
              <select
                value={selectionMode}
                onChange={(e) => setSelectionMode(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="random">Random Shuffle (अनियमित क्रम - हर बार नया क्रम)</option>
                <option value="sequential">Sequential Order (क्रमवार - अध्याय के अनुसार)</option>
              </select>
            </div>

            {/* Negative Marking */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Negative Penalty</span>
              </label>
              <select
                value={negativeMarking}
                onChange={(e) => setNegativeMarking(parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value={0.33}>-0.33 (BPSC TRE 4.0 Standard)</option>
                <option value={0.25}>-0.25 (1/4 Negative)</option>
                <option value={0.0}>0.00 (No Negative Penalty)</option>
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
