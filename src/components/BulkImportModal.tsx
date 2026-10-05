import { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Code,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Wand2,
  FileUp,
  Save,
  Play,
  Calendar
} from 'lucide-react';
import { Question, MockTestSet } from '../types';
import { parseBulkQuestionText, aiSmartFormatText, getFormattedImportDate } from '../utils/questionParser';
import {
  addQuestionsToBank,
  getAllRegisteredTopics,
  registerNewTopic,
  saveCustomTest
} from '../utils/questionBankStorage';
import { MathText } from './MathText';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addedCount: number) => void;
  defaultTopic?: string;
  onStartTestImmediately?: (testSet: MockTestSet) => void;
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
(e) उत्तर नहीं देना चाहते (कोई अंक नहीं कटेगा)

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
(e) अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)

परीक्षा: BPSC Mathematics Specialist
उत्तर: (b)
व्याख्या:
(64/125)^(-2/3) = (125/64)^(2/3) = ((5/4)^3)^(2/3) = (5/4)^2 = 25/16.

प्रश्न 5.
यदि x + 1/x = 5 है, तो x^2 + 1/x^2 का मान ज्ञात कीजिए:
(a) 23
(b) 25
(c) 27
(d) उपर्युक्त में से एक से अधिक
(e) उत्तर नहीं देना चाहते (कोई अंक नहीं कटेगा)

परीक्षा: BPSC TRE Mathematics Algebra
उत्तर: (a)
व्याख्या:
x + 1/x = 5 => (x + 1/x)^2 = 5^2 => x^2 + 1/x^2 + 2 = 25 => x^2 + 1/x^2 = 23.

प्रश्न 6.
मूल्यांकित करें : (-343 × 512)^(1/3)
(a) -56
(b) -42
(c) -84
(d) 56
(e) अनुत्तरित प्रश्न

परीक्षा: Bihar STET 15/09/2020 (Shift-I)
उत्तर: (a)
व्याख्या:
(-343 × 512)^(1/3) = ((-7)^3 × 8^3)^(1/3) = -7 × 8 = -56.

प्रश्न 7.
\\sqrt{144} + \\sqrt[3]{512} \\times 2^3 का मान क्या है?
(a) 76
(b) 64
(c) 80
(d) 96
(e) उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक

परीक्षा: STET Mathematics
उत्तर: (a)
व्याख्या:
\\sqrt{144} = 12, \\sqrt[3]{512} = 8, 2^3 = 8.
12 + (8 × 8) = 12 + 64 = 76.

प्रश्न 8.
यदि x^2 - 5x + 6 = 0 है, तो x के मूल (Roots) होंगे:
(a) 2, 3
(b) -2, -3
(c) 1, 6
(d) -1, -6
(e) अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)

