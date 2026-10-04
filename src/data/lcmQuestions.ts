import { Question } from '../types';

export const lcmHcfQuestions: Question[] = [
  {
    id: 'lcm_1',
    originalNumber: 1,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-II), 23/05/2024 (Shift-II)',
    questionText: 'a × b = ल.स. (a, b) × म.स. (a, b) यह केवल सत्य है-',
    options: [
      { key: 'a', text: 'दो संख्याओं के लिए' },
      { key: 'b', text: 'तीन संख्याओं के लिए' },
      { key: 'c', text: 'चार संख्याओं के लिए' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'a × b = ल.स.(a,b) × म.स.(a,b) यह नियम केवल दो संख्याओं के लिए सत्य है। दो संख्याओं का गुणनफल, उनके लघुत्तम समापवर्त्य (LCM) और महत्तम समापवर्तक (HCF) के गुणनफल के बराबर होता है। तीन या अधिक संख्याओं के लिए यह सर्वथा सत्य नहीं होता।'
  },
  {
    id: 'lcm_2',
    originalNumber: 2,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-I), 23/05/2024 (Shift-II)',
    questionText: '(96, 404) का ल.स. तथा म.स. होगा-',
    options: [
      { key: 'a', text: '(9696, 4)' },
      { key: 'b', text: '(4, 9696)' },
      { key: 'c', text: '(9797, 5)' },
      { key: 'd', text: '(5, 9797)' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '96 = 2 × 2 × 2 × 2 × 2 × 3 = 2⁵ × 3\n404 = 2 × 2 × 101 = 2² × 101\nअतः म.स. (HCF) = 2² = 4\nतथा ल.स. (LCM) = 2⁵ × 3¹ × 101¹ = 32 × 3 × 101 = 9696\nअतः (ल.स., म.स.) = (9696, 4)'
  },
  {
    id: 'lcm_3',
    originalNumber: 3,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: '124 तथा 24 का म.स. .......... होगा।',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '124 का अभाज्य गुणनखंड = 2 × 2 × 31 = 2² × 31\n24 का अभाज्य गुणनखंड = 2 × 2 × 2 × 3 = 2³ × 3\nउभयनिष्ठ अभाज्य गुणनखंडों की न्यूनतम घात = 2² = 4\nअतः म.स. (HCF) = 4'
  },
  {
    id: 'lcm_4',
    originalNumber: 4,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: '(3² × 2 × 5) तथा (3² × 2² × 5) का महत्तम समापवर्तक होगा',
    options: [
      { key: 'a', text: '90' },
      { key: 'b', text: '2700' },
      { key: 'c', text: '1800' },
      { key: 'd', text: '30' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'पहली संख्या = 3² × 2¹ × 5¹\nदूसरी संख्या = 3² × 2² × 5¹\nमहत्तम समापवर्तक (HCF) = न्यूनतम घातों का गुणनफल = 3² × 2¹ × 5¹ = 9 × 2 × 5 = 90'
  },
  {
    id: 'lcm_5',
    originalNumber: 5,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-I)',
    questionText: 'यदि a = 2³ × 3, b = 2 × 3² × 5, c = 3 × 5ⁿ तथा LCM (a, b, c) = 2³ × 3² × 5, तो n बराबर हैं-',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'दिया है: a = 2³ × 3¹, b = 2¹ × 3² × 5¹, c = 3¹ × 5ⁿ\nLCM (a, b, c) = 2³ × 3² × 5¹\nचूंकि LCM में 5 की अधिकतम घात 1 है, इसलिए c = 3 × 5ⁿ में n का मान अनिवार्य रूप से 1 होगा।'
  },
  {
    id: 'lcm_6',
    originalNumber: 6,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 24/05/2024 (Shift-I)',
    questionText: '420 और 272 का म.स. .......... होगा।',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '420 = 2² × 3 × 5 × 7\n272 = 2⁴ × 17\nउभयनिष्ठ गुणनखंड = 2² = 4\nअतः म.स. = 4'
  },
  {
    id: 'lcm_7',
    originalNumber: 7,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 24/05/2024 (Shift-I)',
    questionText: 'यदि p तथा q दो अभाज्य संख्या है, तो उसका म.स. हैं-',
    options: [
      { key: 'a', text: '2' },
      { key: 'b', text: '0' },
      { key: 'c', text: '1 या 2' },
      { key: 'd', text: '1' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'किन्हीं भी दो विभिन्न अभाज्य संख्याओं (Prime numbers) का कोई भी उभयनिष्ठ गुणनखंड केवल 1 होता है। अतः किन्हीं दो अभाज्य संख्याओं का म.स.प. (HCF) हमेशा 1 होता है।'
  },
  {
    id: 'lcm_8',
    originalNumber: 8,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 24/05/2024 (Shift-I)',
    questionText: 'यदि HCF (54, 78) = 6 है, तो LCM (54, 78) का मान क्या होगा-',
    options: [
      { key: 'a', text: '602' },
      { key: 'b', text: '720' },
      { key: 'c', text: '702' },
      { key: 'd', text: '804' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'सूत्र: पहली संख्या × दूसरी संख्या = म.स. × ल.स.\n54 × 78 = 6 × LCM\nLCM = (54 × 78) / 6 = 9 × 78 = 702'
  },
  {
    id: 'lcm_9',
    originalNumber: 9,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 22/05/2024 (Shift-I)',
    questionText: 'यदि दो धनात्मक पूर्णांक c और d (c>d) हों, तो HCF क्या होगा? जब r = 0 है।',
    options: [
      { key: 'a', text: 'cd' },
      { key: 'b', text: 'd' },
      { key: 'c', text: 'c' },
      { key: 'd', text: 'r' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'यूक्लिड विभाजन प्रमेयिका के अनुसार: c = dq + r, जहाँ 0 ≤ r < d।\nयदि शेषफल r = 0 हो, तो भाजक d ही c और d का महत्तम समापवर्तक (HCF) होता है।'
  },
  {
    id: 'lcm_10',
    originalNumber: 10,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 22/05/2024 (Shift-I)',
    questionText: 'दो संख्याओं a और 18 का ल.स. 36 तथा म.स. 2 है, तो a का मान .............. है।',
    options: [
      { key: 'a', text: '2' },
      { key: 'b', text: '3' },
      { key: 'c', text: '4' },
      { key: 'd', text: '1' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'सूत्र: प्रथम संख्या × द्वितीय संख्या = ल.स. × म.स.\na × 18 = 36 × 2\na = (36 × 2) / 18 = 2 × 2 = 4'
  },
  {
    id: 'lcm_11',
    originalNumber: 11,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-II), 22/05/2024 (Shift-I)',
    questionText: 'तीन संख्याओं का गुणनफल उनके ल.स. और म.स. का गुणनफल होता है यह कथन-',
    options: [
      { key: 'a', text: 'सही है।' },
      { key: 'b', text: 'सही नहीं है।' },
      { key: 'c', text: 'दोनों सही है।' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'आधिकारिक परीक्षा कुंजी के अनुसार (c) उत्तर दिया गया है। सामान्यतः तीन संख्याओं के लिए a×b×c = LCM × HCF सदैव लागू नहीं होता (जैसे 4, 6, 8 के लिए), परंतु विशेष परिस्थितियों (जैसे 1, 2, 3) में यह सत्य हो सकता है, इसलिए आयोग ने विकल्प (c) माना है।'
  },
  {
    id: 'lcm_12',
    originalNumber: 12,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-II), 22/05/2024 (Shift-II)',
    questionText: 'सबसे छोटी अभाज्य संख्या और सबसे छोटी यौगिक संख्या का म.स. है-',
    options: [
      { key: 'a', text: '4' },
      { key: 'b', text: '3' },
      { key: 'c', text: '2' },
      { key: 'd', text: '5' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'सबसे छोटी अभाज्य संख्या (Prime Number) = 2\nसबसे छोटी यौगिक/भाज्य संख्या (Composite Number) = 4\nअब 2 और 4 का महत्तम समापवर्तक (HCF):\n2 = 2\n4 = 2²\nHCF = 2'
  },
  {
    id: 'lcm_13',
    originalNumber: 13,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-II), 22/05/2024 (Shift-II)',
    questionText: 'दो परिमेय संख्याओं का म.स. और ल.स. बराबर है, तो संख्याएँ अवश्य ही होगी-',
    options: [
      { key: 'a', text: 'अभाज्य' },
      { key: 'b', text: 'सह-अभाज्य' },
      { key: 'c', text: 'यौगिक' },
      { key: 'd', text: 'समान' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'यदि दो संख्याओं का LCM और HCF परस्पर बराबर हो, तो वे दोनों संख्याएं अनिवार्य रूप से परस्पर समान (Equal) होंगी। जैसे LCM(x, x) = x तथा HCF(x, x) = x।'
  },
  {
    id: 'lcm_14',
    originalNumber: 14,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: '2x³ + 2x, x² + 1, x⁴ - 1 का HCF है',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: 'x² + 1' },
      { key: 'c', text: 'x + 1' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: '2x³ + 2x = 2x(x² + 1)\nx² + 1 = 1 × (x² + 1)\nx⁴ - 1 = (x² - 1)(x² + 1) = (x - 1)(x + 1)(x² + 1)\nतीनों व्यंजकों का उभयनिष्ठ गुणनखंड (HCF) = (x² + 1)'
  },
  {
    id: 'lcm_15',
    originalNumber: 15,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'BPSC-Tre 3.0 (6 to 8) 19/07/2024',
    questionText: 'यदि P एक अभाज्य संख्या है, लघुत्तम समावर्त्य P, P² और P³ है।',
    options: [
      { key: 'a', text: 'P' },
      { key: 'b', text: 'P⁶' },
      { key: 'c', text: 'P³' },
      { key: 'd', text: 'P²' },
      { key: 'e', text: 'इनमें से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'समान आधार वाली संख्याओं का लघुत्तम समापवर्त्य (LCM) वह पद होता है जिसकी घात अधिकतम हो। यहाँ P¹, P², P³ में अधिकतम घात 3 है, अतः LCM = P³ होगा।'
  },
  {
    id: 'lcm_17',
    originalNumber: 17,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-I)',
    questionText: 'म.स. (a, 1) = ?',
    options: [
      { key: 'a', text: 'a' },
      { key: 'b', text: '1' },
      { key: 'c', text: '1/a' },
      { key: 'd', text: 'इनमें कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'किसी भी धनात्मक पूर्णांक a और 1 का उभयनिष्ठ गुणनखंड केवल 1 हो सकता है। अतः HCF (a, 1) = 1।'
  },
  {
    id: 'lcm_18',
    originalNumber: 18,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-I)',
    questionText: '272 तथा 148 का म.स. होगा',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '272 = 2 × 2 × 2 × 2 × 17 = 2⁴ × 17\n148 = 2 × 2 × 37 = 2² × 37\nम.स. = 2² = 4'
  },
  {
    id: 'lcm_19',
    originalNumber: 19,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-I)',
    questionText: '4052 तथा 420 का म.स. होगा',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '4052 = 2² × 1013\n420 = 2² × 3 × 5 × 7\nउभयनिष्ठ गुणनखंड = 2² = 4'
  },
  {
    id: 'lcm_20',
    originalNumber: 20,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-I)',
    questionText: '420 तथा 130 का म.स. होगा-',
    options: [
      { key: 'a', text: '10' },
      { key: 'b', text: '11' },
      { key: 'c', text: '12' },
      { key: 'd', text: '13' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '420 = 2² × 3 × 5 × 7\n130 = 2 × 5 × 13\nउभयनिष्ठ गुणनखंड = 2 × 5 = 10'
  },
  {
    id: 'lcm_21',
    originalNumber: 21,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-II)',
    questionText: 'दो क्रमिक सम संख्याओं का HCF क्या होगा?',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '5' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'दो क्रमिक सम संख्याएँ 2n और 2n+2 होती हैं।\n2n = 2 × n\n2n+2 = 2 × (n+1)\nचूँकि n और n+1 क्रमिक होने के कारण सह-अभाज्य हैं, अतः उनका उभयनिष्ठ गुणनखंड केवल 2 होगा। HCF = 2।'
  },
  {
    id: 'lcm_22',
    originalNumber: 22,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'BPSC-Tre 2.0 (9 & 10) 08/12/2023',
    questionText: 'x² + 5x + 6 और x² + 4x + 4 का लघुत्तम समापवर्त्य है-',
    options: [
      { key: 'a', text: 'x + 2' },
      { key: 'b', text: '(x + 2)(x + 3)' },
      { key: 'c', text: '(x + 2)²(x + 3)' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'x² + 5x + 6 = (x + 2)(x + 3)\nx² + 4x + 4 = (x + 2)²\nलघुत्तम समापवर्त्य (LCM) = (x + 2)²(x + 3)'
  },
  {
    id: 'lcm_23',
    originalNumber: 23,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'BPSC Tre 1.0 (9 & 10) 26/08/2023',
    questionText: 'एक मिठाई विक्रेता के पास 420 काजू की बर्फियाँ और 150 बादाम की बर्फियाँ है। वह उन्हें इस तरह से ढेर करना चाहता है कि प्रत्येक ढेर में उनकी संख्या समान हो, और वे न्यूनतम कम-से-कम क्षेत्र घेरें। इस प्रकार बनने वाले ढेरों की संख्या है-',
    options: [
      { key: 'a', text: '17' },
      { key: 'b', text: '19' },
      { key: 'c', text: '18' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: 'प्रत्येक ढेर में बर्फियों की संख्या = HCF(420, 150) = 30\nकाजू की बर्फियों के ढेरों की संख्या = 420 / 30 = 14\nबादाम की बर्फियों के ढेरों की संख्या = 150 / 30 = 5\nकुल ढेरों की संख्या = 14 + 5 = 19'
  },
  {
    id: 'lcm_24',
    originalNumber: 24,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'BPSC Tre 1.0 (9 & 10) 26/08/2023',
    questionText: 'प्रीतम और राणा एक गोलाकार खेल के मैदान के चारों ओर चक्कर लगाते हैं। प्रीतम एक चक्कर लगाने में 16 मिनट लेता है जबकि राणा 20 मिनट में चक्कर पूरा करता है। यदि दोनों एक ही बिन्दु से, एक ही समय पर और एक ही दिशा में चलना शुरू करते हैं, तो वे प्रारंभिक बिन्दु पर कितने समय बाद मिलेंगे?',
    options: [
      { key: 'a', text: '80 मिनट' },
      { key: 'b', text: '32 मिनट' },
      { key: 'c', text: '40 मिनट' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'मिलने का समय = LCM(16, 20)\n16 = 2⁴\n20 = 2² × 5\nLCM = 2⁴ × 5 = 16 × 5 = 80 मिनट'
  },
  {
    id: 'lcm_25',
    originalNumber: 25,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'BPSC Tre 1.0 (9 & 10) 26/08/2023',
    questionText: 'वह सबसे बड़ी संख्या, जो 450, 577 तथा 704 को विभाजित करने पर शेषफल क्रमशः 9, 10 तथा 11 देती है, है-',
    options: [
      { key: 'a', text: '63' },
      { key: 'b', text: '577' },
      { key: 'c', text: '450' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'संख्याएँ होंगी:\n450 - 9 = 441\n577 - 10 = 567\n704 - 11 = 693\nअब 441, 567 तथा 693 का HCF:\n441 = 63 × 7\n567 = 63 × 9\n693 = 63 × 11\nअतः HCF = 63'
  },
  {
    id: 'lcm_26',
    originalNumber: 26,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'BPSC Tre 1.0 (9 & 10) 26/08/2023',
    questionText: 'दो संख्याओं का लघुत्तम समापवर्तक तथा महत्तम समापवर्तक का योग 1260 है। यदि उनका लघुत्तम समापवर्त्य, महत्तम समापवर्तक से 900 अधिक है, तब उन दो संख्याओं का गुणनफल है-',
    options: [
      { key: 'a', text: '203400' },
      { key: 'b', text: '194400' },
      { key: 'c', text: '198400' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: 'LCM + HCF = 1260 ..... (1)\nLCM - HCF = 900 ..... (2)\nसमीकरण (1) और (2) को जोड़ने पर:\n2 × LCM = 2160 ⇒ LCM = 1080\nHCF = 1260 - 1080 = 180\nदो संख्याओं का गुणनफल = LCM × HCF = 1080 × 180 = 194400'
  },
  {
    id: 'lcm_27',
    originalNumber: 27,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 18/09/2020 (Shift-I)',
    questionText: '6 और 20 का म.स. है-',
    options: [
      { key: 'a', text: '2' },
      { key: 'b', text: '6' },
      { key: 'c', text: '60' },
      { key: 'd', text: '20' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '6 = 2 × 3\n20 = 2² × 5\nHCF = 2'
  },
  {
    id: 'lcm_28',
    originalNumber: 28,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-II)',
    questionText: '148 तथा 124 का म.स. होगा',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '148 = 2² × 37\n124 = 2² × 31\nम.स. = 2² = 4'
  },
  {
    id: 'lcm_29',
    originalNumber: 29,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-II)',
    questionText: '420 और 272 का म.स. होगा-',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '420 = 2² × 3 × 5 × 7\n272 = 2⁴ × 17\nम.स. = 2² = 4'
  },
  {
    id: 'lcm_30',
    originalNumber: 30,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-I)',
    questionText: 'a = bq + r में म.स. (a, b) =',
    options: [
      { key: 'a', text: 'म.स. (a, r)' },
      { key: 'b', text: 'म.स. (b, r)' },
      { key: 'c', text: 'म.स. (b, a)' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'यूक्लिड विभाजन एल्गोरिथम के मूल नियम के अनुसार: यदि a = bq + r हो, तो HCF(a, b) = HCF(b, r) होता है।'
  },
  {
    id: 'lcm_31',
    originalNumber: 31,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-I)',
    questionText: 'यदि 65 तथा 117 का म.स. 65m-117 के रूप में है, तो m का मान है।',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '65 = 13 × 5\n117 = 13 × 3²\nHCF(65, 117) = 13\nप्रश्नानुसार: 65m - 117 = 13\n65m = 130 ⇒ m = 130 / 65 = 2'
  },
  {
    id: 'lcm_32',
    originalNumber: 32,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-I)',
    questionText: '4052 तथा 12576 का म.स. होगा।',
    options: [
      { key: 'a', text: '1' },
      { key: 'b', text: '2' },
      { key: 'c', text: '3' },
      { key: 'd', text: '4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'यूक्लिड विभाजन विधि से:\n12576 = 4052 × 3 + 420\n4052 = 420 × 9 + 272\n420 = 272 × 1 + 148\n272 = 148 × 1 + 124\n148 = 124 × 1 + 24\n124 = 24 × 5 + 4\n24 = 4 × 6 + 0\nअंतिम अशून्य शेषफल 4 है, अतः म.स. = 4।'
  },
  {
    id: 'lcm_33',
    originalNumber: 33,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 27/05/2024 (Shift-I)',
    questionText: '4, 12 और 18 का महत्तम समापवर्तक है-',
    options: [
      { key: 'a', text: '4' },
      { key: 'b', text: '12' },
      { key: 'c', text: '18' },
      { key: 'd', text: '2' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '4 = 2²\n12 = 2² × 3\n18 = 2 × 3²\nतीनों में उभयनिष्ठ न्यूनतम गुणनखंड = 2¹ = 2\nअतः HCF = 2।'
  },
  {
    id: 'lcm_34',
    originalNumber: 34,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 19/05/2024 (Shift-I)',
    questionText: '16 और 20 का महत्तम समापवर्तक है-',
    options: [
      { key: 'a', text: '2' },
      { key: 'b', text: '4' },
      { key: 'c', text: '5' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '16 = 2⁴\n20 = 2² × 5\nHCF = 2² = 4'
  },
  {
    id: 'lcm_35',
    originalNumber: 35,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 18/09/2023 (Shift-I)',
    questionText: 'दो संख्याओं का सबसे बड़ा सामान्य भाजक 8 है जबकि उनका सबसे छोटा सामान्य गुणज 144 है। यदि एक संख्या 16 है तो दूसरी संख्या ज्ञात करें।',
    options: [
      { key: 'a', text: '108' },
      { key: 'b', text: '96' },
      { key: 'c', text: '72' },
      { key: 'd', text: '36' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'सूत्र: पहली संख्या × दूसरी संख्या = HCF × LCM\n16 × दूसरी संख्या = 8 × 144\nदूसरी संख्या = (8 × 144) / 16 = 144 / 2 = 72'
  },
  {
    id: 'lcm_36',
    originalNumber: 36,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: 'निम्न में से सबसे छोटी संख्या कौन है जिसे 4, 6, 8, 12 और 16 से विभाजित करने पर शेष 2 बचता है?',
    options: [
      { key: 'a', text: '46' },
      { key: 'b', text: '48' },
      { key: 'c', text: '50' },
      { key: 'd', text: '52' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '4, 6, 8, 12, 16 का LCM = 48\nअभीष्ट संख्या = LCM + शेषफल = 48 + 2 = 50'
  },
  {
    id: 'lcm_37',
    originalNumber: 37,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 28/01/2020 (Shift-I)',
    questionText: 'जब एक संख्या को 15, 20 या 35 से विभाजित किया जाता है तो हर बार शेष 8 होता है। फिर सबसे छोटी संख्या है',
    options: [
      { key: 'a', text: '427' },
      { key: 'b', text: '428' },
      { key: 'c', text: '443' },
      { key: 'd', text: '463' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '15, 20 और 35 का लघुत्तम समापवर्त्य (LCM):\n15 = 3 × 5\n20 = 2² × 5\n35 = 5 × 7\nLCM = 2² × 3 × 5 × 7 = 420\nअभीष्ट संख्या = 420 + 8 = 428'
  },
  {
    id: 'lcm_38',
    originalNumber: 38,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: 'दो सह-अभाज्य संख्याओं का गुणनफल 117 है, तो उनका लघुत्तम समापवर्त्य है-',
    options: [
      { key: 'a', text: '39' },
      { key: 'b', text: '119' },
      { key: 'c', text: '117' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'सह-अभाज्य संख्याओं (Co-prime numbers) का HCF सदैव 1 होता है।\nसूत्र: LCM × HCF = दोनों संख्याओं का गुणनफल\nLCM × 1 = 117 ⇒ LCM = 117'
  },
  {
    id: 'lcm_39',
    originalNumber: 39,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 15/09/2020 (Shift-I)',
    questionText: '48, 90, 120 का महत्तम समापवर्तक ज्ञात करें।',
    options: [
      { key: 'a', text: '5' },
      { key: 'b', text: '7' },
      { key: 'c', text: '6' },
      { key: 'd', text: '8' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '48 = 2⁴ × 3\n90 = 2 × 3² × 5\n120 = 2³ × 3 × 5\nउभयनिष्ठ गुणनखंड = 2¹ × 3¹ = 6'
  },
  {
    id: 'lcm_40',
    originalNumber: 40,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 09/09/2020 (Shift-II)',
    questionText: '12, 16, 18 और 21 का लघुत्तम समापवर्त्य (LCM) ज्ञात करें।',
    options: [
      { key: 'a', text: '1008' },
      { key: 'b', text: '144' },
      { key: 'c', text: '504' },
      { key: 'd', text: '756' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '12 = 2² × 3\n16 = 2⁴\n18 = 2 × 3²\n21 = 3 × 7\nLCM = 2⁴ × 3² × 7 = 16 × 9 × 7 = 1008'
  },
  {
    id: 'lcm_41',
    originalNumber: 41,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 15/09/2023 (Shift-I)',
    questionText: 'दो संख्याओं का LCM 14560 है और उनका H.C.F. 13 है। यदि उनमें से एक संख्या 416 है, तो दूसरी संख्या है-',
    options: [
      { key: 'a', text: '460' },
      { key: 'b', text: '455' },
      { key: 'c', text: '450' },
      { key: 'd', text: '445' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'सूत्र: पहली संख्या × दूसरी संख्या = LCM × HCF\n416 × x = 14560 × 13\nx = (14560 × 13) / 416 = 14560 / 32 = 455'
  },
  {
    id: 'lcm_42',
    originalNumber: 42,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 10/09/2023 (Shift-I)',
    questionText: 'दो संख्याओं का लघुत्तम समापवर्त्य 168 है और उनका महत्तम समापवर्तक 12 है। यदि संख्याओं का अंतर 60 है, तो संख्याओं का योग क्या है?',
    options: [
      { key: 'a', text: '108' },
      { key: 'b', text: '96' },
      { key: 'c', text: '122' },
      { key: 'd', text: '144' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'माना संख्याएँ x और y हैं।\nx - y = 60\nxy = LCM × HCF = 168 × 12 = 2016\nसूत्र: (x + y)² = (x - y)² + 4xy\n(x + y)² = (60)² + 4(2016) = 3600 + 8064 = 11664\nx + y = √11664 = 108'
  },
  {
    id: 'lcm_43',
    originalNumber: 43,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 09/09/2023 (Shift-I)',
    questionText: 'दो संख्याओं का महत्तम समापवर्तक 8 है जबकि उनका लघुत्तम समापवर्त्य 144 है। यदि एक संख्या 16 है तो दूसरी संख्या ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '108' },
      { key: 'b', text: '96' },
      { key: 'c', text: '72' },
      { key: 'd', text: '36' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '16 × दूसरी संख्या = 8 × 144\nदूसरी संख्या = (8 × 144) / 16 = 72'
  },
  {
    id: 'lcm_44',
    originalNumber: 44,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 08/09/2023 (Shift-I)',
    questionText: 'दो संख्याओं का योग 156 है और उनका म.स.प 13 है। ऐसे संख्या युग्मों की संख्या है-',
    options: [
      { key: 'a', text: '2' },
      { key: 'b', text: '5' },
      { key: 'c', text: '4' },
      { key: 'd', text: '3' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'माना संख्याएँ 13a और 13b हैं, जहाँ a और b सह-अभाज्य हैं।\n13a + 13b = 156 ⇒ a + b = 12\na + b = 12 के सह-अभाज्य युग्म:\n(1, 11) और (5, 7)\nअतः ऐसे युग्मों की कुल संख्या 2 है।'
  },
  {
    id: 'lcm_45',
    originalNumber: 45,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 08/09/2023 (Shift-II)',
    questionText: 'दो संख्याओं का LCM 138 है। लेकिन उनका GCD 23 है। संख्याएँ 1:6 के अनुपात में है। दोनों में सबसे बड़ी संख्या कौन-सी है?',
    options: [
      { key: 'a', text: '46' },
      { key: 'b', text: '138' },
      { key: 'c', text: '69' },
      { key: 'd', text: '23' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'माना संख्याएँ x और 6x हैं।\nx × 6x = LCM × GCD = 138 × 23\n6x² = 3174 ⇒ x² = 529 ⇒ x = 23\nबड़ी संख्या = 6x = 6 × 23 = 138'
  },
  {
    id: 'lcm_46',
    originalNumber: 46,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 05/09/2023 (Shift-I)',
    questionText: 'यदि दो संख्याओं का लघुत्तम समापवर्त्य 225 है और महत्तम समापवर्तक 5 है। तो वे संख्याएं ज्ञात कीजिए जब उनमें से एक संख्या 25 है।',
    options: [
      { key: 'a', text: '75' },
      { key: 'b', text: '65' },
      { key: 'c', text: '15' },
      { key: 'd', text: '45' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '25 × दूसरी संख्या = 225 × 5\nदूसरी संख्या = (225 × 5) / 25 = 9 × 5 = 45'
  },
  {
    id: 'lcm_47',
    originalNumber: 47,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET (Computer Science) Re-Exam 2020',
    questionText: 'दो संख्याओं का लघुत्तम समापवर्त्य 1820 तथा महत्तम समापवर्तक 26 है। यदि एक संख्या 130 है, तो दूसरी संख्या है',
    options: [
      { key: 'a', text: '70' },
      { key: 'b', text: '1690' },
      { key: 'c', text: '364' },
      { key: 'd', text: '1264' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '130 × दूसरी संख्या = 1820 × 26\nदूसरी संख्या = (1820 × 26) / 130 = 1820 / 5 = 364'
  },
  {
    id: 'lcm_48',
    originalNumber: 48,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET 19/06/2024',
    questionText: '16 और 20 का महत्तम समापवर्तक है-',
    options: [
      { key: 'a', text: '2' },
      { key: 'b', text: '4' },
      { key: 'c', text: '5' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '16 = 2⁴\n20 = 2² × 5\nHCF = 2² = 4'
  },
  {
    id: 'lcm_49',
    originalNumber: 49,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'दिए गए भिन्नों 2/5, 3/7 और 4/9 का लघुत्तम समापवर्त्य (LCM) ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '2/315' },
      { key: 'b', text: '1/315' },
      { key: 'c', text: '24' },
      { key: 'd', text: '12' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'भिन्नों का LCM = अंशों का LCM / हरों का HCF\nअंश: 2, 3, 4 का LCM = 12\nहर: 5, 7, 9 का HCF = 1\nभिन्नों का LCM = 12 / 1 = 12'
  },
  {
    id: 'lcm_50',
    originalNumber: 50,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: '3/8, 5/16 और 7/2 का लघुत्तम समापवर्त्य (LCM) क्या है?',
    options: [
      { key: 'a', text: '52 1/2' },
      { key: 'b', text: '101 1/2' },
      { key: 'c', text: '25 1/4' },
      { key: 'd', text: '28 1/4' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'अंशों (3, 5, 7) का LCM = 105\nहरों (8, 16, 2) का HCF = 2\nभिन्नों का LCM = 105 / 2 = 52 1/2'
  },
  {
    id: 'lcm_51',
    originalNumber: 51,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'यदि P = 2³ × 5⁸ और Q = 3⁵ × 7³ है, तो P और Q का लघुत्तम समापवर्त्य (LCM) ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '2³ × 3⁵ × 5⁸ × 7³' },
      { key: 'b', text: '3⁵ × 5⁸' },
      { key: 'c', text: '3⁵ × 7³' },
      { key: 'd', text: '5⁸ × 7³' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'P = 2³ × 5⁸\nQ = 3⁵ × 7³\nचूंकि दोनों में कोई भी अभाज्य गुणनखंड उभयनिष्ठ नहीं है, अतः LCM दोनों संख्याओं के सभी अभाज्य गुणनखंडों की उच्चतम घातों का गुणनफल होगा:\nLCM = 2³ × 3⁵ × 5⁸ × 7³'
  },
  {
    id: 'lcm_52',
    originalNumber: 52,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: '12/5, 14/15 और 16/17 के महत्तम समापवर्तक (HCF) की गणना करें।',
    options: [
      { key: 'a', text: '1/255' },
      { key: 'b', text: '2/255' },
      { key: 'c', text: '3/255' },
      { key: 'd', text: '4/255' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'भिन्नों का HCF = अंशों का HCF / हरों का LCM\nअंश: 12, 14, 16 का HCF = 2\nहर: 5, 15, 17 का LCM = 15 × 17 = 255\nभिन्नों का HCF = 2 / 255'
  },
  {
    id: 'lcm_53',
    originalNumber: 53,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'वह सबसे बड़ी संख्या कौन-सी है, जिससे 126, 224 और 608 को विभाजित करने पर शेषफल क्रमशः 2, 7 और 19 प्राप्त होता है?',
    options: [
      { key: 'a', text: '21' },
      { key: 'b', text: '27' },
      { key: 'c', text: '31' },
      { key: 'd', text: '37' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '126 - 2 = 124\n224 - 7 = 217\n608 - 19 = 589\nअब 124, 217, 589 का HCF:\n124 = 31 × 4\n217 = 31 × 7\n589 = 31 × 19\nअतः अभीष्ट संख्या 31 है।'
  },
  {
    id: 'lcm_54',
    originalNumber: 54,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: '7/16, 21/32 तथा 49/8 का महत्तम समापवर्तक (एच सी एफ) कितना है?',
    options: [
      { key: 'a', text: '7/64' },
      { key: 'b', text: '147/32' },
      { key: 'c', text: '7/8' },
      { key: 'd', text: '7/32' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'अंशों (7, 21, 49) का HCF = 7\nहरों (16, 32, 8) का LCM = 32\nभिन्नों का HCF = 7 / 32'
  },
  {
    id: 'lcm_55',
    originalNumber: 55,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'दो संख्याओं का गुणनफल 1296 है। यदि इन दोनों संख्याओं का महत्तम समापवर्तक (HCF) 12 है, तो दोनों संख्याओं का लघुत्तम समापवर्त्य (LCM) कितना होगा?',
    options: [
      { key: 'a', text: '108' },
      { key: 'b', text: '120' },
      { key: 'c', text: '60' },
      { key: 'd', text: '84' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'सूत्र: गुणनफल = LCM × HCF\n1296 = LCM × 12\nLCM = 1296 / 12 = 108'
  },
  {
    id: 'lcm_56',
    originalNumber: 56,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'दो संख्याओं के लघुत्तम समापवर्त्य (LCM) और महत्तम समापवर्तक (HCF) का गुणनफल 216 है। दोनों संख्याओं का अंतर 6 है। वे संख्याएं कौन सी हैं?',
    options: [
      { key: 'a', text: '9, 24' },
      { key: 'b', text: '6, 36' },
      { key: 'c', text: '8, 27' },
      { key: 'd', text: '12, 18' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'माना संख्याएँ x और x + 6 हैं।\nx(x + 6) = 216\nx² + 6x - 216 = 0\n(x - 12)(x + 18) = 0 ⇒ x = 12\nअतः पहली संख्या = 12 और दूसरी संख्या = 12 + 6 = 18।'
  },
  {
    id: 'lcm_57',
    originalNumber: 57,
    topic: 'lcm_hcf',
    topicNameHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'दो धनात्मक संख्याओं का लघुत्तम समापवर्त्य LCM और उनके महत्तम समापवर्तक HCF का 13 गुना है। HCF और LCM का योग 252 है। यदि उनमें से एक संख्या 54 है, तो दूसरी संख्या ज्ञात करें।',
    options: [
      { key: 'a', text: '68' },
      { key: 'b', text: '63' },
      { key: 'c', text: '73' },
      { key: 'd', text: '78' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'LCM = 13 × HCF\nLCM + HCF = 252 ⇒ 13(HCF) + HCF = 252 ⇒ 14(HCF) = 252\nHCF = 18\nLCM = 13 × 18 = 234\nसूत्र: पहली संख्या × दूसरी संख्या = LCM × HCF\n54 × दूसरी संख्या = 234 × 18\nदूसरी संख्या = (234 × 18) / 54 = 234 / 3 = 78'
  }
];
