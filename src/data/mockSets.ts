import { MockTestSet } from '../types';
import { coordinateGeometryQuestions } from './coordinateGeometryQuestions';

export const mockTestSets: MockTestSet[] = [
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

