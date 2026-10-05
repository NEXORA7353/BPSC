import { useState } from 'react';
import { X, Search, BookOpen, Copy, Check, Sparkles, ChevronRight } from 'lucide-react';

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormulaSheetModal({ isOpen, onClose }: FormulaSheetModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'lcm_hcf' | 'percentage' | 'profit_loss' | 'algebra'>('lcm_hcf');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const formulas = [
    // LCM & HCF
    {
      id: 'lcm_1',
      category: 'lcm_hcf',
      title: 'दो संख्याओं का गुणनफल नियम (Product Formula)',
      formula: 'LCM(a, b) × HCF(a, b) = a × b',
      note: 'यह सूत्र केवल 2 संख्याओं के लिए लागू होता है।'
    },
    {
      id: 'lcm_2',
      category: 'lcm_hcf',
      title: 'भिन्नों का LCM एवं HCF (Fractions Rule)',
      formula: 'LCM = (अंशों का LCM) / (हरों का HCF) \nHCF = (अंशों का HCF) / (हरों का LCM)',
      note: 'अंश = Numerator, हर = Denominator'
    },
    {
      id: 'lcm_3',
      category: 'lcm_hcf',
      title: 'घंटियों के बजने या वृत्ताकार पथ पर मिलने का समय',
      formula: 'Time = LCM(t1, t2, t3, ...)',
      note: 'दी गई समय अवधियों का LCM निकालें।'
    },

    // Percentage
    {
      id: 'pct_1',
      category: 'percentage',
      title: 'प्रतिशत वृद्धि एवं कमी (Percentage Change)',
      formula: 'Percentage Change = (अंतर / प्रारंभिक मान) × 100%',
      note: 'यदि मान बढ़ा है तो वृद्धि %, घटा है तो कमी %।'
    },
    {
      id: 'pct_2',
      category: 'percentage',
      title: 'समान वृद्धि एवं कमी प्रभाव (Net Change Rule)',
      formula: 'Net Change % = x + y + (x × y / 100)',
      note: 'वृद्धि के लिए +x, कमी के लिए -y का प्रयोग करें।'
    },
    {
      id: 'pct_3',
      category: 'percentage',
      title: 'जनसंख्या / मूल्य ह्रास (Depreciation / Growth)',
      formula: 'Future Value = P × (1 ± R/100)^n',
      note: 'P = प्रारंभिक मान, R = दर %, n = वर्षों की संख्या'
    },

    // Profit & Loss
    {
      id: 'pl_1',
      category: 'profit_loss',
      title: 'लाभ % एवं हानि % (Profit & Loss %)',
      formula: 'Profit % = (लाभ / क्रय मूल्य) × 100 \nLoss % = (हानि / क्रय मूल्य) × 100',
      note: 'लाभ और हानि सदैव क्रय मूल्य (CP) पर ज्ञात की जाती है।'
    },
    {
      id: 'pl_2',
      category: 'profit_loss',
      title: 'अंकित मूल्य एवं छूट (Marked Price & Discount)',
      formula: 'SP = MP × (100 - Discount %) / 100',
      note: 'MP = Marked Price (अंकित मूल्य), SP = Selling Price'
    },
    {
      id: 'pl_3',
      category: 'profit_loss',
      title: 'क्रमिक छूट (Successive Discounts)',
      formula: 'Effective Discount % = d1 + d2 - (d1 × d2 / 100)',
      note: 'दो क्रमिक छूट d1% तथा d2% का समतुल्य बट्टा।'
    },

    // Algebra & Number System
    {
      id: 'alg_1',
      category: 'algebra',
      title: 'महत्वपूर्ण बीजगणितीय सूत्र (Algebraic Identities)',
      formula: '(a+b)² = a² + 2ab + b² \n(a-b)² = a² - 2ab + b² \na² - b² = (a+b)(a-b) \n(a+b)³ = a³ + b³ + 3ab(a+b)',
      note: 'BPSC परीक्षा में प्रत्यक्ष गणना में उपयोगी।'
    }
  ];

  const filteredFormulas = formulas.filter((f) => {
    const matchesTab = f.category === activeTab;
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.formula.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col text-slate-100 font-sans">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight">
                BPSC TRE 4.0 गणित सूत्र संग्रह (Formula Cheat Sheet)
              </h3>
              <p className="text-xs text-slate-400"> Quick math formulas & shortcut rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search formula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold w-full sm:w-auto">
            {[
              { id: 'lcm_hcf', label: 'LCM & HCF' },
              { id: 'percentage', label: 'Percentage' },
              { id: 'profit_loss', label: 'Profit & Loss' },
              { id: 'algebra', label: 'Algebra' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formulas List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {filteredFormulas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No formulas match your search term.
            </div>
          ) : (
            filteredFormulas.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.title}</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(item.id, item.formula)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Copy Formula"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-white font-bold whitespace-pre-line leading-relaxed">
                  {item.formula}
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
                  <strong>नोट:</strong> {item.note}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
