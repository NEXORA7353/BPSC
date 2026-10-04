import { useState, useMemo } from 'react';
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
  BookOpen
} from 'lucide-react';
import { Question } from '../types';
import { parseBulkQuestionText } from '../utils/questionParser';
import {
  addQuestionsToBank,
  getAllRegisteredTopics,
  registerNewTopic
} from '../utils/questionBankStorage';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addedCount: number) => void;
  defaultTopic?: string;
}

const SAMPLE_BPSC_TEXT = `प्रश्न 1
a × b = ल.स. (a, b) × म.स. (a, b) यह केवल सत्य है-
(a) दो संख्याओं के लिए
(b) तीन संख्याओं के लिए
(c) चार संख्याओं के लिए
(d) इनमें से कोई नहीं
(e) उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक

परीक्षा: Bihar STET (9 & 10) 23/05/2024 (Shift-II)
उत्तर: (a)
व्याख्या:
a × b = ल.स.(a,b) × म.स.(a,b) यह केवल दो संख्याओं के लिए सत्य है। क्योंकि दो संख्याओं का गुणनफल, उनके लघुत्तम समापवर्त्य (ल.स.) और महत्तम समापवर्तक (म.स.) के गुणनफल के बराबर होता है।

प्रश्न 2
एक दुकानदार अपनी साड़ियों का मूल्य लागत मूल्य से 20% अधिक निर्धारित करता है तथा खरीददार को 10% बट्टा भी देता है। इस प्रकार दुकानदार को कुल कितने प्रतिशत का लाभ होगा?
(a) 10%
(b) 8%
(c) 12%
(d) 15%
(e) उपर्युक्त में से कोई नहीं

परीक्षा: BPSC TRE 3.0 (9 & 10) 21/07/2024
उत्तर: (b)
व्याख्या:
माना क्रय मूल्य (CP) = ₹100
अंकित मूल्य (MP) = ₹120
10% बट्टे के बाद विक्रय मूल्य = 120 × 90/100 = ₹108
लाभ% = 108 - 100 = 8%.`;

const SAMPLE_STET_4_OPTIONS = `Q1. 124 तथा 24 का महत्तम समापवर्तक (HCF) होगा-
(a) 1
(b) 2
(c) 3
(d) 4
Ans: (d)
व्याख्या: 124 = 2×2×31, 24 = 2×2×2×3, म.स. = 2×2 = 4

Q2. किसी वस्तु पर छपा हुआ मूल्य ₹900 है, लेकिन एक व्यापारी इसे 40% छूट पर खरीदकर ₹900 में बेचता है। व्यापारी का प्रतिशत लाभ होगा-
(a) 33⅓% (b) 66% (c) 66⅔% (d) 60%
Ans: (c)
व्याख्या: क्रय मूल्य = 900 × 0.60 = ₹540. लाभ = 900 - 540 = 360. लाभ% = (360/540) × 100 = 66⅔%`;

