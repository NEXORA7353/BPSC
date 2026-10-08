import { MockTestSet, TestAttemptRecord, RegisteredTopic, Question } from '../types';
import { normalizeTestTitle, cleanTitleToEnglish } from './questionBankStorage';

export interface ChapterFolderDef {
  id: string;
  nameEnglish: string;
  nameHindi: string;
  categoryKey: string;
  description: string;
  color: {
    bgLight: string;
    bgDark: string;
    border: string;
    text: string;
    badge: string;
    iconBg: string;
    gradient: string;
  };
  iconType: string;
}

// Preset themes and descriptions for all core BPSC syllabus topics
export const TOPIC_FOLDER_PRESETS: Record<string, Partial<ChapterFolderDef>> = {
  number_system: {
    nameEnglish: 'Number System',
    nameHindi: 'संख्या पद्धति',
    description: 'Divisibility rules, Unit Digits, Remainders, Factors, Prime Numbers & Real Exam Problems',
    color: {
      bgLight: 'bg-amber-500/10',
      bgDark: 'dark:bg-amber-500/5',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      iconBg: 'bg-amber-500 text-slate-950',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
    },
    iconType: 'number_system'
  },
  lcm_hcf: {
    nameEnglish: 'LCM & HCF',
    nameHindi: 'लघुत्तम और महत्तम समापवर्तक',
    description: 'Least Common Multiple, Highest Common Factor, Bell ringing & Remainder Division models',
    color: {
      bgLight: 'bg-cyan-500/10',
      bgDark: 'dark:bg-cyan-500/5',
      border: 'border-cyan-500/30',
      text: 'text-cyan-500',
      badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      iconBg: 'bg-cyan-500 text-slate-950',
      gradient: 'from-cyan-500/20 via-sky-500/10 to-transparent'
    },
    iconType: 'lcm_hcf'
  },
  percentage: {
    nameEnglish: 'Percentage',
    nameHindi: 'प्रतिशत',
    description: 'Percentage change, successive increase/decrease, consumption, expenditure & voting problems',
    color: {
      bgLight: 'bg-rose-500/10',
      bgDark: 'dark:bg-rose-500/5',
      border: 'border-rose-500/30',
      text: 'text-rose-500',
      badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
      iconBg: 'bg-rose-500 text-white',
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent'
    },
    iconType: 'percentage'
  },
  profit_loss: {
    nameEnglish: 'Profit & Loss',
    nameHindi: 'लाभ और हानि',
    description: 'Cost Price, Selling Price, Profit/Loss Percentage, Dishonest Seller & False Weights',
    color: {
      bgLight: 'bg-emerald-500/10',
      bgDark: 'dark:bg-emerald-500/5',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      iconBg: 'bg-emerald-500 text-slate-950',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
    },
    iconType: 'profit_loss'
  },
  discount: {
    nameEnglish: 'Discount & Marked Price',
    nameHindi: 'बट्टा एवं अंकित मूल्य',
    description: 'Successive Discounts, Marked Price (MP), Cost Price (CP) & Selling Price relations',
    color: {
      bgLight: 'bg-teal-500/10',
      bgDark: 'dark:bg-teal-500/5',
      border: 'border-teal-500/30',
      text: 'text-teal-500',
      badge: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
      iconBg: 'bg-teal-500 text-slate-950',
      gradient: 'from-teal-500/20 via-emerald-500/10 to-transparent'
    },
    iconType: 'discount'
  },
  simple_interest: {
    nameEnglish: 'Simple Interest',
    nameHindi: 'साधारण ब्याज',
    description: 'Principal, Rate of Interest, Time duration, Amount & Installment authentic questions',
    color: {
      bgLight: 'bg-green-500/10',
      bgDark: 'dark:bg-green-500/5',
      border: 'border-green-500/30',
      text: 'text-green-500',
      badge: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
      iconBg: 'bg-green-500 text-slate-950',
      gradient: 'from-green-500/20 via-emerald-500/10 to-transparent'
    },
    iconType: 'simple_interest'
  },
  compound_interest: {
    nameEnglish: 'Compound Interest',
    nameHindi: 'चक्रवृद्धि ब्याज',
    description: 'Compounded annually/half-yearly, CI - SI difference formula & multi-year growth rates',
    color: {
      bgLight: 'bg-emerald-600/10',
      bgDark: 'dark:bg-emerald-600/5',
      border: 'border-emerald-600/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-600/30',
      iconBg: 'bg-emerald-600 text-white',
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent'
    },
    iconType: 'compound_interest'
  },
  average: {
    nameEnglish: 'Average',
    nameHindi: 'औसत',
    description: 'Arithmetic Mean, Weighted Average, Batsman/Bowler averages, Replacement & Age change sets',
    color: {
      bgLight: 'bg-sky-500/10',
      bgDark: 'dark:bg-sky-500/5',
      border: 'border-sky-500/30',
      text: 'text-sky-500',
      badge: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
      iconBg: 'bg-sky-500 text-white',
      gradient: 'from-sky-500/20 via-blue-500/10 to-transparent'
    },
    iconType: 'average'
  },
  ratio_proportion: {
    nameEnglish: 'Ratio & Proportion',
    nameHindi: 'अनुपात और समानुपात',
    description: 'Direct & Inverse ratios, Mean/Third/Fourth proportionals, Division of sums & Coin problems',
    color: {
      bgLight: 'bg-violet-500/10',
      bgDark: 'dark:bg-violet-500/5',
      border: 'border-violet-500/30',
      text: 'text-violet-500',
      badge: 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30',
      iconBg: 'bg-violet-500 text-white',
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent'
    },
    iconType: 'ratio_proportion'
  },
  partnership: {
    nameEnglish: 'Partnership',
    nameHindi: 'साझेदारी',
    description: 'Investment capital, Time duration, Sleeping & Working partners, Profit sharing ratios',
    color: {
      bgLight: 'bg-purple-500/10',
      bgDark: 'dark:bg-purple-500/5',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
      iconBg: 'bg-purple-500 text-white',
      gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent'
    },
    iconType: 'partnership'
  },
  mixture: {
    nameEnglish: 'Mixture & Alligation',
    nameHindi: 'मिश्रण एवं पृथक्कीकरण',
    description: 'Rule of Alligation, Milk-Water dilutions, Repeated liquid replacements & mean price',
    color: {
      bgLight: 'bg-fuchsia-500/10',
      bgDark: 'dark:bg-fuchsia-500/5',
      border: 'border-fuchsia-500/30',
      text: 'text-fuchsia-500',
      badge: 'bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
      iconBg: 'bg-fuchsia-500 text-white',
      gradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent'
    },
    iconType: 'mixture'
  },
  age_problems: {
    nameEnglish: 'Age Related Problems',
    nameHindi: 'आयु संबंधित प्रश्न',
    description: 'Father-Son ratios, Past/Present/Future age equations & Cross-multiplication techniques',
    color: {
      bgLight: 'bg-amber-600/10',
      bgDark: 'dark:bg-amber-600/5',
      border: 'border-amber-600/30',
      text: 'text-amber-500',
      badge: 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/30',
      iconBg: 'bg-amber-600 text-white',
      gradient: 'from-amber-600/20 via-orange-600/10 to-transparent'
    },
    iconType: 'age_problems'
  },
  time_work: {
    nameEnglish: 'Time & Work',
    nameHindi: 'कार्य और समय',
    description: 'Work efficiency, Alternate days work, Men-Women-Children equivalence & wages distribution',
    color: {
      bgLight: 'bg-blue-600/10',
      bgDark: 'dark:bg-blue-600/5',
      border: 'border-blue-600/30',
      text: 'text-blue-500',
      badge: 'bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-600/30',
      iconBg: 'bg-blue-600 text-white',
      gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent'
    },
    iconType: 'time_work'
  },
  pipe_cistern: {
    nameEnglish: 'Pipe & Cistern',
    nameHindi: 'पाइप और टंकी',
    description: 'Inlet & Outlet filling pipes, Tank emptying leaks, Alternate pipe operation models',
    color: {
      bgLight: 'bg-cyan-600/10',
      bgDark: 'dark:bg-cyan-600/5',
      border: 'border-cyan-600/30',
      text: 'text-cyan-500',
      badge: 'bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border-cyan-600/30',
      iconBg: 'bg-cyan-600 text-white',
      gradient: 'from-cyan-600/20 via-teal-600/10 to-transparent'
    },
    iconType: 'pipe_cistern'
  },
  time_distance: {
    nameEnglish: 'Time, Speed & Distance',
    nameHindi: 'समय, चाल एवं दूरी',
    description: 'Average speed, Train crossing pole/platform/another train, Relative speed of moving objects',
    color: {
      bgLight: 'bg-orange-500/10',
      bgDark: 'dark:bg-orange-500/5',
      border: 'border-orange-500/30',
      text: 'text-orange-500',
      badge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
      iconBg: 'bg-orange-500 text-white',
      gradient: 'from-orange-500/20 via-amber-500/10 to-transparent'
    },
    iconType: 'time_distance'
  },
  boats_stream: {
    nameEnglish: 'Boats & Stream',
    nameHindi: 'नाव और धारा',
    description: 'Upstream & Downstream speed, Still water velocity, Current speed & Round trip calculations',
    color: {
      bgLight: 'bg-blue-500/10',
      bgDark: 'dark:bg-blue-500/5',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
      iconBg: 'bg-blue-500 text-white',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent'
    },
    iconType: 'boats_stream'
  },
  equations: {
    nameEnglish: 'Equations & Polynomials',
    nameHindi: 'रैखिक एवं द्विघात समीकरण',
    description: 'Linear systems, Quadratic roots, Discriminant, Nature of roots & Factor theorem',
    color: {
      bgLight: 'bg-violet-600/10',
      bgDark: 'dark:bg-violet-600/5',
      border: 'border-violet-600/30',
      text: 'text-violet-400',
      badge: 'bg-violet-600/20 text-violet-700 dark:text-violet-300 border-violet-600/30',
      iconBg: 'bg-violet-600 text-white',
      gradient: 'from-violet-600/20 via-purple-600/10 to-transparent'
    },
    iconType: 'equations'
  },
  mensuration: {
    nameEnglish: '2D & 3D Mensuration',
    nameHindi: 'क्षेत्रमिति (2D एवं 3D)',
    description: 'Cuboid, Cylinder, Cone, Sphere, Rhombus, Circle & Perimeter diagrams',
    color: {
      bgLight: 'bg-indigo-500/10',
      bgDark: 'dark:bg-indigo-500/5',
      border: 'border-indigo-500/30',
      text: 'text-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      iconBg: 'bg-indigo-500 text-white',
      gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent'
    },
    iconType: 'mensuration'
  },
  geometry: {
    nameEnglish: 'Geometry',
    nameHindi: 'ज्यामिति',
    description: 'Circle Theorems, Tangents, Triangle Medians, Trapezium & Angle formulas',
    color: {
      bgLight: 'bg-purple-600/10',
      bgDark: 'dark:bg-purple-600/5',
      border: 'border-purple-600/30',
      text: 'text-purple-400',
      badge: 'bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-600/30',
      iconBg: 'bg-purple-600 text-white',
      gradient: 'from-purple-600/20 via-fuchsia-600/10 to-transparent'
    },
    iconType: 'geometry'
  },
  coordinate_geometry: {
    nameEnglish: 'Coordinate Geometry',
    nameHindi: 'निर्देशांक ज्यामिति',
    description: 'Distance formula, Section formula, Area of triangle, Slope of lines & Coordinate proofs',
    color: {
      bgLight: 'bg-fuchsia-600/10',
      bgDark: 'dark:bg-fuchsia-600/5',
      border: 'border-fuchsia-600/30',
      text: 'text-fuchsia-400',
      badge: 'bg-fuchsia-600/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-600/30',
      iconBg: 'bg-fuchsia-600 text-white',
      gradient: 'from-fuchsia-600/20 via-pink-600/10 to-transparent'
    },
    iconType: 'geometry'
  },
  trigonometry: {
    nameEnglish: 'Trigonometry',
    nameHindi: 'त्रिकोणमिति',
    description: 'Trigonometric identities, Standard angles, Complementary ratios, Max-Min values',
    color: {
      bgLight: 'bg-pink-500/10',
      bgDark: 'dark:bg-pink-500/5',
      border: 'border-pink-500/30',
      text: 'text-pink-500',
      badge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
      iconBg: 'bg-pink-500 text-white',
      gradient: 'from-pink-500/20 via-rose-500/10 to-transparent'
    },
    iconType: 'trigonometry'
  },
  height_distance: {
    nameEnglish: 'Height & Distance',
    nameHindi: 'ऊंचाई और दूरी',
    description: 'Angle of Elevation, Angle of Depression, Tower & Shadow real problems',
    color: {
      bgLight: 'bg-rose-600/10',
      bgDark: 'dark:bg-rose-600/5',
      border: 'border-rose-600/30',
      text: 'text-rose-400',
      badge: 'bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-600/30',
      iconBg: 'bg-rose-600 text-white',
      gradient: 'from-rose-600/20 via-amber-600/10 to-transparent'
    },
    iconType: 'trigonometry'
  },
  statistics: {
    nameEnglish: 'Statistics',
    nameHindi: 'सांख्यिकी',
    description: 'Mean, Median, Mode, Standard Deviation, Variance, Frequency distributions',
    color: {
      bgLight: 'bg-teal-600/10',
      bgDark: 'dark:bg-teal-600/5',
      border: 'border-teal-600/30',
      text: 'text-teal-400',
      badge: 'bg-teal-600/20 text-teal-700 dark:text-teal-300 border-teal-600/30',
      iconBg: 'bg-teal-600 text-white',
      gradient: 'from-teal-600/20 via-emerald-600/10 to-transparent'
    },
    iconType: 'average'
  },
  probability_perm_comb: {
    nameEnglish: 'Probability & Combinations',
    nameHindi: 'प्रायिकता एवं क्रमचय-संचय',
    description: 'Coin, Dice, Card decks, Permutations (nPr) and Combinations (nCr) problems',
    color: {
      bgLight: 'bg-indigo-600/10',
      bgDark: 'dark:bg-indigo-600/5',
      border: 'border-indigo-600/30',
      text: 'text-indigo-400',
      badge: 'bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-600/30',
      iconBg: 'bg-indigo-600 text-white',
      gradient: 'from-indigo-600/20 via-violet-600/10 to-transparent'
    },
    iconType: 'probability_perm_comb'
  },
  progression: {
    nameEnglish: 'Progression (AP / GP)',
    nameHindi: 'श्रेणी (समान्तर एवं गुणोत्तर)',
    description: 'Arithmetic Progression, Geometric Progression, Sum of n terms formulas',
    color: {
      bgLight: 'bg-lime-500/10',
      bgDark: 'dark:bg-lime-500/5',
      border: 'border-lime-500/30',
      text: 'text-lime-500',
      badge: 'bg-lime-500/20 text-lime-700 dark:text-lime-300 border-lime-500/30',
      iconBg: 'bg-lime-500 text-slate-950',
      gradient: 'from-lime-500/20 via-emerald-500/10 to-transparent'
    },
    iconType: 'progression'
  },
  stocks_shares: {
    nameEnglish: 'Stock & Shares',
    nameHindi: 'स्टॉक और शेयर',
    description: 'Face value, Market value, Dividend yield, Brokerage & Rate of return',
    color: {
      bgLight: 'bg-emerald-500/10',
      bgDark: 'dark:bg-emerald-500/5',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      iconBg: 'bg-emerald-500 text-white',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
    },
    iconType: 'profit_loss'
  },
  grand_syllabus: {
    nameEnglish: 'Grand Syllabus & Combined Mocks',
    nameHindi: 'संपूर्ण पाठ्यक्रम कंबाइंड मॉक',
    description: 'Full syllabus 40-question and multi-chapter comprehensive BPSC TRE 4.0 exam sets',
    color: {
      bgLight: 'bg-indigo-500/10',
      bgDark: 'dark:bg-indigo-500/5',
      border: 'border-indigo-500/30',
      text: 'text-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      iconBg: 'bg-indigo-500 text-white',
      gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent'
    },
    iconType: 'grand'
  },
  custom_tests: {
    nameEnglish: 'Custom Generated Tests',
    nameHindi: 'कस्टम निर्मित टेस्ट सेट्स',
    description: 'Tests generated on-demand with customized question count, timer, and topics',
    color: {
      bgLight: 'bg-amber-600/10',
      bgDark: 'dark:bg-amber-600/5',
      border: 'border-amber-600/30',
      text: 'text-amber-500',
      badge: 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/30',
      iconBg: 'bg-amber-600 text-white',
      gradient: 'from-amber-600/20 via-orange-600/10 to-transparent'
    },
    iconType: 'custom'
  },
  general_mocks: {
    nameEnglish: 'General Subject Tests',
    nameHindi: 'सामान्य विषयवार टेस्ट',
    description: 'Practice questions covering additional core mathematics curriculum',
    color: {
      bgLight: 'bg-slate-500/10',
      bgDark: 'dark:bg-slate-500/5',
      border: 'border-slate-500/30',
      text: 'text-slate-400',
      badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
      iconBg: 'bg-slate-700 text-white',
      gradient: 'from-slate-500/20 via-slate-600/10 to-transparent'
    },
    iconType: 'general'
  }
};

