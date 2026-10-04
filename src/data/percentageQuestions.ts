import { Question } from '../types';

export const percentageQuestions: Question[] = [
  {
    id: 'pct_1',
    originalNumber: 1,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-I), 04/09/2023 (Shift-II)',
    questionText: 'किसी संपत्ति की कीमत ₹500000 है तथा प्रतिवर्ष 10% की दर से इसका अवमूल्यन होता है। कितने समय में इसकी कीमत ₹364500 हो जाएगी?',
    options: [
      { key: 'a', text: '3 वर्ष' },
      { key: 'b', text: '3½ वर्ष' },
      { key: 'c', text: '2 वर्ष' },
      { key: 'd', text: '2½ वर्ष' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'A = P(1 - r/100)ⁿ\n364500 = 500000(1 - 10/100)ⁿ\n364500 / 500000 = (9/10)ⁿ\n729 / 1000 = (9/10)ⁿ\n(9/10)³ = (9/10)ⁿ\nदोनों पक्षों की तुलना करने पर: n = 3 वर्ष'
  },
  {
    id: 'pct_2',
    originalNumber: 2,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 24/05/2024 (Shift-I), 05/09/2023 (Shift-I)',
    questionText: 'मोहन ने एक घर ₹30000 में खरीदा जिसका 25% वार्षिक दर से अवमूल्यन हो रहा है। 3 वर्ष बाद घर की कीमत होगी-',
    options: [
      { key: 'a', text: '₹13656' },
      { key: 'b', text: '₹13656.25' },
      { key: 'c', text: '₹12656' },
      { key: 'd', text: '₹12656.25' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'A = P(1 - R/100)ᵗ\n= 30000(1 - 25/100)³\n= 30000(3/4)³\n= 30000 × (27 / 64) = ₹12656.25'
  },
  {
    id: 'pct_3',
    originalNumber: 3,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 22/05/2024 (Shift-I)',
    questionText: 'यदि वृत्त की त्रिज्या में 100% की वृद्धि की जाती है, तो क्षेत्र में वृद्धि होगी-',
    options: [
      { key: 'a', text: '100%' },
      { key: 'b', text: '200%' },
      { key: 'c', text: '300%' },
      { key: 'd', text: '400%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'वृत्त का क्षेत्रफल A ∝ r²\nत्रिज्या में 100% वृद्धि का अर्थ है नई त्रिज्या = 2r\nनया क्षेत्रफल = π(2r)² = 4πr²\nवृद्धि = 4πr² - πr² = 3πr²\nप्रतिशत वृद्धि = (3πr² / πr²) × 100% = 300%'
  },
  {
    id: 'pct_4',
    originalNumber: 4,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 22/05/2024 (Shift-I)',
    questionText: 'किसी दिए गए आयत की लंबाई में 20% की वृद्धि और चौड़ाई में 20% की कमी की जाती है, तो क्षेत्रफल-',
    options: [
      { key: 'a', text: 'वही रहता है।' },
      { key: 'b', text: '5% बढ़ जाता है।' },
      { key: 'c', text: '5% कम हो जाता है।' },
      { key: 'd', text: '4% कम हो जाता है।' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'शुद्ध प्रभाव % = a + b + (ab / 100)\n= 20 + (-20) + (20 × -20) / 100\n= 0 - 400 / 100 = -4%\nऋणात्मक चिन्ह 4% की कमी दर्शाता है।'
  },
  {
    id: 'pct_5',
    originalNumber: 5,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'यदि आयत के प्रत्येक आयाम में 100% की वृद्धि होती है, तो इसका क्षेत्रफल बढ़ती होगी',
    options: [
      { key: 'a', text: '400%' },
      { key: 'b', text: '300%' },
      { key: 'c', text: '100%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: 'क्षेत्रफल में प्रतिशत वृद्धि = x + y + (xy / 100)\n= 100 + 100 + (100 × 100) / 100 = 200 + 100 = 300%'
  },
  {
    id: 'pct_6',
    originalNumber: 6,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 22/05/2024 (Shift-I)',
    questionText: 'एक रेफ्रिजरेटर 2 वर्ष पूर्व खरीदा गया जिसका 12% प्रतिवर्ष की दर से अवमूल्यन होने के पश्चात्य वर्तमान मूल्य ₹9680 है। यह कितने रूपये में खरीदा गया था?',
    options: [
      { key: 'a', text: '₹12000' },
      { key: 'b', text: '₹12500' },
      { key: 'c', text: '₹13000' },
      { key: 'd', text: '₹13500' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'वर्तमान मूल्य = P × (1 - 12/100)²\n9680 = P × (0.88)²\n9680 = P × 0.7744\nP = 9680 / 0.7744 = ₹12500'
  },
  {
    id: 'pct_7',
    originalNumber: 7,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'किसी संख्या के 25% का 40% 80 है, उस संख्या का 60% कितना होगा?',
    options: [
      { key: 'a', text: '400' },
      { key: 'b', text: '450' },
      { key: 'c', text: '480' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'माना संख्या x है।\n(40/100) × (25/100) × x = 80\n(1/10) × x = 80 ⇒ x = 800\nअब 800 का 60% = 800 × 60/100 = 480'
  },
  {
    id: 'pct_8',
    originalNumber: 8,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'यदि किसी वृत्त की त्रिज्या में 50% वृद्धि कर दी जाए, तो उसके क्षेत्रफल में कितनी वृद्धि होगा?',
    options: [
      { key: 'a', text: '125%' },
      { key: 'b', text: '75%' },
      { key: 'c', text: '50%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'प्रतिशत वृद्धि = 50 + 50 + (50 × 50)/100 = 100 + 25 = 125%'
  },
  {
    id: 'pct_9',
    originalNumber: 9,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'यदि चीनी की कीमत में 25% वृद्धि हो जाए, तो किसी गृहस्थ को चीनी की खपत में कितने प्रतिशत कमी करनी पड़ेगी, ताकि उसके चीनी का खर्च न बढ़े?',
    options: [
      { key: 'a', text: '18%' },
      { key: 'b', text: '20%' },
      { key: 'c', text: '10%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: 'खपत में प्रतिशत कमी = [r / (100 + r)] × 100%\n= [25 / (100 + 25)] × 100% = (25 / 125) × 100% = 20%'
  },
  {
    id: 'pct_10',
    originalNumber: 10,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'एक शहर की वर्तमान जनसंख्या 1,76,400 है। यदि जनसंख्या वृद्धि की दर 5% प्रतिवर्ष हो, तो उसी शहर की जनसंख्या 2 साल बाद होगी:',
    options: [
      { key: 'a', text: '1,94,481' },
      { key: 'b', text: '2,00,000' },
      { key: 'c', text: '1,90,000' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: '2 वर्ष बाद जनसंख्या = 176400 × (1 + 5/100)²\n= 176400 × (21/20) × (21/20)\n= 176400 × (441 / 400) = 441 × 441 = 1,94,481'
  },
  {
    id: 'pct_11',
    originalNumber: 11,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'यदि एक लंब वृत्तीय शंकु की त्रिज्या और ऊँचाई 20%, बढ़ा दी जाए, तो इसका आयतन बढ़ जाएगा',
    options: [
      { key: 'a', text: '40%' },
      { key: 'b', text: '60%' },
      { key: 'c', text: '72.8%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'V = (1/3)πr²h\nनया आयतन V₁ = (1/3)π(1.2r)²(1.2h) = 1.44 × 1.2 × V = 1.728 V\nवृद्धि = 1.728 V - V = 0.728 V\nप्रतिशत वृद्धि = 0.728 × 100% = 72.8%'
  },
  {
    id: 'pct_12',
    originalNumber: 12,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'यदि A का 80% = B का 50% और B = A का x% तो x का मान है-',
    options: [
      { key: 'a', text: '160' },
      { key: 'b', text: '300' },
      { key: 'c', text: '400' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'A × 80 = B × 50 ⇒ B = 80A / 50 = (8/5)A\nअब B = A × (x/100) ⇒ (8/5)A = A × (x/100)\nx = (8/5) × 100 = 160'
  },
  {
    id: 'pct_13',
    originalNumber: 13,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC-Tre 3.0 (6 to 8) 15/03/2024',
    questionText: 'यदि वृत्त की त्रिज्या 40% बढ़ा दी गई हो, तो उसका क्षेत्रफल बढ़ जाएगा।',
    options: [
      { key: 'a', text: '69%' },
      { key: 'b', text: '48%' },
      { key: 'c', text: '96%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'क्षेत्रफल में प्रतिशत वृद्धि = 40 + 40 + (40 × 40)/100 = 80 + 16 = 96%'
  },
  {
    id: 'pct_14',
    originalNumber: 14,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC-Tre 3.0 (6 to 8) 15/03/2024',
    questionText: 'एक संख्या का 4/7 भाग, दूसरी संख्या के 40% के समान है। प्रथम संख्या व दूसरी संख्या में अनुपात है, क्रमशः:',
    options: [
      { key: 'a', text: '6:7' },
      { key: 'b', text: '7:10' },
      { key: 'c', text: '10:7' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: '(4/7)x = (40/100)y = (2/5)y\nx / y = (2/5) × (7/4) = 14 / 20 = 7 / 10\nx : y = 7 : 10'
  },
  {
    id: 'pct_15',
    originalNumber: 15,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC-Tre 2.0 (6 to 8) 9/12/2023',
    questionText: 'एक निश्चित प्रयोग में, जीवाणुओं की संख्या 2.5% प्रति घंटा की दर से बढ़ रही थी। प्रारंभ में यह संख्या 512000 थी। 2 घंटे के अन्त में जीवाणुओं की संख्या ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '537920' },
      { key: 'b', text: '536920' },
      { key: 'c', text: '537960' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: '2.5% = 2.5/100 = 1/40\nप्रत्येक घंटे बाद संख्या = 1 + 1/40 = 41/40 गुना हो जाती है।\n2 घंटे बाद संख्या = 512000 × (41/40) × (41/40)\n= 512000 × (1681 / 1600) = 320 × 1681 = 537920'
  },
  {
    id: 'pct_16',
    originalNumber: 16,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC-Tre 2.0 (6 to 8) 9/12/2023',
    questionText: 'एक मशीन के मूल्य में प्रति वर्ष 20% की दर से ह्रास होता है। इसे दो वर्ष पूर्व खरीदा गया था। यदि इसकी वर्तमान कीमत ₹40,000 हो, तो यह कितने में खरीदी गयी थी?',
    options: [
      { key: 'a', text: '₹62,500' },
      { key: 'b', text: '₹65,200' },
      { key: 'c', text: '₹56,500' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'माना प्रारंभिक खरीद मूल्य = ₹x\nx × (1 - 20/100)² = 40000\nx × (4/5)² = 40000\nx × (16/25) = 40000\nx = (40000 × 25) / 16 = 2500 × 25 = ₹62,500'
  },
  {
    id: 'pct_17',
    originalNumber: 17,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC-Tre 2.0 (9 & 10) 08/12/2023',
    questionText: 'एक मात्रा X, Y से 25% अधिक है, तो Y, X से कम होगा-',
    options: [
      { key: 'a', text: '20%' },
      { key: 'b', text: '25%' },
      { key: 'c', text: '15%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'कमी प्रतिशत = [r / (100 + r)] × 100%\n= [25 / (100 + 25)] × 100% = (25 / 125) × 100% = 20%'
  },
  {
    id: 'pct_18',
    originalNumber: 18,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC-Tre 2.0 (9 & 10) 08/12/2023',
    questionText: 'एक बल्लेबाज ने 120 रन बनाए, जिनमें 3 चौके और 8 छक्के शामिल हैं। विकेटों के बीच दौड़कर उसके कुल स्कोर का प्रतिशत है-',
    options: [
      { key: 'a', text: '40%' },
      { key: 'b', text: '50%' },
      { key: 'c', text: '60%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: 'बाउंड्री से रन = (3 × 4) + (8 × 6) = 12 + 48 = 60 रन\nदौड़कर बनाए रन = 120 - 60 = 60 रन\nप्रतिशत = (60 / 120) × 100% = 50%'
  },
  {
    id: 'pct_19',
    originalNumber: 19,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC-Tre 2.0 (9 & 10) 08/12/2023',
    questionText: 'एक परीक्षण में 1100 लड़कों और 700 लड़कियों की जांच की जाती है, जिनमें लड़कों का 42% और लड़कियों का 30% पास हुए हैं। कुल असफलता का प्रतिशत है-',
    options: [
      { key: 'a', text: '62⅔%' },
      { key: 'b', text: '58%' },
      { key: 'c', text: '55%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'असफल लड़के = 1100 का (100 - 42)% = 1100 × 58% = 638\nअसफल लड़कियाँ = 700 का (100 - 30)% = 700 × 70% = 490\nकुल असफल विद्यार्थी = 638 + 490 = 1128\nकुल विद्यार्थी = 1100 + 700 = 1800\nकुल असफलता % = (1128 / 1800) × 100% = 1128 / 18 = 62⅔%'
  },
  {
    id: 'pct_20',
    originalNumber: 20,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'BPSC Tre 1.0 (9 & 10) 26/08/2023',
    questionText: 'एक परीक्षा में एक छात्र ने 30% अंक प्राप्त किए तथा वह 45 अंकों से अनुत्तीर्ण हो गया। दूसरे छात्र ने 42% अंक प्राप्त किए, जो उत्तीर्ण होने के लिए आवश्यक न्यूनतम अंकों से 45 अंक अधिक है। पूर्णांक ज्ञात कीजिए',
    options: [
      { key: 'a', text: '270' },
      { key: 'b', text: '750' },
      { key: 'c', text: '850' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: 'माना पूर्णांक x है।\nउत्तीर्ण अंक = (30% of x) + 45 = (42% of x) - 45\n(42% - 30%) of x = 45 + 45\n12% of x = 90\nx = (90 × 100) / 12 = 750'
  },
  {
    id: 'pct_21',
    originalNumber: 21,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 14/09/2020 (Shift-I)',
    questionText: 'A और B दोनों का वेतन 26000 रूपया है यदि दोनों अपने वेतन का 75 प्रतिशत एवं 60 प्रतिशत खर्च करते हैं, इसके बाद दोनों का बचत बराबर होता है, तो B का वेतन क्या होना चाहिए?',
    options: [
      { key: 'a', text: '₹16000' },
      { key: 'b', text: '₹8000' },
      { key: 'c', text: '₹6000' },
      { key: 'd', text: '₹10000' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'A की बचत = A का (100 - 75)% = 25% of A\nB की बचत = B का (100 - 60)% = 40% of B\n25% of A = 40% of B ⇒ A / B = 40 / 25 = 8 / 5\nB का वेतन = [5 / (8 + 5)] × 26000 = (5 / 13) × 26000 = ₹10,000'
  },
  {
    id: 'pct_22',
    originalNumber: 22,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 28/01/2020',
    questionText: 'यदि मोहन की आय, रमन की आय से 25% अधिक है तो बतायें कि रमन की आय, मोहन की आय से कितने प्रतिशत कम है?',
    options: [
      { key: 'a', text: '25%' },
      { key: 'b', text: '80%' },
      { key: 'c', text: '20%' },
      { key: 'd', text: '75%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'माना रमन की आय = 100\nमोहन की आय = 125\nकमी % = [(125 - 100) / 125] × 100% = (25 / 125) × 100% = 20%'
  },
  {
    id: 'pct_23',
    originalNumber: 23,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (9 & 10) 28/01/2020 (Shift-I)',
    questionText: 'यदि x का 90%, 315 किमी. है, तो x का मान है?',
    options: [
      { key: 'a', text: '325 किमी.' },
      { key: 'b', text: '350 किमी.' },
      { key: 'c', text: '405 किमी.' },
      { key: 'd', text: '340 किमी.' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'x × (90 / 100) = 315\nx = (315 × 100) / 90 = 35 × 10 = 350 किमी.'
  },
  {
    id: 'pct_24',
    originalNumber: 24,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 28/01/2020 (Shift-I)',
    questionText: '4.9 को प्रतिशत के रूप में व्यक्त किया जा सकता है-',
    options: [
      { key: 'a', text: '4.9%' },
      { key: 'b', text: '490%' },
      { key: 'c', text: '0.049%' },
      { key: 'd', text: '0.49%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'किसी संख्या को प्रतिशत में बदलने के लिए 100 से गुणा करते हैं:\n4.9 × 100% = 490%'
  },
  {
    id: 'pct_25',
    originalNumber: 25,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: 'राधा का वेतन सलमा के वेतन से 20% कम है, तब सलमा का वेतन राधा के वेतन से अधिक है',
    options: [
      { key: 'a', text: '25%' },
      { key: 'b', text: '33⅓%' },
      { key: 'c', text: '16⅔%' },
      { key: 'd', text: '20%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'सलमा = 100 ⇒ राधा = 80\nअधिकता % = [(100 - 80) / 80] × 100% = (20 / 80) × 100% = 25%'
  },
  {
    id: 'pct_26',
    originalNumber: 26,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: '264 का 60% बराबर है-',
    options: [
      { key: 'a', text: '448 का 22%' },
      { key: 'b', text: '544 का 17%' },
      { key: 'c', text: '180 का 55%' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '264 × 60/100 = 158.4\nविकल्पों की जाँच:\n(a) 448 × 22/100 = 98.56\n(b) 544 × 17/100 = 92.48\n(c) 180 × 55/100 = 99\nअतः सही उत्तर विकल्प (d) इनमें से कोई नहीं है।'
  },
  {
    id: 'pct_27',
    originalNumber: 27,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: 'एक व्यक्ति की मासिक आय 18,000 रुपये है। यदि उसके वेतन में 30% की वृद्धि होती है तो अब उसकी मासिक आय क्या है?',
    options: [
      { key: 'a', text: '22,400 रुपये' },
      { key: 'b', text: '23,400 रुपये' },
      { key: 'c', text: '24,400 रुपये' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'नया वेतन = 18000 × (130 / 100) = 180 × 130 = ₹23,400'
  },
  {
    id: 'pct_28',
    originalNumber: 28,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 15/09/2020 (Shift-I)',
    questionText: 'एक विद्यालय में 38% विद्यार्थी बालिकाएँ हैं। यदि विद्यालय में बालकों की संख्या 1023 है। तब विद्यालय में कुल छात्रों की संख्या होगी-',
    options: [
      { key: 'a', text: '1500' },
      { key: 'b', text: '1650' },
      { key: 'c', text: '1061' },
      { key: 'd', text: '985' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'बालकों का प्रतिशत = 100% - 38% = 62%\n62% = 1023\n1% = 1023 / 62 = 16.5\nकुल छात्र (100%) = 16.5 × 100 = 1650'
  },
  {
    id: 'pct_29',
    originalNumber: 29,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 15/09/2020 (Shift-I)',
    questionText: 'यदि आयकर में 19% की वृद्धि हो जाती है तथा शुद्ध आय में 6% की कमी होती है। आयकर की दर ज्ञात करें-',
    options: [
      { key: 'a', text: '29%' },
      { key: 'b', text: '27%' },
      { key: 'c', text: '24%' },
      { key: 'd', text: '25%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'आयकर में वृद्धि = शुद्ध आय में कमी\nTax × 19% = Net Income × 6%\nTax / Net Income = 6 / 19\nकुल आय (Gross Income) = 6 + 19 = 25\nआयकर की दर = (Tax / Gross Income) × 100% = (6 / 25) × 100% = 24%'
  },
  {
    id: 'pct_30',
    originalNumber: 30,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 15/09/2020 (Shift-II)',
    questionText: 'एक विद्यार्थी को परीक्षा में उत्तीर्ण होने के लिए 40% अंक चाहिए। विद्यार्थी को 40 अंक आये और वह 20 अंकों से अनुत्तीर्ण हो गया। परीक्षा में कुल प्राप्तांक कितने है:',
    options: [
      { key: 'a', text: '180' },
      { key: 'b', text: '160' },
      { key: 'c', text: '150' },
      { key: 'd', text: '125' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'उत्तीर्ण होने के लिए आवश्यक अंक = 40 + 20 = 60\n40% = 60\nकुल पूर्णांक (100%) = (60 / 40) × 100 = 150'
  },
  {
    id: 'pct_31',
    originalNumber: 31,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 15/09/2020 (Shift-II)',
    questionText: 'यदि स्कूल में 75% छात्र लड़के हैं और लड़कियों की संख्या 420 है। तो लड़कों की संख्या है-',
    options: [
      { key: 'a', text: '1176' },
      { key: 'b', text: '1350' },
      { key: 'c', text: '1260' },
      { key: 'd', text: '1125' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'लड़कियों का प्रतिशत = 100% - 75% = 25%\n25% = 420\nलड़कों की संख्या (75%) = 3 × 25% = 3 × 420 = 1260'
  },
  {
    id: 'pct_32',
    originalNumber: 32,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 15/09/2020 (Shift-II)',
    questionText: 'यदि एक आयत की लम्बाई 10% बढ़ जाती है, तो क्षेत्रफल समान बनाए रखने के लिए चौड़ाई कितने प्रतिशत कम होनी चाहिए?',
    options: [
      { key: 'a', text: '10%' },
      { key: 'b', text: '20%' },
      { key: 'c', text: '9.09%' },
      { key: 'd', text: '5%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'कमी प्रतिशत = [r / (100 + r)] × 100% = [10 / (100 + 10)] × 100% = 100 / 11% ≈ 9.09%'
  },
  {
    id: 'pct_33',
    originalNumber: 33,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 15/09/2020 (Shift-II), 14/09/2020 (Shift-I)',
    questionText: 'एक वृत्त की त्रिज्या में 20% की वृद्धि होती है तो परिधि में कितने प्रतिशत की वृद्धि होगी?',
    options: [
      { key: 'a', text: '20%' },
      { key: 'b', text: '40%' },
      { key: 'c', text: '44%' },
      { key: 'd', text: '48%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'वृत्त की परिधि C = 2πr सीधे त्रिज्या (r) के समानुपाती होती है। अतः त्रिज्या में 20% वृद्धि होने पर परिधि में भी ठीक 20% की वृद्धि होगी।'
  },
  {
    id: 'pct_34',
    originalNumber: 34,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 14/09/2020 (Shift-I)',
    questionText: 'खाद्य तेल की कीमत में 25% की वृद्धि हो गई। एक परिवार खाद्य तेल की खपत में कितनी कमी करे कि उसका कुल खर्च पहले जितना ही रहे',
    options: [
      { key: 'a', text: '25%' },
      { key: 'b', text: '30%' },
      { key: 'c', text: '20%' },
      { key: 'd', text: '15%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'खपत में कमी % = [25 / (100 + 25)] × 100% = (25 / 125) × 100% = 20%'
  },
  {
    id: 'pct_35',
    originalNumber: 35,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 14/09/2020 (Shift-I), 15/09/2020 (Shift-II)',
    questionText: 'एक नगर की जनसंख्या का 96%, 23040 होता है। उस नगर की कुल जनसंख्या कितनी है?',
    options: [
      { key: 'a', text: '32,256' },
      { key: 'b', text: '24,000' },
      { key: 'c', text: '24,936' },
      { key: 'd', text: '25,640' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '96% = 23040\n1% = 23040 / 96 = 240\nकुल जनसंख्या (100%) = 240 × 100 = 24,000'
  },
  {
    id: 'pct_36',
    originalNumber: 36,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 11/09/2020 (Shift-I)',
    questionText: 'किसी परीक्षा को उत्तीर्ण करने के लिए न्यूनतम 33% अंक चाहिए एक विद्यार्थी को 210 अंक मिले और वह 21 अंकों से अनुत्तीर्ण हो गया। परीक्षा के कुल अंक हैं:',
    options: [
      { key: 'a', text: '700' },
      { key: 'b', text: '600' },
      { key: 'c', text: '550' },
      { key: 'd', text: '500' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'उत्तीर्ण अंक = 210 + 21 = 231\n33% = 231\n100% = (231 / 33) × 100 = 7 × 100 = 700'
  },
  {
    id: 'pct_37',
    originalNumber: 37,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 10/09/2020 (Shift-I)',
    questionText: 'यदि किसी संख्या की 10% की वृद्धि कर, बढ़ी हुई संख्या में पुनः 10% की कमी कर दी जाए तो मूल संख्या में कितने प्रतिशत की कमी या वृद्धि होगी?',
    options: [
      { key: 'a', text: 'मूल संख्या पूर्ववत रहेगी।' },
      { key: 'b', text: '2% की कमी होगी।' },
      { key: 'c', text: '1% की कमी होगी।' },
      { key: 'd', text: '1% की वृद्धि होगी।' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'शुद्ध प्रभाव = +10 - 10 - (10 × 10)/100 = -1%\nअतः मूल संख्या में 1% की कमी होगी।'
  },
  {
    id: 'pct_38',
    originalNumber: 38,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 10/09/2020 (Shift-I)',
    questionText: '25 का 5%, 5 के कितने प्रतिशत के बराबर होगा?',
    options: [
      { key: 'a', text: '25%' },
      { key: 'b', text: '5%' },
      { key: 'c', text: '2.5%' },
      { key: 'd', text: '1.25%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '25 × 5/100 = 5 × (x/100)\n25 × 5 = 5x ⇒ x = 25%'
  },
  {
    id: 'pct_39',
    originalNumber: 39,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 10/09/2020 (Shift-II)',
    questionText: 'यदि आमों के मूल्य में 25% कमी होने के बाद में 60 रू. में 4 आम अधिक क्रय कर सकता हूँ तो एक आम का घटा हुआ मूल्य क्या है?',
    options: [
      { key: 'a', text: '₹5' },
      { key: 'b', text: '₹4' },
      { key: 'c', text: '₹3.75' },
      { key: 'd', text: 'उपरोक्त में से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'बचत राशि = 60 का 25% = ₹15\n₹15 में 4 आम अधिक मिलते हैं।\nअतः 1 आम का नया (घटा हुआ) मूल्य = 15 / 4 = ₹3.75'
  },
  {
    id: 'pct_40',
    originalNumber: 40,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 09/09/2020 (Shift-I)',
    questionText: '264 का 60% समान है-',
    options: [
      { key: 'a', text: '520 का 30%' },
      { key: 'b', text: '360 का 48%' },
      { key: 'c', text: '1056 का 15%' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '264 × 60% = 158.4\nविकल्प (c): 1056 × 15/100 = 158.4\nदोनों समान हैं, अतः विकल्प (c) सही उत्तर है।'
  },
  {
    id: 'pct_41',
    originalNumber: 41,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET 09/09/2020 (Shift-I)',
    questionText: 'एक दिन का कितना प्रतिशत 3 घंटे है?',
    options: [
      { key: 'a', text: '14½%' },
      { key: 'b', text: '16⅓%' },
      { key: 'c', text: '18⅔%' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'एक दिन = 24 घंटे\nप्रतिशत = (3 / 24) × 100% = 1/8 × 100% = 12.5%\nचूँकि 12.5% विकल्पों (a), (b), (c) में नहीं है, अतः (d) इनमें से कोई नहीं सही है।'
  },
  {
    id: 'pct_42',
    originalNumber: 42,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET (Computer Science) Re-Exam 2020',
    questionText: 'किसी संख्या का 20%, 120 हो, तो उस संख्या का 120% कितना होगा?',
    options: [
      { key: 'a', text: '20' },
      { key: 'b', text: '120' },
      { key: 'c', text: '480' },
      { key: 'd', text: '720' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '20% = 120\n120% = (120 / 20) × 120 = 6 × 120 = 720'
  },
  {
    id: 'pct_43',
    originalNumber: 43,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'यदि पहली संख्या, तीसरी संख्या से 20% कम है तथा दूसरी और तीसरी संख्या का अनुपात 7:10 है, तो पहली और तीसरी संख्या का औसत, दूसरी संख्या से कितने प्रतिशत अधिक है?',
    options: [
      { key: 'a', text: '26⁴⁄₇%' },
      { key: 'b', text: '28²⁄₇%' },
      { key: 'c', text: '24²⁄₇%' },
      { key: 'd', text: '28⁴⁄₇%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'माना तीसरी संख्या = 10\nपहली संख्या = 10 का 80% = 8\nदूसरी संख्या = 7\nपहली और तीसरी संख्या का औसत = (8 + 10) / 2 = 9\nदूसरी संख्या (7) से अधिकता % = [(9 - 7) / 7] × 100% = 200 / 7% = 28⁴⁄₇%'
  },
  {
    id: 'pct_45',
    originalNumber: 45,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'प्रकाश का वेतन ₹75,000 था यदि उसके वेतन में 8% की वृद्धि होती है, तो उसका नया वेतन कितना होगा?',
    options: [
      { key: 'a', text: '₹77,000' },
      { key: 'b', text: '₹80,000' },
      { key: 'c', text: '₹81,000' },
      { key: 'd', text: '₹1,08,000' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'नया वेतन = 75000 × (108 / 100) = 750 × 108 = ₹81,000'
  },
  {
    id: 'pct_46',
    originalNumber: 46,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'एक संख्या में 30% की कमी हुई, फिर 30% की वृद्धि हुई, और फिर उसके बाद 10% की कमी हुई। संख्या में कितने प्रतिशत की शुद्ध वृद्धि/कमी (निकटतम पूर्णांक में) हुई?',
    options: [
      { key: 'a', text: '19% की कमी' },
      { key: 'b', text: '18% की कमी' },
      { key: 'c', text: '19% की वृद्धि' },
      { key: 'd', text: '18% की वृद्धि' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'माना संख्या = 100\nनयी संख्या = 100 × (70/100) × (130/100) × (90/100) = 81.9\nकमी = 100 - 81.9 = 18.1% ≈ 18% की कमी'
  },
  {
    id: 'pct_47',
    originalNumber: 47,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'यदि किसी वर्ग की प्रत्येक भुजा को 17% कम कर दिया जाए, तो इसका क्षेत्रफल कितने प्रतिशत कम हो जाएगा?',
    options: [
      { key: 'a', text: '31.11%' },
      { key: 'b', text: '25%' },
      { key: 'c', text: '30.79%' },
      { key: 'd', text: '44.31%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'क्षेत्रफल में प्रतिशत कमी = -17 - 17 + (17 × 17)/100 = -34 + 2.89 = -31.11%'
  },
  {
    id: 'pct_48',
    originalNumber: 48,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'एक शहर की जनसंख्या वर्ष 2010 में 12,50,000 थी। वर्ष 2011 और 2012 के दौरान इसमें 2% वार्षिक दर से बढ़ोतरी हुई। वर्ष 2013 में, इसमें 1% की कमी आई। 2013 के अंत में शहर की जनसंख्या ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '13,87,495' },
      { key: 'b', text: '12,87,495' },
      { key: 'c', text: '13,50,000' },
      { key: 'd', text: '1,28,54,952' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '2012 के अंत में = 1250000 × (102/100) × (102/100) = 13,00,500\n2013 के अंत में (1% कमी) = 1300500 × (99/100) = 13005 × 99 = 12,87,495'
  },
  {
    id: 'pct_49',
    originalNumber: 49,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'एक निश्चित गाँव की जनसंख्या प्रति वर्ष 5 प्रतिशत बढ़ जाती है। इसकी वर्तमान जनसंख्या 8200 है। दो वर्ष के बाद जनसंख्या कितनी होगी? (लगभग)',
    options: [
      { key: 'a', text: '9161' },
      { key: 'b', text: '9246' },
      { key: 'c', text: '9200' },
      { key: 'd', text: '9040' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '2 वर्ष बाद = 8200 × (105/100) × (105/100) = 8200 × (21/20) × (21/20) = 8200 × 441 / 400 = 9040.5 ≈ 9040'
  },
  {
    id: 'pct_50',
    originalNumber: 50,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'एक निर्वाचन क्षेत्र की निर्वाचक नामावली में शामिल कुल लोगों में से 85% ने चुनाव के दौरान अपने मत डाले। डाले गए मतों में से 10% अवैध घोषित कर दिए गए। यदि मतदाता सूची में 3,00,000 लोग शामिल थे, और धरम ने 1,37,700 वैध मत प्राप्त किए, तो धरम को प्राप्त वैध मतों की कुल संख्या के कितने प्रतिशत मत प्राप्त हुए?',
    options: [
      { key: 'a', text: '50.5%' },
      { key: 'b', text: '70.2%' },
      { key: 'c', text: '45.9%' },
      { key: 'd', text: '60.0%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'कुल वैध मत = 300000 × (85/100) × (90/100) = 2,29,500\nधरम को प्राप्त % = (137700 / 229500) × 100% = 60.0%'
  },
  {
    id: 'pct_51',
    originalNumber: 51,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'यदि चेतन की वर्तमान आय ₹40,000 है इसमें प्रत्येक वर्ष 1% की वृद्धि होती है, तो आज से 2 वर्ष बाद उसकी आय कितनी होगी',
    options: [
      { key: 'a', text: '₹44,854' },
      { key: 'b', text: '₹58,000' },
      { key: 'c', text: '₹50,800' },
      { key: 'd', text: '₹40,804' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '2 वर्ष बाद आय = 40000 × (101/100) × (101/100) = 4 × 101 × 101 = ₹40,804'
  },
  {
    id: 'pct_52',
    originalNumber: 52,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'एक व्यक्ति की मासिक आय ₹27,000 थी और उसका मासिक व्यय ₹18,000 था अगले वर्ष उसकी आय में 28% की वृद्धि होती है और उनके व्यय में 14% की वृद्धि होती है। उसकी बचत में प्रतिशत वृद्धि ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '51.5%' },
      { key: 'b', text: '61.5%' },
      { key: 'c', text: '56%' },
      { key: 'd', text: '50.5%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'प्रारंभिक बचत = 27000 - 18000 = ₹9000\nनई आय = 27000 × 1.28 = ₹34,560\nनया व्यय = 18000 × 1.14 = ₹20,520\nनई बचत = 34560 - 20520 = ₹14,040\nबचत में वृद्धि = 14040 - 9000 = ₹5040\nप्रतिशत वृद्धि = (5040 / 9000) × 100% = 56%'
  },
  {
    id: 'pct_53',
    originalNumber: 53,
    topic: 'percentage',
    topicNameHindi: 'प्रतिशत (Percentage)',
    exam: 'Bihar STET Mathematics Shift Exam',
    questionText: 'मयंक अपनी मासिक आय का 35% घरेलू सामानों पर, 25% इलेक्ट्रॉनिक वस्तुओं पर और 7% दवाओं पर खर्च करता है। वह ₹11,550 की शेष राशि बचाता है। मयंक की मासिक आय (₹ में) ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '₹35,000' },
      { key: 'b', text: '₹40,000' },
      { key: 'c', text: '₹33,000' },
      { key: 'd', text: '₹38,000' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'कुल खर्च = 35% + 25% + 7% = 67%\nबचत = 100% - 67% = 33%\n33% = 11550\nमासिक आय (100%) = (11550 / 33) × 100 = 350 × 100 = ₹35,000'
  }
];