परीक्षा: BPSC TRE 3.0 Algebra
उत्तर: (a)
व्याख्या:
x^2 - 5x + 6 = 0 => (x - 2)(x - 3) = 0 => x = 2, 3.`;

const SAMPLE_BPSC_JSON = JSON.stringify([
  {
    "originalNumber": 1,
    "exam": "BPSC-TRE 3.0 (6 to 8) 19/07/2024",
    "questionText": "यदि (1/5)^(3x) = 0.008 हो, तो (0.25)^x का मान है-",
    "options": [
      { "key": "a", "text": "1.0" },
      { "key": "b", "text": "4.0" },
      { "key": "c", "text": "0.25" },
      { "key": "d", "text": "उपर्युक्त में से एक से अधिक" },
      { "key": "e", "text": "अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)" }
    ],
    "correctOption": "c",
    "explanation": "(1/5)^(3x) = 0.008 => (0.2)^(3x) = (0.2)^3 => 3x = 3 => x = 1 अतः (0.25)^x = (0.25)^1 = 0.25"
  },
  {
    "originalNumber": 2,
    "exam": "BPSC-TRE 2.0 (6 to 8) 9/12/2023",
    "questionText": "यदि x, y और z धनात्मक वास्तविक संख्याएँ हों, तो ⁵√(3125x¹⁰y⁵z¹⁰) बराबर होगा-",
    "options": [
      { "key": "a", "text": "5x^2yz^2" },
      { "key": "b", "text": "25x^3y^2z" },
      { "key": "c", "text": "125x^2yz^2" },
      { "key": "d", "text": "उपर्युक्त में से एक से अधिक" },
      { "key": "e", "text": "उत्तर नहीं देना चाहते (कोई अंक नहीं कटेगा)" }
    ],
    "correctOption": "a",
    "explanation": "⁵√(3125x¹⁰y⁵z¹⁰) = ⁵√(5⁵ · x¹⁰ · y⁵ · z¹⁰) = 5 · x² · y · z² = 5x²yz²"
  },
  {
    "originalNumber": 3,
    "exam": "BPSC TRE 4.0 Real Mock Question",
    "questionText": "(0.03125)^(2/5) का मान ज्ञात कीजिए:",
    "options": [
      { "key": "a", "text": "0.25" },
      { "key": "b", "text": "0.04" },
      { "key": "c", "text": "0.5" },
      { "key": "d", "text": "0.125" },
      { "key": "e", "text": "अनुत्तरित प्रश्न" }
    ],
    "correctOption": "b",
    "explanation": "0.03125 = (0.5)^5. अतः (0.03125)^(2/5) = ((0.5)^5)^(2/5) = (0.5)^2 = 0.04."
  }
], null, 2);


export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTopic,
  onStartTestImmediately
}: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<'bulk_paste' | 'json_mode' | 'single_manual'>('bulk_paste');
  const [rawText, setRawText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Topics
  const [registeredTopics, setRegisteredTopics] = useState(() => getAllRegisteredTopics());
  const [selectedTopic, setSelectedTopic] = useState(defaultTopic || 'profit_loss');
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // Parsed Questions & In-Place Editing
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editItemState, setEditItemState] = useState<Question | null>(null);

  // Toast & UX Feedback
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [testTitleInput, setTestTitleInput] = useState('');

  // Single Question Form
  const [singleQ, setSingleQ] = useState({
    text: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    optE: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)',
    correct: 'a' as 'a' | 'b' | 'c' | 'd' | 'e',
    exam: 'BPSC TRE 4.0 / Bihar STET',
    explanation: ''
  });

  if (!isOpen) return null;

  const currentTopicObj = registeredTopics.find((t) => t.key === selectedTopic);
  const topicNameHindi = currentTopicObj?.labelHindi || 'विविध गणित (Custom Topic)';

  const handleTopicChange = (newKey: string) => {
    setSelectedTopic(newKey);
    const topicObj = registeredTopics.find((t) => t.key === newKey);
    const newHindi = topicObj?.labelHindi || 'विविध गणित (Custom Topic)';
    if (previewQuestions.length > 0) {
      const updated = previewQuestions.map((q) => ({
        ...q,
        topic: newKey,
        topicNameHindi: newHindi
      }));
      setPreviewQuestions(updated);
      setJsonText(JSON.stringify(updated, null, 2));
    }
  };

  const handleParseText = (text: string, overrideTopicKey?: string, overrideTopicHindi?: string) => {
    const targetKey = overrideTopicKey || selectedTopic;
    const targetHindi = overrideTopicHindi || topicNameHindi;
    const result = parseBulkQuestionText(text, targetKey, targetHindi);
    setPreviewQuestions(result.questions);
    setParseErrors(result.errors);
    if (result.questions.length > 0) {
      setJsonText(JSON.stringify(result.questions, null, 2));
    }
  };

  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    if (val.trim().length > 10) {
      handleParseText(val);
    } else {
      setPreviewQuestions([]);
      setParseErrors([]);
      setJsonText('');
    }
  };

  // AI Smart Auto-Formatter
  const handleAiSmartFormat = () => {
    if (!rawText.trim()) return;
    const formatted = aiSmartFormatText(rawText);
    setRawText(formatted);
    handleParseText(formatted);
  };

  // File Upload Handler (.txt, .json, .csv)
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawText(content);
        handleParseText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCreateNewTopic = () => {
    if (!newTopicHindi.trim()) return;
    const created = registerNewTopic('', newTopicHindi, newTopicEnglish || newTopicHindi);
    setRegisteredTopics(getAllRegisteredTopics());
    handleTopicChange(created.key);
    setIsCreatingNewTopic(false);
    setNewTopicHindi('');
    setNewTopicEnglish('');
  };

  const handleLoadSample = (sample: string) => {
    setRawText(sample);
    handleParseText(sample);
  };

  const handleCopyJson = () => {
    if (previewQuestions.length === 0) return;
    navigator.clipboard.writeText(JSON.stringify(previewQuestions, null, 2)).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  };

  // In-place Editing Handlers
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditItemState({ ...previewQuestions[index] });
  };

  const handleSaveInlineEdit = () => {
    if (editingIndex === null || !editItemState) return;
    const updated = [...previewQuestions];
    updated[editingIndex] = editItemState;
    setPreviewQuestions(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    setEditingIndex(null);
    setEditItemState(null);
  };

  const handleDeletePreviewItem = (index: number) => {
    const updated = previewQuestions.filter((_, i) => i !== index);
    setPreviewQuestions(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Save to Question Bank
  const handleSaveImport = () => {
    if (previewQuestions.length === 0) return;
    const dateFormatted = getFormattedImportDate();
    const stampedQuestions = previewQuestions.map((q) => ({
      ...q,
      topic: selectedTopic,
      topicNameHindi: topicNameHindi,
      createdAt: q.createdAt || dateFormatted
    }));

    const { count } = addQuestionsToBank(stampedQuestions);
    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      onSuccess(count);
      onClose();
    }, 800);
  };

  // Save & Create Dedicated Mock Test Set Immediately
  const handleSaveAndCreateTest = () => {
    if (previewQuestions.length === 0) return;
    const dateFormatted = getFormattedImportDate();
    const stampedQuestions = previewQuestions.map((q) => ({
      ...q,
      topic: selectedTopic,
      topicNameHindi: topicNameHindi,
      createdAt: q.createdAt || dateFormatted
    }));

    const { count } = addQuestionsToBank(stampedQuestions);
    const testTitle = testTitleInput.trim() || `Imported Test Set (${stampedQuestions.length} Questions)`;

    const newTest: MockTestSet = {
      id: `custom_test_${Date.now()}`,
      title: testTitle,
      subtitle: `Created from bulk import on ${dateFormatted}`,
      targetExam: 'BPSC TRE 4.0 Mathematics (Custom Imported)',
      category: 'custom',
      categoryTitle: 'Custom Imported Tests',
      topicBadges: [topicNameHindi, 'Imported Test'],
      totalQuestions: stampedQuestions.length,
      totalTimeMinutes: stampedQuestions.length,
      questions: stampedQuestions,
      negativeMarkingValue: 0.33,
      isCustom: true,
      createdAt: dateFormatted
    };

    saveCustomTest(newTest);
    setIsSuccessToast(true);

    setTimeout(() => {
      setIsSuccessToast(false);
      onSuccess(count);
      if (onStartTestImmediately) {
        onStartTestImmediately(newTest);
      }
      onClose();
    }, 800);
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleQ.text || !singleQ.optA || !singleQ.optB) return;

    const newQuestion: Question = {
      id: `custom_${Date.now()}`,
      originalNumber: Date.now() % 1000,
      topic: selectedTopic,
      topicNameHindi,
      exam: singleQ.exam || 'BPSC TRE 4.0',
      questionText: singleQ.text.trim(),
      options: [
        { key: 'a', text: singleQ.optA.trim() },
        { key: 'b', text: singleQ.optB.trim() },
        { key: 'c', text: singleQ.optC.trim() },
        { key: 'd', text: singleQ.optD.trim() },
        { key: 'e', text: singleQ.optE.trim() }
      ],
      correctOption: singleQ.correct,
      explanation: singleQ.explanation.trim() || `सही उत्तर (${singleQ.correct.toUpperCase()}) है।`,
      isUserAdded: true,
      createdAt: new Date().toISOString()
    };

    const { count } = addQuestionsToBank([newQuestion]);
    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      onSuccess(count);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
                <span>Smart AI Question Importer & PDF Parser</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                  AI v2.0
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag-and-drop PDFs, Word docs or paste raw text. Auto-extracts 5 options, answer key & Hindi explanations.
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

        {/* Tabs Bar */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40 text-xs sm:text-sm font-bold shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('bulk_paste')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'bulk_paste'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Smart PDF / Text Drag-Drop</span>
            </button>

            <button
              onClick={() => setActiveTab('json_mode')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'json_mode'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>JSON Question Schema</span>
            </button>

            <button
              onClick={() => setActiveTab('single_manual')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'single_manual'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Manual Entry Form</span>
            </button>
          </div>

          {activeTab === 'bulk_paste' && rawText.trim().length > 10 && (
            <button
              onClick={handleAiSmartFormat}
              className="mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              title="Auto-clean messy line breaks, format option tags and extract keys"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Smart Auto-Fix Text</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Topic Assignment Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Assign to Topic:</span>
                <select
                  value={selectedTopic}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {registeredTopics.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.labelHindi} ({t.labelEnglish})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingNewTopic(!isCreatingNewTopic)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New Custom Topic</span>
              </button>
            </div>

            {/* In-place Topic Creator */}
            {isCreatingNewTopic && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 space-y-2 animate-in fade-in">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  New Topic Details (नया अध्याय)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Hindi Name (e.g. साधारण ब्याज)"
                    value={newTopicHindi}
                    onChange={(e) => setNewTopicHindi(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="English Name (e.g. Simple Interest)"
                    value={newTopicEnglish}
                    onChange={(e) => setNewTopicEnglish(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewTopic(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewTopic}
                    disabled={!newTopicHindi.trim()}
                    className="px-4 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Register Topic
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: RAW PDF / TEXT DRAG & DROP PASTE */}
          {activeTab === 'bulk_paste' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-4 transition-all ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Paste or Drag & Drop Question Document / PDF</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".txt,.json,.csv,.md,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <FileUp className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Upload File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadSample(SAMPLE_BPSC_TEXT)}
                      className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                    >
                      ⚡ Load Sample BPSC Paper
                    </button>
                  </div>
                </div>

                {/* Quick Math Format Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5 p-2 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                    <span>Quick Insert:</span>
                  </span>
                  {[
                    { label: '(1/5)^(3x)', snippet: '(1/5)^(3x)' },
                    { label: 'x^(2/5)', snippet: 'x^(2/5)' },
                    { label: '√x', snippet: '\\sqrt{x}' },
                    { label: '∛x', snippet: '\\sqrt[3]{x}' },
                    { label: 'a/b', snippet: '\\frac{a}{b}' },
                    { label: 'x²', snippet: 'x^2' },
                    { label: '⇒', snippet: '=> ' },
                    { label: '±', snippet: '±' },
                    { label: '×', snippet: '×' },
                    { label: '÷', snippet: '÷' },
                    { label: '≤', snippet: '≤' },
                    { label: '≥', snippet: '≥' },
                    { label: 'Option (E) अनुत्तरित (विस्तृत)', snippet: '\n(e) अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' },
                    { label: 'Option (E) उत्तर नहीं देना', snippet: '\n(e) उत्तर नहीं देना चाहते (कोई अंक नहीं कटेगा)' },
                    { label: 'Option (E) अनुत्तरित प्रश्न', snippet: '\n(e) अनुत्तरित प्रश्न' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        const next = rawText ? rawText + ' ' + chip.snippet : chip.snippet;
                        setRawText(next);
                        handleParseText(next);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:border-amber-400 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold transition-all active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                  <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    ✓ KaTeX Smart Math Active
                  </span>
                </div>

                <textarea
                  rows={9}
                  value={rawText}
                  onChange={handleRawTextChange}
                  placeholder={`Paste raw questions copied from PDF or document.
