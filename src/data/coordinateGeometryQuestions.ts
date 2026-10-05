import { Question } from '../types';

export const coordinateGeometryQuestions: Question[] = [
  {
    id: 'coord_geom_39',
    originalNumber: 39,
    topic: 'coordinate_geometry',
    topicNameHindi: 'निर्देशांक ज्यामिति (Co-Ordinate Geometry)',
    exam: 'Bihar STET (9 & 10) 24/05/2024 (Shift-I)',
    questionText: '\\Delta ABC के शीर्षों A(-2, -1), B(3, -2) और C(-1, 2) हों, तो माध्यिका AD की लम्बाई ........ होगी।',
    options: [
      { key: 'a', text: '\\sqrt{2}' },
      { key: 'b', text: '4\\sqrt{2}' },
      { key: 'c', text: '\\sqrt{10}' },
      { key: 'd', text: 'कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'c',
    explanation: `\\Delta ABC में शीर्ष A से सम्मुख भुजा BC के मध्य बिन्दु D को मिलाने वाली रेखा माध्यिका AD कहलाती है।

1. भुजा BC के मध्य बिन्दु D(x, y) के निर्देशांक:
x = \\frac{x_1 + x_2}{2} = \\frac{3 + (-1)}{2} = \\frac{2}{2} = 1
y = \\frac{y_1 + y_2}{2} = \\frac{-2 + 2}{2} = \\frac{0}{2} = 0
अतः मध्य बिन्दु D = (1, 0)

2. बिंदु A(-2, -1) तथा D(1, 0) के बीच की दूरी (माध्यिका AD की लम्बाई):
d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}
= \\sqrt{(1 - (-2))^2 + (0 - (-1))^2}
= \\sqrt{(1 + 2)^2 + (0 + 1)^2}
= \\sqrt{3^2 + 1^2} = \\sqrt{9 + 1} = \\sqrt{10}

अतः माध्यिका AD की लम्बाई \\sqrt{10} इकाई होगी। सही उत्तर विकल्प (c) है।`,
    isCustomE: true
  },
  {
    id: 'coord_geom_101',
    originalNumber: 101,
    topic: 'coordinate_geometry',
    topicNameHindi: 'निर्देशांक ज्यामिति (Co-Ordinate Geometry)',
    exam: 'Bihar STET (9 & 10) 28/01/2020 (Shift-I)',
    questionText: 'बिन्दुएँ A(-2, -5) तथा B(3, -1) को मिलाने वाली रेखाखण्ड के मध्य बिन्दु का नियामक है-',
    options: [
      { key: 'a', text: '\\left(\\frac{1}{2}, \\frac{1}{3}\\right)' },
      { key: 'b', text: '\\left(\\frac{1}{2}, -\\frac{1}{3}\\right)' },
      { key: 'c', text: '\\left(2, -\\frac{1}{3}\\right)' },
      { key: 'd', text: '\\left(\\frac{1}{2}, -3\\right)' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `दो बिन्दुओं (x₁, y₁) तथा (x₂, y₂) के मध्य बिन्दु का नियामक सूत्र:
M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)

यहाँ x₁ = -2, y₁ = -5 तथा x₂ = 3, y₂ = -1
अतः AB का मध्य बिन्दु = \\left(\\frac{-2 + 3}{2}, \\frac{-5 - 1}{2}\\right)
= \\left(\\frac{1}{2}, \\frac{-6}{2}\\right) = \\left(\\frac{1}{2}, -3\\right)

अतः सही उत्तर विकल्प (d) है।`,
    isCustomE: true
  },
  {
    id: 'coord_geom_81',
    originalNumber: 81,
    topic: 'coordinate_geometry',
    topicNameHindi: 'निर्देशांक ज्यामिति (Co-Ordinate Geometry)',
    exam: 'BPSC-TRE 2.0 (6 to 8) 9/12/2023',
    questionText: 'किसी सरल रेखा पर मूलबिंदु (0, 0) से डाला गया लम्ब y-अक्ष की धनात्मक दिशा से \\alpha-कोण बनाता है और यह p लम्बाई का है, तो रेखा का समीकरण होगा-',
    options: [
      { key: 'a', text: 'x\\cos\\alpha + y\\sin\\alpha = p' },
      { key: 'b', text: 'x\\sin\\alpha + y\\cos\\alpha = p' },
      { key: 'c', text: 'x\\cos\\alpha - y\\sin\\alpha = p' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: `सरल रेखा के अभिलम्ब रूप (Normal Form) का मानक सूत्र:
x\\cos\\theta + y\\sin\\theta = p

जहाँ \\theta लम्ब का x-अक्ष से बना कोण है।
चूंकि लम्ब y-अक्ष से \\alpha कोण बनाता है, अतः x-अक्ष से बना कोण \\theta = (90^\\circ - \\alpha) होगा।

समीकरण में मान रखने पर:
x\\cos(90^\\circ - \\alpha) + y\\sin(90^\\circ - \\alpha) = p
\\Rightarrow x\\sin\\alpha + y\\cos\\alpha = p

अतः अभीष्ट समीकरण x\\sin\\alpha + y\\cos\\alpha = p होगा। अतः विकल्प (b) सही है।`,
    isCustomE: true
  }
];
