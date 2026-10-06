import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Wand2,
  X,
  Copy,
  Layers,
  Sparkles,
  HelpCircle,
  Check,
  Search,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  FileText,
  Lightbulb
} from 'lucide-react';
import {
  BatchAuditReport,
  AuditedQuestionItem,
  autoHealQuestion
} from '../utils/questionQualityAudit';
import { getQuestionCorrectKeys, getQuestionCorrectDisplay } from '../utils/questionBankStorage';
import { Question } from '../types';
import { MathText } from './MathText';

interface SmartQualityReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditReport: BatchAuditReport;
  onUpdateQuestions: (updated: Question[]) => void;
}

export function SmartQualityReviewModal({
  isOpen,
  onClose,
  auditReport,
  onUpdateQuestions
}: SmartQualityReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'all_issues' | 'duplicates' | 'blanks' | 'all'>('all_issues');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filtered List - Hook MUST be called unconditionally before any early return!
  const displayItems = useMemo(() => {
    let list = auditReport?.items || [];

    if (activeTab === 'all_issues') {
      list = list.filter((item) => item.issues.length > 0);
    } else if (activeTab === 'duplicates') {
      list = list.filter((item) => item.isDuplicate);
    } else if (activeTab === 'blanks') {
      list = list.filter((item) =>
        item.issues.some((i) => i.type === 'EMPTY_OPTION' || i.type === 'EMPTY_EXPLANATION')
      );
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (it) =>
          String(it.question?.questionText || '').toLowerCase().includes(q) ||
          it.issues.some((i) => String(i?.title || '').toLowerCase().includes(q))
      );
    }

    return list;
  }, [auditReport, activeTab, searchFilter]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Single Item Handlers
  const handleDeleteItem = (id: string) => {
    const updated = auditReport.items
      .filter((it) => it.id !== id)
      .map((it) => it.question);
    onUpdateQuestions(updated);
    showToast('प्रश्न सूची से हटा दिया गया (Deleted).');
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleAutoHealItem = (id: string) => {
    const updated = auditReport.items.map((it) => {
      if (it.id === id) {
        return autoHealQuestion(it.question);
      }
      return it.question;
    });
    onUpdateQuestions(updated);
    showToast('स्वतः ठीक किया गया (Auto-healed).');
  };

  const handleStartEdit = (item: AuditedQuestionItem) => {
    setEditingId(item.id);
    setEditForm({
      ...item.question,
      options: item.question.options.map((o) => ({ ...o }))
    });
  };

  const handleToggleCorrectKey = (key: 'a' | 'b' | 'c' | 'd' | 'e') => {
    if (!editForm) return;
    const currentKeys = getQuestionCorrectKeys(editForm);
    let nextKeys: ('a' | 'b' | 'c' | 'd' | 'e')[];
    if (currentKeys.includes(key)) {
      if (currentKeys.length > 1) {
        nextKeys = currentKeys.filter((k) => k !== key);
      } else {
        nextKeys = currentKeys;
      }
    } else {
      nextKeys = [...currentKeys, key];
    }
    setEditForm({
      ...editForm,
      correctOption: nextKeys.join(','),
      correctOptions: nextKeys
    });
  };

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return;
    const updated = auditReport.items.map((it) => {
      if (it.id === editingId) {
        return editForm;
      }
      return it.question;
    });
    onUpdateQuestions(updated);
    setEditingId(null);
    setEditForm(null);
    showToast('प्रश्न सफलतापूर्वक सहेजा गया (Updated).');
  };

  // Bulk Handlers
  const handleRemoveAllDuplicates = () => {
    const duplicateIds = new Set(
      auditReport.items.filter((it) => it.isDuplicate).map((it) => it.id)
    );
    const updated = auditReport.items
      .filter((it) => !duplicateIds.has(it.id))
      .map((it) => it.question);
    onUpdateQuestions(updated);
    showToast(`${duplicateIds.size} डुप्लीकेट प्रश्न हटा दिए गए!`);
  };

  const handleAutoHealAllBlanks = () => {
    const updated = auditReport.items.map((it) => {
      const hasBlank = it.issues.some(
        (i) => i.type === 'EMPTY_EXPLANATION' || i.type === 'EMPTY_OPTION'
      );
      if (hasBlank) {
        return autoHealQuestion(it.question);
      }
      return it.question;
    });
    onUpdateQuestions(updated);
    showToast('सभी खाली व्याख्याएं एवं विकल्प स्वतः ठीक कर दिए गए!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  Smart Attention & Quality Review
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs font-mono">
                  {auditReport.problemCount} Issues Found
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                खाली विकल्प, अधूरी व्याख्या एवं डुप्लीकेट प्रश्नों की तुरंत समीक्षा करें व सुधारें।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close Review"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Badges & Bulk Actions */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <span>कुल प्रश्न:</span>
              <strong className="font-mono">{auditReport.totalQuestions}</strong>
            </span>

            {auditReport.duplicateCount > 0 && (
              <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>डुप्लीकेट:</span>
                <strong className="font-mono">{auditReport.duplicateCount}</strong>
              </span>
            )}

            {auditReport.blankOptionCount > 0 && (
              <span className="px-3 py-1 rounded-xl bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>खाली विकल्प:</span>
                <strong className="font-mono">{auditReport.blankOptionCount}</strong>
              </span>
            )}

            {auditReport.blankExplanationCount > 0 && (
              <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>खाली व्याख्या:</span>
                <strong className="font-mono">{auditReport.blankExplanationCount}</strong>
              </span>
            )}
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            {auditReport.duplicateCount > 0 && (
              <button
                type="button"
                onClick={handleRemoveAllDuplicates}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>सभी डुप्लीकेट हटाएं ({auditReport.duplicateCount})</span>
              </button>
            )}

            {(auditReport.blankExplanationCount > 0 || auditReport.blankOptionCount > 0) && (
              <button
                type="button"
                onClick={handleAutoHealAllBlanks}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold transition-all flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>सभी खाली व्याख्या स्वतः भरें</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters & Search */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('all_issues')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'all_issues'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
            >
              सभी समस्याएं ({auditReport.problemCount})
            </button>

            <button
              onClick={() => setActiveTab('duplicates')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'duplicates'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
            >
              डुप्लीकेट्स ({auditReport.duplicateCount})
            </button>

            <button
              onClick={() => setActiveTab('blanks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'blanks'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
            >
              खाली सामग्री ({auditReport.blankOptionCount + auditReport.blankExplanationCount})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
            >
              सभी प्रश्न ({auditReport.totalQuestions})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="समस्या या प्रश्न खोजें..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Notification Toast */}
        {successToast && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{successToast}</span>
            </div>
          </div>
        )}

        {/* Scrollable Questions Review List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {displayItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                इस फ़िल्टर में कोई त्रुटि नहीं मिली!
              </h5>
              <p className="text-xs text-slate-500 max-w-sm">
                सभी प्रश्न पूर्ण एवं सही हैं अथवा फ़िल्टर की गई शर्तें पूरी हो चुकी हैं।
              </p>
            </div>
          ) : (
            displayItems.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${item.hasErrors
                      ? 'bg-red-500/[0.03] border-red-500/30 dark:border-red-500/30'
                      : item.isDuplicate
                        ? 'bg-purple-500/[0.03] border-purple-500/30 dark:border-purple-500/30'
                        : item.hasWarnings
                          ? 'bg-amber-500/[0.03] border-amber-500/30 dark:border-amber-500/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                >
                  {/* Top Bar of Item */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-black text-xs">
                        Q#{item.originalIndex + 1}
                      </span>

                      {/* Issue Badges */}
                      {item.issues.map((iss, iIdx) => (
                        <span
                          key={iIdx}
                          className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 ${iss.severity === 'critical'
                              ? 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
                              : iss.type.includes('DUPLICATE')
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{iss.title}</span>
                        </span>
                      ))}

                      {item.duplicateInfo && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold">
                          {item.duplicateInfo.similarity}% Match
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditingId(null) : handleStartEdit(item))}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditing ? 'रद्द करें' : 'सुधारें (Edit)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAutoHealItem(item.id)}
                        className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs transition-colors flex items-center gap-1"
                        title="Auto fill explanation & options"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>स्वतः ठीक करें</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-3 py-1 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-bold text-xs transition-colors flex items-center gap-1"
                        title="Delete question from import"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>हटाएं (Delete)</span>
                      </button>
                    </div>
                  </div>

                  {/* Duplicate Comparison Notice */}
                  {item.duplicateInfo && (
                    <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                      <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {item.duplicateInfo.source === 'current_batch'
                            ? `इस सूची के प्रश्न #${(item.duplicateInfo.matchedIndex || 0) + 1} से समानता:`
                            : 'प्रश्न बैंक (Question Bank) में पहले से मौजूद प्रश्न से समानता:'}
                        </span>
                      </div>
                      <div className="italic text-slate-600 dark:text-slate-400 pl-5">
                        "{item.duplicateInfo.matchedText.slice(0, 140)}..."
                      </div>
                    </div>
                  )}

                  {/* Inline Edit Form */}
                  {isEditing && editForm ? (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
                      <div className="font-bold text-xs text-amber-700 dark:text-amber-300">
                        Editing Question #{item.originalIndex + 1}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          प्रश्न विवरण (Question Text):
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.questionText}
                          onChange={(e) =>
                            setEditForm({ ...editForm, questionText: e.target.value })
                          }
                          className="w-full mt-1 p-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(Array.isArray(editForm.options) ? editForm.options : []).map((opt: any, oIdx: number) => {
                          const isBlank = !opt.text || opt.text.trim() === '';
                          return (
                            <div key={opt.key || oIdx} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="uppercase text-slate-500">
                                  Option ({opt.key}):
                                </span>
                                {isBlank && (
                                  <span className="text-red-500 text-[10px] inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-red-500" /> Required (खाली है)
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                value={opt.text || ''}
                                onChange={(e) => {
                                  const updatedOpts = [...(editForm.options || [])];
                                  updatedOpts[oIdx] = { ...opt, text: e.target.value };
                                  setEditForm({ ...editForm, options: updatedOpts });
                                }}
                                className={`w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-950 border focus:outline-none ${isBlank
                                    ? 'border-red-500 ring-1 ring-red-500'
                                    : 'border-slate-300 dark:border-slate-700'
                                  }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Answer Key & Explanation */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                              सही उत्तर (Key):
                            </label>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              (2 या अधिक उत्तर चुन सकते हैं)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {(['a', 'b', 'c', 'd', 'e'] as const).map((k) => {
                              const activeKeys = getQuestionCorrectKeys(editForm);
                              const isSelected = activeKeys.includes(k);
                              return (
                                <button
                                  key={k}
                                  type="button"
                                  onClick={() => handleToggleCorrectKey(k)}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400 scale-105'
                                      : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                                  }`}
                                  title={`Toggle answer ${k.toUpperCase()}`}
                                >
                                  {k}
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            चयनित: {getQuestionCorrectDisplay(editForm)} ({getQuestionCorrectKeys(editForm).length} उत्तर मान्य)
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            व्याख्या / हल (Explanation):
                          </label>
                          <textarea
                            rows={2}
                            value={editForm.explanation}
                            onChange={(e) =>
                              setEditForm({ ...editForm, explanation: e.target.value })
                            }
                            placeholder="विस्तृत गणितीय हल यहाँ लिखें..."
                            className="w-full mt-1 p-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                        >
                          रद्द करें
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shadow-sm"
                        >
                          सहेजें (Save Changes)
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read-Only Preview Card */
                    <div className="mt-3 space-y-2">
                      <div className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                        <MathText text={item.question.questionText} />
                      </div>

                      {/* Options Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {(Array.isArray(item.question.options) ? item.question.options : []).map((opt) => {
                          const optKey = String(opt?.key || '').toLowerCase();
                          const correctKeys = getQuestionCorrectKeys(item.question);
                          const isCorrect = correctKeys.includes(optKey as any);
                          const isEmpty = !opt?.text || String(opt.text).trim() === '';

                          return (
                            <div
                              key={optKey || Math.random().toString()}
                              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border ${isEmpty
                                  ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 font-bold'
                                  : isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                              <span className="font-mono font-bold uppercase shrink-0">
                                ({optKey || '?'})
                              </span>
                              <span className="truncate flex items-center gap-1">
                                {isEmpty ? (
                                  <span className="inline-flex items-center gap-1 text-red-500">
                                    <AlertTriangle className="w-3 h-3" /> [खाली विकल्प - Empty]
                                  </span>
                                ) : (
                                  String(opt?.text || '')
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Preview */}
                      <div
                        className={`p-2.5 rounded-xl text-xs border ${!item.question.explanation || item.question.explanation.trim() === ''
                            ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 font-bold'
                            : 'bg-amber-500/5 border-amber-500/20 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <span className="font-bold text-amber-600 dark:text-amber-400 mr-1.5">
                          व्याख्या:
                        </span>
                        {!item.question.explanation || item.question.explanation.trim() === '' ? (
                          <span className="inline-flex items-center gap-1 text-red-500">
                            <AlertTriangle className="w-3.5 h-3.5" /> कोई व्याख्या नहीं है (Explanation is Empty)
                          </span>
                        ) : (
                          <MathText text={item.question.explanation} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {auditReport.problemCount === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                सभी प्रश्न 100% सही और तैयार हैं!
              </span>
            ) : (
              <span>
                {auditReport.problemCount} प्रश्न ध्यान देने योग्य हैं। ऊपर दिए गए 'स्वतः ठीक करें' या 'सुधारें' विकल्प का उपयोग करें।
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md"
          >
            समीक्षा पूरी हुई (Done & Close)
          </button>
        </div>

      </div>
    </div>
  );
}
