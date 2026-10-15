import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Volume2
} from 'lucide-react';
import {
  requestMobileNotificationPermission,
  dispatchPortalNotification,
  getNotificationSettings,
  saveNotificationSettings
} from '../utils/mobileNotificationService';

const SNOOZE_STORAGE_KEY = 'bpsc_notif_prompt_snoozed_until';

interface NotificationPermissionPromptProps {
  onOpenNotificationCenter?: () => void;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  onOpenNotificationCenter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'mobile' | 'laptop'>('mobile');
  const [successToast, setSuccessToast] = useState(false);

  // Check notification status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStatus = () => {
      if (!('Notification' in window)) {
        return;
      }

      const currentPerm = Notification.permission;
      setPermissionState(currentPerm);

      // If already granted, no need to prompt
      if (currentPerm === 'granted') {
        return;
      }

      // Check snooze timestamp
      const snoozedUntilStr = localStorage.getItem(SNOOZE_STORAGE_KEY);
      if (snoozedUntilStr) {
        const snoozedUntil = parseInt(snoozedUntilStr, 10);
        if (!isNaN(snoozedUntil) && Date.now() < snoozedUntil) {
          return;
        }
      }

      // Open prompt after 1.5s delay so page initial layout renders smoothly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    };

    checkStatus();

    // Listen to permission changes if user changes them elsewhere
    const handlePermChange = () => {
      if ('Notification' in window) {
        setPermissionState(Notification.permission);
        if (Notification.permission === 'granted') {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('bpsc_notification_settings_changed', handlePermChange);
    return () => {
      window.removeEventListener('bpsc_notification_settings_changed', handlePermChange);
    };
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestMobileNotificationPermission();
      setPermissionState(result);

      if (result === 'granted') {
        saveNotificationSettings({ pushEnabled: true });
        setSuccessToast(true);

        // Send instant welcome notification to confirm sound & push
        await dispatchPortalNotification({
          title: '[अधिसूचना सक्रिय]: BPSC TRE 4.0 अलर्ट चालू हुए',
          body: 'बधाई! आपके मोबाइल व लैपटॉप पर दैनिक अभ्यास अलर्ट व हर घंटे का मोटिवेशन सक्रिय हो गया है।',
          category: 'system',
          severity: 'info'
        });

        setTimeout(() => {
          setSuccessToast(false);
          setIsOpen(false);
        }, 1800);
      } else if (result === 'denied') {
        setShowGuide(true);
      }
    } catch {
      setShowGuide(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSnooze = () => {
    // Snooze for 6 hours
    const snoozeUntil = Date.now() + 6 * 60 * 60 * 1000;
    try {
      localStorage.setItem(SNOOZE_STORAGE_KEY, snoozeUntil.toString());
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen && !successToast) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Glow ambient highlight */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-white/10 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>मोबाइल व लैपटॉप नोटिफिकेशन चालू करें</span>
                </h3>
                <p className="text-xs text-amber-300 font-medium mt-0.5">
                  BPSC TRE 4.0 परीक्षा में चयन हेतु नियमित अलर्ट जरूरी हैं
                </p>
              </div>
            </div>

            <button
              onClick={handleSnooze}
              aria-label="Close"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {successToast ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-white">नोटिफिकेशन सक्रिय हो गए!</h4>
              <p className="text-xs text-slate-300 max-w-xs">
                आपको अब हर घंटे का मोटिवेशन, नए मॉक टेस्ट और परीक्षा परिणाम का रियलिटी चेक प्राप्त होगा।
              </p>
            </div>
          ) : showGuide || permissionState === 'denied' ? (
            /* Guide when notifications are blocked */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200 leading-relaxed">
                  <strong className="text-amber-300 font-bold block mb-0.5">नोटिफिकेशन ब्राउज़र में ब्लॉक हैं</strong>
                  कृपया ब्राउज़र सेटिंग्स में जाकर परमिशन को <span className="text-emerald-400 font-semibold underline">Allow</span> करें:
                </div>
              </div>

              {/* Mobile vs Laptop Guide Switch */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('mobile')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    activeGuideTab === 'mobile'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>मोबाइल (Android / Chrome)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('laptop')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    activeGuideTab === 'laptop'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>लैपटॉप / कंप्यूटर (Chrome / PC)</span>
                </button>
              </div>

              {/* Guide steps */}
              {activeGuideTab === 'mobile' ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
                    <span>ब्राउज़र के ऊपर एड्रेस बार में बाईं ओर स्थित <strong>ताला (Lock 🔒)</strong> या <strong>सेटिंग (Tune ⚙️)</strong> आइकन पर टैप करें।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                    <span><strong>Permissions</strong> या <strong>Site Settings</strong> विकल्प पर जाएं।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                    <span><strong>Notifications</strong> को चुनकर <strong>Allow</strong> पर सेट करें।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">4</span>
                    <span>पेज को रीफ्रेश (Reload) करें।</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
                    <span>ब्राउज़र के URL बार में बाईं तरफ <strong>🔒 (View site information)</strong> पर क्लिक करें।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                    <span><strong>Notifications</strong> के सामने वाले स्विच को चालू करें या ड्रॉपडाउन से <strong>Allow</strong> चुनें।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                    <span>कीबोर्ड पर <strong>F5</strong> दबाकर पेज को रीलोड करें।</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>पेज रीफ्रेश करें (Refresh Page)</span>
              </button>
            </div>
          ) : (
            /* Main Features list */
            <div className="space-y-3.5">
              <p className="text-xs text-slate-300 leading-relaxed">
                यह पोर्टल आपको निरंतर अध्ययन में बनाए रखने और समय की बर्बादी रोकने के लिए विशेष अलर्ट्स भेजता है:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <strong className="text-slate-100 font-bold block">हर घंटे का मोटिवेशन व समय अलर्ट</strong>
                    <span className="text-slate-400 leading-tight block">
                      प्रत्येक घंटे पढ़ाई की गति और -0.33 नेगेटिव मार्किंग से बचाव की याद दिलाता है।
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <strong className="text-slate-100 font-bold block">नया टेस्ट व चैप्टर पब्लिश अलर्ट</strong>
                    <span className="text-slate-400 leading-tight block">
                      नया गणित मॉक टेस्ट या स्पीड ड्रिल उपलब्ध होते ही तुरंत सूचना मिलती है।
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <strong className="text-slate-100 font-bold block">कम स्कोर पर रियलिटी चेक अलार्म</strong>
                    <span className="text-slate-400 leading-tight block">
                      यदि टेस्ट में स्कोर 50% से कम हो तो तुरंत सतर्कता अलार्म व री-अटेम्प्ट संदेश मिलता है।
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <strong className="text-slate-100 font-bold block">मोबाइल लॉकस्क्रीन व बैकग्राउंड सपोर्ट</strong>
                    <span className="text-slate-400 leading-tight block">
                      ऐप बंद होने पर भी डिवाइस पर वाइब्रेशन व ऑडियो अलर्ट्स प्राप्त होते हैं।
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!successToast && !showGuide && permissionState !== 'denied' && (
          <div className="p-5 sm:p-6 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              <span>{isRequesting ? 'परमिशन मांगी जा रही है...' : 'अभी नोटिफिकेशन चालू करें'}</span>
            </button>

            <button
              type="button"
              onClick={handleSnooze}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
            >
              बाद में याद दिलाएं
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
