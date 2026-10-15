import React, { useState } from 'react';
import { Mail, Check, Copy, X, Send, User, Users, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { MockTestSet } from '../types';
import { getUserProfile } from '../utils/userProfile';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  testSet: MockTestSet;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  testSet
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingLiveTest, setIsSendingLiveTest] = useState(false);
  const [sendResultMsg, setSendResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const profile = getUserProfile();
  const candidateName = profile.displayName || 'प्रिया पटेल';
  const studentEmail = profile.email || 'patel000priya000@gmail.com';
  const parentEmail = profile.parentEmail || 'arjittreadingcompany@gmail.com';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bpsc.dpdns.org';
  const directTestUrl = `${baseUrl}/?testId=${encodeURIComponent(testSet.id)}`;

  const studentSubject = `[BPSC TRE 4.0] New Mock Test Available: ${testSet.title}`;
  const parentSubject = `[BPSC TRE 4.0] New Mathematics Practice Test for ${candidateName}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directTestUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      window.prompt('सीधा टेस्ट लिंक कॉपी करें:', directTestUrl);
    }
  };

  const handleSendLiveTestEmail = async (forceResend = false) => {
    setIsSendingLiveTest(true);
    setSendResultMsg(null);

    const payload = {
      testId: testSet.id,
      testData: {
        ...testSet,
        studentEmail,
        parentEmail,
        studentName: candidateName,
        isPublished: true
      },
      appBaseUrl: baseUrl,
      sendToParent: true,
      force: forceResend
    };

    try {
      // 1. Try local or proxied endpoint first
      let res: Response | null = null;
      let data: any = null;

      try {
        res = await fetch('/api/email/notify-new-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        data = await res.json().catch(() => null);
      } catch (localErr) {
        console.warn('Local endpoint fetch error, attempting production fallback:', localErr);
      }

      // 2. If local failed or didn't return JSON/success, fallback to production backend
      if (!res || !res.ok || !data) {
        res = await fetch('https://bpsc.dpdns.org/api/email/notify-new-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        data = await res.json().catch(() => ({}));
      }

      if (res && res.ok && data?.success) {
        if (data.alreadySent && !forceResend) {
          setSendResultMsg({
            type: 'error',
            text: `⚠️ इस टेस्ट का ईमेल पहले ही भेजा जा चुका है! दोबारा भेजने के लिए नीचे "पुनः भेजें (Force Resend)" बटन दबाएं।`
          });
        } else {
          setSendResultMsg({
            type: 'success',
            text: `🚀 लाइव ईमेल सफलतापूर्वक भेजा गया (${data.provider || 'Brevo'})! छात्र (${studentEmail}) और अभिभावक (${parentEmail}) दोनों को डिलीवर हो गया।`
          });
        }
      } else {
        setSendResultMsg({
          type: 'error',
          text: data?.message || data?.error || 'ईमेल भेजने में सर्वर त्रुटि हुई।'
        });
      }
    } catch (err: any) {
      setSendResultMsg({
        type: 'error',
        text: `नेटवर्क कनेक्शन विफलता: ${err?.message || err}`
      });
    } finally {
      setIsSendingLiveTest(false);
      setTimeout(() => setSendResultMsg(null), 8000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>ई-मेल व सीधा टेस्ट लिंक प्रिव्यू</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">हिंदी</span>
              </h3>
              <p className="text-xs text-slate-400">परीक्षार्थी व अभिभावक को भेजे जाने वाले आधिकारिक ई-मेल का लाइव प्रिव्यू</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Link Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>सीधा परीक्षा प्रवेश लिंक (Direct Test Link)</span>
            </span>
            <button
              onClick={handleCopyLink}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 transition-all hover:scale-105"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'लिंक कॉपी हो गया!' : 'लिंक कॉपी करें'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 break-all select-all">
            {directTestUrl}
          </div>
          <p className="text-[11px] text-slate-400">
            ई-मेल में यह सीधा लिंक शामिल रहता है। छात्र इस पर क्लिक करते ही बिना किसी रीडायरेक्ट के सीधे इसी टेस्ट में पहुंच जाएंगे।
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>छात्र ई-मेल प्रिव्यू (Student Email)</span>
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'parent'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>अभिभावक ई-मेल प्रिव्यू (Parent Email)</span>
          </button>
        </div>

        {/* Rendered Email Preview Box */}
        <div className="rounded-2xl border border-slate-700 bg-white text-slate-900 overflow-hidden shadow-xl text-xs">
          {/* Email Subject Line Header */}
          <div className="bg-slate-100 p-3.5 border-b border-slate-300 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 text-[11px]">विषय (Subject):</span>
              <span className="font-bold text-slate-900">
                {activeTab === 'student' ? studentSubject : parentSubject}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>प्राप्तकर्ता (To):</span>
              <span className="font-medium text-slate-700">
                {activeTab === 'student' ? `${candidateName} <${studentEmail}>` : `अभिभावक <${parentEmail}>`}
              </span>
            </div>
          </div>

          {/* Email Body Preview */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl text-center border-b-2 border-amber-500">
              <h4 className="font-black text-sm tracking-wide">🎯 BPSC TRE 4.0 गणित मॉक टेस्ट पोर्टल</h4>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                ⚡ बिहार शिक्षक भर्ती परीक्षा 4.0 - रियल परीक्षा सिमुलेटर
              </p>
            </div>

            {activeTab === 'student' ? (
              <div className="space-y-3.5 text-slate-800">
                <h3 className="font-black text-base text-slate-900">📢 नया मॉक टेस्ट प्रकाशित हुआ है!</h3>
                <p className="text-xs text-slate-600">
                  👤 अभ्यर्थी: <strong>{candidateName}</strong> &nbsp;|&nbsp; 🎯 लक्ष्य: BPSC TRE 4.0 शिक्षक चयन
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-l-4 border-l-amber-500 space-y-2">
                  <h4 className="font-black text-sm text-slate-900">📝 {testSet.title}</h4>
                  <p className="text-xs text-slate-500">{testSet.subtitle || 'BPSC TRE 4.0 गणित उच्च-स्तरीय अभ्यास प्रश्न पत्र'}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                      📚 {testSet.totalQuestions} प्रश्न
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                      ⏱️ {testSet.totalTimeMinutes} मिनट
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px]">
                      ⚠️ -0.33 नेगेटिव मार्किंग
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      🛡️ Option (E) सेफ स्किप
                    </span>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-600 space-y-1 border-t border-slate-200">
                    <div>• ❌ <strong>नेगेटिव मार्किंग:</strong> प्रत्येक गलत उत्तर पर 0.33 अंक काट लिए जाएंगे।</div>
                    <div>• 🛡️ <strong>Option (E) का उपयोग:</strong> जिस प्रश्न का उत्तर ज्ञात न हो, उसमें Option (E) भरकर ब्लैंक पेनाल्टी से बचें।</div>
                    <div>• 📊 <strong>रियल टाइम मूल्यांकन:</strong> टेस्ट पूरा होते ही तुरंत विस्तृत स्कोरकार्ड प्राप्त होगा।</div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="inline-block px-6 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-md">
                    🚀 अभी CBT मॉक टेस्ट शुरू करें
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-[11px] text-slate-600 break-all">
                  <strong>सीधा टेस्ट लिंक:</strong><br />
                  <span className="text-blue-600 underline font-semibold">{directTestUrl}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-slate-800">
                <h3 className="font-black text-base text-slate-900">👨‍👩‍👧 अभिभावक अध्ययन अपडेट: नया टेस्ट जारी</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  आदरणीय अभिभावक, <strong>{candidateName}</strong> के लिए BPSC TRE 4.0 गणित का एक नया अभ्यास प्रश्न पत्र पोर्टल पर प्रकाशित कर दिया गया है।
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-l-4 border-l-blue-600 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-900">📋 {testSet.title}</h4>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>• 📚 कुल प्रश्न: <strong>{testSet.totalQuestions} प्रश्न</strong></div>
                    <div>• ⏱️ आवंटित समय: <strong>{testSet.totalTimeMinutes} मिनट</strong></div>
                    <div>• ⚡ स्थिति: आज अभ्यास के लिए लाइव उपलब्ध</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  💡 <strong>सुझाव:</strong> कृपया सुनिश्चित करें कि {candidateName} इस मॉक टेस्ट को बिना किसी रुकावट के शांत वातावरण में पेन-पेपर के साथ हल करें। टेस्ट सबमिट होते ही उनका विस्तृत परिणाम आपको ईमेल द्वारा भेज दिया जाएगा।
                </p>

                <div className="text-center pt-2">
                  <span className="inline-block px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-md">
                    📊 पोर्टल पर टेस्ट विवरण देखें
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Test Dispatch Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSendLiveTestEmail(false)}
              disabled={isSendingLiveTest}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingLiveTest ? 'ईमेल भेजा जा रहा है...' : '🚀 दोनों को लाइव ईमेल भेजें (Send Live Mail)'}</span>
            </button>

            <button
              onClick={() => handleSendLiveTestEmail(true)}
              disabled={isSendingLiveTest}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="पहले से भेजे गए टेस्ट को दोबारा भेजें"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>पुनः भेजें (Force Resend)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>

        {sendResultMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              sendResultMsg.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}
          >
            {sendResultMsg.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{sendResultMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
