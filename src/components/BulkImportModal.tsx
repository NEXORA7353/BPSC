import { useState, useRef, useMemo, useEffect } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  Wand2,
  FileUp,
  Save,
  Play,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  RotateCcw,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { Question, MockTestSet } from '../types';
import { parseBulkQuestionText, aiSmartFormatText, getFormattedImportDate } from '../utils/questionParser';
import {
  addQuestionsToBank,
  getAllQuestionBank,
  getAllRegisteredTopics,
  registerNewTopic,
  saveCustomTest
} from '../utils/questionBankStorage';
import { auditQuestionBatch } from '../utils/questionQualityAudit';
import { SmartQualityReviewModal } from './SmartQualityReviewModal';
import { MathText } from './MathText';
import { ImageKitUploadModal } from './ImageKitUploadModal';

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
  const previewScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Topics
  const [registeredTopics, setRegisteredTopics] = useState(() => getAllRegisteredTopics());
  const [selectedTopic, setSelectedTopic] = useState(defaultTopic || 'number_system');
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // Parsed Questions & In-Place Editing
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editItemState, setEditItemState] = useState<Question | null>(null);
  const [isQualityReviewOpen, setIsQualityReviewOpen] = useState(false);

  // Quality & Advanced Duplicate Audit
  const bankQuestions = useMemo(() => (isOpen ? getAllQuestionBank() : []), [isOpen]);
  const auditReport = useMemo(
    () => auditQuestionBatch(previewQuestions, bankQuestions),
    [previewQuestions, bankQuestions]
  );
  const questionAuditMap = useMemo(
    () => new Map(auditReport.items.map((it) => [it.id, it])),
    [auditReport]
  );

  // Search & Navigation for 100-500 questions
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50; // chunk size for super smooth rendering

  // ImageKit Cloud Uploader Modal
  const [isImageKitModalOpen, setIsImageKitModalOpen] = useState(false);

  const handleImageUploaded = (markdownSnippet: string) => {
    setRawText((prev) => {
      const updated = prev ? `${prev}\n\n${markdownSnippet}\n` : `${markdownSnippet}\n`;
      handleParseText(updated);
      return updated;
    });
  };

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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    setCurrentPage(1);
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
      setCurrentPage(1);
    }
  };

  const handleAiSmartFormat = () => {
    if (!rawText.trim()) return;
    const formatted = aiSmartFormatText(rawText);
    setRawText(formatted);
    handleParseText(formatted);
  };

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

  const handleClearAll = () => {
    setRawText('');
    setJsonText('');
    setPreviewQuestions([]);
    setParseErrors([]);
    setSearchQuery('');
    setCurrentPage(1);
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

  // Filtered Questions with Search
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return previewQuestions.map((q, originalIdx) => ({ q, originalIdx }));
    }
    const qLower = searchQuery.toLowerCase().trim();
    return previewQuestions
      .map((q, originalIdx) => ({ q, originalIdx }))
      .filter(({ q, originalIdx }) => {
        const textMatch = q.questionText.toLowerCase().includes(qLower);
        const numMatch = `q${originalIdx + 1}`.includes(qLower) || `${q.originalNumber}`.includes(qLower);
        const optMatch = q.options.some((opt) => opt.text.toLowerCase().includes(qLower));
        const expMatch = q.explanation.toLowerCase().includes(qLower);
        return textMatch || numMatch || optMatch || expMatch;
      });
  }, [previewQuestions, searchQuery]);

  // Paginated chunk for large question counts (100-500)
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  const handleJumpToQuestion = (targetNum: number) => {
    if (targetNum < 1 || targetNum > previewQuestions.length) return;
    const targetPage = Math.ceil(targetNum / pageSize);
    setCurrentPage(targetPage);
    setTimeout(() => {
      const el = document.getElementById(`preview-q-${targetNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-label="Close modal overlay" />

      {/* Slide-over Side Drawer Container */}
      <div className="relative z-10 w-full max-w-[98vw] xl:max-w-[1600px] 2xl:max-w-[1720px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-black shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base leading-tight tracking-tight text-slate-900 dark:text-white">
                  Smart AI Question Importer & PDF Parser
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  AI v2.0 Ultra
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Auto-extracts 5 options, KaTeX math formulas, Hindi solutions & answer keys. Supports 100–500 questions in 1-click.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {previewQuestions.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{previewQuestions.length} Questions Ready</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Close (Esc)"
            >
              <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">Esc</span>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dual-Pane Split Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* LEFT COLUMN: Input & Extraction Tools (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900">
            
            {/* Topic Assignment Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Topic (अध्याय):</span>
                  <select
                    value={selectedTopic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Topic</span>
                </button>
              </div>

              {/* In-place Topic Creator */}
              {isCreatingNewTopic && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900 space-y-2 animate-in fade-in">
                  <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">
                    Create Custom Mathematics Chapter
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Hindi Name (e.g. त्रिकोणमिति)"
                      value={newTopicHindi}
                      onChange={(e) => setNewTopicHindi(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="English Name (e.g. Trigonometry)"
                      value={newTopicEnglish}
                      onChange={(e) => setNewTopicEnglish(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewTopic(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewTopic}
                      disabled={!newTopicHindi.trim()}
                      className="px-3.5 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Format Mode Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('bulk_paste')}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
                    activeTab === 'bulk_paste'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Smart PDF / Text</span>
                </button>

                <button
                  onClick={() => setActiveTab('json_mode')}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
                    activeTab === 'json_mode'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>JSON Schema</span>
                </button>

                <button
                  onClick={() => setActiveTab('single_manual')}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
                    activeTab === 'single_manual'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Manual Form</span>
                </button>
              </div>

              {activeTab === 'bulk_paste' && rawText.trim().length > 10 && (
                <button
                  onClick={handleAiSmartFormat}
                  className="mb-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-[11px] shadow-xs transition-all active:scale-95 flex items-center gap-1"
                  title="Auto-clean messy line breaks and align tags"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>AI Auto-Clean</span>
                </button>
              )}
            </div>

            {/* TAB 1: SMART PDF / TEXT INPUT */}
            {activeTab === 'bulk_paste' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-3 sm:p-4 transition-all flex flex-col flex-1 ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                  }`}
                >
                  {/* Top Bar of Textarea */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>Paste Raw Question Text / Notes (100–500 Qs)</span>
                    </label>

                    <div className="flex items-center gap-1.5">
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
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                      >
                        <FileUp className="w-3 h-3 text-indigo-500" />
                        <span>Upload File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsImageKitModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                        title="Upload Diagram or PNG to ImageKit Cloud CDN"
                      >
                        <ImageIcon className="w-3 h-3 text-emerald-500" />
                        <span>Upload Diagram (ImageKit)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadSample(SAMPLE_BPSC_TEXT)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/20 transition-colors"
                      >
                        ⚡ Sample
                      </button>

                      {rawText && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Clear text"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Math Quick Chips Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Insert:</span>
                    {[
                      { label: '(1/5)^(3x)', snippet: '(1/5)^(3x)' },
                      { label: 'x^(2/5)', snippet: 'x^(2/5)' },
                      { label: '√x', snippet: '\\sqrt{x}' },
                      { label: '∛x', snippet: '\\sqrt[3]{x}' },
                      { label: 'a/b', snippet: '\\frac{a}{b}' },
                      { label: 'x²', snippet: 'x^2' },
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
                        className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:border-amber-400 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold transition-all active:scale-95"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={12}
                    value={rawText}
                    onChange={handleRawTextChange}
                    placeholder={`Paste 1 to 500 questions here. Example:

15. 2333 एक .......... है-
(a) प्राकृत संख्या
(b) सम संख्या
(c) परिमेय संख्या
(d) अपरिमेय संख्या
(e) अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)
उत्तर: (a)
व्याख्या: 2333 एक परिमेय संख्या है।`}
                    className="w-full flex-1 min-h-[220px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y leading-relaxed"
                  />

                  {/* Extraction Metrics Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">
                        {rawText ? `${rawText.split('\n').length} lines · ${rawText.length} chars` : 'Ready to paste'}
                      </span>
                      {previewQuestions.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500 text-slate-950 font-mono text-[10px]">
                          {previewQuestions.length} Parsed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {parseErrors.length > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{parseErrors.length} notices</span>
                        </span>
                      )}
                      {previewQuestions.length > 0 && (
                        <button
                          type="button"
                          onClick={handleCopyJson}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                        >
                          {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedJson ? 'JSON Copied!' : 'Copy JSON'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: JSON SCHEMA */}
            {activeTab === 'json_mode' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Paste JSON array of Question objects:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setJsonText(SAMPLE_BPSC_JSON);
                      handleParseText(SAMPLE_BPSC_JSON);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Load Sample JSON
                  </button>
                </div>

                <textarea
                  rows={14}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    handleParseText(e.target.value);
                  }}
                  placeholder="Paste JSON array [...] here..."
                  className="w-full flex-1 min-h-[260px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
                />
              </div>
            )}

            {/* TAB 3: SINGLE MANUAL ENTRY FORM */}
            {activeTab === 'single_manual' && (
              <form onSubmit={handleAddSingle} className="space-y-3 flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question Text in Hindi (प्रश्न) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="प्रश्न लिखें... e.g. प्रथम n प्राकृत संख्याओं का योग क्या है?"
                    value={singleQ.text}
                    onChange={(e) => setSingleQ({ ...singleQ, text: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['a', 'b', 'c', 'd', 'e'] as const).map((key) => {
                    const valKey = `opt${key.toUpperCase()}` as keyof typeof singleQ;
                    return (
                      <div key={key} className={key === 'e' ? 'sm:col-span-2' : ''}>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase">
                          Option ({key.toUpperCase()}) {key !== 'e' ? '*' : '(Safe Skip / अनुत्तरित)'}
                        </label>
                        <input
                          type="text"
                          required={key !== 'e'}
                          value={String(singleQ[valKey] || '')}
                          onChange={(e) => setSingleQ({ ...singleQ, [valKey]: e.target.value })}
                          placeholder={`विकल्प (${key.toUpperCase()}) का मान`}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                        />
                        {key === 'e' && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <button
                              type="button"
                              onClick={() => setSingleQ({ ...singleQ, optE: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' })}
                              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-bold hover:bg-amber-500/20"
                            >
                              अनुत्तरित (विस्तृत)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSingleQ({ ...singleQ, optE: 'उत्तर नहीं देना चाहते (कोई अंक नहीं कटेगा)' })}
                              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-bold hover:bg-amber-500/20"
                            >
                              उत्तर नहीं देना
                            </button>
                            <button
                              type="button"
                              onClick={() => setSingleQ({ ...singleQ, optE: 'अनुत्तरित प्रश्न' })}
                              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[10px] font-bold hover:bg-amber-500/20"
                            >
                              अनुत्तरित प्रश्न
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      Correct Option Key *
                    </label>
                    <select
                      value={singleQ.correct}
                      onChange={(e) => setSingleQ({ ...singleQ, correct: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                    >
                      <option value="a">Option (A) - सही उत्तर</option>
                      <option value="b">Option (B) - सही उत्तर</option>
                      <option value="c">Option (C) - सही उत्तर</option>
                      <option value="d">Option (D) - सही उत्तर</option>
                      <option value="e">Option (E) - सही उत्तर</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      Exam Tag / Source
                    </label>
                    <input
                      type="text"
                      value={singleQ.exam}
                      onChange={(e) => setSingleQ({ ...singleQ, exam: e.target.value })}
                      placeholder="e.g. Bihar STET (9 & 10) 2024"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      Hindi Explanation (व्याख्या)
                    </label>
                    <input
                      type="text"
                      value={singleQ.explanation}
                      onChange={(e) => setSingleQ({ ...singleQ, explanation: e.target.value })}
                      placeholder="विस्तृत व्याख्या या सूत्र"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Save Single Question to Bank</span>
                </button>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: Live Question Review & Inspection Studio (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-full bg-slate-50/80 dark:bg-slate-950/60 overflow-hidden">
            
            {/* Review Studio Header */}
            <div className="p-3.5 sm:px-5 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shrink-0 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Live Question Studio
                </h4>
                <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  {previewQuestions.length} Questions
                </span>

                {auditReport.problemCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsQualityReviewOpen(true)}
                    className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] bg-amber-500/20 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-950 border border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                    title="Click to review and fix issues"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>{auditReport.problemCount} Attention</span>
                  </button>
                )}
              </div>

              {/* Search & Quick Filter */}
              {previewQuestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-36 sm:w-44 focus:outline-none focus:w-56 transition-all"
                    />
                  </div>

                  {/* Jump To Dropdown / Input */}
                  {previewQuestions.length > 10 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <span>Jump:</span>
                      <select
                        onChange={(e) => handleJumpToQuestion(Number(e.target.value))}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        {Array.from({ length: Math.ceil(previewQuestions.length / 10) }).map((_, idx) => {
                          const qNum = idx * 10 + 1;
                          return (
                            <option key={qNum} value={qNum}>
                              Q{qNum}
                            </option>
                          );
                        })}
                        <option value={previewQuestions.length}>Q{previewQuestions.length}</option>
                      </select>
                    </div>
                  )}

                  {/* Mock Test Title Input */}
                  <input
                    type="text"
                    placeholder="Mock Test Title (Optional)"
                    value={testTitleInput}
                    onChange={(e) => setTestTitleInput(e.target.value)}
                    className="hidden sm:inline-block bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold w-40 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Attention Required Banner */}
            {previewQuestions.length > 0 && auditReport.problemCount > 0 && (
              <div className="mx-3.5 sm:mx-5 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 flex-wrap">
                      <span>⚠️ {auditReport.problemCount} प्रश्नों में सुधार या समीक्षा आवश्यक है</span>
                      {auditReport.duplicateCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                          {auditReport.duplicateCount} डुप्लीकेट
                        </span>
                      )}
                      {auditReport.blankOptionCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-700 dark:text-red-300 text-[10px] font-bold">
                          {auditReport.blankOptionCount} खाली विकल्प
                        </span>
                      )}
                      {auditReport.blankExplanationCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          {auditReport.blankExplanationCount} खाली व्याख्या
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300/80">
                      खाली विकल्प/हल भरने अथवा डुप्लीकेट हटाने के लिए एक क्लिक में समीक्षा करें।
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQualityReviewOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>सुधारें व हटाएं (Review & Fix)</span>
                </button>
              </div>
            )}

            {/* Questions Scrollable Canvas */}
            <div
              ref={previewScrollContainerRef}
              className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5"
            >
              {previewQuestions.length === 0 ? (
                /* Empty State */
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <FileText className="w-8 h-8 opacity-60" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      No Questions Extracted Yet
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Paste or drag-and-drop your math questions document on the left panel.
                      KaTeX formulas, Hindi solutions and answer keys will instantly render here in real time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_BPSC_TEXT)}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>⚡ Load Sample 8 BPSC Questions to See Magic</span>
                  </button>
                </div>
              ) : (
                /* Question Cards List */
                <>
                  {paginatedQuestions.map(({ q, originalIdx }) => {
                    const isEditing = editingIndex === originalIdx;

                    if (isEditing && editItemState) {
                      return (
                        <div
                          key={originalIdx}
                          id={`preview-q-${originalIdx + 1}`}
                          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-3 animate-in fade-in"
                        >
                          <div className="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between">
                            <span>Editing Question #{originalIdx + 1}</span>
                            <button
                              onClick={handleSaveInlineEdit}
                              className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400"
                            >
                              Save Changes
                            </button>
                          </div>

                          <textarea
                            rows={3}
                            value={editItemState.questionText}
                            onChange={(e) =>
                              setEditItemState({ ...editItemState, questionText: e.target.value })
                            }
                            className="w-full bg-white dark:bg-slate-950 border border-amber-400/40 p-2.5 text-xs rounded-xl font-mono focus:outline-none"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {editItemState.options.map((opt, optIdx) => (
                              <div key={opt.key} className="flex items-center gap-2">
                                <span className="font-bold uppercase text-slate-500 shrink-0">
                                  ({opt.key})
                                </span>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const updatedOpts = [...editItemState.options];
                                    updatedOpts[optIdx] = { ...opt, text: e.target.value };
                                    setEditItemState({ ...editItemState, options: updatedOpts });
                                  }}
                                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-1.5 rounded-lg text-xs"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 pt-1 text-xs">
                            <span className="font-bold">Correct Key:</span>
                            <select
                              value={editItemState.correctOption}
                              onChange={(e) =>
                                setEditItemState({
                                  ...editItemState,
                                  correctOption: e.target.value as any
                                })
                              }
                              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded-lg font-bold"
                            >
                              <option value="a">A</option>
                              <option value="b">B</option>
                              <option value="c">C</option>
                              <option value="d">D</option>
                              <option value="e">E</option>
                            </select>
                          </div>
                        </div>
                      );
                    }

                    const auditItem = questionAuditMap.get(q.id);

                    return (
                      <div
                        key={originalIdx}
                        id={`preview-q-${originalIdx + 1}`}
                        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-shadow shadow-xs space-y-3 ${
                          auditItem?.hasErrors
                            ? 'border-red-500/40 ring-1 ring-red-500/20'
                            : auditItem?.isDuplicate
                            ? 'border-purple-500/40 ring-1 ring-purple-500/20'
                            : auditItem?.hasWarnings
                            ? 'border-amber-500/40'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-black text-xs">
                              Q{originalIdx + 1}
                            </span>

                            {auditItem && auditItem.issues.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setIsQualityReviewOpen(true)}
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                                  auditItem.hasErrors
                                    ? 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white'
                                    : auditItem.isDuplicate
                                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500 hover:text-white'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950'
                                }`}
                                title="Click to review and fix issues"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>{auditItem.issues[0]?.title || 'समीक्षा आवश्यक'}</span>
                              </button>
                            )}

                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                              {q.topicNameHindi || topicNameHindi}
                            </span>
                            {q.exam && (
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {q.exam}
                              </span>
                            )}
                            {q.createdAt && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium text-[10px] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{q.createdAt}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-black text-[11px] uppercase tracking-wider font-mono">
                              KEY: ({q.correctOption.toUpperCase()})
                            </span>

                            <button
                              type="button"
                              onClick={() => handleStartEdit(originalIdx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                              title="Edit this question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePreviewItem(originalIdx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Remove from import"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Question Stem Text */}
                        <div className="text-slate-900 dark:text-slate-100 text-sm sm:text-base font-semibold font-sans leading-relaxed">
                          <MathText text={q.questionText} />
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => {
                            const isCorrect = opt.key.toLowerCase() === q.correctOption.toLowerCase();
                            return (
                              <div
                                key={opt.key}
                                className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/20'
                                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {opt.key.toUpperCase()}
                                </span>
                                <div className="leading-snug break-words flex-1 min-w-0">
                                  <MathText text={opt.text} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-slate-800 dark:text-amber-200 text-xs sm:text-[13px] leading-relaxed">
                            <span className="font-bold text-amber-700 dark:text-amber-400">व्याख्या: </span>
                            <MathText text={q.explanation} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pagination Bar for 50+ questions */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      <span className="text-slate-500">
                        Showing {(currentPage - 1) * pageSize + 1} -{' '}
                        {Math.min(currentPage * pageSize, filteredQuestions.length)} of{' '}
                        {filteredQuestions.length} Questions
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage((p) => Math.max(1, p - 1));
                            previewScrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                          Page {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                            previewScrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {previewQuestions.length > 0
              ? `${previewQuestions.length} Questions ready for « ${topicNameHindi} »`
              : 'Paste or upload questions on the left to start'}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            {activeTab !== 'single_manual' && (
              <>
                {auditReport.problemCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsQualityReviewOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/35 hover:bg-amber-500/25 transition-all active:scale-95"
                    title="Review Blank/Duplicate Issues"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Review Issues ({auditReport.problemCount})</span>
                  </button>
                )}

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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Save & Start Test ({previewQuestions.length} Qs)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {isSuccessToast && (
          <div className="fixed bottom-8 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-5 h-5" />
            <span>Questions imported successfully!</span>
          </div>
        )}

        {/* ImageKit Cloud Upload Modal */}
        <ImageKitUploadModal
          isOpen={isImageKitModalOpen}
          onClose={() => setIsImageKitModalOpen(false)}
          onImageUploaded={(snippet) => {
            handleImageUploaded(snippet);
            setIsImageKitModalOpen(false);
          }}
        />

        {/* Smart Quality & Duplicate Attention Modal */}
        <SmartQualityReviewModal
          isOpen={isQualityReviewOpen}
          onClose={() => setIsQualityReviewOpen(false)}
          auditReport={auditReport}
          onUpdateQuestions={(updated) => {
            setPreviewQuestions(updated);
            setJsonText(JSON.stringify(updated, null, 2));
          }}
        />
      </div>
    </div>
  );
}
