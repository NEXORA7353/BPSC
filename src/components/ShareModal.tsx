import { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, ExternalLink, QrCode } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTitle?: string;
}

export function ShareModal({ isOpen, onClose, testTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  // Real shared production URL
  const productionShareUrl = 'https://bpsc-chi.vercel.app/';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : productionShareUrl;
  // If in localhost/dev, prioritize the permanent preview URL so shared users can actually open it!
  const shareUrl = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')
    ? productionShareUrl
    : currentUrl;

  const shareText = testTitle
    ? `BPSC TRE 4.0 गणित मॉक टेस्ट: "${testTitle}" - Solve 150+ Previous Year Questions (STET & TRE) with authentic CBT interface and Hindi solutions! Check out:`
    : `BPSC TRE 4.0 गणित परीक्षा पोर्टल - Solve 150+ Previous Year Questions (STET & TRE) with authentic CBT interface, Hindi solutions, and Question Bank! Check out:`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        window.prompt('Copy this portal link to share:', shareUrl);
      });
    } else {
      window.prompt('Copy this portal link to share:', shareUrl);
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(waUrl, '_blank');
  };

  const handleTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank');
  };

  // QR Code URL using free reliable QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Share Test Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share with students, friends & study groups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Link Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Direct Public Share URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden select-all"
              />
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white transition-all shadow-xs shrink-0 ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Link copied to clipboard! Paste it in WhatsApp, Telegram or any browser.
              </p>
            )}
          </div>

          {/* Quick Share Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Instant Social Share
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={handleTelegram}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Share on Telegram</span>
              </button>
            </div>
          </div>

          {/* Mobile QR Code Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Scan to Open on Mobile Phone
                </span>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showQR ? 'Hide QR' : 'Show QR Code'}
              </button>
            </div>

            {showQR && (
              <div className="mt-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for BPSC TRE 4.0 Mock Portal"
                  className="w-40 h-40 rounded-lg shadow-xs"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Scan with your mobile camera or Google Lens to start practicing immediately
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Works seamlessly on Chrome, Safari, Android & iOS</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
