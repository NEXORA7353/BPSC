import { MockTestSet } from '../types';
import { coordinateGeometryQuestions } from './coordinateGeometryQuestions';
import { mensurationQuestions } from './mensurationQuestions';

export const mockTestSets: MockTestSet[] = [
  {
    id: 'set_mensuration_23',
    title: 'BPSC TRE / STET क्षेत्रमिति (2D & 3D Mensuration Real Papers)',
    subtitle: 'घनाभ, गोला, बेलन, शंकु, समचतुर्भुज, वृत्त एवं अंतर्निहित वृत्त (चित्र सहित 23 प्रामाणिक प्रश्न)',
    category: 'full_mock',
    categoryTitle: 'क्षेत्रमिति एवं 3D/2D ज्यामिति विशेष (23 Questions)',
    topicBadges: ['क्षेत्रमिति', 'घनाभ व घन', 'गोला व बेलन', 'समचतुर्भुज', 'चित्र आधारित'],
    totalQuestions: mensurationQuestions.length,
    totalTimeMinutes: 30,
    questions: mensurationQuestions
  },
  {
    id: 'set_geometry_diagrams',
    title: 'BPSC TRE 4.0 ज्यामिति एवं निर्देशांक ज्यामिति (चित्र सहित Real Questions)',
    subtitle: 'वृत्त, स्पर्श रेखा, त्रिभुज की माध्यिका एवं समलम्ब चतुर्भुज पर आधारित प्रामाणिक प्रश्न',
    category: 'full_mock',
    categoryTitle: 'चित्र आधारित विशेष टेस्ट (Geometry with Diagrams)',
    topicBadges: ['वृत्त व स्पर्शरेखा', 'माध्यिका', 'समलम्ब चतुर्भुज', 'निर्देशांक'],
    totalQuestions: coordinateGeometryQuestions.length,
    totalTimeMinutes: 15,
    questions: coordinateGeometryQuestions
  }
];