export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTopic
}: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<'bulk_paste' | 'json_mode' | 'single_manual'>('bulk_paste');
  const [rawText, setRawText] = useState('');
  const [jsonText, setJsonText] = useState('');

  // Topics
  const [registeredTopics, setRegisteredTopics] = useState(() => getAllRegisteredTopics());
  const [selectedTopic, setSelectedTopic] = useState(defaultTopic || 'profit_loss');
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);
  const [newTopicKey, setNewTopicKey] = useState('');
  const [newTopicHindi, setNewTopicHindi] = useState('');
  const [newTopicEnglish, setNewTopicEnglish] = useState('');

  // Parsed Questions state for in-place editing
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Single Question Form State
  const [singleQ, setSingleQ] = useState({
    text: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    optE: 'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक',
    correct: 'a' as 'a' | 'b' | 'c' | 'd' | 'e',
    exam: 'BPSC TRE 4.0 / Bihar STET',
    explanation: ''
  });

  if (!isOpen) return null;

  const currentTopicObj = registeredTopics.find((t) => t.key === selectedTopic);
  const topicNameHindi = currentTopicObj?.labelHindi || 'विविध गणित (Custom Topic)';

  const handleParseText = (text: string) => {
    const result = parseBulkQuestionText(text, selectedTopic, topicNameHindi);
    setPreviewQuestions(result.questions);
    setParseErrors(result.errors);
    if (result.questions.length > 0) {
      setJsonText(JSON.stringify(result.questions, null, 2));
    }
  };

  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    if (val.trim().length > 15) {
      handleParseText(val);
    } else {
      setPreviewQuestions([]);
      setParseErrors([]);
      setJsonText('');
    }
  };

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        setPreviewQuestions(parsed);
        setParseErrors([]);
      }
    } catch {
      // not valid JSON yet
    }
  };

  const handleCreateNewTopic = () => {
    if (!newTopicHindi.trim()) return;
    const key = newTopicKey.trim() || newTopicHindi.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const created = registerNewTopic(key, newTopicHindi, newTopicEnglish || newTopicHindi);
    setRegisteredTopics(getAllRegisteredTopics());
    setSelectedTopic(created.key);
    setIsCreatingNewTopic(false);
    setNewTopicKey('');
    setNewTopicHindi('');
    setNewTopicEnglish('');
  };

  const handleLoadSample = (sample: string) => {
    setRawText(sample);
    handleParseText(sample);
  };

  const handleCopyJson = () => {
    if (previewQuestions.length === 0) return;
    const formatted = JSON.stringify(previewQuestions, null, 2);
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  };

  const handleDeletePreviewItem = (index: number) => {
    const updated = previewQuestions.filter((_, i) => i !== index);
    setPreviewQuestions(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleSaveImport = () => {
    if (previewQuestions.length === 0) return;
    const { count } = addQuestionsToBank(previewQuestions);
    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      onSuccess(count);
      onClose();
    }, 1000);
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
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight">
                Bulk Question Importer & PDF Parser
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste raw questions from exam PDFs — regex automatically extracts 5 options, answer key & Hindi explanation
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
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50/60 dark:bg-slate-900/40 text-xs sm:text-sm font-bold shrink-0">
          <button
            onClick={() => setActiveTab('bulk_paste')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'bulk_paste'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Raw PDF / Text Paste</span>
          </button>

          <button
            onClick={() => setActiveTab('json_mode')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'json_mode'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>JSON Question Bank Format</span>
          </button>

          <button
            onClick={() => setActiveTab('single_manual')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'single_manual'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Single Question Entry</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Target Topic Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Assign to Topic:</span>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
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
                  New Topic Details (नया अध्याय जोड़ें)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Topic Name in Hindi (e.g. साधारण ब्याज / ब्याज)"
                    value={newTopicHindi}
                    onChange={(e) => setNewTopicHindi(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Topic Name in English (e.g. Simple Interest)"
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

          {/* TAB 1: RAW PDF / TEXT PASTE */}
          {activeTab === 'bulk_paste' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Paste Raw Question Text Below (Exam Paper, PDF or Word)</span>
                </label>

                {/* Sample Loaders */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Load Template:</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_BPSC_TEXT)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    5-Option BPSC
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_STET_4_OPTIONS)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    STET 4-Option (Auto-E)
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={rawText}
                onChange={handleRawTextChange}
                placeholder={`Paste directly from PDF or notes! Our regex parser will detect:
- Question Number & Question Text in Hindi
- 5 Options: (a), (b), (c), (d), and (e)
- Correct Answer Key: 'उत्तर: (a)' or 'Ans. (b)'
- Exam Source: 'परीक्षा: Bihar STET 2024'
- Explanation: 'व्याख्या: ...'

Example:
प्रश्न 1. दो संख्याओं का म.स. 16 है...
(a) 100 (b) 200 (c) 300 (d) 400
उत्तर: (b)
व्याख्या: म.स. × ल.स. = दो संख्याओं का गुणनफल`}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 resize-y leading-relaxed"
              />

              {/* Extraction Metrics Bar */}
              {rawText.trim().length > 15 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">
                      Extraction Status:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-mono">
                      {previewQuestions.length} Questions Extracted
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {parseErrors.length > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{parseErrors.length} blocks skipped</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'JSON Copied!' : 'Copy Parsed JSON'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JSON QUESTION BANK FORMAT */}
          {activeTab === 'json_mode' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span>Internal JSON Question Bank Schema</span>
                </label>
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

              <textarea
                rows={11}
                value={jsonText}
                onChange={handleJsonTextChange}
                placeholder="[ { id, questionText, options: [{ key: 'a', text: '' }, ...], correctOption: 'a', explanation: '' } ]"
                className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-4 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 resize-y leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: SINGLE MANUAL FORM */}
          {activeTab === 'single_manual' && (
            <form onSubmit={handleAddSingle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Text in Hindi (प्रश्न का विवरण) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="यहाँ प्रश्न लिखें (e.g. दो संख्याओं का ल.स. 120 तथा म.स. 6 है...)"
                  value={singleQ.text}
                  onChange={(e) => setSingleQ({ ...singleQ, text: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-hidden"
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
                    Step-by-Step Hindi Explanation (विस्तृत हल)
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

          {/* PARSED PREVIEW & IN-PLACE EDITING CARDS */}
          {previewQuestions.length > 0 && activeTab !== 'single_manual' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Extracted Questions Preview ({previewQuestions.length} Questions)
                </h4>
                <span className="text-[11px] text-slate-400">
                  Click on any card to edit before saving
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {previewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono font-bold flex items-center justify-center text-[11px]">
                          Q{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {q.exam}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                          Correct: ({q.correctOption})
                        </span>
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

                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm font-sans leading-relaxed">
                      {q.questionText}
                    </p>

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
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 text-xs leading-relaxed">
                        <span className="font-bold">व्याख्या: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {previewQuestions.length > 0
              ? `${previewQuestions.length} Questions Ready to Save into ${topicNameHindi}`
              : 'Paste questions text above to auto-extract'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            {activeTab !== 'single_manual' && (
              <button
                disabled={previewQuestions.length === 0}
                onClick={handleSaveImport}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
              >
                {isSuccessToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Saved into Database!</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import {previewQuestions.length} Questions to Bank</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
