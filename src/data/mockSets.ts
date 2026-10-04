import { MockTestSet, Question } from '../types';
import { lcmHcfQuestions } from './lcmQuestions';
import { percentageQuestions } from './percentageQuestions';
import { profitLossQuestions } from './profitLossQuestions';

// Helper to interleave two arrays: [a0, b0, a1, b1, ...]
function interleave2(arrA: Question[], arrB: Question[]): Question[] {
  const result: Question[] = [];
  const maxLen = Math.max(arrA.length, arrB.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < arrA.length) result.push(arrA[i]);
    if (i < arrB.length) result.push(arrB[i]);
  }
  return result;
}

// Helper to interleave three arrays: [a0, b0, c0, a1, b1, c1, ...]
function interleave3(arrA: Question[], arrB: Question[], arrC: Question[]): Question[] {
  const result: Question[] = [];
  const maxLen = Math.max(arrA.length, arrB.length, arrC.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < arrA.length) result.push(arrA[i]);
    if (i < arrB.length) result.push(arrB[i]);
    if (i < arrC.length) result.push(arrC[i]);
  }
  return result;
}

// --- CATEGORY 1: 3-TOPIC COMBINED MEGA MOCKS (त्रि-विषय संगम) ---
// Mega Mock 01: 10 LCM (0..10) + 10 Percentage (0..10) + 10 Profit & Loss (0..10) = 30 Questions
const triMock1Questions = interleave3(
  lcmHcfQuestions.slice(0, 10),
  percentageQuestions.slice(0, 10),
  profitLossQuestions.slice(0, 10)
);

// Mega Mock 02: 10 LCM (10..20) + 10 Percentage (10..20) + 10 Profit & Loss (10..20) = 30 Questions
const triMock2Questions = interleave3(
  lcmHcfQuestions.slice(10, 20),
  percentageQuestions.slice(10, 20),
  profitLossQuestions.slice(10, 20)
);

// --- CATEGORY 2: PROFIT & LOSS SPECIAL TESTS (लाभ और हानि स्पेशल 2 टेस्ट) ---
// Profit & Loss Test 1: Questions 1 to 24 (24 questions)
const plTest1Questions = profitLossQuestions.slice(0, 24);

// Profit & Loss Test 2: Questions 25 to 47 (23 questions)
const plTest2Questions = profitLossQuestions.slice(24, 47);

// --- CATEGORY 3: LCM & HCF + PERCENTAGE MIXED SETS (द्वि-विषय सेट्स) ---
const set1Questions = interleave2(
  lcmHcfQuestions.slice(0, 14),
  percentageQuestions.slice(0, 13)
);
const set2Questions = interleave2(
  lcmHcfQuestions.slice(14, 28),
  percentageQuestions.slice(13, 26)
);
const set3Questions = interleave2(
  lcmHcfQuestions.slice(28, 41),
  percentageQuestions.slice(26, 39)
);
const set4Questions = interleave2(
  lcmHcfQuestions.slice(41, 55),
  percentageQuestions.slice(39, 52)
);

