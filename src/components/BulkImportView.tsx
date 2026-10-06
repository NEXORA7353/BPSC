import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Edit2,
  Trash2,
  Wand2,
  FileUp,
  Save,
  Play,
  ArrowRight,
  ArrowLeft,
  Search,
  Layers,
  RotateCcw,
  Image as ImageIcon,
  AlertTriangle,
  BookOpen,
  Code
} from 'lucide-react';
import { Question, MockTestSet, RegisteredTopic } from '../types';
import { parseBulkQuestionText, aiSmartFormatText, getFormattedImportDate } from '../utils/questionParser';
import {
  addQuestionsToBank,
  getAllQuestionBank,
  getAllRegisteredTopics,
  registerNewTopic,
  saveCustomTest,
  getQuestionCorrectKeys,
  getQuestionCorrectDisplay
} from '../utils/questionBankStorage';
import { auditQuestionBatch } from '../utils/questionQualityAudit';
import { MathText } from './MathText';
import { BackButton } from './BackButton';
import { ImageKitUploadModal } from './ImageKitUploadModal';

interface BulkImportViewProps {
  onBack: () => void;
  defaultTopic?: string;
  onSuccess: (addedCount: number) => void;
  onStartTestImmediately?: (testSet: MockTestSet) => void;
  onNavigateToBank?: () => void;
}

const SAMPLE_BPSC_TEXT = `प्रश्न 1.
यदि (1/5)^(3x) = 0.008 हो, तो (0.25)^x का मान है-
(a) 1.0
(b) 4.0
(c) 0.25
(d) उपर्युक्त में से एक से अधिक
(e) अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)

परीक्षा: BPSC-TRE 3.0 (6 to 8) 19/07/2024
उत्तर: (c)
व्याख्या:
(1/5)^(3x) = 0.008
=> (0.2)^(3x) = (0.2)^3
=> 3x = 3 => x = 1
अतः (0.25)^x = (0.25)^1 = 0.25. अतः विकल्प (c) सही है।

प्रश्न 2.
यदि x, y और z धनात्मक वास्तविक संख्याएँ हों, तो ⁵√(3125x¹⁰y⁵z¹⁰) बराबर होगा-
(a) 5x^2yz^2
(b) 25x^3y^2z
(c) 125x^2yz^2
(d) उपर्युक्त में से एक से अधिक
(e) अनुत्तरित प्रश्न (कोई अंक नहीं कटेगा)

परीक्षा: BPSC-TRE 2.0 (6 to 8) 9/12/2023
उत्तर: (a)
व्याख्या:
⁵√(3125x¹⁰y⁵z¹⁰) = ⁵√(5⁵ · x¹⁰ · y⁵ · z¹⁰) = 5 · x² · y · z² = 5x²yz². अतः विकल्प (a) सही है।

प्रश्न 3.
(0.03125)^(2/5) का मान ज्ञात कीजिए:
(a) 0.25
(b) 0.04
(c) 0.5
(d) 0.125
(e) अनुत्तरित प्रश्न

परीक्षा: BPSC TRE 4.0 Real Mock Question
उत्तर: (b)
व्याख्या:
0.03125 = (0.5)^5.
अतः (0.03125)^(2/5) = ((0.5)^5)^(2/5) = (0.5)^2 = 0.04.

प्रश्न 4.
(64/125)^(-2/3) का सरलीकृत रूप क्या होगा?
(a) 16/25
(b) 25/16
(c) 4/5
(d) 5/4
(e) अनुत्तरित प्रश्न

परीक्षा: BPSC TRE 3.0 (9-10) 2024
उत्तर: (b)
व्याख्या:
(64/125)^(-2/3) = ((4/5)^3)^(-2/3) = (4/5)^(-2) = (5/4)^2 = 25/16. अतः विकल्प (b) सही उत्तर है।`;

