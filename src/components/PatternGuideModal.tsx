import { X, CheckCircle, AlertTriangle, Clock, HelpCircle, ShieldAlert } from 'lucide-react';

interface PatternGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatternGuideModal({ isOpen, onClose }: PatternGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg font-bold text-slate-900">
              BPSC TRE 4.0 Mathematics Exam Pattern & Guidelines
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-950 text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700" />
              Examination Structure (TRE 4.0)
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-900 text-xs sm:text-sm">
              <li><strong>लक्ष्य:</strong> गणित (Mathematics), वर्ग 6–8 एवं 9–10 शिक्षक भर्ती।</li>
              <li><strong>प्रश्नों का प्रकार:</strong> बहुविकल्पीय वस्तुनिष्ठ (MCQ), 5 विकल्प (A, B, C, D, E)।</li>
              <li><strong>अंक योजना:</strong> प्रत्येक सही उत्तर के लिए <strong>+1 अंक</strong>।</li>
              <li><strong>नकारात्मक अंकन:</strong> प्रत्येक गलत उत्तर के लिए <strong>-1/3 (-0.33) अंक</strong>।</li>
              <li><strong>समय प्रबंधन:</strong> वास्तविक परीक्षा में 1 मिनट प्रति प्रश्न की दर से समय दिया गया है।</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-bold text-amber-950 text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              विकल्प E एवं अनुत्तरित प्रश्नों का अति-महत्वपूर्ण नियम
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-amber-900">
              <p>
                <strong>1. सुरक्षित रूप से प्रश्न छोड़ना (विकल्प E):</strong> यदि आप किसी प्रश्न का उत्तर नहीं देना चाहते हैं, तो आपको अनिवार्य रूप से <strong>विकल्प (E)</strong> चुनना होगा। विकल्प E चुनने पर 0 अंक मिलेगा (कोई नेगेटिव मार्किंग नहीं होगी)।
              </p>
              <p>
                <strong>2. कोई विकल्प न चुनने पर दंड:</strong> यदि आप A, B, C, D, E में से कोई भी विकल्प नहीं चुनते हैं और प्रश्न को पूर्णतः रिक्त छोड़ते हैं, तब भी <strong>-1/3 (-0.33) अंक</strong> का दंड काटा जाएगा!
              </p>
              <p>
                <strong>3. गलत उत्तर पर दंड:</strong> A, B, C, D में से गलत विकल्प चुनने पर <strong>-1/3 अंक</strong> काटा जाएगा।
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              प्रति प्रश्न समय विश्लेषण (Advance Time Analysis)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              यह टेस्ट पोर्टल प्रत्येक प्रश्न पर आपके द्वारा व्यतीत किए गए समय (सेकंड में) का सटीक रिकॉर्ड रखता है। परीक्षा समाप्ति के पश्चात आप विस्तृत टाइम मैट्रिक्स, औसत गति (तेज़, मध्यम, धीमा), एवं प्रत्येक प्रश्न की चरणबद्ध हिन्दी व्याख्या देख सकते हैं।
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              प्रश्नों का स्रोत एवं मिश्रण
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              सभी प्रश्न <strong>Bihar STET (2020, 2023, 2024)</strong> तथा <strong>BPSC TRE 1.0, 2.0, 3.0</strong> की पूर्व परीक्षाओं से संकलित हैं। वास्तविक परीक्षा अनुभव के लिए लघुत्तम-महत्तम (LCM & HCF) तथा प्रतिशत (Percentage) के प्रश्नों को एक-के-बाद-एक मिश्रित (Interleaved) किया गया है।
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors"
          >
            Understood, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