export const mockTestSets: MockTestSet[] = [
  // 1. Tri-Topic Combined Mega Mocks
  {
    id: 'bpsc_tre4_tri_mock_1',
    title: 'त्रि-विषय महा-मॉक टेस्ट - 01',
    subtitle: 'LCM & HCF + प्रतिशत + लाभ और हानि (तीनों विषयों का संपूर्ण संगम)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'tri_topic',
    categoryTitle: 'त्रि-विषय महा-मॉक टेस्ट (3 Topics Combined)',
    topicBadges: ['LCM & HCF', 'प्रतिशत (Percentage)', 'लाभ और हानि (P&L)'],
    totalQuestions: triMock1Questions.length,
    totalTimeMinutes: triMock1Questions.length, // 1 min per question rule
    questions: triMock1Questions
  },
  {
    id: 'bpsc_tre4_tri_mock_2',
    title: 'त्रि-विषय महा-मॉक टेस्ट - 02',
    subtitle: 'LCM & HCF + प्रतिशत + लाभ और हानि (तीनों विषयों का संपूर्ण संगम)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'tri_topic',
    categoryTitle: 'त्रि-विषय महा-मॉक टेस्ट (3 Topics Combined)',
    topicBadges: ['LCM & HCF', 'प्रतिशत (Percentage)', 'लाभ और हानि (P&L)'],
    totalQuestions: triMock2Questions.length,
    totalTimeMinutes: triMock2Questions.length, // 1 min per question rule
    questions: triMock2Questions
  },

  // 2. Profit & Loss Special Tests
  {
    id: 'bpsc_tre4_pl_test_1',
    title: 'लाभ और हानि (Profit & Loss) - टेस्ट 01',
    subtitle: 'छूट, बट्टा, क्रय-विक्रय मूल्य, समतुल्य बट्टा (प्रश्न 1 से 24)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'profit_loss',
    categoryTitle: 'लाभ और हानि स्पेशल (Profit & Loss Tests)',
    topicBadges: ['लाभ और हानि (Profit & Loss)'],
    totalQuestions: plTest1Questions.length,
    totalTimeMinutes: plTest1Questions.length,
    questions: plTest1Questions
  },
  {
    id: 'bpsc_tre4_pl_test_2',
    title: 'लाभ और हानि (Profit & Loss) - टेस्ट 02',
    subtitle: 'बेईमान व्यापारी, क्रमिक छूट, साझा लाभ-हानि (प्रश्न 25 से 47)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'profit_loss',
    categoryTitle: 'लाभ और हानि स्पेशल (Profit & Loss Tests)',
    topicBadges: ['लाभ और हानि (Profit & Loss)'],
    totalQuestions: plTest2Questions.length,
    totalTimeMinutes: plTest2Questions.length,
    questions: plTest2Questions
  },

  // 3. LCM & HCF + Percentage Dual Topic Sets
  {
    id: 'bpsc_tre4_mock_1',
    title: 'LCM-HCF एवं प्रतिशत - सेट 01',
    subtitle: 'लघुत्तम समापवर्त्य, महत्तम समापवर्तक एवं प्रतिशत (मिश्रित अभ्यास)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'lcm_percentage',
    categoryTitle: 'LCM, HCF एवं प्रतिशत सेट्स',
    topicBadges: ['LCM & HCF', 'प्रतिशत (Percentage)'],
    totalQuestions: set1Questions.length,
    totalTimeMinutes: set1Questions.length,
    questions: set1Questions
  },
  {
    id: 'bpsc_tre4_mock_2',
    title: 'LCM-HCF एवं प्रतिशत - सेट 02',
    subtitle: 'लघुत्तम समापवर्त्य, महत्तम समापवर्तक एवं प्रतिशत (मिश्रित अभ्यास)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'lcm_percentage',
    categoryTitle: 'LCM, HCF एवं प्रतिशत सेट्स',
    topicBadges: ['LCM & HCF', 'प्रतिशत (Percentage)'],
    totalQuestions: set2Questions.length,
    totalTimeMinutes: set2Questions.length,
    questions: set2Questions
  },
  {
    id: 'bpsc_tre4_mock_3',
    title: 'LCM-HCF एवं प्रतिशत - सेट 03',
    subtitle: 'लघुत्तम समापवर्त्य, महत्तम समापवर्तक एवं प्रतिशत (मिश्रित अभ्यास)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'lcm_percentage',
    categoryTitle: 'LCM, HCF एवं प्रतिशत सेट्स',
    topicBadges: ['LCM & HCF', 'प्रतिशत (Percentage)'],
    totalQuestions: set3Questions.length,
    totalTimeMinutes: set3Questions.length,
    questions: set3Questions
  },
  {
    id: 'bpsc_tre4_mock_4',
    title: 'LCM-HCF एवं प्रतिशत - सेट 04',
    subtitle: 'लघुत्तम समापवर्त्य, महत्तम समापवर्तक एवं प्रतिशत (मिश्रित अभ्यास)',
    targetExam: 'BPSC TRE 4.0 (Class 6-8 / 9-10) Mathematics',
    category: 'lcm_percentage',
    categoryTitle: 'LCM, HCF एवं प्रतिशत सेट्स',
    topicBadges: ['LCM & HCF', 'प्रतिशत (Percentage)'],
    totalQuestions: set4Questions.length,
    totalTimeMinutes: set4Questions.length,
    questions: set4Questions
  }
];
