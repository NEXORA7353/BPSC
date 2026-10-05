import { Question } from '../types';

export const profitLossQuestions: Question[] = [
  {
    id: 'pl_1',
    originalNumber: 1,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 24/05/2024 (Shift-I)',
    questionText: 'एक दुकानदार अपनी साड़ियों का मूल्य लागत मूल्य से 20% अधिक निर्धारित करता है तथा खरीददार को 10% बट्टा भी देता है। इस प्रकार दुकानदार को कुल कितने प्रतिशत का लाभ होगा?',
    options: [
      { key: 'a', text: '10%' },
      { key: 'b', text: '8%' },
      { key: 'c', text: '12%' },
      { key: 'd', text: '15%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'दिया है: अंकित प्रतिशत वृद्धि a = +20%, बट्टा b = -10%\nक्रमिक परिवर्तन सूत्र: प्रतिशत लाभ = [a + b + (a × b) / 100]%\n= [20 - 10 + (20 × -10) / 100]%\n= 10 - 2 = 8%\nअतः दुकानदार को कुल 8% का लाभ होगा।'
  },
  {
    id: 'pl_2',
    originalNumber: 2,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 22/05/2024 (Shift-II), 05/09/2023, 18/09/2020',
    questionText: 'A ने एक मेज जिसका अंकित मूल्य ₹3000 था क्रमशः 10% तथा 15% के क्रमिक बट्टे पर खरीदी। उसने ₹105 परिवहन पर व्यय किया तथा मेज को ₹3200 में बेच दी। उसके लाभ का प्रतिशत होगा-',
    options: [
      { key: 'a', text: '30%' },
      { key: 'b', text: '33⅓%' },
      { key: 'c', text: '35%' },
      { key: 'd', text: '35⅓%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'मेज का अंकित मूल्य = ₹3000\nछूट के बाद खरीद मूल्य = 3000 × (90/100) × (85/100) = ₹2295\nपरिवहन व्यय = ₹105\nकुल लागत मूल्य (C.P.) = 2295 + 105 = ₹2400\nविक्रय मूल्य (S.P.) = ₹3200\nलाभ = 3200 - 2400 = ₹800\nलाभ% = (800 / 2400) × 100% = 1/3 × 100% = 33⅓%'
  },
  {
    id: 'pl_3',
    originalNumber: 3,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 22/05/2024 (Shift-II)',
    questionText: 'किसी वस्तु पर छपा हुआ मूल्य ₹900 है, लेकिन एक खुदरा व्यापारी इसे 40% बट्टे पर खरीदकर ₹900 में बेच देता है। खुदरा व्यापारी का प्रतिशत लाभ होगा-',
    options: [
      { key: 'a', text: '33⅔%' },
      { key: 'b', text: '66%' },
      { key: 'c', text: '66⅔%' },
      { key: 'd', text: '60%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'अंकित मूल्य = ₹900\nबट्टा = 40%\nक्रय मूल्य (CP) = 900 × (1 - 40/100) = 900 × 0.60 = ₹540\nविक्रय मूल्य (SP) = ₹900\nलाभ = 900 - 540 = ₹360\nलाभ% = (360 / 540) × 100% = (2 / 3) × 100% = 66⅔%'
  },
  {
    id: 'pl_4',
    originalNumber: 4,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'यदि 11 पेंसिलें ₹10 रुपये में खरीदी जाती हैं और 10 पेंसिलें ₹11 में बेची जाती हैं तो उसमें लाभ है-',
    options: [
      { key: 'a', text: '21%' },
      { key: 'b', text: '16%' },
      { key: 'c', text: '18%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: '1 पेंसिल का क्रय मूल्य (CP) = ₹10/11\n1 पेंसिल का विक्रय मूल्य (SP) = ₹11/10\nलाभ = 11/10 - 10/11 = (121 - 100) / 110 = 21/110\nलाभ% = [(21/110) / (10/11)] × 100% = (21/110) × (11/10) × 100% = 21%'
  },
  {
    id: 'pl_5',
    originalNumber: 5,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: 'एक आदमी एक वस्तु को 25% लाभ पर बेचता है, यदि उसने इसे 20% कम मूल्य पर खरीदा होता और इसे ₹10.50 कम पर बेचा होता तो उसे 30% लाभ प्राप्त होता, तो उस वस्तु की लागत है-',
    options: [
      { key: 'a', text: '₹30' },
      { key: 'b', text: '₹40' },
      { key: 'c', text: '₹50' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'माना क्रय मूल्य (CP) = ₹x\nप्रारंभिक विक्रय मूल्य (SP₁) = 1.25x\nनया क्रय मूल्य = 0.80x\nनया विक्रय मूल्य = 0.80x × 1.30 = 1.04x\nप्रश्नानुसार:\n1.25x - 1.04x = 10.50\n0.21x = 10.50 ⇒ x = 10.50 / 0.21 = ₹50'
  },
  {
    id: 'pl_6',
    originalNumber: 6,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: '20 कुर्सियों को बेचने पर 5 कुर्सियों के विक्रय मूल्य के बराबर लाभ प्राप्त होता है। तो लाभ का प्रतिशत है-',
    options: [
      { key: 'a', text: '66⅙%' },
      { key: 'b', text: '66⅔%' },
      { key: 'c', text: '33⅓%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'माना 1 कुर्सी का विक्रय मूल्य (SP) = ₹1\n20 कुर्सियों का SP = ₹20\nलाभ = 5 कुर्सियों का SP = ₹5\n20 कुर्सियों का क्रय मूल्य (CP) = SP - लाभ = 20 - 5 = ₹15\nलाभ% = (लाभ / CP) × 100% = (5 / 15) × 100% = 33⅓%'
  },
  {
    id: 'pl_7',
    originalNumber: 7,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC Tre 3.0 (9 & 10) 21/07/2024',
    questionText: '₹12,560 के अंकित मूल्य पर 12.5% की छूट के बाद एक सामान को कितने में बेचा जाना चाहिए?',
    options: [
      { key: 'a', text: '₹10,990' },
      { key: 'b', text: '₹12,000' },
      { key: 'c', text: '₹11,000' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: '12.5% = 1/8\nछूट = 12560 × 12.5/100 = 12560 / 8 = ₹1570\nविक्रय मूल्य = 12560 - 1570 = ₹10,990'
  },
  {
    id: 'pl_8',
    originalNumber: 8,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC-Tre 3.0 (6 to 8) 15/03/2024',
    questionText: 'एक पंखा 30% घाटे पर ₹4,900 में बेचा गया। पंखे का क्रय मूल्य क्या है?',
    options: [
      { key: 'a', text: '₹7,000' },
      { key: 'b', text: '₹6,300' },
      { key: 'c', text: '₹7,500' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'a',
    explanation: 'विक्रय मूल्य = (100 - 30)% = 70% of CP\n70% = ₹4900\n1% = 4900 / 70 = ₹70\nक्रय मूल्य (100%) = 70 × 100 = ₹7,000'
  },
  {
    id: 'pl_9',
    originalNumber: 9,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 23/05/2024 (Shift-I)',
    questionText: 'किसी व्यापारी के सामानों का अंकित मूल्य उसके क्र. मू. से 30% अधिक है। वह अपने ग्राहकों के अंकित मूल्य पर 10% का बट्टा देता है। उसे कितना प्रतिशत लाभ हुआ?',
    options: [
      { key: 'a', text: '27%' },
      { key: 'b', text: '25%' },
      { key: 'c', text: '20%' },
      { key: 'd', text: '17%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'लाभ% = M - D - (M × D) / 100\n= 30 - 10 - (30 × 10) / 100\n= 20 - 3 = 17%'
  },
  {
    id: 'pl_10',
    originalNumber: 10,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC-Tre 2.0 (6 to 8) 9/12/2023',
    questionText: 'एक दुकान में 2 पेंसिल और 3 रबर की कीमत ₹9 तथा 4 पेंसिल और 6 रबर की कीमत ₹18 है। प्रत्येक पेंसिल और प्रत्येक रबर की कीमत क्या हैं?',
    options: [
      { key: 'a', text: 'प्रत्येक पेंसिल ₹1 तथा प्रत्येक रबर ₹2' },
      { key: 'b', text: 'प्रत्येक पेंसिल ₹2 तथा प्रत्येक रबर ₹1' },
      { key: 'c', text: 'प्रत्येक पेंसिल ₹3 तथा प्रत्येक रबर ₹2' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'e',
    explanation: 'समीकरण:\n2x + 3y = 9 .....(1)\n4x + 6y = 18 ⇒ 2x + 3y = 9 .....(2)\nयहाँ a₁/a₂ = b₁/b₂ = c₁/c₂ = 1/2 है। ये संपाती रेखाएं हैं, अतः इनके अनंत (अपरिमित) हल हैं। कोई एक अद्वितीय हल निश्चित नहीं है। अतः सही विकल्प (e) उपर्युक्त में से कोई नहीं है।'
  },
  {
    id: 'pl_11',
    originalNumber: 11,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-I)',
    questionText: 'चीनी के मूल्य में 5% की कमी होने पर एक खरीदार ₹608 में 2kg चीनी अधिक प्राप्त करता है, तो चीनी का प्रारंभिक मूल्य प्रति किग्रा होगा-',
    options: [
      { key: 'a', text: '₹20 प्रति kg' },
      { key: 'b', text: '₹25 प्रति kg' },
      { key: 'c', text: '₹16 प्रति kg' },
      { key: 'd', text: '₹18 प्रति kg' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '5% की बचत राशि = 608 × (5/100) = ₹30.40\n₹30.40 में 2kg अधिक मिलती है ⇒ घटा हुआ मूल्य = 30.40 / 2 = ₹15.20 प्रति kg\nप्रारंभिक मूल्य = 15.20 / (0.95) = ₹16 प्रति kg'
  },
  {
    id: 'pl_12',
    originalNumber: 12,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 09/06/2024 (Shift-I), 04/09/2023 (Shift-II)',
    questionText: 'किसी वस्तु का अंकित मूल्य उसके क्रयमूल्य से 20 प्रतिशत अधिक है। अंकित मूल्य पर 20 प्रतिशत का एक बट्टा दिया जाता है। इस प्रकार की बिक्री में विक्रेता को क्या होगा?',
    options: [
      { key: 'a', text: 'लाभ' },
      { key: 'b', text: 'हानि' },
      { key: 'c', text: 'न तो लाभ और न हानि' },
      { key: 'd', text: 'इनमें से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'माना क्रय मूल्य = 100\nअंकित मूल्य = 120\nबट्टा = 120 का 20% = 24\nविक्रय मूल्य = 120 - 24 = 96\nचूंकि विक्रय मूल्य (96) क्रय मूल्य (100) से कम है, अतः विक्रेता को 4% की हानि होगी।'
  },
  {
    id: 'pl_13',
    originalNumber: 13,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC-Tre 2.0 (9 & 10) 08/12/2023',
    questionText: 'यदि 9 संतरों का विक्रय मूल्य 12 संतरों के क्रय मूल्य के बराबर है, तो प्रतिशत लाभ होगा-',
    options: [
      { key: 'a', text: '25%' },
      { key: 'b', text: '33⅓%' },
      { key: 'c', text: '20%' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'b',
    explanation: '9 SP = 12 CP\nSP / CP = 12 / 9 = 4 / 3\nलाभ = 4 - 3 = 1 इकाई\nलाभ% = (1 / 3) × 100% = 33⅓%'
  },
  {
    id: 'pl_14',
    originalNumber: 14,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC-Tre 2.0 (9 & 10) 08/12/2023',
    questionText: 'किसी वस्तु को 6% तथा 4% लाभ से बेचने पर विक्रय मूल्य का अंतर ₹3 है। उस वस्तु का क्रय मूल्य है-',
    options: [
      { key: 'a', text: '₹100' },
      { key: 'b', text: '₹150' },
      { key: 'c', text: '₹175' },
      { key: 'd', text: 'उपर्युक्त में से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'लाभ का अंतर = 6% - 4% = 2%\n2% of CP = ₹3\nCP = (3 / 2) × 100 = ₹150'
  },
  {
    id: 'pl_15',
    originalNumber: 15,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC-Tre 2.0 (9 & 10) 08/12/2023',
    questionText: 'जब एक प्लॉट ₹18,700 में बेचा जाता है, तो मालिक को 15% नुकसान होता है। 15% लाभ हासिल करने के लिए प्लॉट को कितने में बेचा जाना चाहिए?',
    options: [
      { key: 'a', text: '₹25,800' },
      { key: 'b', text: '₹22,500' },
      { key: 'c', text: '₹25,300' },
      { key: 'd', text: 'उपर्युक्त में से कोई नहीं' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '85% = ₹18700\n1% = 18700 / 85 = ₹220\n115% लाभ पर SP = 220 × 115 = ₹25,300'
  },
  {
    id: 'pl_16',
    originalNumber: 16,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'BPSC Tre 1.0 (9 & 10) 26/08/2023',
    questionText: 'एक व्यक्ति ने एक घोड़ा एवं एक कार ₹20,000 में खरीदा। उसने घोड़ा 20% लाभ पर एवं कार 10% हानि पर बेचा। इस लेन-देन में उसे 2% लाभ प्राप्त हुआ। घोड़े का क्रय मूल्य है-',
    options: [
      { key: 'a', text: '₹7,200' },
      { key: 'b', text: '₹7,500' },
      { key: 'c', text: '₹8,000' },
      { key: 'd', text: 'उपर्युक्त में से एक से अधिक' },
      { key: 'e', text: 'उपर्युक्त में से कोई नहीं' }
    ],
    correctOption: 'c',
    explanation: 'एलिगेशन नियम से:\nघोड़ा: +20%, कार: -10%, कुल औसत: +2%\nघोड़ा का अनुपात : कार का अनुपात\n[2 - (-10)] : [20 - 2] = 12 : 18 = 2 : 3\nघोड़े का क्रय मूल्य = [2 / (2 + 3)] × 20000 = (2 / 5) × 20000 = ₹8,000'
  },
  {
    id: 'pl_17',
    originalNumber: 17,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-I)',
    questionText: 'किसी खिलौने के अंकित मूल्य पर 10% का बट्टा देने से एक दुकानदार को 20% का लाभ होता है। यदि 20% का बट्टा दिया जाए तो उसको कितना लाभ होगा?',
    options: [
      { key: 'a', text: '8%' },
      { key: 'b', text: '6⅔%' },
      { key: 'c', text: '7⅓%' },
      { key: 'd', text: '10%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'माना अंकित मूल्य = 100\n10% बट्टा देने पर विक्रय मूल्य = 90\n20% लाभ होने के कारण क्रय मूल्य = 90 × (100 / 120) = 75\nयदि 20% बट्टा दिया जाए तो नया विक्रय मूल्य = 80\nनया लाभ = 80 - 75 = 5\nनया लाभ% = (5 / 75) × 100% = 1/15 × 100% = 20/3% = 6⅔%'
  },
  {
    id: 'pl_18',
    originalNumber: 18,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 04/09/2023 (Shift-I)',
    questionText: 'एक दुकानदार अपनी साड़ियों का मूल्य लागत मूल्य से 20 प्रतिशत अधिक निर्धारित करता है तथा खरीददार को 10 प्रतिशत बट्टा भी देता है। इस प्रकार दुकानदार को कुल कितने प्रतिशत का लाभ होगा?',
    options: [
      { key: 'a', text: '10%' },
      { key: 'b', text: '8%' },
      { key: 'c', text: '12%' },
      { key: 'd', text: '15%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'माना लागत मूल्य = ₹100\nअंकित मूल्य = ₹120\n10% बट्टे के बाद विक्रय मूल्य = 120 × (90 / 100) = ₹108\nलाभ = 108 - 100 = ₹8\nलाभ% = 8%'
  },
  {
    id: 'pl_19',
    originalNumber: 19,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 14/09/2020 (Shift-I)',
    questionText: '25 वस्तुओं का क्रयमूल्य, 20 वस्तुओं के विक्रयमूल्य के बराबर हो, तब लाभ प्रतिशत होगा-',
    options: [
      { key: 'a', text: '20%' },
      { key: 'b', text: '25%' },
      { key: 'c', text: '30%' },
      { key: 'd', text: '40%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '25 CP = 20 SP\nSP / CP = 25 / 20 = 5 / 4\nलाभ% = [(5 - 4) / 4] × 100% = (1 / 4) × 100% = 25%'
  },
  {
    id: 'pl_20',
    originalNumber: 20,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 28/01/2020 (Shift-I)',
    questionText: 'एक व्यापारी 329 रु. में एक वस्तु को बेचने पर 6% की हानि उठाता है। वस्तु का क्रय मूल्य है-',
    options: [
      { key: 'a', text: '₹310.37' },
      { key: 'b', text: '₹348.74' },
      { key: 'c', text: '₹335' },
      { key: 'd', text: '₹350' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'SP = 94% of CP\n329 = CP × (94 / 100)\nCP = (329 × 100) / 94 = 3.5 × 100 = ₹350'
  },
  {
    id: 'pl_21',
    originalNumber: 21,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET (9 & 10) 05/09/2023 (Shift-II), 18/09/2020 (Shift-I)',
    questionText: 'एक फुटकर विक्रेता थोक विक्रेता से 40 कलम 36 कलम की निर्धारित दर पर खरीदता है। यदि फुटकर विक्रेता उन कलमों को 1% बट्टे पर बेचता है, तो उसका प्रतिशत लाभ होगा-',
    options: [
      { key: 'a', text: '10%' },
      { key: 'b', text: '10.50%' },
      { key: 'c', text: '6%' },
      { key: 'd', text: '8%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'माना 1 कलम का अंकित मूल्य = ₹1\n40 कलम का क्रय मूल्य = 36 कलम का अंकित मूल्य = ₹36\n40 कलम का विक्रय मूल्य (1% बट्टे पर) = 40 × 0.99 = ₹39.60\nलाभ = 39.60 - 36 = ₹3.60\nलाभ% = (3.60 / 36) × 100% = 10%'
  },
  {
    id: 'pl_22',
    originalNumber: 22,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 28/01/2020 (Shift-I)',
    questionText: 'एक आदमी ने 20 सेब को 100 रुपया में बेच कर 20% मुनाफा कमाया। उसने 100 रुपया में कितने सेब खरीदे?',
    options: [
      { key: 'a', text: '22' },
      { key: 'b', text: '25' },
      { key: 'c', text: '24' },
      { key: 'd', text: '26' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '20 सेब का विक्रय मूल्य = ₹100 ⇒ 1 सेब का SP = ₹5\n1 सेब का क्रय मूल्य = 5 × (100 / 120) = ₹25/6\nअतः ₹100 में खरीदे गए सेब = 100 / (25/6) = 100 × 6 / 25 = 24 सेब'
  },
  {
    id: 'pl_23',
    originalNumber: 23,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 28/01/2020 (Shift-I)',
    questionText: 'एक व्यक्ति 12 रुपये/पाइप की दर से दो पाइप बेचता है। एक पर उसे 20% का लाभ हुआ तथा दूसरे पर उसे 20% की हानि हुई, तो पूरे सौदे का नतीजा क्या रहा?',
    options: [
      { key: 'a', text: 'न लाभ न हानि' },
      { key: 'b', text: '4% की हानि' },
      { key: 'c', text: '1% का लाभ' },
      { key: 'd', text: '8% का लाभ' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'जब दो वस्तुओं का विक्रय मूल्य समान हो और लाभ% व हानि% समान (x%) हों, तो हमेशा हानि होती है:\nहानि% = (x / 10)² = (20 / 10)² = 4% की हानि'
  },
  {
    id: 'pl_24',
    originalNumber: 24,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: 'यदि 40 वस्तुओं का विक्रयमूल्य 50 वस्तुओं के क्रयमूल्य के बराबर है, तो प्रतिशत लाभ या हानि होगा-',
    options: [
      { key: 'a', text: '25% लाभ' },
      { key: 'b', text: '25% हानि' },
      { key: 'c', text: '20% लाभ' },
      { key: 'd', text: '20% हानि' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '40 SP = 50 CP\nSP / CP = 50 / 40 = 5 / 4\nलाभ% = [(5 - 4) / 4] × 100% = 25% लाभ'
  },
  {
    id: 'pl_25',
    originalNumber: 25,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: 'यदि लागत मूल्य विक्रय मूल्य का 96% है, तो प्रतिशत लाभ क्या है?',
    options: [
      { key: 'a', text: '4.17%' },
      { key: 'b', text: '4.27%' },
      { key: 'c', text: '3.72%' },
      { key: 'd', text: '8.92%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'CP = 96% of SP\nCP / SP = 96 / 100 = 24 / 25\nलाभ% = [(25 - 24) / 24] × 100% = 100 / 24% = 4.166% ≈ 4.17%'
  },
  {
    id: 'pl_26',
    originalNumber: 26,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 28/01/2020 (Shift-II)',
    questionText: 'एक व्यक्ति 396 रुपया प्रति मशीन की दर से दो मशीन बेचता है। पहली मशीन पर उसे 10% का लाभ होता है जबकि दूसरी मशीन पर उसे 10% की हानि होती है। इस पूरे लेन-देन में उसे कितने प्रतिशत का लाभ या हानि हुई?',
    options: [
      { key: 'a', text: 'न हानि न लाभ' },
      { key: 'b', text: '1% की हानि' },
      { key: 'c', text: '1% का लाभ' },
      { key: 'd', text: '8% का लाभ' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'समान विक्रय मूल्य पर समान लाभ% और हानि% (10%) होने पर:\nकुल हानि% = (10 / 10)² = 1% की हानि'
  },
  {
    id: 'pl_27',
    originalNumber: 27,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 26/02/2020 (Shift-I)',
    questionText: '15 वस्तुओं का क्रय मूल्य 10 वस्तुओं के विक्रय मूल्य के बराबर है, तो प्रतिशत लाभ है-',
    options: [
      { key: 'a', text: '30%' },
      { key: 'b', text: '40%' },
      { key: 'c', text: '45%' },
      { key: 'd', text: '50%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: '15 CP = 10 SP\nSP / CP = 15 / 10 = 3 / 2\nलाभ% = [(3 - 2) / 2] × 100% = 50%'
  },
  {
    id: 'pl_28',
    originalNumber: 28,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 18/09/2020 (Shift-II)',
    questionText: 'एक सामान को 20% हानि पर 15000 रुपये में बेचा गया। इसका क्रय मूल्य पता करें।',
    options: [
      { key: 'a', text: '17,750 रुपये' },
      { key: 'b', text: '17,250 रुपये' },
      { key: 'c', text: '18,750 रुपये' },
      { key: 'd', text: '18,250 रुपये' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '80% = ₹15000\n100% = (15000 / 80) × 100 = 15000 × 5 / 4 = ₹18,750'
  },
  {
    id: 'pl_29',
    originalNumber: 29,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 18/09/2020 (Shift-I)',
    questionText: 'यदि 15 वस्तुओं का लागत मूल्य 12 वस्तुओं के विक्रय मूल्य के बराबर हो, तो लाभ का प्रतिशत कितना है?',
    options: [
      { key: 'a', text: '20%' },
      { key: 'b', text: '25%' },
      { key: 'c', text: '18%' },
      { key: 'd', text: '21%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '15 CP = 12 SP\nSP / CP = 15 / 12 = 5 / 4\nलाभ% = (1 / 4) × 100% = 25%'
  },
  {
    id: 'pl_30',
    originalNumber: 30,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 18/09/2020 (Shift-I)',
    questionText: 'किसी वस्तु का लागत मूल्य उसके निर्धारित मूल्य का 64% है। तदनुसार निर्धारित मूल्य पर 12% छूट देने पर उस पर लाभ का प्रतिशत कितना रहेगा?',
    options: [
      { key: 'a', text: '37.5%' },
      { key: 'b', text: '48%' },
      { key: 'c', text: '50.5%' },
      { key: 'd', text: '52%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: 'माना निर्धारित मूल्य = 100\nलागत मूल्य = 64\n12% छूट देने पर विक्रय मूल्य = 88\nलाभ = 88 - 64 = 24\nलाभ% = (24 / 64) × 100% = 3/8 × 100% = 37.5%'
  },
  {
    id: 'pl_31',
    originalNumber: 31,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 16/09/2020 (Shift-I)',
    questionText: 'एक मोबाइल फोन को 2400 रुपये में बेचा गया, जिसमें दुकानदार को 25% का लाभ हुआ। यदि 2040 रुपये में बेचता तो कितने प्रतिशत का लाभ होता?',
    options: [
      { key: 'a', text: '5%' },
      { key: 'b', text: '7.2%' },
      { key: 'c', text: '6.25%' },
      { key: 'd', text: '8%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '125% = ₹2400\nCP = 2400 × (100 / 125) = ₹1920\nनया SP = ₹2040\nलाभ = 2040 - 1920 = ₹120\nलाभ% = (120 / 1920) × 100% = 1/16 × 100% = 6.25%'
  },
  {
    id: 'pl_32',
    originalNumber: 32,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 16/09/2020 (Shift-I)',
    questionText: 'एक व्यक्ति किसी सामान को 720 रूपये में बेचता है जिसमें उसे 10% की हानि होती है। यदि वह 5% का लाभ लेकर बेचे तो वह सामान कितने रूपये में बेचेगा?',
    options: [
      { key: 'a', text: '₹800' },
      { key: 'b', text: '₹840' },
      { key: 'c', text: '₹900' },
      { key: 'd', text: '₹780' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '90% = ₹720\n105% = (720 / 90) × 105 = 8 × 105 = ₹840'
  },
  {
    id: 'pl_33',
    originalNumber: 33,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 15/09/2020 (Shift-II)',
    questionText: 'एक निर्माता ने एक कलम थोक दुकानदार को 18% लाभ पर दिया, थोक विक्रेता ने उसे खुदरा व्यापारी को 20% लाभ पर बेचा। खुदरा व्यापारी ने उसी कलम को ग्राहक को 25% लाभ पर बेचा। यदि ग्राहक को 35.40 रु. चुकाने पड़े, तो निर्माता के लिए लागत थी:',
    options: [
      { key: 'a', text: '₹15' },
      { key: 'b', text: '₹17' },
      { key: 'c', text: '₹20' },
      { key: 'd', text: '₹22' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'माना लागत = x\nx × (118/100) × (120/100) × (125/100) = 35.40\nx × 1.18 × 1.2 × 1.25 = 35.40\nx × 1.77 = 35.40 ⇒ x = 35.40 / 1.77 = ₹20'
  },
  {
    id: 'pl_34',
    originalNumber: 34,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 10/09/2020 (Shift-II)',
    questionText: 'यदि कोई विक्रेता एक वस्तु पर उसके क्रय मूल्य से 20% अधिक मूल्य अंकित करता है। कुछ छूट देने के बाद 8% शुद्ध लाभ प्राप्त होता है। उसने वस्तु पर कितने प्रतिशत छूट दी?',
    options: [
      { key: 'a', text: '4%' },
      { key: 'b', text: '6%' },
      { key: 'c', text: '10%' },
      { key: 'd', text: '12%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'CP = 100 ⇒ MP = 120\n8% लाभ के साथ SP = 108\nछूट = 120 - 108 = 12\nछूट% = (12 / 120) × 100% = 10%'
  },
  {
    id: 'pl_35',
    originalNumber: 35,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 09/09/2020 (Shift-I)',
    questionText: 'एक आदमी 1400 रुपये में एक साइकिल खरीदता है और इसे 15% की हानि पर बेचता है। साइकिल का विक्रय मूल्य क्या है?',
    options: [
      { key: 'a', text: '1202 रुपये' },
      { key: 'b', text: '1160 रुपये' },
      { key: 'c', text: '1000 रुपये' },
      { key: 'd', text: '1190 रुपये' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'SP = 1400 × (100 - 15) / 100 = 1400 × 85 / 100 = 14 × 85 = ₹1190'
  },
  {
    id: 'pl_36',
    originalNumber: 36,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 09/09/2020 (Shift-II)',
    questionText: '15% छूट देने के बाद 2 पेन का एक पैकेट रु. 340 में खरीदा गया। प्रत्येक पेन का अंकित मूल्य ज्ञात करें।',
    options: [
      { key: 'a', text: '200 रुपया' },
      { key: 'b', text: '150 रुपया' },
      { key: 'c', text: '170 रुपया' },
      { key: 'd', text: '180 रुपया' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '85% = ₹340\nकुल पैकेट का अंकित मूल्य (100%) = (340 / 85) × 100 = 4 × 100 = ₹400\nप्रत्येक पेन का मूल्य = 400 / 2 = ₹200'
  },
  {
    id: 'pl_37',
    originalNumber: 37,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET 14/09/2023 (Shift-I)',
    questionText: 'यदि किसी पुस्तक का क्रय मूल्य उसके विक्रय मूल्य का 92% है, तो पुस्तक की बिक्री पर लाभ प्रतिशत कितना होगा (दशमलव के दो स्थानों तक सही)?',
    options: [
      { key: 'a', text: '8.53%' },
      { key: 'b', text: '2.25%' },
      { key: 'c', text: '8.00%' },
      { key: 'd', text: '8.69%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'SP = 100 ⇒ CP = 92\nलाभ = 100 - 92 = 8\nलाभ% = (8 / 92) × 100% = 8.695% ≈ 8.69%'
  },
  {
    id: 'pl_38',
    originalNumber: 38,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Shift-II Exam',
    questionText: 'एक विक्रेता 10% की हानि पर एक कुर्सी ₹720 में बेचता है। 20% का लाभ अर्जित करने के लिए विक्रय मूल्य कितना होना चाहिए?',
    options: [
      { key: 'a', text: '₹960' },
      { key: 'b', text: '₹920' },
      { key: 'c', text: '₹880' },
      { key: 'd', text: '₹1000' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '90% = ₹720 ⇒ 1% = ₹8\n120% = 8 × 120 = ₹960'
  },
  {
    id: 'pl_39',
    originalNumber: 39,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: '85 वस्तुओं का अंकित मूल्य 153 वस्तुओं के क्रय मूल्य के बराबर था तथा 104 वस्तुओं का विक्रय मूल्य 65 वस्तुओं के अंकित मूल्य के बराबर था। प्रत्येक वस्तु की बिक्री से प्रतिशत लाभ या हानि की गणना कीजिए।',
    options: [
      { key: 'a', text: '12.5% लाभ' },
      { key: 'b', text: '12.25% लाभ' },
      { key: 'c', text: '15% लाभ' },
      { key: 'd', text: '12.5% हानि' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '85 MP = 153 CP ⇒ MP / CP = 9 / 5\n104 SP = 65 MP ⇒ SP / MP = 65 / 104 = 5 / 8\nSP / CP = (SP / MP) × (MP / CP) = (5 / 8) × (9 / 5) = 9 / 8\nलाभ% = [(9 - 8) / 8] × 100% = 12.5% लाभ'
  },
  {
    id: 'pl_40',
    originalNumber: 40,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: 'अनिल बीना को 20% के लाभ पर एक कार बेचता है। बीना इसे करण को 25% के लाभ पर बेच देती है। यदि करण इसके लिए ₹2,25,000 का भुगतान करता है, तो अनिल के लिए कार का क्रय मूल्य ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '₹1,75,000' },
      { key: 'b', text: '₹1,50,000' },
      { key: 'c', text: '₹1,25,000' },
      { key: 'd', text: '₹2,00,000' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: 'माना अनिल का क्रय मूल्य = x\nx × (120/100) × (125/100) = 225000\nx × (6/5) × (5/4) = 225000\nx × (3/2) = 225000 ⇒ x = 225000 × 2 / 3 = ₹1,50,000'
  },
  {
    id: 'pl_41',
    originalNumber: 41,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: 'राम, मोहन को एक सूटकेस 20% लाभ पर बेचता है। मोहन इसे श्याम को 40% लाभ पर बेचता है। यदि श्याम इसके लिए ₹1430 का भुगतान करता है, तो राम ने इसे कितने में खरीदा था?',
    options: [
      { key: 'a', text: '₹875' },
      { key: 'b', text: '₹870' },
      { key: 'c', text: '₹851.19' },
      { key: 'd', text: '₹880' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'x × 1.20 × 1.40 = 1430\nx × 1.68 = 1430 ⇒ x = 1430 / 1.68 ≈ ₹851.19'
  },
  {
    id: 'pl_42',
    originalNumber: 42,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: 'एक वस्तु को ₹5,280 में बेचने पर गीता को 12% की हानि होती है। 12% का लाभ अर्जित करने के लिए उसे इसे किस मूल्य पर बेचना चाहिए?',
    options: [
      { key: 'a', text: '₹5,780' },
      { key: 'b', text: '₹6,720' },
      { key: 'c', text: '₹7,150' },
      { key: 'd', text: '₹6,820' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'b',
    explanation: '88% = ₹5280 ⇒ CP = 5280 / 0.88 = ₹6000\n12% लाभ पर SP = 6000 × 1.12 = ₹6,720'
  },
  {
    id: 'pl_43',
    originalNumber: 43,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: 'एक वस्तु को Rs. 33,000 में बेचने पर एक व्यक्ति को 10% का लाभ होता है। 20% का लाभ प्राप्त करने के लिए उसे इसे किस मूल्य पर बेचना होगा?',
    options: [
      { key: 'a', text: '₹30,000' },
      { key: 'b', text: '₹36,600' },
      { key: 'c', text: '₹36,000' },
      { key: 'd', text: '₹35,000' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: '110% = ₹33000 ⇒ 1% = 300\n120% = 300 × 120 = ₹36,000'
  },
  {
    id: 'pl_44',
    originalNumber: 44,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: '15 गेंदों को ₹450 में बेचने पर, 5 गेंदों के क्रय मूल्य के बराबर हानि होती है। एक गेंद का क्रय मूल्य क्या होगा?',
    options: [
      { key: 'a', text: '₹23' },
      { key: 'b', text: '₹32' },
      { key: 'c', text: '₹45' },
      { key: 'd', text: '₹54' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'हानि = 15 गेंदों का CP - 15 गेंदों का SP\n5 गेंदों का CP = 15 गेंदों का CP - 450\n10 गेंदों का CP = 450\n1 गेंद का CP = 450 / 10 = ₹45'
  },
  {
    id: 'pl_45',
    originalNumber: 45,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: 'दो वस्तुओं में से प्रत्येक को ₹4,752 में बेचा जाता है। विक्रेता को एक वस्तु की बिक्री पर 32% का लाभ और दूसरी पर 28% की हानि होती है। समग्र रूप से लाभ या हानि प्रतिशत क्या है (दशमलव के एक स्थान तक)?',
    options: [
      { key: 'a', text: '7.3% लाभ' },
      { key: 'b', text: '7.3% हानि' },
      { key: 'c', text: '6.8% हानि' },
      { key: 'd', text: '6.8% लाभ' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'c',
    explanation: 'कुल SP = 4752 + 4752 = ₹9504\nCP₁ = 4752 / 1.32 = ₹3600\nCP₂ = 4752 / 0.72 = ₹6600\nकुल CP = 3600 + 6600 = ₹10,200\nकुल हानि = 10200 - 9504 = ₹696\nहानि% = (696 / 10200) × 100% ≈ 6.8% हानि'
  },
  {
    id: 'pl_46',
    originalNumber: 46,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: 'राहुल ने ₹375 प्रति दर्जन की दर से 20 दर्जन खिलौने खरीदे। उसने उनमें से प्रत्येक खिलौने को ₹33 में बेचा। उसका लाभ प्रतिशत ज्ञात कीजिए।',
    options: [
      { key: 'a', text: '5.6%' },
      { key: 'b', text: '4.7%' },
      { key: 'c', text: '6%' },
      { key: 'd', text: '5%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'a',
    explanation: '1 खिलौने का CP = 375 / 12 = ₹31.25\n1 खिलौने का SP = ₹33\nलाभ = 33 - 31.25 = ₹1.75\nलाभ% = (1.75 / 31.25) × 100% = 5.6%'
  },
  {
    id: 'pl_47',
    originalNumber: 47,
    topic: 'profit_loss',
    topicNameHindi: 'लाभ और हानि (Profit & Loss)',
    exam: 'Bihar STET Mathematics Exam',
    questionText: 'सुमेर ने ₹800 प्रति कुर्सी के मूल्य पर 6 कुर्सियाँ और ₹1,200 में एक मेज खरीदा। उसने सभी कुर्सियों और मेज को ₹7,200 में बेच दिया। उसके लाभ का प्रतिशत कितना है?',
    options: [
      { key: 'a', text: '25%' },
      { key: 'b', text: '22%' },
      { key: 'c', text: '16.6%' },
      { key: 'd', text: '20%' },
      { key: 'e', text: 'अनुत्तरित (कोई उत्तर नहीं देना है)' }
    ],
    correctOption: 'd',
    explanation: 'कुर्सियों का CP = 800 × 6 = ₹4800\nमेज का CP = ₹1200\nकुल CP = 4800 + 1200 = ₹6000\nकुल SP = ₹7200\nलाभ = 7200 - 6000 = ₹1200\nलाभ% = (1200 / 6000) × 100% = 20%'
  }
];
