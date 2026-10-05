import { Question } from '../types';

export const mensurationQuestions: Question[] = [
  // --- PAGE 221 ---
  {
    id: 'mens_q1',
    originalNumber: 1,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cuboid)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II) / 05/09/2023 (Shift-I)',
    questionText: 'एक घनाभ की ऊँचाई ................ होगी जिसका आयतन 275 सेमी³ है और आधार का क्षेत्रफल 25 सेमी² है।',
    options: [
      { key: 'a', text: '10 सेमी.' },
      { key: 'b', text: '11 सेमी.' },
      { key: 'c', text: '12 सेमी.' },
      { key: 'd', text: '13 सेमी.' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'b',
    explanation: `दिया है:
घनाभ का आयतन = 275 सेमी³
आधार का क्षेत्रफल = 25 सेमी²

घनाभ का आयतन = आधार का क्षेत्रफल × ऊँचाई
\\Rightarrow ऊँचाई = \\frac{\\text{आयतन}}{\\text{आधार का क्षेत्रफल}} = \\frac{275}{25} = 11\\text{ सेमी.}

अतः सही उत्तर विकल्प (b) है।`
  },
  {
    id: 'mens_q2',
    originalNumber: 2,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Sphere)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II)',
    questionText: 'दो गोले के आयतन का अनुपात 27 : 8 है, तो घुमावदार सतह का अनुपात ................ होगा।',
    options: [
      { key: 'a', text: '9 : 4' },
      { key: 'b', text: '4 : 9' },
      { key: 'c', text: '3 : 2' },
      { key: 'd', text: '2 : 3' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'a',
    explanation: `माना दो गोलों के आयतन V₁ और V₂ हैं तथा त्रिज्याएँ r₁ और r₂ हैं।
\\frac{V_1}{V_2} = \\frac{27}{8}
\\Rightarrow \\frac{\\frac{4}{3}\\pi r_1^3}{\\frac{4}{3}\\pi r_2^3} = \\frac{27}{8}
\\Rightarrow \\frac{r_1^3}{r_2^3} = \\frac{27}{8} \\implies \\frac{r_1}{r_2} = \\frac{3}{2}

सतह के क्षेत्रफल (घुमावदार सतह) का अनुपात:
\\frac{A_1}{A_2} = \\frac{4\\pi r_1^2}{4\\pi r_2^2} = \\left(\\frac{r_1}{r_2}\\right)^2 = \\left(\\frac{3}{2}\\right)^2 = \\frac{9}{4} = 9 : 4

अतः सही उत्तर विकल्प (a) है।`
  },
  {
    id: 'mens_q3',
    originalNumber: 3,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Sphere)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II) / 05/09/2023 (Shift-I)',
    questionText: 'एक गोलाकार गुब्बारे की त्रिज्या 8 सेमी. से बढ़कर 12 सेमी. हो जाती है। दोनों स्थितियों में गुब्बारे के पृष्ठीय क्षेत्रफल का अनुपात ................ होगा।',
    options: [
      { key: 'a', text: '2 : 3' },
      { key: 'b', text: '3 : 2' },
      { key: 'c', text: '8 : 27' },
      { key: 'd', text: '4 : 9' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `दिया है:
गुब्बारे की प्रारंभिक त्रिज्या (r₁) = 8 सेमी
गुब्बारे की अंतिम त्रिज्या (r₂) = 12 सेमी

प्रारंभिक त्रिज्या पर पृष्ठीय क्षेत्रफल (A₁) = 4π(8)² = 256π
अंतिम त्रिज्या पर पृष्ठीय क्षेत्रफल (A₂) = 4π(12)² = 576π

पृष्ठीय क्षेत्रफल का अनुपात:
\\frac{A_1}{A_2} = \\frac{256\\pi}{576\\pi} = \\frac{4}{9} = 4 : 9

अतः सही उत्तर विकल्प (d) है।`
  },
  {
    id: 'mens_q4',
    originalNumber: 4,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cylinder Wire)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II) / 04/09/2023 (Shift-II)',
    questionText: 'एक तार की त्रिज्या एक-तिहाई तक कम हो जाती है। यदि आयतन समान रहता है, तो लंबाई कितनी बढ़ जाएगी?',
    options: [
      { key: 'a', text: '3 गुना' },
      { key: 'b', text: '6 गुना' },
      { key: 'c', text: '9 गुना' },
      { key: 'd', text: '27 गुना' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'c',
    explanation: `बेलन (तार) का आयतन = \\pi r^2 h
बेलन की नई त्रिज्या r' = \\frac{r}{3}
माना बेलन की नई लंबाई h₁ है।

आयतन समान रहने पर:
\\pi r^2 h = \\pi \\left(\\frac{r}{3}\\right)^2 \\times h_1
\\Rightarrow \\pi r^2 h = \\pi \\frac{r^2}{9} \\times h_1
\\Rightarrow h = \\frac{h_1}{9} \\implies h_1 = 9h

अतः लंबाई 9 गुना बढ़ जाएगी। सही उत्तर विकल्प (c) है।`
  },
  {
    id: 'mens_q5',
    originalNumber: 5,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Room Surface Area)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II) / 04/09/2023 (Shift-I)',
    questionText: 'एक कमरा आकार में आयताकार है और इसकी एक सपाट छत है। यह 10 मीटर चौड़ा, 13 मीटर लंबा और 5 मीटर ऊँचा है। इसे अंदर, बाहर और फर्श पर पेंट किया जाना है लेकिन छत पर नहीं, तो पेंट किया जाने वाला कुल क्षेत्रफल है-',
    options: [
      { key: 'a', text: '360 वर्ग मीटर' },
      { key: 'b', text: '460 वर्ग मीटर' },
      { key: 'c', text: '490 वर्ग मीटर' },
      { key: 'd', text: '590 वर्ग मीटर' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `दिया है:
कमरे की लंबाई (l) = 13 मी.
कमरे की चौड़ाई (b) = 10 मी.
कमरे की ऊँचाई (h) = 5 मी.

चार दीवारों का क्षेत्रफल = 2(l + b)h = 2(13 + 10) × 5 = 230 वर्ग मी.
चूँकि दीवारों को अंदर और बाहर दोनों ओर पेंट करना है:
दोनों तरफ दीवारों का क्षेत्रफल = 2 × 230 = 460 वर्ग मी.

फर्श का क्षेत्रफल = l × b = 13 × 10 = 130 वर्ग मी. (छत पर पेंट नहीं होना है)
अतः पेंट किया जाने वाला कुल क्षेत्रफल = 460 + 130 = 590 वर्ग मीटर

सही उत्तर विकल्प (d) है।`
  },

  // --- PAGE 222 ---
  {
    id: 'mens_q6',
    originalNumber: 6,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Circle)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II) / 04/09/2023 (Shift-I)',
    questionText: 'यदि एक वृत्त की परिधि और त्रिज्या के बीच का अंतर 37 सेमी. है, तो वृत्त का क्षेत्रफल होगा-',
    options: [
      { key: 'a', text: '111 वर्ग सेमी.' },
      { key: 'b', text: '148 वर्ग सेमी.' },
      { key: 'c', text: '259 वर्ग सेमी.' },
      { key: 'd', text: '154 वर्ग सेमी.' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `दिया है:
वृत्त की परिधि - वृत्त की त्रिज्या = 37 सेमी.
\\Rightarrow 2\\pi r - r = 37
\\Rightarrow r(2\\pi - 1) = 37
\\Rightarrow r\\left(2 \\times \\frac{22}{7} - 1\\right) = 37
\\Rightarrow r\\left(\\frac{44 - 7}{7}\\right) = 37
\\Rightarrow r \\times \\frac{37}{7} = 37 \\implies r = 7\\text{ सेमी.}

वृत्त का क्षेत्रफल (A) = \\pi r^2 = \\frac{22}{7} \\times 7 \\times 7 = 154\\text{ वर्ग सेमी.}

अतः सही उत्तर विकल्प (d) है।`
  },
  {
    id: 'mens_q7',
    originalNumber: 7,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cylinder)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-I) / 22/05/2024 (Shift-II)',
    questionText: 'एक बेलनाकार बॉक्स में ............ घुमावदार सतह और ............ वृत्ताकार फलक होते हैं, जो समान हैं।',
    options: [
      { key: 'a', text: 'एक, एक' },
      { key: 'b', text: 'एक, दो' },
      { key: 'c', text: 'दो, एक' },
      { key: 'd', text: 'दो, दो' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'b',
    explanation: `एक बेलनाकार (Cylindrical) बॉक्स में:
1. एक घुमावदार सतह (Curved surface) होती है, जो उसे चारों ओर से घेरे रहती है।
2. दो समतल वृत्ताकार फलक (Circular flat faces) होते हैं — एक ऊपरी आधार तथा एक निचला आधार।

अतः सही उत्तर विकल्प (b) है।`
  },
  {
    id: 'mens_q8',
    originalNumber: 8,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Square)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II) / 04/09/2023 (Shift-I)',
    questionText: "भुजा की लंबाई 'a' वाले वर्ग का क्षेत्रफल ............ है।",
    options: [
      { key: 'a', text: '2a' },
      { key: 'b', text: '4a' },
      { key: 'c', text: 'a / 2' },
      { key: 'd', text: 'a²' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `वर्ग का क्षेत्रफल = भुजा × भुजा = a × a = a²
अतः सही उत्तर विकल्प (d) है।`
  },
  {
    id: 'mens_q9',
    originalNumber: 9,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Inscribed Circle)',
    exam: 'BPSC-TRE 3.0 (6 to 8) 19/07/2024 / Bihar STET 23/05/2024',
    questionText: 'एक वृत्त का क्षेत्रफल जो 10 सेमी. भुजा वाले वर्ग में अंतर्निहित (Inscribed) किया जा सकता है-',
    imageUrl: 'https://ik.imagekit.io/bk52vah91/bpsc_questions/circle_in_square_q9.svg',
    options: [
      { key: 'a', text: '40π सेमी.²' },
      { key: 'b', text: '30π सेमी.²' },
      { key: 'c', text: '100π सेमी.²' },
      { key: 'd', text: '25π सेमी.²' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `चित्रानुसार:
![वर्ग में अंतर्निहित वृत्त](https://ik.imagekit.io/bk52vah91/bpsc_questions/circle_in_square_q9.svg)

वर्ग की भुजा = 10 सेमी.
चूँकि वृत्त वर्ग के भीतर अंतर्निहित है, इसलिए वृत्त का व्यास (d) = वर्ग की भुजा = 10 सेमी.
\\Rightarrow वृत्त की त्रिज्या (r) = \\frac{10}{2} = 5\\text{ सेमी.}

वृत्त का क्षेत्रफल (A) = \\pi r^2 = \\pi (5)^2 = 25\\pi\\text{ सेमी.}^2

अतः सही उत्तर विकल्प (d) है।`
  },
  {
    id: 'mens_q10',
    originalNumber: 10,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Circle & Semicircle)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-II)',
    questionText: 'एक वृत्त जिसका क्षेत्रफल 24 सेमी. और 7 सेमी. त्रिज्या वाले दो वृत्तों के क्षेत्रफलों के योग के बराबर है, तो अर्धवृत्त का व्यास ............ होगा।',
    options: [
      { key: 'a', text: '31 सेमी.' },
      { key: 'b', text: '25 सेमी.' },
      { key: 'c', text: '62 सेमी.' },
      { key: 'd', text: '50 सेमी.' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `प्रश्नानुसार:
24 सेमी त्रिज्या वाले वृत्त का क्षेत्रफल = \\pi(24)^2 = 576\\pi\\text{ सेमी.}^2
7 सेमी त्रिज्या वाले वृत्त का क्षेत्रफल = \\pi(7)^2 = 49\\pi\\text{ सेमी.}^2

दोनों वृत्तों के क्षेत्रफलों का योग = 576\\pi + 49\\pi = 625\\pi\\text{ सेमी.}^2
यह क्षेत्रफल नए वृत्त के क्षेत्रफल के बराबर है:
\\pi r^2 = 625\\pi \\implies r^2 = 625 \\implies r = 25\\text{ सेमी.}

अतः अर्धवृत्त का व्यास = 2r = 2 × 25 = 50 सेमी.
सही उत्तर विकल्प (d) है।`
  },
  {
    id: 'mens_q11',
    originalNumber: 11,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cylinder & Cone Volume)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: 'त्रिज्या 6 सेमी. और ऊँचाई 10 सेमी. की एक बेलनाकार बोतल से तेल को खाली करने के लिए त्रिज्या 2 सेमी. और ऊँचाई 3.6 सेमी. की शंक्वाकार बोतलों की संख्या क्या होगी?',
    options: [
      { key: 'a', text: '100' },
      { key: 'b', text: '9' },
      { key: 'c', text: '75' },
      { key: 'd', text: '20' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'c',
    explanation: `बेलनाकार बोतल की त्रिज्या (r₁) = 6 सेमी, ऊँचाई (h₁) = 10 सेमी.
शंक्वाकार बोतल की त्रिज्या (r₂) = 2 सेमी, ऊँचाई (h₂) = 3.6 सेमी.

माना शंक्वाकार बोतलों की संख्या = n
बेलनाकार बोतल का आयतन = n × शंक्वाकार बोतल का आयतन
\\pi r_1^2 h_1 = n \\times \\frac{1}{3}\\pi r_2^2 h_2
\\Rightarrow 6 \\times 6 \\times 10 = n \\times \\frac{1}{3} \\times 2 \\times 2 \\times 3.6
\\Rightarrow 360 = n \\times \\frac{4 \\times 3.6}{3} = n \\times 4.8
\\Rightarrow n = \\frac{360}{4.8} = 75

अतः शंक्वाकार बोतलों की संख्या 75 होगी। सही उत्तर विकल्प (c) है।`
  },

  // --- PAGE 223 ---
  {
    id: 'mens_q12',
    originalNumber: 12,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Rectangle)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I) / 05/09/2023 (Shift-I)',
    questionText: 'यदि एक आयत की लंबाई 1/3 बढ़ा दी जाती है और चौड़ाई 1/3 कम कर दी जाती है, तो आयत का क्षेत्रफल भिन्न में कम हो जाता है-',
    options: [
      { key: 'a', text: '2/3' },
      { key: 'b', text: '1/6' },
      { key: 'c', text: '1/9' },
      { key: 'd', text: '1/8' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'c',
    explanation: `माना पहले आयत की लंबाई = l तथा चौड़ाई = b
मूल क्षेत्रफल = l × b

नई लंबाई l' = l + \\frac{l}{3} = \\frac{4l}{3}
नई चौड़ाई b' = b - \\frac{b}{3} = \\frac{2b}{3}

नया क्षेत्रफल = \\frac{4l}{3} \\times \\frac{2b}{3} = \\frac{8}{9}lb
क्षेत्रफल में कमी = lb - \\frac{8}{9}lb = \\frac{1}{9}lb

अतः आयत का क्षेत्रफल 1/9 भाग कम हो जाएगा। सही उत्तर विकल्प (c) है।`
  },
  {
    id: 'mens_q13',
    originalNumber: 13,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cuboid Diagonal)',
    exam: 'BPSC-TRE 3.0 (6 to 8) 19/07/2024',
    questionText: 'एक कमरा 8 मीटर लंबा, 6 मीटर चौड़ा और 10 मीटर ऊँचा है, तो कमरे में रखे जा सकने वाले सबसे लंबे खंभे की लम्बाई है-',
    imageUrl: 'https://ik.imagekit.io/bk52vah91/bpsc_questions/cuboid_diagonal_q13.svg',
    options: [
      { key: 'a', text: '12 मीटर' },
      { key: 'b', text: '10√6 मीटर' },
      { key: 'c', text: '10√2 मीटर' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: `चित्रानुसार:
![कमरे का विकर्ण](https://ik.imagekit.io/bk52vah91/bpsc_questions/cuboid_diagonal_q13.svg)

कमरे की विमाएँ:
लंबाई (l) = 8 मी, चौड़ाई (b) = 6 मी, ऊँचाई (h) = 10 मी.

कमरे में रखे जा सकने वाले सबसे लंबे खंभे की लंबाई = घनाभ का विकर्ण:
\\text{विकर्ण} = \\sqrt{l^2 + b^2 + h^2}
= \\sqrt{8^2 + 6^2 + 10^2}
= \\sqrt{64 + 36 + 100} = \\sqrt{200}
= 10\\sqrt{2}\\text{ मीटर}

अतः सही उत्तर विकल्प (c) है।`
  },
  {
    id: 'mens_q14',
    originalNumber: 14,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Rhombus Perimeter)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: 'यदि एक समचतुर्भुज के विकर्ण 24 सेमी. और 10 सेमी. हैं, तो समचतुर्भुज का परिमाप होगा-',
    imageUrl: 'https://ik.imagekit.io/bk52vah91/bpsc_questions/rhombus_q14.svg',
    options: [
      { key: 'a', text: '68 सेमी.' },
      { key: 'b', text: '60 सेमी.' },
      { key: 'c', text: '52 सेमी.' },
      { key: 'd', text: '50 सेमी.' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'c',
    explanation: `चित्रानुसार:
![समचतुर्भुज और विकर्ण](https://ik.imagekit.io/bk52vah91/bpsc_questions/rhombus_q14.svg)

समचतुर्भुज का पहला विकर्ण d₁ = 24 सेमी.
दूसरा विकर्ण d₂ = 10 सेमी.
समचतुर्भुज की भुजा (a):
a^2 = \\left(\\frac{d_1}{2}\\right)^2 + \\left(\\frac{d_2}{2}\\right)^2
= \\left(\\frac{24}{2}\\right)^2 + \\left(\\frac{10}{2}\\right)^2
= (12)^2 + (5)^2 = 144 + 25 = 169
\\Rightarrow a = \\sqrt{169} = 13\\text{ सेमी.}

समचतुर्भुज का परिमाप = 4a = 4 × 13 = 52 सेमी.
अतः सही उत्तर विकल्प (c) है।`
  },
  {
    id: 'mens_q15',
    originalNumber: 15,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Triangle Sides & Heron)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: 'एक त्रिभुज की भुजाओं की लंबाई पूर्णांकों में होती है और इसका क्षेत्रफल भी एक पूर्णांक होता है। एक भुजा 21 सेमी. है और परिमाप 48 सेमी. है, तो सबसे छोटी भुजा की लंबाई होगी-',
    options: [
      { key: 'a', text: '8 सेमी.' },
      { key: 'b', text: '10 सेमी.' },
      { key: 'c', text: '12 सेमी.' },
      { key: 'd', text: '14 सेमी.' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'b',
    explanation: `दिया है:
त्रिभुज की एक भुजा c = 21 सेमी.
परिमाप = a + b + c = 48 सेमी.
\\Rightarrow a + b = 48 - 21 = 27
अर्धपरिमाप s = \\frac{48}{2} = 24

हीरोन के सूत्र से:
\\text{क्षेत्रफल} = \\sqrt{s(s - a)(s - b)(s - c)} = \\sqrt{24(24 - a)(24 - b)(3)}

विकल्पों की जाँच:
यदि a = 10 सेमी, तो b = 27 - 10 = 17 सेमी.
\\text{क्षेत्रफल} = \\sqrt{24(24 - 10)(24 - 17)(24 - 21)}
= \\sqrt{24 \\times 14 \\times 7 \\times 3} = \\sqrt{7056} = 84 (जो एक पूर्ण पूर्णांक है!)
यदि a = 8 सेमी लेते, तो b = 19 सेमी होता, जहाँ क्षेत्रफल अपूर्णांक \\sqrt{5760} आता।

अतः सबसे छोटी भुजा की लंबाई 10 सेमी. होगी। सही उत्तर विकल्प (b) है।`
  },

  // --- PAGE 224 ---
  {
    id: 'mens_q16',
    originalNumber: 16,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Circle Area Formula)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: "त्रिज्या 'r' के साथ एक वृत्त का क्षेत्रफल है-",
    options: [
      { key: 'a', text: 'πr²' },
      { key: 'b', text: '1/2 πr²' },
      { key: 'c', text: '2πr²' },
      { key: 'd', text: '4πr²' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'a',
    explanation: `त्रिज्या r वाले वृत्त का मानक क्षेत्रफल = πr²
अतः सही उत्तर विकल्प (a) है।`
  },
  {
    id: 'mens_q17',
    originalNumber: 17,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cube Surface Area)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I) / 04/09/2023 (Shift-I)',
    questionText: "किनारे 'a' के घन का पृष्ठीय क्षेत्रफल है-",
    options: [
      { key: 'a', text: '4a²' },
      { key: 'b', text: '6a²' },
      { key: 'c', text: '3a²' },
      { key: 'd', text: 'a²' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'b',
    explanation: `घन के 6 समान वर्गाकार फलक होते हैं। प्रत्येक फलक का क्षेत्रफल a² होता है।
अतः घन का कुल पृष्ठीय क्षेत्रफल = 6a²
सही उत्तर विकल्प (b) है।`
  },
  {
    id: 'mens_q18',
    originalNumber: 18,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Rhombus Area)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I) / 04/09/2023 (Shift-I) / 18/09/2020 (Shift-I)',
    questionText: 'एक समचतुर्भुज के विकर्ण 8 सेमी. और 10 सेमी. हैं, तब समचतुर्भुज का क्षेत्रफल ............. है।',
    options: [
      { key: 'a', text: '64 वर्ग सेमी.' },
      { key: 'b', text: '100 वर्ग सेमी.' },
      { key: 'c', text: '80 वर्ग सेमी.' },
      { key: 'd', text: '40 वर्ग सेमी.' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `दिया है:
समचतुर्भुज का पहला विकर्ण (d₁) = 8 सेमी.
समचतुर्भुज का दूसरा विकर्ण (d₂) = 10 सेमी.

समचतुर्भुज का क्षेत्रफल = \\frac{1}{2} \\times \\text{विकर्णों का गुणनफल}
= \\frac{1}{2} \\times d_1 \\times d_2 = \\frac{1}{2} \\times 8 \\times 10 = 40\\text{ वर्ग सेमी.}

अतः सही उत्तर विकल्प (d) है।`
  },
  {
    id: 'mens_q19',
    originalNumber: 19,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cylinder & Cone Ratio)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I) / 05/09/2023 (Shift-II)',
    questionText: 'एक सिलेंडर और एक शंकु का समान आधार त्रिज्या और समान ऊँचाई है, तो बेलन के आयतन का शंकु के आयतन से अनुपात है-',
    options: [
      { key: 'a', text: '3 : 1' },
      { key: 'b', text: '1 : 3' },
      { key: 'c', text: '2 : 3' },
      { key: 'd', text: '1 : 1' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'a',
    explanation: `माना त्रिज्या = r तथा ऊँचाई = h
बेलन का आयतन V₁ = \\pi r^2 h
शंकु का आयतन V₂ = \\frac{1}{3}\\pi r^2 h

अनुपात:
\\frac{V_1}{V_2} = \\frac{\\pi r^2 h}{\\frac{1}{3}\\pi r^2 h} = \\frac{1}{\\frac{1}{3}} = \\frac{3}{1} = 3 : 1

अतः सही उत्तर विकल्प (a) है।`
  },
  {
    id: 'mens_q20',
    originalNumber: 20,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Equilateral Triangles Ratio)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: 'ABC और BDE दो समबाहु त्रिभुज इस प्रकार हैं कि D, BC का मध्य-बिंदु है। त्रिभुज ABC और BDE के क्षेत्रफलों का अनुपात है-',
    options: [
      { key: 'a', text: '2 : 1' },
      { key: 'b', text: '4 : 1' },
      { key: 'c', text: '1 : 2' },
      { key: 'd', text: '1 : 4' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'b',
    explanation: `माना समबाहु त्रिभुज ABC की प्रत्येक भुजा की लंबाई = a
चूँकि D, भुजा BC का मध्य-बिंदु है:
\\Rightarrow \\Delta BDE की भुजा की लंबाई = \\frac{a}{2}

क्षेत्रफलों का अनुपात:
\\frac{\\text{क्षेत्रफल}(\\Delta ABC)}{\\text{क्षेत्रफल}(\\Delta BDE)} = \\frac{\\frac{\\sqrt{3}}{4}a^2}{\\frac{\\sqrt{3}}{4}\\left(\\frac{a}{2}\\right)^2} = \\frac{a^2}{\\frac{a^2}{4}} = \\frac{4}{1} = 4 : 1

अतः सही उत्तर विकल्प (b) है।`
  },
  {
    id: 'mens_q21',
    originalNumber: 21,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Solid Geometry Dimensions)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I)',
    questionText: 'एक ठोस (Solid) की कुल कितनी विमाएँ (Dimensions) होती हैं?',
    options: [
      { key: 'a', text: '4' },
      { key: 'b', text: '1' },
      { key: 'c', text: '2' },
      { key: 'd', text: '3' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'd',
    explanation: `एक ठोस (3D Solid) की कुल 3 विमाएँ (Dimensions) होती हैं:
1. लम्बाई (Length)
2. चौड़ाई (Breadth)
3. ऊँचाई / मोटाई (Height / Depth)

अतः सही उत्तर विकल्प (d) है।`
  },
  {
    id: 'mens_q22',
    originalNumber: 22,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Rhombus Diagonal)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-II) / 23/05/2024 (Shift-I)',
    questionText: 'एक समचतुर्भुज का क्षेत्रफल 240 सेमी.² और एक विकर्ण 16 सेमी. है। दूसरा विकर्ण ...... होगा।',
    options: [
      { key: 'a', text: '16 सेमी.' },
      { key: 'b', text: '20 सेमी.' },
      { key: 'c', text: '30 सेमी.' },
      { key: 'd', text: '36 सेमी.' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'c',
    explanation: `समचतुर्भुज का क्षेत्रफल = \\frac{d_1 \\times d_2}{2}
दिया है:
क्षेत्रफल = 240 सेमी.²
पहला विकर्ण d₁ = 16 सेमी.

\\Rightarrow 240 = \\frac{16 \\times d_2}{2} = 8 \\times d_2
\\Rightarrow d_2 = \\frac{240}{8} = 30\\text{ सेमी.}

अतः दूसरा विकर्ण 30 सेमी. होगा। सही उत्तर विकल्प (c) है।`
  },
  {
    id: 'mens_q23',
    originalNumber: 23,
    topic: 'mensuration',
    topicNameHindi: 'क्षेत्रमिति (Mensuration - Cube Faces)',
    exam: 'Bihar STET (9 & 10) 18/09/2020 (Shift-I) / 23/05/2024 (Shift-I)',
    questionText: 'एक घन के सभी छह फलक ..... होते हैं।',
    options: [
      { key: 'a', text: 'समान' },
      { key: 'b', text: 'भिन्न' },
      { key: 'c', text: 'वृत्ताकार' },
      { key: 'd', text: 'आयताकार' },
      { key: 'e', text: 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)' }
    ],
    correctOption: 'a',
    explanation: `घन (Cube) की सभी 12 भुजाएँ बराबर होती हैं।
अतः घन के सभी छह फलक (6 faces) एक समान वर्गाकार (identical square faces) होते हैं।

सही उत्तर विकल्प (a) है।`
  }
];
