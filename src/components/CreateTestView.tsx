import { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  Zap,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Check,
  Plus,
  Trash2,
  Shuffle,
  FileDown,
  RotateCcw,
  Target,
  Trophy,
  Flame,
  CheckSquare,
  Square,
  HelpCircle
} from 'lucide-react';
import { CustomTestConfig, MockTestSet, RegisteredTopic, Question } from '../types';
import {
  getAllQuestionBank,
  createCustomMockTest,
  getAllRegisteredTopics,
  registerNewTopic,
  deleteMultipleQuestions,
  getBookmarkedIds,
  getUsedQuestionsInfo,
  saveCustomTest,
  cleanTitleToEnglish
} from '../utils/questionBankStorage';
import { parseBulkQuestionText } from '../utils/questionParser';
import { generateStandaloneHtml } from '../utils/exportHtml';
import { saveTestSetToCloud } from '../services/firebaseSyncService';
import { MathText } from './MathText';
import { BackButton } from './BackButton';

interface CreateTestViewProps {
  onBack: () => void;
  onStartTest: (testSet: MockTestSet) => void;
  onOpenBulkImport?: (topicKey?: string) => void;
  preselectedTopic?: string;
}

type TitleStyle = 'mock' | 'sprint' | 'grand' | 'drill';

const TOPIC_PRESETS = [
  {
    id: 'arithmetic',
    name: 'Core Arithmetic',
    keys: ['number_system', 'lcm_hcf', 'percentage', 'profit_loss', 'ratio_proportion', 'average']
  },
  {
    id: 'commercial',
    name: 'Commercial Mathematics',
    keys: ['simple_interest', 'compound_interest', 'discount', 'partnership']
  },
  {
    id: 'work_motion',
    name: 'Motion, Work & Distance',
    keys: ['time_work', 'pipe_cistern', 'time_distance', 'boats_stream']
  },
  {
    id: 'adv_math',
    name: 'Algebra & Geometry',
    keys: ['equations', 'progression', 'trigonometry', 'mensuration', 'geometry', 'coordinate_geometry']
  }
];

