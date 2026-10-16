import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  requestMobileNotificationPermission,
  dispatchPortalNotification,
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
  const [isSuccess, setIsSuccess] = useState(false);

  // Check notification status and immediately request permission on website open
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndAutoRequest = async () => {
      if (!('Notification' in window)) {
        return;
      }

      const currentPerm = Notification.permission;
      setPermissionState(currentPerm);

      if (currentPerm === 'granted') {
        return;
      }

      // If default (not yet decided): immediately open prompt and attempt requestPermission
      if (currentPerm === 'default') {
        setIsOpen(true);
        try {
          const res = await requestMobileNotificationPermission();
          setPermissionState(res);
          if (res === 'granted') {
            saveNotificationSettings({ pushEnabled: true });
            setIsSuccess(true);
            await dispatchPortalNotification({
              title: '[अधिसूचना सक्रिय]: BPSC TRE 4.0 अलर्ट चालू हुए',
              body: 'बधाई! आपके मोबाइल व लैपटॉप पर दैनिक अभ्यास अलर्ट व हर घंटे का मोटिवेशन सक्रिय हो गया है।',
              category: 'system',
              severity: 'info',
              url: window.location.origin
            });
            setTimeout(() => {
              setIsSuccess(false);
              setIsOpen(false);
            }, 1500);
            return;
          }
        } catch {}
        return;
      }

      // If denied, check if forced open via URL parameter
      const params = new URLSearchParams(window.location.search);
      const forceOpen = params.get('enableNotif') === 'true' || params.get('notif') === 'open';
      if (forceOpen) {
        setIsOpen(true);
      }
    };

    checkAndAutoRequest();

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

  const handleDirectEnable = async () => {
    setIsRequesting(true);
    try {
      const result = await requestMobileNotificationPermission();
      setPermissionState(result);

      if (result === 'granted') {
        saveNotificationSettings({ pushEnabled: true });
        setIsSuccess(true);

        await dispatchPortalNotification({
          title: '[अधिसूचना सक्रिय]: BPSC TRE 4.0 अलर्ट चालू हुए',
          body: 'बधाई! आपके मोबाइल व लैपटॉप पर दैनिक अभ्यास अलर्ट व हर घंटे का मोटिवेशन सक्रिय हो गया है।',
          category: 'system',
          severity: 'info',
          url: window.location.origin
        });

        setTimeout(() => {
          setIsSuccess(false);
          setIsOpen(false);
        }, 1500);
      }
    } catch (e) {
      console.warn('Notification permission request error:', e);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen && !isSuccess) {
    return null;
  }

  return (
    <div
      id="direct-notification-prompt"
      className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-50 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="relative bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border-2 border-amber-500/60 rounded-2xl shadow-2xl shadow-black/80 p-4 sm:p-5 text-slate-100 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        {isSuccess ? (
          <div className="py-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-white">नोटिफिकेशन चालू हो गया!</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                अब आपको मोबाइल व लैपटॉप पर सीधे अभ्यास अलर्ट मिलेंगे।
              </p>
            </div>
          </div>
        ) : permissionState === 'denied' ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <h4 className="text-sm font-black text-amber-300">नोटिफिकेशन ब्राउज़र में ब्लॉक है</h4>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ब्राउज़र के ऊपर एड्रेस बार में <strong>ताला (🔒 Lock)</strong> या <strong>सेटिंग्स</strong> पर क्लिक करके Notifications को <strong>Allow</strong> करें।
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>पेज रीफ्रेश करें (Refresh)</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-3 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    <span>नोटिफिकेशन की अनुमति दें</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      LIVE
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-300 font-medium">
                    वेबसाइट पर सीधे अभ्यास अलर्ट और रिजल्ट पाएं
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick value proposition */}
            <p className="text-xs text-slate-300 leading-snug">
              BPSC TRE 4.0 परीक्षा अभ्यास, हर घंटे का मोटिवेशन और मॉक टेस्ट परिणाम का अलर्ट तुरंत पाने के लिए नीचे बटन पर क्लिक करके <strong>Allow</strong> करें।
            </p>

            {/* Direct 1-Click Action Button */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleDirectEnable}
                disabled={isRequesting}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>{isRequesting ? 'अनुमति जांची जा रही है...' : 'अनुमति दें (Allow Notification)'}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                बाद में
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