export function BulkImportView({
  onBack,
  defaultTopic,
  onSuccess,
  onStartTestImmediately,
  onNavigateToBank
}: BulkImportViewProps) {
  // Stepper State: 1 = Input & Chapter, 2 = AI Parse & Review, 3 = Save & Launch
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Input & Topics State
  const [registeredTopics, setRegisteredTopics] = useState<RegisteredTopic[]>(() => getAllRegisteredTopics());
  const [selectedTopic, setSelectedTopic] = useState<string>(() => {
    if (defaultTopic) return defaultTopic;
    const topics = getAllRegisteredTopics();
    return topics[0]?.key || 'percentage';
  });

  const [inputMode, setInputMode] = useState<'text' | 'json' | 'diagram'>('text');
  const [rawText, setRawText] = useState('');
  const [examName, setExamName] = useState('BPSC TRE 4.0');
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [isAiCleaning, setIsAiCleaning] = useState(false);
  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);

  // In-line Topic Creation
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // Editing single parsed question
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Quality Review Filter in Step 2
  const [reviewFilter, setReviewFilter] = useState<'all' | 'valid' | 'issues'>('all');
  const [isImageKitModalOpen, setIsImageKitModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import Destination Choice in Step 3
  const [destinationChoice, setDestinationChoice] = useState<'bank' | 'bank_and_test' | 'json_only'>('bank');

  // Sync topics when defaultTopic changes
  useEffect(() => {
    if (defaultTopic) setSelectedTopic(defaultTopic);
  }, [defaultTopic]);

  // Topic object lookup
  const currentTopicObj = useMemo(() => {
    return registeredTopics.find((t) => t.key === selectedTopic) || registeredTopics[0];
  }, [registeredTopics, selectedTopic]);

  // Handle in-place new topic creation
  const handleSaveNewTopic = () => {
    if (!newTopicHindi.trim()) return;
    const created = registerNewTopic('', newTopicHindi, newTopicEnglish || newTopicHindi);
    setRegisteredTopics(getAllRegisteredTopics());
    setSelectedTopic(created.key);
    setIsCreatingNewTopic(false);
    setNewTopicHindi('');
    setNewTopicEnglish('');
  };

  // AI Smart Formatter
  const handleAiSmartFormat = () => {
    if (!rawText.trim()) return;
    setIsAiCleaning(true);
    setTimeout(() => {
      try {
        const cleaned = aiSmartFormatText(rawText);
        setRawText(cleaned);
      } catch (err) {
        console.error('AI Clean error:', err);
      } finally {
        setIsAiCleaning(false);
      }
    }, 250);
  };

  // Run AI Parser and advance to Step 2
  const handleRunParser = () => {
    if (!rawText.trim()) {
      alert('Please enter question text to parse or click "Load Sample"!');
      return;
    }
    const res = parseBulkQuestionText(
      rawText,
      selectedTopic,
      examName || 'BPSC TRE 4.0'
    );
    const parsed = res.questions;
    if (parsed.length === 0) {
      alert('No valid questions found. Please check format or click "Load Authentic Sample".');
      return;
    }
    setParsedQuestions(parsed);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Audit of parsed questions
  const auditReport = useMemo(() => {
    return auditQuestionBatch(parsedQuestions);
  }, [parsedQuestions]);

  // Filtered parsed questions in Step 2
  const displayedQuestions = useMemo(() => {
    if (reviewFilter === 'valid') {
      const issueIds = new Set(auditReport.items.map((i) => i.question.id));
      return parsedQuestions.filter((q) => !issueIds.has(q.id));
    }
    if (reviewFilter === 'issues') {
      const issueIds = new Set(auditReport.items.map((i) => i.question.id));
      return parsedQuestions.filter((q) => issueIds.has(q.id));
    }
    return parsedQuestions;
  }, [parsedQuestions, reviewFilter, auditReport]);

  // Inline Question Editing handlers
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingQuestion({ ...parsedQuestions[index] });
  };

  const handleSaveInlineEdit = () => {
    if (editingIndex === null || !editingQuestion) return;
    const updated = [...parsedQuestions];
    updated[editingIndex] = editingQuestion;
    setParsedQuestions(updated);
    setEditingIndex(null);
    setEditingQuestion(null);
  };

  const handleDeleteParsedQuestion = (index: number) => {
    const updated = parsedQuestions.filter((_, idx) => idx !== index);
    setParsedQuestions(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingQuestion(null);
    }
  };

  // JSON File Upload
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const list = Array.isArray(json) ? json : json.questions || [];
        if (list.length > 0) {
          setParsedQuestions(list);
          setCurrentStep(2);
        } else {
          alert('No questions found in JSON file!');
        }
      } catch (err) {
        alert('Invalid JSON file format!');
      }
    };
    reader.readAsText(file);
  };

  // Final Save Handler (Step 3)
  const handleFinalImport = () => {
    if (parsedQuestions.length === 0) return;

    if (destinationChoice === 'json_only') {
      const blob = new Blob([JSON.stringify(parsedQuestions, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BPSC_Import_${selectedTopic}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsSuccessToast(`${parsedQuestions.length} questions downloaded as JSON backup!`);
      return;
    }

    // Add to bank
    const { count } = addQuestionsToBank(parsedQuestions);
    onSuccess(count);

    if (destinationChoice === 'bank_and_test' && onStartTestImmediately) {
      const topicLabelEn = currentTopicObj?.labelEnglish || 'Mathematics';
      const testTitle = `BPSC TRE 4.0: ${topicLabelEn} Practice Test (${parsedQuestions.length} Qs)`;
      const newTestSet: MockTestSet = {
        id: `import_test_${Date.now()}`,
        title: testTitle,
        subtitle: `Imported Questions Practice Set - ${getFormattedImportDate()}`,
        targetExam: examName || 'BPSC TRE 4.0',
        category: 'custom',
        categoryTitle: `${topicLabelEn} Practice`,
        topicBadges: [topicLabelEn],
        totalQuestions: parsedQuestions.length,
        totalTimeMinutes: Math.max(5, parsedQuestions.length),
        questions: parsedQuestions,
        isCustom: true
      };
      saveCustomTest(newTestSet);
      onStartTestImmediately(newTestSet);
      return;
    }

    setIsSuccessToast(`Success! ${count} questions added to Master Question Bank!`);
    setTimeout(() => {
      if (onNavigateToBank) {
        onNavigateToBank();
      } else {
        onBack();
      }
    }, 1200);
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
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span>AI Bulk Question Importer & PDF Parser</span>
                  </h1>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                    v2.0 Ultra
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-wise 5-option extractor with KaTeX formulas, Hindi solutions, and quality validation
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
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : currentStep > 1
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-white/10'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 1 ? 'bg-white text-indigo-600' : currentStep > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                </span>
                <span className="hidden sm:inline">1. Input & Chapter</span>
              </button>

              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />

              {/* Step 2 Pill */}
              <button
                onClick={() => {
                  if (parsedQuestions.length > 0) setCurrentStep(2);
                }}
                disabled={parsedQuestions.length === 0}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 2
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : currentStep > 2
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-white/10'
                    : 'text-slate-400 disabled:opacity-40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 2 ? 'bg-white text-indigo-600' : currentStep > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
                </span>
                <span className="hidden sm:inline">2. Parse & Review</span>
              </button>

              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />

              {/* Step 3 Pill */}
              <button
                onClick={() => {
                  if (parsedQuestions.length > 0) setCurrentStep(3);
                }}
                disabled={parsedQuestions.length === 0}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-400 disabled:opacity-40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 3 ? 'bg-white text-indigo-600' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  3
                </span>
                <span className="hidden sm:inline">3. Save & Done</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {isSuccessToast && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{isSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Main Form Stepper Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* ======================================================== */}
        {/* STEP 1: INPUT SOURCE & TARGET CHAPTER                    */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Step 1 of 3: Enter Chapter & Question Source</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Enter or Paste Mathematics Questions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Supports single or hundreds of questions copied from PDFs, websites, or previous year exam papers.
              </p>
            </div>

            {/* Target Chapter & Exam Configuration Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span>Target Mathematics Chapter:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Mathematics Chapter:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden"
                    >
                      {registeredTopics.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.labelEnglish} ({t.labelHindi})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewTopic(!isCreatingNewTopic)}
                      className="px-3 py-2.5 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors shrink-0"
                    >
                      + New Chapter
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Exam Tag / Source:
                  </label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. BPSC-TRE 3.0 (6 to 8) 2024"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* In-place New Chapter Form */}
              {isCreatingNewTopic && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3 animate-in fade-in">
                  <div className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                    Register New Mathematics Chapter
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Chapter Hindi Name (e.g. सांख्यिकी)"
                      value={newTopicHindi}
                      onChange={(e) => setNewTopicHindi(e.target.value)}
                      className="p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="Chapter Name (English, e.g. Statistics)"
                      value={newTopicEnglish}
                      onChange={(e) => setNewTopicEnglish(e.target.value)}
                      className="p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveNewTopic}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Save Chapter
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewTopic(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Mode Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    inputMode === 'text'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text / PDF Paste</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode('json');
                    fileInputRef.current?.click();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    inputMode === 'json'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload JSON Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsImageKitModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload Diagram / Image</span>
                </button>
              </div>

              {/* Sample & AI Clean Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_BPSC_TEXT)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-colors text-slate-700 dark:text-slate-300"
                >
                  Load 4-Q BPSC Sample
                </button>

                <button
                  type="button"
                  onClick={handleAiSmartFormat}
                  disabled={isAiCleaning || !rawText.trim()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isAiCleaning ? 'animate-spin' : ''}`} />
                  <span>{isAiCleaning ? 'Formatting...' : 'AI Smart Clean'}</span>
                </button>

                {rawText.trim() && (
                  <button
                    type="button"
                    onClick={() => setRawText('')}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                    title="Clear text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleJsonUpload}
              accept=".json"
              className="hidden"
            />

            {/* Textarea Workspace */}
            <div className="glass-panel p-6 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>PASTE CONTENT BELOW:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {rawText.split('\n').filter((l) => l.trim().length > 0).length} Lines
                </span>
              </div>

              <textarea
                rows={16}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="यहाँ BPSC गणित के प्रश्न पेस्ट करें (प्रश्न 1, विकल्प a-e, उत्तर, व्याख्या)..."
                className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Action Bar */}
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
                onClick={handleRunParser}
                disabled={!rawText.trim()}
                className="px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all active:scale-95 flex items-center gap-2 group disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run AI Parser & Review Questions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PARSE DIAGNOSTICS & INTERACTIVE REVIEW          */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Step 2 of 3: Question Parsing & Quality Review</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Review Extracted Questions ({parsedQuestions.length} Total)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Verify 5 options, KaTeX equations, and Hindi solutions before finalizing import.
                </p>
              </div>

              {/* Status Badge */}
              <div className="px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 flex items-center gap-3 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider">Ready for Import</div>
                  <div className="text-xl font-black font-mono leading-none">{parsedQuestions.length} Questions</div>
                </div>
              </div>
            </div>

            {/* Quality Summary 4 Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-400">Total Extracted</div>
                <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                  {parsedQuestions.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Parsed Questions</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-400">5 Options Check</div>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {parsedQuestions.filter((q) => q.options.length === 5).length}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">BPSC Standard (A-E)</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-400">Hindi Solutions</div>
                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {parsedQuestions.filter((q) => q.explanation && q.explanation.trim().length > 5).length}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Explanations Ready</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-400">Quality Issues</div>
                <div className={`text-2xl font-black font-mono mt-1 ${auditReport.problemCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {auditReport.problemCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {auditReport.problemCount > 0 ? 'Warnings Detected' : 'All Clear 100%'}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  reviewFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
                }`}
              >
                All Questions ({parsedQuestions.length})
              </button>

              <button
                type="button"
                onClick={() => setReviewFilter('valid')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  reviewFilter === 'valid'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
                }`}
              >
                Ready & Valid ({parsedQuestions.length - auditReport.items.length})
              </button>

              {auditReport.problemCount > 0 && (
                <button
                  type="button"
                  onClick={() => setReviewFilter('issues')}
                  className={`px-4 py-2 rounded-xl transition-all text-amber-600 dark:text-amber-400 ${
                    reviewFilter === 'issues'
                      ? 'bg-amber-500/20 border border-amber-500/40'
                      : 'hover:bg-white/10'
                  }`}
                >
                  Needs Attention ({auditReport.items.length})
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {displayedQuestions.map((q, idx) => {
                const isEditing = editingIndex === idx;

                return (
                  <div
                    key={q.id || idx}
                    className="glass-panel p-6 rounded-3xl space-y-4 relative border transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-black text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                          {q.exam || 'BPSC TRE'}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {currentTopicObj?.labelHindi}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx)}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteParsedQuestion(idx)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                          title="Discard this question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Content View or In-place Editor */}
                    {!isEditing ? (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                          <MathText text={q.questionText} />
                        </div>

                        {/* 5 Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 text-xs">
                          {q.options.map((opt) => {
                            const isCorrect = q.correctOption?.includes(opt.key);
                            return (
                              <div
                                key={opt.key}
                                className={`p-2 rounded-xl border font-medium ${
                                  isCorrect
                                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-800 dark:text-emerald-200 font-bold'
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="uppercase font-bold">({opt.key})</span>{' '}
                                <MathText text={opt.text} />
                              </div>
                            );
                          })}
                        </div>

                        {/* Hindi Solution */}
                        {q.explanation && (
                          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div className="font-bold text-amber-600 dark:text-amber-400">
                              Explanation / Solution:
                            </div>
                            <MathText text={q.explanation} />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Inline Question Editor */
                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/30 space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">Question Text:</label>
                          <textarea
                            rows={3}
                            value={editingQuestion?.questionText || ''}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion!,
                                questionText: e.target.value
                              })
                            }
                            className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden font-medium"
                          />
                        </div>

                        {/* Options Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {editingQuestion?.options.map((opt, oIdx) => (
                            <div key={opt.key} className="space-y-1">
                              <label className="text-[11px] font-bold uppercase text-slate-500">
                                Option ({opt.key}):
                              </label>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const opts = [...editingQuestion.options];
                                  opts[oIdx] = { ...opt, text: e.target.value };
                                  setEditingQuestion({ ...editingQuestion, options: opts });
                                }}
                                className="w-full p-2 rounded-xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500">Explanation / Solution:</label>
                          <textarea
                            rows={3}
                            value={editingQuestion?.explanation || ''}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion!,
                                explanation: e.target.value
                              })
                            }
                            className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border focus:outline-hidden font-medium"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSaveInlineEdit}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndex(null);
                              setEditingQuestion(null);
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
                <span>Back to Edit Raw Input</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all active:scale-95 flex items-center gap-2 group"
              >
                <span>Proceed to Step 3: Choose Destination</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: DESTINATION & CONFIRM IMPORT                     */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Step 3 of 3: Select Destination & Save</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Choose Where to Save These Questions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All {parsedQuestions.length} questions are verified and ready to be loaded into your portal.
              </p>
            </div>

            {/* Destination Options Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Option 1: Master Question Bank */}
              <div
                onClick={() => setDestinationChoice('bank')}
                className={`cursor-pointer p-6 rounded-3xl border transition-all space-y-4 ${
                  destinationChoice === 'bank'
                    ? 'bg-indigo-500/10 border-indigo-500/60 shadow-xl ring-2 ring-indigo-500/30'
                    : 'glass-panel glass-panel-hover'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Add to Question Bank
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Directly saves questions into Master Repository under "{currentTopicObj?.labelHindi}".
                  </p>
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Check className="w-4 h-4" />
                  <span>Standard & Recommended</span>
                </div>
              </div>

              {/* Option 2: Add + Start CBT Test */}
              <div
                onClick={() => setDestinationChoice('bank_and_test')}
                className={`cursor-pointer p-6 rounded-3xl border transition-all space-y-4 ${
                  destinationChoice === 'bank_and_test'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-xl ring-2 ring-amber-500/30'
                    : 'glass-panel glass-panel-hover'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                  <Play className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Add & Launch CBT Test
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Adds questions to bank and immediately launches a live practice exam session!
                  </p>
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Examination Mode</span>
                </div>
              </div>

              {/* Option 3: Download JSON Backup Only */}
              <div
                onClick={() => setDestinationChoice('json_only')}
                className={`cursor-pointer p-6 rounded-3xl border transition-all space-y-4 ${
                  destinationChoice === 'json_only'
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-xl ring-2 ring-emerald-500/30'
                    : 'glass-panel glass-panel-hover'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Export JSON Backup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Downloads these questions as a standalone JSON file without modifying local database.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Code className="w-4 h-4" />
                  <span>Portable Backup</span>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Import Batch Summary:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400 block font-bold">Target Chapter</span>
                  <span className="font-black text-slate-900 dark:text-white mt-0.5 block">
                    {currentTopicObj?.labelHindi}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400 block font-bold">Questions Count</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block font-mono text-base">
                    {parsedQuestions.length} Qs
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400 block font-bold">Exam Source</span>
                  <span className="font-black text-slate-900 dark:text-white mt-0.5 block">
                    {examName || 'BPSC TRE 4.0'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400 block font-bold">Option (E) Safe Skip</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    Supported (5-Options)
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Review Questions</span>
              </button>

              <button
                type="button"
                onClick={handleFinalImport}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Import {parsedQuestions.length} Questions</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ImageKit Upload Helper Modal */}
      {isImageKitModalOpen && (
        <ImageKitUploadModal
          isOpen={isImageKitModalOpen}
          onClose={() => setIsImageKitModalOpen(false)}
          onImageUploaded={(markdownSnippet: string) => {
            setRawText((prev) => prev + `\n${markdownSnippet}\n`);
            setIsImageKitModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