Smart parser automatically extracts:
- Question Number & Question Text in Hindi
- Options: (a), (b), (c), (d), (e)
- Answer Key: 'उत्तर: (a)' or 'Ans: (b)'
- Explanation: 'व्याख्या: ...'`}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y leading-relaxed"
                />
              </div>

              {/* Extraction Metrics Bar */}
              {rawText.trim().length > 10 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      AI Parsing Engine:
                    </span>
                    <span className="px-3 py-1 rounded-full font-black bg-amber-500 text-slate-950 font-mono text-xs">
                      {previewQuestions.length} Questions Extracted
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {parseErrors.length > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{parseErrors.length} blocks format warning</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'JSON Copied!' : 'Copy Parsed JSON'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JSON SCHEMA */}
          {activeTab === 'json_mode' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span>JSON Question Array Schema</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJsonText(SAMPLE_BPSC_JSON);
                      try {
                        const parsed = JSON.parse(SAMPLE_BPSC_JSON);
                        if (Array.isArray(parsed)) setPreviewQuestions(parsed);
                      } catch {}
                    }}
                    className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/20 transition-colors"
                  >
                    ⚡ Load Sample BPSC JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    disabled={!jsonText}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={11}
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed)) setPreviewQuestions(parsed);
                  } catch {}
                }}
                placeholder="[ { id, questionText, options: [{ key: 'a', text: '' }], correctOption: 'a', explanation: '' } ]"
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: SINGLE MANUAL ENTRY */}
          {activeTab === 'single_manual' && (
            <form onSubmit={handleAddSingle} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Question Text in Hindi *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSingleQ({
                        text: 'यदि (1/5)^(3x) = 0.008 हो, तो (0.25)^x का मान है-',
                        optA: '1.0',
                        optB: '4.0',
                        optC: '0.25',
                        optD: 'उपर्युक्त में से एक से अधिक',
                        optE: 'उपर्युक्त में से कोई नहीं',
                        correct: 'c',
                        exam: 'BPSC-TRE 3.0 (6 to 8) 19/07/2024',
                        explanation: '(1/5)^(3x) = 0.008 => (0.2)^(3x) = (0.2)^3 => 3x = 3 => x = 1 अतः (0.25)^x = (0.25)^1 = 0.25'
                      });
                    }}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    ⚡ Fill with Sample Math Question
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="यहाँ प्रश्न लिखें (e.g. दो संख्याओं का ल.स. 120 तथा म.स. 6 है...)"
                  value={singleQ.text}
                  onChange={(e) => setSingleQ({ ...singleQ, text: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['a', 'b', 'c', 'd', 'e'] as const).map((key) => {
                  const valKey = `opt${key.toUpperCase()}` as keyof typeof singleQ;
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                        Option ({key}) {key !== 'e' ? '*' : '(Safe Skip Option)'}
                      </label>
                      <input
                        type="text"
                        required={key !== 'e'}
                        value={String(singleQ[valKey] || '')}
                        onChange={(e) => setSingleQ({ ...singleQ, [valKey]: e.target.value })}
                        placeholder={`विकल्प (${key}) का मान`}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold"
                      />
                      {key === 'e' && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setSingleQ({ ...singleQ, optE: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' })}
                            className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-bold hover:bg-amber-500/20"
                          >
                            अनुत्तरित (विस्तृत)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSingleQ({ ...singleQ, optE: 'उत्तर नहीं देना चाहते (कोई अंक नहीं कटेगा)' })}
                            className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-bold hover:bg-amber-500/20"
                          >
                            उत्तर नहीं देना चाहते
                          </button>
                          <button
                            type="button"
                            onClick={() => setSingleQ({ ...singleQ, optE: 'अनुत्तरित प्रश्न' })}
                            className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-bold hover:bg-amber-500/20"
                          >
                            अनुत्तरित प्रश्न
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correct Option Key *
                  </label>
                  <select
                    value={singleQ.correct}
                    onChange={(e) =>
                      setSingleQ({ ...singleQ, correct: e.target.value as any })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  >
                    <option value="a">Option (A) - सही उत्तर</option>
                    <option value="b">Option (B) - सही उत्तर</option>
                    <option value="c">Option (C) - सही उत्तर</option>
                    <option value="d">Option (D) - सही उत्तर</option>
                    <option value="e">Option (E) - सही उत्तर</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Tag / Source
                  </label>
                  <input
                    type="text"
                    value={singleQ.exam}
                    onChange={(e) => setSingleQ({ ...singleQ, exam: e.target.value })}
                    placeholder="e.g. Bihar STET (9 & 10) 2024"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Step-by-Step Hindi Explanation
                  </label>
                  <input
                    type="text"
                    value={singleQ.explanation}
                    onChange={(e) => setSingleQ({ ...singleQ, explanation: e.target.value })}
                    placeholder="विस्तृत व्याख्या या सूत्र"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Question to Bank</span>
              </button>
            </form>
          )}

          {/* PARSED PREVIEW & IN-LINE EDITING CARDS */}
          {previewQuestions.length > 0 && activeTab !== 'single_manual' && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Extracted Questions Preview ({previewQuestions.length} Questions)
                </h4>

                <input
                  type="text"
                  placeholder="Optional Mock Test Title (e.g. TRE 4.0 Special Set 1)"
                  value={testTitleInput}
                  onChange={(e) => setTestTitleInput(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold w-64 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {previewQuestions.map((q, idx) => {
                  const isEditing = editingIndex === idx;

                  if (isEditing && editItemState) {
                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-3">
                        <div className="font-bold text-xs text-amber-500 flex items-center justify-between">
                          <span>Inline Edit Question #{idx + 1}</span>
                          <button
                            onClick={handleSaveInlineEdit}
                            className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                          >
                            Done Editing
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={editItemState.questionText}
                          onChange={(e) => setEditItemState({ ...editItemState, questionText: e.target.value })}
                          className="w-full bg-white dark:bg-slate-950 border p-2 text-xs rounded-xl"
                        />

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {editItemState.options.map((opt, optIdx) => (
                            <div key={opt.key} className="flex items-center gap-2">
                              <span className="font-bold uppercase">({opt.key})</span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const updatedOpts = [...editItemState.options];
                                  updatedOpts[optIdx] = { ...opt, text: e.target.value };
                                  setEditItemState({ ...editItemState, options: updatedOpts });
                                }}
                                className="w-full bg-white dark:bg-slate-950 border p-1 rounded-lg text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono font-bold flex items-center justify-center text-[11px]">
                            Q{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 font-bold text-[11px]">
                            {q.topicNameHindi || topicNameHindi}
                          </span>
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            {q.exam}
                          </span>
                          {q.createdAt && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{q.createdAt}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                            Key: ({q.correctOption})
                          </span>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="p-1 rounded-md text-amber-500 hover:bg-amber-500/10"
                            title="Edit this question inline"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePreviewItem(idx)}
                            className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Remove from import"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm font-sans leading-relaxed">
                        <MathText text={q.questionText} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.key}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                              opt.key === q.correctOption
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-bold uppercase shrink-0">({opt.key})</span>
                            <span className="truncate">
                              <MathText text={opt.text} />
                            </span>
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 text-xs leading-relaxed">
                          <span className="font-bold">व्याख्या: </span>
                          <MathText text={q.explanation} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {previewQuestions.length > 0
              ? `${previewQuestions.length} Questions Extracted for ${topicNameHindi}`
              : 'Paste or upload document to auto-extract'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            {activeTab !== 'single_manual' && (
              <>
                <button
                  disabled={previewQuestions.length === 0}
                  onClick={handleSaveImport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95"
                >
                  <Save className="w-4 h-4 text-emerald-500" />
                  <span>Save to Bank</span>
                </button>

                <button
                  disabled={previewQuestions.length === 0}
                  onClick={handleSaveAndCreateTest}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Save & Start Test Now ({previewQuestions.length} Qs)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
