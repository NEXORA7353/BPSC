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
    isCustomE: true,
    imageUrl: 'https://ik.imagekit.io/bk52vah91/bpsc_questions/triangle_q39.svg'
  },
  {
    id: 'circle_geom_184',
    originalNumber: 184,
    topic: 'geometry',
    topicNameHindi: 'ज्यामिति (Geometry - Circle)',
    exam: 'Bihar STET (9 & 10) 14/09/2020 (Shift-I)',
    questionText: 'दी गई आकृति में, PT तथा PBA एक वृत्त पर खींची गई क्रमशः स्पर्श रेखा तथा छेदक रेखा है। यदि PT = 12 सेमी, PB = 8 सेमी है, तब जीवा AB का मान होगा:\n\n![वृत्त पर स्पर्श रेखा PT तथा छेदक रेखा PBA](https://ik.imagekit.io/bk52vah91/bpsc_questions/circle_q184.svg)',
    imageUrl: 'https://ik.imagekit.io/bk52vah91/bpsc_questions/circle_q184.svg',
    options: [
      { key: 'a', text: '16 सेमी' },
      { key: 'b', text: '10 सेमी' },
      { key: 'c', text: '\\sqrt{5} सेमी' },
      { key: 'd', text: '18 सेमी' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'b',
    explanation: `स्पर्श रेखा-छेदक रेखा प्रमेय (Tangent-Secant Power Theorem) से:
PA \\times PB = (PT)^2

दिए गए मान रखने पर:
PA \\times 8 = (12)^2 = 144
\\Rightarrow PA = \\frac{144}{8} = 18\\text{ सेमी}

चूँकि PA = PB + AB
\\Rightarrow AB = PA - PB = 18 - 8 = 10\\text{ सेमी}

अतः सही उत्तर विकल्प (b) 10 सेमी है।`,
    isCustomE: true
  },
  {
    id: 'circle_geom_182',
    originalNumber: 182,
    topic: 'geometry',
    topicNameHindi: 'ज्यामिति (Geometry - Trapezium & Semicircle)',
    exam: 'Bihar STET (9 & 10) 14/09/2020 (Shift-I)',
    questionText: 'यदि व्यास AD के साथ एक अर्द्धवृत्त के अन्दर एक समद्विबाहु समलम्ब ABCD बनाया जाए तथा AB = CD = 2 सेमी तथा अर्द्धवृत्त की त्रिज्या 5 सेमी है, तब BC की लम्बाई ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '6 सेमी' },
      { key: 'b', text: '7 सेमी' },
      { key: 'c', text: '8 सेमी' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित प्रश्न' }
    ],
    correctOption: 'd',
    explanation: `अर्द्धवृत्त की त्रिज्या R = 5 सेमी => व्यास AD = 10 सेमी।
शीर्ष B से व्यास AD पर लम्ब BE खींचा।
माना AE = x, तो OE = 5 - x.
समकोण त्रिभुज ABE और EBO में पाइथागोरस प्रमेय से:
BE^2 = AB^2 - AE^2 = OB^2 - OE^2
2^2 - x^2 = 5^2 - (5 - x)^2
4 - x^2 = 25 - (25 - 10x + x^2) => 10x = 4 => x = 0.4\\text{ सेमी}

अतः BC = EF = AD - 2x = 10 - 2(0.4) = 9.2\\text{ सेमी}।
अतः सही उत्तर विकल्प (d) इनमें से कोई नहीं (9.2 सेमी) है।`,
    isCustomE: true
  },
  {
    id: 'circle_geom_183',
    originalNumber: 183,
    topic: 'geometry',
    topicNameHindi: 'ज्यामिति (Geometry - Circles)',
    exam: 'Bihar STET (9 & 10) 14/09/2020 (Shift-I)',
    questionText: 'एक दिए हुए त्रिभुज के सभी शीर्षों से होकर जाने वाली वृत्तों की संख्या है-',
    options: [
      { key: 'a', text: 'एक' },
      { key: 'b', text: 'दो' },
      { key: 'c', text: 'तीन' },
      { key: 'd', text: 'अनन्त' },
      { key: 'e', text: 'अनुत्तरित प्रश्न' }
    ],
    correctOption: 'a',
    explanation: `प्रमेय: किन्हीं तीन असंरेखीय (Non-collinear) बिन्दुओं से होकर केवल और केवल एक ही वृत्त (परिवृत्त - Circumcircle) खींचा जा सकता है।
अतः किसी त्रिभुज के तीनों शीर्षों से होकर जाने वाले वृत्तों की संख्या 'एक' (1) होती है। अतः विकल्प (a) सही है।`,
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