const DYNAMIC_PALETTES = [
  {
    bgLight: 'bg-emerald-500/10',
    bgDark: 'dark:bg-emerald-500/5',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    iconBg: 'bg-emerald-500 text-slate-950',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  {
    bgLight: 'bg-sky-500/10',
    bgDark: 'dark:bg-sky-500/5',
    border: 'border-sky-500/30',
    text: 'text-sky-500',
    badge: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
    iconBg: 'bg-sky-500 text-white',
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent'
  },
  {
    bgLight: 'bg-violet-500/10',
    bgDark: 'dark:bg-violet-500/5',
    border: 'border-violet-500/30',
    text: 'text-violet-500',
    badge: 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30',
    iconBg: 'bg-violet-500 text-white',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent'
  },
  {
    bgLight: 'bg-rose-500/10',
    bgDark: 'dark:bg-rose-500/5',
    border: 'border-rose-500/30',
    text: 'text-rose-500',
    badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
    iconBg: 'bg-rose-500 text-white',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent'
  },
  {
    bgLight: 'bg-amber-500/10',
    bgDark: 'dark:bg-amber-500/5',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    iconBg: 'bg-amber-500 text-slate-950',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  {
    bgLight: 'bg-indigo-500/10',
    bgDark: 'dark:bg-indigo-500/5',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    iconBg: 'bg-indigo-500 text-white',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent'
  }
];

/**
 * Returns or dynamically creates a chapter folder definition for ANY topic key.
 */
export function getTopicFolderDef(
  topicKey: string,
  registeredTopics?: RegisteredTopic[]
): ChapterFolderDef {
  const normKey = (topicKey || 'custom').trim().toLowerCase();

  // 1. Direct preset match
  if (TOPIC_FOLDER_PRESETS[normKey]) {
    const preset = TOPIC_FOLDER_PRESETS[normKey];
    const registered = (registeredTopics || []).find((t) => t.key.toLowerCase() === normKey);
    return {
      id: normKey,
      nameEnglish: registered?.labelEnglish || preset.nameEnglish || cleanTitleToEnglish(normKey),
      nameHindi: registered?.labelHindi || preset.nameHindi || normKey,
      categoryKey: normKey,
      description: preset.description || `Practice tests and real questions for ${normKey}`,
      color: preset.color || DYNAMIC_PALETTES[0],
      iconType: preset.iconType || 'folder'
    };
  }

  // 2. Check registeredTopics
  const registered = (registeredTopics || []).find((t) => t.key.toLowerCase() === normKey);
  const englishName = registered?.labelEnglish || cleanTitleToEnglish(normKey.replace(/[-_]/g, ' '));
  const hindiName = registered?.labelHindi || englishName;

  // Pick deterministic palette
  let hash = 0;
  for (let i = 0; i < normKey.length; i++) {
    hash = (hash << 5) - hash + normKey.charCodeAt(i);
    hash |= 0;
  }
  const paletteIndex = Math.abs(hash) % DYNAMIC_PALETTES.length;
  const color = DYNAMIC_PALETTES[paletteIndex];

  return {
    id: normKey,
    nameEnglish: englishName,
    nameHindi: hindiName,
    categoryKey: normKey,
    description: `Targeted authentic practice questions and mock tests for ${englishName}`,
    color,
    iconType: 'folder'
  };
}

/**
 * Determine which chapter folder a test belongs to.
 * Resolves to the specific topic folder (e.g. boats_stream, simple_interest, age_problems)
 * instead of dumping into generic custom_tests.
 */
export function getTestChapterId(
  test: MockTestSet,
  registeredTopics?: RegisteredTopic[]
): string {
  if (!test) return 'general_mocks';

  // 1. Explicit Grand Syllabus / Combined Mock check
  const title = (test.title || '').toLowerCase();
  const subtitle = (test.subtitle || '').toLowerCase();
  const catTitle = (test.categoryTitle || '').toLowerCase();
  const topicBadges = (test.topicBadges || []).map((b) => b.toLowerCase());
  const combinedText = `${title} ${subtitle} ${catTitle} ${topicBadges.join(' ')}`;

  if (
    combinedText.includes('grand') ||
    combinedText.includes('syllabus') ||
    combinedText.includes('combined mock') ||
    combinedText.includes('40 q') ||
    combinedText.includes('full mock') ||
    (test.topicBreakdown && test.topicBreakdown.length >= 4)
  ) {
    return 'grand_syllabus';
  }

  // 2. Direct ID prefix match for auto topic tests
  if (test.id.startsWith('auto_topic_test_')) {
    return test.id.replace('auto_topic_test_', '');
  }

  // 3. Dominant Question Topic Analysis
  if (Array.isArray(test.questions) && test.questions.length > 0) {
    const topicCounts = new Map<string, number>();
    test.questions.forEach((q) => {
      if (q && q.topic) {
        const tKey = q.topic.trim().toLowerCase();
        topicCounts.set(tKey, (topicCounts.get(tKey) || 0) + 1);
      }
    });

    let maxTopic = '';
    let maxCount = 0;
    topicCounts.forEach((count, tKey) => {
      if (count > maxCount) {
        maxCount = count;
        maxTopic = tKey;
      }
    });

    // If 4+ diverse topics with no clear majority, it's a combined test
    if (topicCounts.size >= 4 && maxCount / test.questions.length < 0.45) {
      return 'grand_syllabus';
    }

    // Dominant topic found
    if (maxTopic && maxCount / test.questions.length >= 0.35) {
      return maxTopic;
    }
  }

  // 4. Topic Badges matching known topics
  const knownKeys = [
    'boats_stream',
    'simple_interest',
    'compound_interest',
    'discount',
    'profit_loss',
    'percentage',
    'average',
    'age_problems',
    'ratio_proportion',
    'partnership',
    'mixture',
    'pipe_cistern',
    'time_distance',
    'time_work',
    'lcm_hcf',
    'number_system',
    'mensuration',
    'geometry',
    'coordinate_geometry',
    'trigonometry',
    'height_distance',
    'statistics',
    'probability_perm_comb',
    'progression',
    'equations',
    'stocks_shares'
  ];

  for (const badge of topicBadges) {
    if (badge.includes('boat') || badge.includes('stream') || badge.includes('नाव') || badge.includes('धारा')) {
      return 'boats_stream';
    }
    if (badge.includes('simple interest') || badge.includes('साधारण ब्याज')) {
      return 'simple_interest';
    }
    if (badge.includes('compound interest') || badge.includes('चक्रवृद्धि ब्याज')) {
      return 'compound_interest';
    }
    if (badge.includes('discount') || badge.includes('बट्टा') || badge.includes('छूट')) {
      return 'discount';
    }
    if (badge.includes('age') || badge.includes('आयु')) {
      return 'age_problems';
    }
    if (badge.includes('average') || badge.includes('औसत')) {
      return 'average';
    }
    if (badge.includes('ratio') || badge.includes('proportion') || badge.includes('अनुपात')) {
      return 'ratio_proportion';
    }
    if (badge.includes('partnership') || badge.includes('साझेदारी')) {
      return 'partnership';
    }
    if (badge.includes('mixture') || badge.includes('alligation') || badge.includes('मिश्रण')) {
      return 'mixture';
    }
    if (badge.includes('pipe') || badge.includes('cistern') || badge.includes('टंकी')) {
      return 'pipe_cistern';
    }
    if (badge.includes('distance') || badge.includes('speed') || badge.includes('दूरी') || badge.includes('चाल')) {
      return 'time_distance';
    }
    if (badge.includes('work') || badge.includes('कार्य')) {
      return 'time_work';
    }
    if (badge.includes('profit') || badge.includes('loss') || badge.includes('लाभ') || badge.includes('हानि')) {
      return 'profit_loss';
    }
    if (badge.includes('percentage') || badge.includes('प्रतिशत')) {
      return 'percentage';
    }
    if (badge.includes('lcm') || badge.includes('hcf') || badge.includes('लघुत्तम') || badge.includes('महत्तम')) {
      return 'lcm_hcf';
    }
    if (badge.includes('number system') || badge.includes('संख्या पद्धति')) {
      return 'number_system';
    }
    if (badge.includes('mensuration') || badge.includes('क्षेत्रमिति')) {
      return 'mensuration';
    }
    if (badge.includes('coordinate') || badge.includes('निर्देशांक')) {
      return 'coordinate_geometry';
    }
    if (badge.includes('geometry') || badge.includes('ज्यामिति')) {
      return 'geometry';
    }
    if (badge.includes('trigonometry') || badge.includes('त्रिकोणमिति')) {
      return 'trigonometry';
    }
    if (badge.includes('equation') || badge.includes('समीकरण') || badge.includes('algebra') || badge.includes('बीजगणित')) {
      return 'equations';
    }

    // Check custom registered topics
    if (registeredTopics) {
      const match = registeredTopics.find((t) => {
        const en = t.labelEnglish.toLowerCase();
        const hi = t.labelHindi.toLowerCase();
        return badge === t.key.toLowerCase() || badge.includes(en) || badge.includes(hi);
      });
      if (match) return match.key;
    }
  }

  // 5. Title & Subtitle Keyword Matching
  if (combinedText.includes('boat') || combinedText.includes('stream') || combinedText.includes('नाव') || combinedText.includes('धारा')) {
    return 'boats_stream';
  }
  if (combinedText.includes('simple interest') || combinedText.includes('साधारण ब्याज')) {
    return 'simple_interest';
  }
  if (combinedText.includes('compound interest') || combinedText.includes('चक्रवृद्धि ब्याज')) {
    return 'compound_interest';
  }
  if (combinedText.includes('discount') || combinedText.includes('बट्टा') || combinedText.includes('छूट')) {
    return 'discount';
  }
  if (combinedText.includes('mensuration') || combinedText.includes('क्षेत्रमिति') || combinedText.includes('cuboid') || combinedText.includes('cylinder') || combinedText.includes('sphere') || combinedText.includes('rhombus')) {
    return 'mensuration';
  }
  if (combinedText.includes('coordinate') || combinedText.includes('निर्देशांक')) {
    return 'coordinate_geometry';
  }
  if (combinedText.includes('geometry') || combinedText.includes('ज्यामिति') || combinedText.includes('tangent') || combinedText.includes('trapezium')) {
    return 'geometry';
  }
  if (combinedText.includes('age') || combinedText.includes('आयु')) {
    return 'age_problems';
  }
  if (combinedText.includes('average') || combinedText.includes('औसत')) {
    return 'average';
  }
  if (combinedText.includes('ratio') || combinedText.includes('proportion') || combinedText.includes('अनुपात')) {
    return 'ratio_proportion';
  }
  if (combinedText.includes('partnership') || combinedText.includes('साझेदारी')) {
    return 'partnership';
  }
  if (combinedText.includes('mixture') || combinedText.includes('alligation') || combinedText.includes('मिश्रण')) {
    return 'mixture';
  }
  if (combinedText.includes('pipe') || combinedText.includes('cistern') || combinedText.includes('टंकी')) {
    return 'pipe_cistern';
  }
  if (combinedText.includes('distance') || combinedText.includes('speed') || combinedText.includes('दूरी') || combinedText.includes('चाल')) {
    return 'time_distance';
  }
  if (combinedText.includes('time and work') || combinedText.includes('कार्य और समय') || combinedText.includes('time & work')) {
    return 'time_work';
  }
  if (combinedText.includes('lcm') || combinedText.includes('hcf') || combinedText.includes('लघुत्तम') || combinedText.includes('महत्तम')) {
    return 'lcm_hcf';
  }
  if (combinedText.includes('profit') || combinedText.includes('loss') || combinedText.includes('लाभ') || combinedText.includes('हानि')) {
    return 'profit_loss';
  }
  if (combinedText.includes('percentage') || combinedText.includes('प्रतिशत')) {
    return 'percentage';
  }
  if (combinedText.includes('number system') || combinedText.includes('संख्या पद्धति') || combinedText.includes('number')) {
    return 'number_system';
  }
  if (combinedText.includes('trigonometry') || combinedText.includes('त्रिकोणमिति')) {
    return 'trigonometry';
  }
  if (combinedText.includes('algebra') || combinedText.includes('समीकरण') || combinedText.includes('equation')) {
    return 'equations';
  }

  // 6. Fallback
  if (test.isCustom) {
    return 'custom_tests';
  }

  return 'general_mocks';
}

/**
 * Extract human-readable creation date & time from a test in English
 */
export function formatTestDateTime(test: MockTestSet): { formatted: string; isApprox: boolean } {
  if (test.createdAt) {
    const d = new Date(test.createdAt);
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return { formatted: `${datePart} · ${timePart}`, isApprox: false };
    }
  }

  const match = test.id.match(/(\d{12,14})/);
  if (match) {
    const ts = parseInt(match[1], 10);
    const d = new Date(ts);
    if (!isNaN(d.getTime()) && d.getFullYear() >= 2024 && d.getFullYear() <= 2030) {
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return { formatted: `${datePart} · ${timePart}`, isApprox: false };
    }
  }

  return { formatted: 'Oct 8, 2026 · 11:00 PM', isApprox: true };
}

/**
 * Check if a test has been attempted by the user
 */
export function getTestAttempt(
  test: MockTestSet,
  attempts: TestAttemptRecord[]
): TestAttemptRecord | null {
  if (!attempts || attempts.length === 0 || !test) return null;
  
  const byId = attempts.find((a) => a.testId === test.id);
  if (byId) return byId;

  const normTitle = normalizeTestTitle(test.title);
  if (normTitle) {
    const byTitle = attempts.find(
      (a) => a.testTitle && normalizeTestTitle(a.testTitle) === normTitle
    );
    if (byTitle) return byTitle;
  }

  return null;
}

export interface GroupedChapterFolder {
  definition: ChapterFolderDef;
  tests: MockTestSet[];
  totalQuestions: number;
  totalTimeMinutes: number;
  attemptedCount: number;
}

// Preferred ordering of core curriculum topics
const TOPIC_SORT_ORDER: string[] = [
  'number_system',
  'lcm_hcf',
  'percentage',
  'profit_loss',
  'discount',
  'simple_interest',
  'compound_interest',
  'average',
  'ratio_proportion',
  'age_problems',
  'partnership',
  'mixture',
  'time_work',
  'pipe_cistern',
  'time_distance',
  'boats_stream',
  'equations',
  'mensuration',
  'geometry',
  'coordinate_geometry',
  'trigonometry',
  'height_distance',
  'statistics',
  'probability_perm_comb',
  'progression',
  'stocks_shares',
  'grand_syllabus',
  'custom_tests',
  'general_mocks'
];

/**
 * Groups all available test sets into active chapter folders.
 * Dynamically creates a folder for EVERY topic for which questions or tests exist.
 */
export function groupTestsIntoChapters(
  tests: MockTestSet[],
  attempts: TestAttemptRecord[],
  allQuestions?: Question[],
  registeredTopics?: RegisteredTopic[]
): GroupedChapterFolder[] {
  const map = new Map<string, MockTestSet[]>();

  // 1. Distribute active test sets into their respective topic folders
  (tests || []).forEach((t) => {
    if (!t || !t.id) return;
    const chapterId = getTestChapterId(t, registeredTopics);
    const list = map.get(chapterId) || [];
    list.push(t);
    map.set(chapterId, list);
  });

  // 2. Synthesize chapter tests for any topic that has questions in Question Bank but no standalone test yet
  if (Array.isArray(allQuestions) && allQuestions.length > 0) {
    const questionsByTopic = new Map<string, Question[]>();
    allQuestions.forEach((q) => {
      if (q && q.topic) {
        const tKey = q.topic.trim().toLowerCase();
        const list = questionsByTopic.get(tKey) || [];
        list.push(q);
        questionsByTopic.set(tKey, list);
      }
    });

    questionsByTopic.forEach((topicQs, topicKey) => {
      if (!map.has(topicKey) || (map.get(topicKey) || []).length === 0) {
        const def = getTopicFolderDef(topicKey, registeredTopics);
        const autoTest: MockTestSet = {
          id: `auto_topic_test_${topicKey}`,
          title: `BPSC TRE 4.0: ${def.nameEnglish} Chapter Test`,
          subtitle: `${def.nameHindi} · Comprehensive Topic Test (${topicQs.length} Questions)`,
          targetExam: 'BPSC TRE 4.0',
          category: 'full_mock',
          categoryTitle: def.nameEnglish,
          topicBadges: [def.nameEnglish],
          totalQuestions: topicQs.length,
          totalTimeMinutes: Math.max(10, Math.ceil(topicQs.length * 1)),
          questions: topicQs
        };
        map.set(topicKey, [autoTest]);
      }
    });
  }

  // 3. Build GroupedChapterFolder structures
  const result: GroupedChapterFolder[] = [];

  map.forEach((chapterTests, chapterId) => {
    if (!chapterTests || chapterTests.length === 0) return;

    let totalQuestions = 0;
    let totalTimeMinutes = 0;
    let attemptedCount = 0;

    chapterTests.forEach((t) => {
      totalQuestions += t.totalQuestions || (Array.isArray(t.questions) ? t.questions.length : 0);
      totalTimeMinutes += t.totalTimeMinutes || 20;
      if (getTestAttempt(t, attempts)) {
        attemptedCount += 1;
      }
    });

    const definition = getTopicFolderDef(chapterId, registeredTopics);

    result.push({
      definition,
      tests: chapterTests,
      totalQuestions,
      totalTimeMinutes,
      attemptedCount
    });
  });

  // 4. Sort folders according to syllabus order, then custom topics, then grand/general
  result.sort((a, b) => {
    const idxA = TOPIC_SORT_ORDER.indexOf(a.definition.id);
    const idxB = TOPIC_SORT_ORDER.indexOf(b.definition.id);
    const orderA = idxA !== -1 ? idxA : 100;
    const orderB = idxB !== -1 ? idxB : 100;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.definition.nameEnglish.localeCompare(b.definition.nameEnglish);
  });

  return result;
}
