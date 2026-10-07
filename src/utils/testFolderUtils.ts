import { MockTestSet, TestAttemptRecord } from '../types';
import { normalizeTestTitle } from './questionBankStorage';

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
  iconType: 'discount' | 'mensuration' | 'geometry' | 'number_system' | 'percentage' | 'algebra' | 'grand' | 'custom' | 'general';
}

export const CHAPTER_DEFINITIONS: ChapterFolderDef[] = [
  {
    id: 'lcm_hcf_number',
    nameEnglish: 'Number System, LCM & HCF',
    nameHindi: 'संख्या पद्धति, ल.स. एवं म.स.',
    categoryKey: 'lcm_hcf_number',
    description: 'Divisibility, Unit Digits, Remainders, Factors, LCM & HCF real exam problems',
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
  {
    id: 'discount',
    nameEnglish: 'Discount & Marked Price',
    nameHindi: 'बट्टा एवं अंकित मूल्य',
    categoryKey: 'discount',
    description: 'Successive Discounts, Marked Price (MP), Cost Price (CP) & Selling Price relations',
    color: {
      bgLight: 'bg-emerald-500/10',
      bgDark: 'dark:bg-emerald-500/5',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      iconBg: 'bg-emerald-500 text-slate-950',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
    },
    iconType: 'discount'
  },
  {
    id: 'mensuration',
    nameEnglish: '2D & 3D Mensuration',
    nameHindi: 'क्षेत्रमिति (2D एवं 3D)',
    categoryKey: 'mensuration',
    description: 'Cuboid, Cylinder, Cone, Sphere, Rhombus, Circle & Perimeter diagrams',
    color: {
      bgLight: 'bg-blue-500/10',
      bgDark: 'dark:bg-blue-500/5',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
      iconBg: 'bg-blue-500 text-white',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent'
    },
    iconType: 'mensuration'
  },
  {
    id: 'geometry',
    nameEnglish: 'Geometry & Coordinate Geometry',
    nameHindi: 'ज्यामिति एवं निर्देशांक ज्यामिति',
    categoryKey: 'geometry',
    description: 'Circle Theorems, Tangents, Triangle Medians, Trapezium & Coordinate formulas',
    color: {
      bgLight: 'bg-purple-500/10',
      bgDark: 'dark:bg-purple-500/5',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
      iconBg: 'bg-purple-500 text-white',
      gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent'
    },
    iconType: 'geometry'
  },
  {
    id: 'percentage_profit',
    nameEnglish: 'Percentage, Profit & Loss',
    nameHindi: 'प्रतिशत, लाभ एवं हानि',
    categoryKey: 'percentage_profit',
    description: 'Percentage changes, Profit-Loss percentages, False Weights & Dishonest Seller',
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
  {
    id: 'algebra_equations',
    nameEnglish: 'Algebra & Quadratic Equations',
    nameHindi: 'बीजगणित एवं द्विघात समीकरण',
    categoryKey: 'algebra_equations',
    description: 'Polynomial zeroes, Algebraic identities, Linear & Quadratic equations',
    color: {
      bgLight: 'bg-cyan-500/10',
      bgDark: 'dark:bg-cyan-500/5',
      border: 'border-cyan-500/30',
      text: 'text-cyan-500',
      badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      iconBg: 'bg-cyan-500 text-slate-950',
      gradient: 'from-cyan-500/20 via-sky-500/10 to-transparent'
    },
    iconType: 'algebra'
  },
  {
    id: 'grand_syllabus',
    nameEnglish: 'Grand Syllabus & Combined Mocks',
    nameHindi: 'संपूर्ण पाठ्यक्रम कंबाइंड मॉक',
    categoryKey: 'grand_syllabus',
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
  {
    id: 'custom_tests',
    nameEnglish: 'Custom Generated Tests',
    nameHindi: 'कस्टम निर्मित टेस्ट सेट्स',
    categoryKey: 'custom_tests',
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
  {
    id: 'general_mocks',
    nameEnglish: 'General Subject Tests',
    nameHindi: 'सामान्य विषयवार टेस्ट',
    categoryKey: 'general_mocks',
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
];

/**
 * Determine which chapter folder a test belongs to
 */
export function getTestChapterId(test: MockTestSet): string {
  const title = (test.title || '').toLowerCase();
  const subtitle = (test.subtitle || '').toLowerCase();
  const catTitle = (test.categoryTitle || '').toLowerCase();
  const topicBadges = (test.topicBadges || []).map((b) => b.toLowerCase()).join(' ');
  const combinedText = `${title} ${subtitle} ${catTitle} ${topicBadges}`;

  // 1. Discount / बट्टा
  if (combinedText.includes('discount') || combinedText.includes('बट्टा') || combinedText.includes('छूट')) {
    return 'discount';
  }

  // 2. Mensuration / क्षेत्रमिति
  if (
    combinedText.includes('mensuration') ||
    combinedText.includes('क्षेत्रमिति') ||
    combinedText.includes('cuboid') ||
    combinedText.includes('cylinder') ||
    combinedText.includes('sphere') ||
    combinedText.includes('rhombus') ||
    combinedText.includes('घनाभ') ||
    combinedText.includes('बेलन') ||
    combinedText.includes('गोला')
  ) {
    return 'mensuration';
  }

  // 3. Geometry / Coordinate / ज्यामिति / निर्देशांक
  if (
    combinedText.includes('coordinate') ||
    combinedText.includes('निर्देशांक') ||
    combinedText.includes('geometry') ||
    combinedText.includes('ज्यामिति') ||
    combinedText.includes('triangle') ||
    combinedText.includes('circle') ||
    combinedText.includes('tangent') ||
    combinedText.includes('trapezium')
  ) {
    return 'geometry';
  }

  // 4. Grand Syllabus / Full Multi-Topic Mock
  if (
    combinedText.includes('grand') ||
    combinedText.includes('syllabus') ||
    combinedText.includes('40 q') ||
    combinedText.includes('full mock') ||
    (test.topicBreakdown && test.topicBreakdown.length >= 3)
  ) {
    return 'grand_syllabus';
  }

  // 5. LCM / HCF / Number System / संख्या पद्धति
  if (
    combinedText.includes('lcm') ||
    combinedText.includes('hcf') ||
    combinedText.includes('लघुत्तम') ||
    combinedText.includes('महत्तम') ||
    combinedText.includes('संख्या पद्धति') ||
    combinedText.includes('number system') ||
    combinedText.includes('संख्या')
  ) {
    return 'lcm_hcf_number';
  }

  // 6. Percentage / Profit & Loss
  if (
    combinedText.includes('profit') ||
    combinedText.includes('loss') ||
    combinedText.includes('लाभ') ||
    combinedText.includes('हानि') ||
    combinedText.includes('percentage') ||
    combinedText.includes('प्रतिशत')
  ) {
    return 'percentage_profit';
  }

  // 7. Algebra & Equations
  if (
    combinedText.includes('algebra') ||
    combinedText.includes('बीजगणित') ||
    combinedText.includes('polynomial') ||
    combinedText.includes('बहुपद') ||
    combinedText.includes('equation') ||
    combinedText.includes('समीकरण')
  ) {
    return 'algebra_equations';
  }

  // 8. Custom user-created tests
  if (test.isCustom) {
    return 'custom_tests';
  }

  return 'general_mocks';
}

/**
 * Extract human-readable creation date & time from a test in English
 */
export function formatTestDateTime(test: MockTestSet): { formatted: string; isApprox: boolean } {
  // If explicitly stored createdAt
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

  // Try extracting timestamp from ID (e.g. custom_test_1791233129425_1791233211454)
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

  return { formatted: 'Oct 7, 2026 · 2:30 PM', isApprox: true };
}

/**
 * Check if a test has been attempted by the user
 */
export function getTestAttempt(
  test: MockTestSet,
  attempts: TestAttemptRecord[]
): TestAttemptRecord | null {
  if (!attempts || attempts.length === 0 || !test) return null;
  
  // 1. Direct ID match
  const byId = attempts.find((a) => a.testId === test.id);
  if (byId) return byId;

  // 2. Normalized Title match
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

/**
 * Groups all available test sets into active chapter folders
 */
export function groupTestsIntoChapters(
  tests: MockTestSet[],
  attempts: TestAttemptRecord[]
): GroupedChapterFolder[] {
  const map = new Map<string, MockTestSet[]>();

  // Distribute tests into chapter buckets
  tests.forEach((t) => {
    if (!t || !t.id) return;
    const chapterId = getTestChapterId(t);
    const list = map.get(chapterId) || [];
    list.push(t);
    map.set(chapterId, list);
  });

  const result: GroupedChapterFolder[] = [];

  CHAPTER_DEFINITIONS.forEach((def) => {
    const chapterTests = map.get(def.id);
    if (chapterTests && chapterTests.length > 0) {
      let totalQuestions = 0;
      let totalTimeMinutes = 0;
      let attemptedCount = 0;

      chapterTests.forEach((t) => {
        totalQuestions += t.totalQuestions || 0;
        totalTimeMinutes += t.totalTimeMinutes || 0;
        if (getTestAttempt(t, attempts)) {
          attemptedCount += 1;
        }
      });

      result.push({
        definition: def,
        tests: chapterTests,
        totalQuestions,
        totalTimeMinutes,
        attemptedCount
      });
    }
  });

  return result;
}
