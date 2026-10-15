import React, { useState } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  Eye,
  ExternalLink,
  ShieldCheck,
  User,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
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
  const candidateName = profile.displayName || 'PrIyA PaTeL';
  const studentEmail = profile.email || 'patel000priya000@gmail.com';
  const parentEmail = profile.parentEmail || 'arjittreadingcompany@gmail.com';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bpsc.dpdns.org';
  const directTestUrl = `${baseUrl}/?testId=${encodeURIComponent(testSet.id)}`;

  const studentSubject = `[BPSC TRE 4.0] New Mock Test Available: ${testSet.title}`;
  const parentSubject = `[BPSC Study Update] New Mathematics Mock Test Published for ${candidateName}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directTestUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      window.prompt('Copy direct test link:', directTestUrl);
    }
  };

  const handleSendLiveTestEmail = async () => {
    setIsSendingLiveTest(true);
    setSendResultMsg(null);
    try {
      const res = await fetch('/api/email/notify-new-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: testSet.id,
          testData: {
            ...testSet,
            studentEmail,
            parentEmail,
            studentName: candidateName,
            isPublished: true
          },
          appBaseUrl: baseUrl,
          sendToParent: true
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSendResultMsg({
          type: 'success',
          text: `Live email dispatched via ${data.provider || 'email provider'}! Delivered to: ${studentEmail} and ${parentEmail}`
        });
      } else {
        setSendResultMsg({
          type: 'error',
          text: data.message || data.error || 'Server error processing test email'
        });
      }
    } catch (err: any) {
      setSendResultMsg({
        type: 'error',
        text: `Network failure: ${err?.message || err}`
      });
    } finally {
      setIsSendingLiveTest(false);
      setTimeout(() => setSendResultMsg(null), 6000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Email & Direct Link Preview</h3>
              <p className="text-xs text-slate-400">परीक्षार्थी व अभिभावक को भेजे जाने वाले ईमेल का लाइव प्रिव्यू</p>
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
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Direct Exam Access Link (सीधा टेस्ट लिंक)
            </span>
            <button
              onClick={handleCopyLink}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied Link!' : 'Copy Direct Link'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 break-all select-all">
            {directTestUrl}
          </div>
          <p className="text-[11px] text-slate-500">
            ईमेल में यह सीधा लिंक शामिल रहता है। छात्र इस लिंक पर क्लिक करते ही सीधे इसी टेस्ट में पहुंच जाएंगे।
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Email Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'parent'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Parent Email Preview</span>
          </button>
        </div>

        {/* Rendered Email Preview Box */}
        <div className="rounded-2xl border border-slate-700 bg-white text-slate-900 overflow-hidden shadow-lg text-xs">
          {/* Email Subject Line Header */}
          <div className="bg-slate-100 p-3.5 border-b border-slate-300 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 text-[11px]">Subject:</span>
              <span className="font-bold text-slate-900">
                {activeTab === 'student' ? studentSubject : parentSubject}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>To:</span>
              <span className="font-medium text-slate-700">
                {activeTab === 'student' ? `${candidateName} <${studentEmail}>` : `Parent <${parentEmail}>`}
              </span>
            </div>
          </div>

          {/* Email Body Preview */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl text-center border-b-2 border-amber-500">
              <h4 className="font-black text-sm tracking-wide">BPSC TRE 4.0 MATHEMATICS PORTAL</h4>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                Target: BPSC TRE 4.0 Teacher Examination
              </p>
            </div>

            {activeTab === 'student' ? (
              <div className="space-y-3.5 text-slate-800">
                <h3 className="font-black text-base text-slate-900">New Mock Test Published</h3>
                <p className="text-xs text-slate-600">Candidate: <strong>{candidateName}</strong></p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-l-4 border-l-amber-500 space-y-2">
                  <h4 className="font-black text-sm text-slate-900">{testSet.title}</h4>
                  <p className="text-xs text-slate-500">{testSet.subtitle || 'Targeted BPSC TRE 4.0 Mathematics Practice Set'}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                      [QUESTIONS]: {testSet.totalQuestions} Questions
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                      [DURATION]: {testSet.totalTimeMinutes} Minutes
                    </span>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-600 space-y-1 border-t border-slate-200">
                    <div>• <strong>Negative Marking:</strong> 0.33 marks penalty for wrong answers.</div>
                    <div>• <strong>Option (E) Safe Skip:</strong> Attempt (E) for unattempted questions to avoid penalties.</div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="inline-block px-6 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-xs">
                    START CBT MOCK TEST
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-[11px] text-slate-600 break-all">
                  <strong>Direct Access Link:</strong><br />
                  <span className="text-blue-600 underline">{directTestUrl}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-slate-800">
                <h3 className="font-black text-base text-slate-900">New Practice Test Alert for {candidateName}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A new full-length mathematics examination has been published on the portal for <strong>{candidateName}</strong>.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-l-4 border-l-blue-600 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-900">{testSet.title}</h4>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>• Total Questions: <strong>{testSet.totalQuestions} Questions</strong></div>
                    <div>• Allocated Time: <strong>{testSet.totalTimeMinutes} Minutes</strong></div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Kripya sunishchit karein ki {candidateName} is mock test ko shanti-purna vatavaran mein attempt karein aur time management ka dhyan rakhein. Test pura hote hi scorecard aapko dispatch ho jayega.
                </p>

                <div className="text-center pt-2">
                  <span className="inline-block px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-xs">
                    VIEW TEST DETAILS ON PORTAL
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Test Dispatch */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleSendLiveTestEmail}
            disabled={isSendingLiveTest}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingLiveTest ? 'Sending Test Mail...' : 'Send Live Test Email to Student & Parent'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>

        {sendResultMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              sendResultMsg.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{sendResultMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