export function CreateTestView({
  onBack,
  onStartTest,
  onOpenBulkImport,
  preselectedTopic
}: CreateTestViewProps) {
  // Stepper State: 1 = Mode & Config, 2 = Quotas & Selection, 3 = Blueprint & Launch
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Creation Mode
  const [creationMode, setCreationMode] = useState<'topic_distribution' | 'handpick' | 'quick_sprint' | 'direct_paste'>('topic_distribution');

  // Topics & Questions State
  const [registeredTopics, setRegisteredTopics] = useState<RegisteredTopic[]>(() => getAllRegisteredTopics());
  const [allBankQuestions, setAllBankQuestions] = useState<Question[]>(() => getAllQuestionBank());
  const bookmarkedIds = useMemo(() => getBookmarkedIds(), []);

  // Used Questions Tracker
  const { usedIds, usedTextSet, questionUsageMap } = useMemo(() => {
    return getUsedQuestionsInfo();
  }, [allBankQuestions]);

  const isQuestionUsed = (q: Question) => {
    if (usedIds.has(q.id)) return true;
    const norm = q.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
    return norm.length > 5 && usedTextSet.has(norm);
  };

  // Form Parameters
  const [testTitle, setTestTitle] = useState(() => {
    if (preselectedTopic) {
      const topics = getAllRegisteredTopics();
      const topicObj = topics.find((t) => t.key === preselectedTopic);
      if (topicObj) {
        const engName = cleanTitleToEnglish(topicObj.labelEnglish || topicObj.labelHindi || topicObj.key);
        return `BPSC TRE 4.0: ${engName} Mock Test`;
      }
    }
    return 'BPSC TRE 4.0: Mathematics Mock Test';
  });
  const [titleStyle, setTitleStyle] = useState<TitleStyle>('mock');
  const [isTitleCustomLocked, setIsTitleCustomLocked] = useState(false);

  // Time & Exam Setup
  const [timeMode, setTimeMode] = useState<'auto' | 'custom'>('auto');
  const [customTimeMinutes, setCustomTimeMinutes] = useState(20);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [preferUnused, setPreferUnused] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'random' | 'all'>('random');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(''); // YYYY-MM-DDTHH:mm
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Topic Distribution Map
  const [selectedTopicKeys, setSelectedTopicKeys] = useState<string[]>(() => {
    if (preselectedTopic) return [preselectedTopic];
    const initial = getAllRegisteredTopics().slice(0, 4).map((t) => t.key);
    return initial.length > 0 ? initial : ['percentage', 'profit_loss', 'lcm_hcf'];
  });

  const [topicDistribution, setTopicDistribution] = useState<Record<string, number>>(() => {
    const dist: Record<string, number> = {};
    if (preselectedTopic) {
      dist[preselectedTopic] = 20;
      return dist;
    }
    const topics = getAllRegisteredTopics();
    topics.slice(0, 4).forEach((t) => {
      dist[t.key] = 5;
    });
    return dist;
  });

  // Automatically sync preselected topic changes
  useEffect(() => {
    if (preselectedTopic) {
      const topicObj = registeredTopics.find((t) => t.key === preselectedTopic);
      if (topicObj) {
        const engName = cleanTitleToEnglish(topicObj.labelEnglish || topicObj.labelHindi || topicObj.key);
        setTestTitle(`BPSC TRE 4.0: ${engName} Mock Test`);
        setSelectedTopicKeys([preselectedTopic]);
        setTopicDistribution({ [preselectedTopic]: 20 });
      }
    }
  }, [preselectedTopic, registeredTopics]);

  // Handpick Selection
  const [handpickedIds, setHandpickedIds] = useState<string[]>([]);
  const [handpickSearch, setHandpickSearch] = useState('');
  const [handpickTopicFilter, setHandpickTopicFilter] = useState('all');
  const [handpickUsageFilter, setHandpickUsageFilter] = useState<'all' | 'unused' | 'used'>('all');
  const [handpickOnlyBookmarks, setHandpickOnlyBookmarks] = useState(false);

  // Direct Paste
  const [directPasteText, setDirectPasteText] = useState('');
  const [directParsedQuestions, setDirectParsedQuestions] = useState<Question[]>([]);

  // Generated Preview Set
  const [generatedPreviewSet, setGeneratedPreviewSet] = useState<MockTestSet | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Topic Search & Registration
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [isAddingNewTopic, setIsAddingNewTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // Count available questions per topic
  const questionsPerTopic = useMemo(() => {
    const map: Record<string, { total: number; unused: number; used: number }> = {};
    registeredTopics.forEach((t) => {
      map[t.key] = { total: 0, unused: 0, used: 0 };
    });
    allBankQuestions.forEach((q) => {
      const k = q.topic || 'custom';
      if (!map[k]) map[k] = { total: 0, unused: 0, used: 0 };
      map[k].total += 1;
      if (isQuestionUsed(q)) {
        map[k].used += 1;
      } else {
        map[k].unused += 1;
      }
    });
    return map;
  }, [allBankQuestions, registeredTopics, usedIds, usedTextSet]);

  // Total Questions Count live calculation
  const totalQuestionsCount = useMemo(() => {
    if (creationMode === 'topic_distribution' || creationMode === 'quick_sprint') {
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

  // Total Duration Calculation
  const totalMinutes = useMemo(() => {
    if (timeMode === 'auto') {
      return Math.max(5, totalQuestionsCount);
    }
    return customTimeMinutes;
  }, [timeMode, totalQuestionsCount, customTimeMinutes]);

  // Direct Paste Live Parser
  useEffect(() => {
    if (creationMode === 'direct_paste' && directPasteText.trim()) {
      const res = parseBulkQuestionText(directPasteText, 'custom', 'BPSC TRE 4.0');
      setDirectParsedQuestions(res.questions);
    } else if (creationMode === 'direct_paste') {
      setDirectParsedQuestions([]);
    }
  }, [creationMode, directPasteText]);

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
    setStatusNotification(`Chapter "${newTopicEnglish || newTopicHindi}" registered successfully!`);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Quick Sprint Presets
  const applySprintPreset = (count: number, style: TitleStyle, customTitleSuffix: string) => {
    setCreationMode('quick_sprint');
    setTimeMode('auto');
    setTitleStyle(style);

    const activeKeys = selectedTopicKeys.length > 0 ? selectedTopicKeys : ['number_system', 'percentage', 'profit_loss'];
    if (selectedTopicKeys.length === 0) setSelectedTopicKeys(activeKeys);

    const perTopic = Math.max(1, Math.floor(count / activeKeys.length));
    const rem = count % activeKeys.length;
    const newDist: Record<string, number> = {};
    activeKeys.forEach((k, i) => {
      newDist[k] = perTopic + (i < rem ? 1 : 0);
    });
    setTopicDistribution((prev) => ({ ...prev, ...newDist }));
    setTestTitle(`BPSC TRE 4.0: ${customTitleSuffix} (${count} Qs)`);
    setIsTitleCustomLocked(true);
  };

  // Handpick filtering
  const filteredHandpickQuestions = useMemo(() => {
    return allBankQuestions.filter((q) => {
      const matchesTopic = handpickTopicFilter === 'all' || q.topic === handpickTopicFilter;
      const matchesBookmark = !handpickOnlyBookmarks || bookmarkedIds.includes(q.id);
      const used = isQuestionUsed(q);
      const matchesUsage =
        handpickUsageFilter === 'all' ||
        (handpickUsageFilter === 'unused' && !used) ||
        (handpickUsageFilter === 'used' && used);
      const query = handpickSearch.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        q.questionText.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query) ||
        (q.topicNameHindi && q.topicNameHindi.toLowerCase().includes(query));
      return matchesTopic && matchesBookmark && matchesUsage && matchesSearch;
    });
  }, [allBankQuestions, handpickTopicFilter, handpickOnlyBookmarks, handpickUsageFilter, handpickSearch, bookmarkedIds]);

  // Topic filter for Step 2
  const filteredTopics = useMemo(() => {
    if (!topicSearchQuery.trim()) return registeredTopics;
    const q = topicSearchQuery.toLowerCase();
    return registeredTopics.filter(
      (t) =>
        t.labelHindi.toLowerCase().includes(q) ||
        t.labelEnglish.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q)
    );
  }, [registeredTopics, topicSearchQuery]);

  // Step 2 Quota adjustment helpers
  const handleSetTopicCount = (key: string, count: number) => {
    const val = Math.max(0, count);
    setTopicDistribution((prev) => ({ ...prev, [key]: val }));
    if (val > 0 && !selectedTopicKeys.includes(key)) {
      setSelectedTopicKeys((prev) => [...prev, key]);
    } else if (val === 0) {
      setSelectedTopicKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  // Generate Blueprint Object
  const generateBlueprint = (): MockTestSet => {
    const activeTopics = (creationMode === 'topic_distribution' || creationMode === 'quick_sprint')
      ? selectedTopicKeys.filter((k) => (topicDistribution[k] || 0) > 0)
      : undefined;

    const config: CustomTestConfig = {
      title: cleanTitleToEnglish(testTitle.trim() || `BPSC TRE 4.0 Mock Test (${totalQuestionsCount} Qs)`),
      creationMode: creationMode === 'quick_sprint' ? 'topic_distribution' : creationMode,
      selectedTopics: activeTopics && activeTopics.length > 0 ? activeTopics : selectedTopicKeys,
      topicDistribution: (creationMode === 'topic_distribution' || creationMode === 'quick_sprint') ? topicDistribution : undefined,
      specificQuestionIds: creationMode === 'handpick' ? handpickedIds : undefined,
      directQuestions: creationMode === 'direct_paste' ? directParsedQuestions : undefined,
      questionCount: totalQuestionsCount,
      timeMinutes: totalMinutes,
      selectionMode: 'random',
      negativeMarking: negativeMarking ? 0.33 : 0,
      targetExam: 'BPSC TRE 4.0 Mathematics (Custom Studio)',
      preferUnused
    };

    const blueprint = createCustomMockTest(config);
    if (scheduledDateTime) {
      blueprint.scheduledStartAt = new Date(scheduledDateTime).toISOString();
    }
    return blueprint;
  };

  // Move from Step 2 to Step 3
  const handleProceedToBlueprint = () => {
    if (totalQuestionsCount === 0) {
      alert('Please select at least 1 question or allocate a chapter quota!');
      return;
    }
    const blueprint = generateBlueprint();
    setGeneratedPreviewSet(blueprint);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch or Save actions
  const handleStartExamNow = async () => {
    const testSet = generatedPreviewSet || generateBlueprint();
    testSet.isPublished = true;
    testSet.publishedAtIso = testSet.publishedAtIso || new Date().toISOString();
    if (scheduledDateTime) {
      testSet.scheduledStartAt = new Date(scheduledDateTime).toISOString();
    }
    // 1. Save locally
    saveCustomTest(testSet);

    // 2. Persist to Firestore
    try {
      await saveTestSetToCloud(testSet);
    } catch (err) {
      console.warn('Direct cloud test save warning:', err);
    }

    // 3. Notify student and parent in background only upon explicit publication
    fetch('/api/email/notify-new-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId: testSet.id, testData: testSet })
    }).catch((err) => console.warn('Publish email notify error:', err));

    onStartTest(testSet);
  };

  const handlePublishAndNotify = async () => {
    setIsPublishing(true);
    try {
      const testSet = generatedPreviewSet || generateBlueprint();
      testSet.isPublished = true;
      testSet.publishedAtIso = new Date().toISOString();
      if (scheduledDateTime) {
        testSet.scheduledStartAt = new Date(scheduledDateTime).toISOString();
      }

      // 1. Save locally
      saveCustomTest(testSet);

      // 2. Persist to Firestore FIRST
      try {
        await saveTestSetToCloud(testSet);
      } catch (err) {
        console.warn('Direct cloud test save warning:', err);
      }

      // 3. Dispatch notifications without failing test creation if email errors
      try {
        await fetch('/api/email/notify-new-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: testSet.id, testData: testSet })
        });
      } catch (e) {
        console.warn('Publish email notify error:', e);
      }

      setStatusNotification(`Test "${testSet.title}" published & saved successfully!`);
      setTimeout(() => {
        onBack();
      }, 1400);
    } catch (err: any) {
      alert(`Error publishing test: ${err?.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveToLibraryOnly = () => {
    const testSet = generatedPreviewSet || generateBlueprint();
    testSet.isPublished = false; // Draft only, no email sent
    if (scheduledDateTime) {
      testSet.scheduledStartAt = new Date(scheduledDateTime).toISOString();
    }
    saveCustomTest(testSet);
    setStatusNotification(`Draft test "${testSet.title}" saved to library. (Not published, no emails sent)`);
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  const handleDownloadStandaloneHtml = () => {
    const testSet = generatedPreviewSet || generateBlueprint();
    saveCustomTest(testSet);
    const html = generateStandaloneHtml(testSet);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BPSC_TRE4_${testSet.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusNotification('Offline HTML downloaded successfully!');
    setTimeout(() => setStatusNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-app-canvas grid-lines-44 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-200">
      {/* Top Breadcrumb & Stepper Header */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BackButton onClick={onBack} label="Back to Portal" variant="compact" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                    <span>BPSC Custom Test Studio</span>
                  </h1>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                    TRE 4.0 Standard
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-wise exam builder: Topic distribution, question freshness AI, and instant CBT launch
                </p>
              </div>
            </div>

            {/* Stepper Wizard Progress */}
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
              {/* Step 1 Pill */}
              <button
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 1
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : currentStep > 1
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-white/10'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 1 ? 'bg-slate-950 text-amber-400' : currentStep > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                </span>
                <span className="hidden sm:inline">1. Mode & Setup</span>
              </button>

              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />

              {/* Step 2 Pill */}
              <button
                onClick={() => setCurrentStep(2)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 2
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : currentStep > 2
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-white/10'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 2 ? 'bg-slate-950 text-amber-400' : currentStep > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
                </span>
                <span className="hidden sm:inline">2. Chapters & Questions</span>
              </button>

              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />

              {/* Step 3 Pill */}
              <button
                onClick={() => {
                  if (totalQuestionsCount > 0) handleProceedToBlueprint();
                }}
                disabled={totalQuestionsCount === 0}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 disabled:opacity-40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 3 ? 'bg-slate-950 text-amber-400' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  3
                </span>
                <span className="hidden sm:inline">3. Review & Launch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusNotification && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{statusNotification}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* ======================================================== */}
        {/* STEP 1: MODE & GENERAL TEST CONFIGURATION               */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step 1 Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Step 1 of 3: Choose Test Format & Creation Mode</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                How would you like to build your practice test?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose an intelligent creation mode tailored for BPSC TRE 4.0 Mathematics examination.
              </p>
            </div>

            {/* Mode Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mode A: Chapter Distribution */}
              <div
                onClick={() => setCreationMode('topic_distribution')}
                className={`cursor-pointer p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-4 ${
                  creationMode === 'topic_distribution'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'glass-panel glass-panel-hover'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    Recommended
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Topic Distribution
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select mathematics chapters and assign how many questions you want from each. The smart engine ensures maximum fresh questions.
                  </p>
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Multi-Chapter Balanced Test Generator</span>
                </div>
              </div>

              {/* Mode B: Quick Exam Sprint */}
              <div
                onClick={() => setCreationMode('quick_sprint')}
                className={`cursor-pointer p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-4 ${
                  creationMode === 'quick_sprint'
                    ? 'bg-indigo-500/10 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'glass-panel glass-panel-hover'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    1-Click Instant
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Quick Exam Sprints
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Instantly create pre-balanced tests: 10 Qs Rapid Sprint, 20 Qs Power Test, or 40 Qs Grand Syllabus Mock.
                  </p>
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>10, 20, or 40 Questions Presets</span>
                </div>
              </div>

              {/* Mode C: Handpick Specific Questions */}
              <div
                onClick={() => setCreationMode('handpick')}
                className={`cursor-pointer p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-4 ${
                  creationMode === 'handpick'
                    ? 'bg-blue-500/10 border-blue-500/60 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30'
                    : 'glass-panel glass-panel-hover'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    Handpick Mode
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Handpick Questions
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Browse question bank with search, chapter filters, and bookmarked questions to cherry-pick exact problems.
                  </p>
                </div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Specific Selection ({allBankQuestions.length} in Bank)</span>
                </div>
              </div>

              {/* Mode D: Direct Paste */}
              <div
                onClick={() => setCreationMode('direct_paste')}
                className={`cursor-pointer p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-4 ${
                  creationMode === 'direct_paste'
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                    : 'glass-panel glass-panel-hover'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Direct Entry
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Direct Paste Text
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Paste raw question text directly to generate an on-the-spot test without adding to the permanent bank.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Immediate Test Run</span>
                </div>
              </div>
            </div>

            {/* General Parameters Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                <span>Exam Parameters & Timing</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Title Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Test Title:
                  </label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => {
                      setTestTitle(e.target.value);
                      setIsTitleCustomLocked(true);
                    }}
                    placeholder="Enter mock test title..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400">Quick suggestions:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTestTitle('BPSC TRE 4.0: 20 Qs Mathematics Power Test');
                        setIsTitleCustomLocked(true);
                      }}
                      className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Power Test
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTestTitle('BPSC TRE 4.0: Arithmetic Grand Mock Test');
                        setIsTitleCustomLocked(true);
                      }}
                      className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Grand Mock Test
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTestTitle('BPSC TRE 4.0: 10 Qs Speed Sprint');
                        setIsTitleCustomLocked(true);
                      }}
                      className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Speed Sprint
                    </button>
                  </div>
                </div>

                {/* Duration Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Exam Duration:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTimeMode('auto')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        timeMode === 'auto'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-700 dark:text-amber-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Auto (1 Min / Q)</div>
                      <div className="text-[11px] opacity-80 mt-0.5">BPSC TRE Official Pace</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeMode('custom')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        timeMode === 'custom'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-700 dark:text-amber-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Custom Timer</div>
                      <div className="text-[11px] opacity-80 mt-0.5">{customTimeMinutes} Minutes</div>
                    </button>
                  </div>

                  {timeMode === 'custom' && (
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="range"
                        min="5"
                        max="150"
                        step="5"
                        value={customTimeMinutes}
                        onChange={(e) => setCustomTimeMinutes(Number(e.target.value))}
                        className="flex-1 accent-amber-500"
                      />
                      <span className="font-mono font-black text-sm px-3 py-1 bg-white dark:bg-slate-900 border rounded-xl">
                        {customTimeMinutes} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
                {/* Question Freshness AI */}
                <div
                  onClick={() => setPreferUnused(!preferUnused)}
                  className="cursor-pointer p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Prefer Fresh / Unused Questions</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Auto-skips questions already attempted in previous tests
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors p-1 ${preferUnused ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferUnused ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Negative Marking */}
                <div
                  onClick={() => setNegativeMarking(!negativeMarking)}
                  className="cursor-pointer p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-rose-500" />
                      <span>Negative Marking: -0.33 (BPSC Standard)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      1 mark for correct, -0.33 for wrong, Option (E) 0 penalty
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors p-1 ${negativeMarking ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${negativeMarking ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 CTA Bottom Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-white/10 transition-colors"
              >
                Cancel & Exit
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/25 transition-all active:scale-95 flex items-center gap-2 group"
              >
                <span>Continue to Step 2: Select Questions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: TOPIC QUOTAS & QUESTION SELECTION               */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step 2 Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <span>Step 2 of 3: Chapters & Question Quotas</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Select Question Bank Chapters
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Configure question counts across mathematics topics or select specific questions.
                </p>
              </div>

              {/* Live Selected Pill */}
              <div className="px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-black tracking-wider">Total Allocated</div>
                  <div className="text-xl font-black font-mono leading-none">{totalQuestionsCount} Questions</div>
                </div>
                <div className="w-px h-8 bg-amber-500/30" />
                <div className="text-right">
                  <div className="text-[10px] uppercase font-black tracking-wider">Est. Duration</div>
                  <div className="text-xl font-black font-mono leading-none">{totalMinutes} Mins</div>
                </div>
              </div>
            </div>

            {/* Quick Sprints View in Step 2 */}
            {creationMode === 'quick_sprint' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div
                    onClick={() => applySprintPreset(10, 'sprint', '10 Qs Rapid Sprint')}
                    className={`cursor-pointer p-6 rounded-3xl border transition-all text-center space-y-3 ${
                      totalQuestionsCount === 10
                        ? 'bg-amber-500/15 border-amber-500 shadow-xl ring-2 ring-amber-500/40'
                        : 'glass-panel glass-panel-hover'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center font-black">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">10 Qs Rapid Sprint</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      10 Minutes · Fast Chapter Check · Perfect for quick revision
                    </p>
                    <div className="pt-2">
                      <span className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs inline-block">
                        Select 10 Qs
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => applySprintPreset(20, 'mock', '20 Qs Power Test')}
                    className={`cursor-pointer p-6 rounded-3xl border transition-all text-center space-y-3 ${
                      totalQuestionsCount === 20
                        ? 'bg-indigo-500/15 border-indigo-500 shadow-xl ring-2 ring-indigo-500/40'
                        : 'glass-panel glass-panel-hover'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-500 mx-auto flex items-center justify-center font-black">
                      <Flame className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">20 Qs Power Mock</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      20 Minutes · Core Arithmetic + Commercial · High yield
                    </p>
                    <div className="pt-2">
                      <span className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-xs inline-block">
                        Select 20 Qs
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => applySprintPreset(40, 'grand', '40 Qs Grand Syllabus Mock')}
                    className={`cursor-pointer p-6 rounded-3xl border transition-all text-center space-y-3 ${
                      totalQuestionsCount === 40
                        ? 'bg-emerald-500/15 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40'
                        : 'glass-panel glass-panel-hover'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center font-black">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">40 Qs Grand Mock</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      40 Minutes · Full Examination Syllabus · Complete Test
                    </p>
                    <div className="pt-2">
                      <span className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs inline-block">
                        Select 40 Qs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Topic Distribution View in Step 2 */}
            {(creationMode === 'topic_distribution' || creationMode === 'quick_sprint') && (
              <div className="space-y-6">
                {/* Topic Presets Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                  <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Select Chapters:</span>
                  </span>
                  {TOPIC_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedTopicKeys(p.keys);
                        const dist: Record<string, number> = {};
                        p.keys.forEach((k) => (dist[k] = 5));
                        setTopicDistribution((prev) => ({ ...prev, ...dist }));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold hover:border-amber-500 hover:text-amber-500 transition-colors shadow-2xs"
                    >
                      {p.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const allKeys = registeredTopics.map((t) => t.key);
                      setSelectedTopicKeys(allKeys);
                      const dist: Record<string, number> = {};
                      allKeys.forEach((k) => (dist[k] = 5));
                      setTopicDistribution(dist);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold hover:bg-amber-500/20 transition-colors ml-auto"
                  >
                    Select All Chapters (5 Qs Each)
                  </button>
                </div>

                {/* Chapters Grid with +/- stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTopics.map((topic) => {
                    const stats = questionsPerTopic[topic.key] || { total: 0, unused: 0, used: 0 };
                    const currentVal = topicDistribution[topic.key] || 0;
                    const isSelected = selectedTopicKeys.includes(topic.key) && currentVal > 0;

                    return (
                      <div
                        key={topic.key}
                        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                            : 'glass-panel'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              {topic.labelEnglish || topic.labelHindi}
                            </h4>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {stats.total} in bank
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {topic.labelHindi}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 pt-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {stats.unused} Fresh
                            </span>
                            <span>·</span>
                            <span className="text-slate-400">{stats.used} Used</span>
                          </div>
                        </div>

                        {/* Interactive Counter */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSetTopicCount(topic.key, currentVal - 1)}
                              disabled={currentVal <= 0}
                              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 font-black text-base flex items-center justify-center transition-colors disabled:opacity-30"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={stats.total || 100}
                              value={currentVal}
                              onChange={(e) => handleSetTopicCount(topic.key, parseInt(e.target.value) || 0)}
                              className="w-14 text-center font-mono font-black text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-1 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleSetTopicCount(topic.key, currentVal + 1)}
                              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 font-black text-base flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetTopicCount(topic.key, 5)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                            >
                              5 Qs
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetTopicCount(topic.key, 10)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                            >
                              10 Qs
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Handpick Mode in Step 2 */}
            {creationMode === 'handpick' && (
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[260px] relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions in Hindi or English..."
                      value={handpickSearch}
                      onChange={(e) => setHandpickSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={handpickTopicFilter}
                    onChange={(e) => setHandpickTopicFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="all">All Chapters</option>
                    {registeredTopics.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.labelEnglish || t.labelHindi}
                      </option>
                    ))}
                  </select>

                  <select
                    value={handpickUsageFilter}
                    onChange={(e) => setHandpickUsageFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="all">All Questions</option>
                    <option value="unused">Fresh / Unused Only</option>
                    <option value="used">Previously Used</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setHandpickOnlyBookmarks(!handpickOnlyBookmarks)}
                    className={`px-3 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      handpickOnlyBookmarks
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${handpickOnlyBookmarks ? 'fill-amber-500' : ''}`} />
                    <span>Bookmarks ({bookmarkedIds.length})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const ids = filteredHandpickQuestions.map((q) => q.id);
                        setHandpickedIds((prev) => Array.from(new Set([...prev, ...ids])));
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
                    >
                      Select All Filtered ({filteredHandpickQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHandpickedIds([])}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                {/* Handpick Question Cards */}
                <div className="space-y-3">
                  {filteredHandpickQuestions.map((q, idx) => {
                    const isSelected = handpickedIds.includes(q.id);
                    const isUsed = isQuestionUsed(q);

                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setHandpickedIds((prev) =>
                            prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                          );
                        }}
                        className={`cursor-pointer p-4 sm:p-5 rounded-3xl border transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                            : 'glass-panel glass-panel-hover'
                        }`}
                      >
                        <div className="pt-1">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                              {q.topicNameHindi || q.topic}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {q.exam}
                            </span>
                            {isUsed ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                Previously Used
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Fresh / Unused
                              </span>
                            )}
                          </div>

                          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                            <MathText text={q.questionText} />
                          </div>

                          {/* Options Preview */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
                            {q.options.map((opt) => (
                              <div
                                key={opt.key}
                                className={`p-1.5 rounded-lg border text-center font-medium ${
                                  q.correctOption?.includes(opt.key)
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <span className="uppercase font-bold">({opt.key})</span>{' '}
                                <span className="truncate">{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Paste in Step 2 */}
            {creationMode === 'direct_paste' && (
              <div className="space-y-4">
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Paste Raw Questions Text (BPSC 5-Options Format):
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {directParsedQuestions.length} Questions Detected
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={directPasteText}
                    onChange={(e) => setDirectPasteText(e.target.value)}
                    placeholder="Question 1. If (1/5)^(3x) = 0.008, then find the value of (0.25)^x:&#10;(a) 1.0&#10;(b) 4.0&#10;(c) 0.25&#10;(d) More than one of the above&#10;(e) Unattempted / None of the above&#10;Answer: (c)&#10;Explanation: ..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Step 2 Bottom Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Mode & Settings</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToBlueprint}
                disabled={totalQuestionsCount === 0}
                className="px-8 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/25 transition-all active:scale-95 flex items-center gap-2 group disabled:opacity-40"
              >
                <span>Proceed to Step 3: Review Blueprint ({totalQuestionsCount} Qs)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: BLUEPRINT REVIEW & LAUNCH EXAMINATION           */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step 3 Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Step 3 of 3: Final Blueprint Review & Exam Launch</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Mock Test Ready for Execution!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Review your test blueprint below. You can start the examination immediately in real CBT mode, save to your library, or export offline HTML.
              </p>
            </div>

            {/* Executive Blueprint Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden border-amber-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    BPSC TRE 4.0 Examination Blueprint
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {testTitle}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Created via BPSC Custom Test Studio · Candidate: PrIyA PaTeL
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validated Ready</span>
                  </span>
                </div>
              </div>

              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] font-black uppercase text-slate-400">Total Questions</div>
                  <div className="text-2xl font-black font-mono text-amber-500 mt-1">
                    {totalQuestionsCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">MCQ 5-Options</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] font-black uppercase text-slate-400">Total Time</div>
                  <div className="text-2xl font-black font-mono text-indigo-500 mt-1">
                    {totalMinutes} Min
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{timeMode === 'auto' ? 'Auto (1m/Q)' : 'Custom'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] font-black uppercase text-slate-400">Marking Scheme</div>
                  <div className="text-2xl font-black font-mono text-rose-500 mt-1">
                    {negativeMarking ? '-0.33' : '0.00'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Opt (E) Safe Skip</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] font-black uppercase text-slate-400">Total Marks</div>
                  <div className="text-2xl font-black font-mono text-emerald-500 mt-1">
                    {totalQuestionsCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">1 Mark / Correct</div>
                </div>
              </div>

              {/* Topic Breakdown Pills */}
              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chapter Distribution Breakdown:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTopicKeys
                    .filter((k) => (topicDistribution[k] || 0) > 0)
                    .map((k) => {
                      const topicObj = registeredTopics.find((t) => t.key === k);
                      const count = topicDistribution[k] || 0;
                      return (
                        <div
                          key={k}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-2"
                        >
                          <span>{topicObj?.labelEnglish || topicObj?.labelHindi || k}</span>
                          <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">
                            {count} Qs
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Sample Questions Preview Card */}
            {generatedPreviewSet && generatedPreviewSet.questions.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Sample Questions Preview:</span>
                </h4>

                <div className="space-y-3">
                  {generatedPreviewSet.questions.slice(0, 2).map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-amber-500 font-mono">Q{idx + 1}.</span>
                        <MathText text={q.questionText} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-500">
                        {q.options.map((opt) => (
                          <div key={opt.key} className="truncate">
                            <span className="font-bold uppercase">({opt.key})</span> {opt.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduling and Publication Settings Card */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Schedule Live Exam Date & Time (Optional)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Set a future start time in Indian Standard Time (IST). Automated email reminders will be sent 2–3 hours before and 15 minutes before start.
                  </p>
                </div>
                <div className="sm:w-64">
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                  />
                  {scheduledDateTime && (
                    <button
                      type="button"
                      onClick={() => setScheduledDateTime('')}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline mt-1 block"
                    >
                      Clear schedule (Make available immediately)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Main Action CTA Buttons */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 bg-gradient-to-tr from-amber-500/10 via-transparent to-indigo-500/10 border-amber-500/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Ready to begin or publish this examination?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Publishing immediately dispatches email announcements to Priya Patel and parent.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadStandaloneHtml}
                    className="px-4 py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4 text-amber-500" />
                    <span>Download Offline HTML</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToLibraryOnly}
                    className="px-4 py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-slate-500" />
                    <span>Save Draft Only</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={handlePublishAndNotify}
                    className="px-5 py-3 rounded-2xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish & Notify Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartExamNow}
                    className="px-6 py-3 rounded-2xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/25 transition-all active:scale-95 flex items-center gap-2 group"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start CBT Test Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Go Back Link */}
              <div className="pt-2 text-center sm:text-left">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-slate-500 hover:text-amber-500 font-bold transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Adjust chapters or question quotas (Go back to Step 2)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
