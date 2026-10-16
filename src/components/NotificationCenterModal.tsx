import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  AlertTriangle,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  Send,
  Trash2,
  Mail,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationHistory,
  clearNotificationHistory,
  markNotificationAsRead,
  requestMobileNotificationPermission,
  triggerHourlyMotivation,
  dispatchPortalNotification,
  triggerStrictDisciplineWakeupAlert,
  triggerHighScoreCelebrationAlert,
  PortalNotificationItem,
  NotificationSettings
} from '../utils/mobileNotificationService';
import { getUserProfile } from '../utils/userProfile';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTest?: (testId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenTest
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => getNotificationSettings());
  const [history, setHistory] = useState<PortalNotificationItem[]>(() => getNotificationHistory());
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [isSendingInactivity, setIsSendingInactivity] = useState(false);
  const [inactivityResultMsg, setInactivityResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const handleHistoryUpdate = () => {
      setHistory(getNotificationHistory());
    };
    const handleSettingsUpdate = () => {
      setSettings(getNotificationSettings());
    };
    window.addEventListener('bpsc_notification_history_updated', handleHistoryUpdate);
    window.addEventListener('bpsc_notification_settings_changed', handleSettingsUpdate);
    return () => {
      window.removeEventListener('bpsc_notification_history_updated', handleHistoryUpdate);
      window.removeEventListener('bpsc_notification_settings_changed', handleSettingsUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    if (permission !== 'granted') {
      const res = await requestMobileNotificationPermission();
      setPermission(res);
      if (res === 'granted') {
        saveNotificationSettings({ pushEnabled: true });
        setSettings(getNotificationSettings());
        await dispatchPortalNotification({
          title: '[अधिसूचना सक्रिय]: BPSC TRE 4.0 अलर्ट चालू हुए',
          body: 'बधाई! आपके मोबाइल व लैपटॉप पर नोटिफिकेशन सफलतापूर्वक चालू हो गए हैं।',
          category: 'system',
          severity: 'info',
          url: window.location.origin
        });
      }
    } else {
      const next = !settings.pushEnabled;
      saveNotificationSettings({ pushEnabled: next });
      setSettings(getNotificationSettings());
    }
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    saveNotificationSettings({ soundEnabled: next });
    setSettings(getNotificationSettings());
  };

  const handleToggleVibration = () => {
    const next = !settings.vibrationEnabled;
    saveNotificationSettings({ vibrationEnabled: next });
    setSettings(getNotificationSettings());
  };

  const handleToggleHourly = () => {
    const next = !settings.hourlyMotivationEnabled;
    saveNotificationSettings({ hourlyMotivationEnabled: next });
    setSettings(getNotificationSettings());
  };

  const handleIntervalChange = (intervalHours: number) => {
    saveNotificationSettings({ hourlyIntervalHours: intervalHours });
    setSettings(getNotificationSettings());
  };

  const handleToggleRealityCheck = () => {
    const next = !settings.strictRealityCheckEnabled;
    saveNotificationSettings({ strictRealityCheckEnabled: next });
    setSettings(getNotificationSettings());
  };

  const handleTestNotification = async () => {
    setIsTestingAlert(true);
    try {
      await dispatchPortalNotification({
        title: '🔔 [परीक्षण अलर्ट]: मोबाइल नोटिफिकेशन सिस्टम सक्रिय है!',
        body: 'BPSC TRE 4.0 मोबाइल नोटिफिकेशन इंजन ऑडियो टोन और कंपन के साथ पूरी तरह कार्य कर रहा है। 🎯',
        category: 'system',
        severity: 'info',
        url: window.location.origin
      });
    } finally {
      setTimeout(() => setIsTestingAlert(false), 600);
    }
  };

  const handleTriggerHourlyNow = async () => {
    setIsTestingAlert(true);
    try {
      await triggerHourlyMotivation(true);
    } finally {
      setTimeout(() => setIsTestingAlert(false), 600);
    }
  };

  const handleTriggerStrictRealityCheckNow = async () => {
    setIsTestingAlert(true);
    try {
      const profile = getUserProfile();
      await triggerStrictDisciplineWakeupAlert(profile.displayName || 'प्रिया पटेल');
    } finally {
      setTimeout(() => setIsTestingAlert(false), 600);
    }
  };

  const handleTriggerCelebrationNow = async () => {
    setIsTestingAlert(true);
    try {
      await triggerHighScoreCelebrationAlert({
        testTitle: 'BPSC TRE 4.0: Mathematics Mock Test',
        score: 28.5,
        totalMarks: 30,
        accuracy: 95
      });
    } finally {
      setTimeout(() => setIsTestingAlert(false), 600);
    }
  };

  const handleTriggerInactivityEmailNow = async () => {
    setIsSendingInactivity(true);
    setInactivityResultMsg(null);
    try {
      const profile = getUserProfile();
      const payload = {
        studentEmail: profile.email || 'patel000priya000@gmail.com',
        parentEmail: profile.parentEmail || 'arjittreadingcompany@gmail.com',
        studentName: profile.displayName || 'प्रिया पटेल',
        forceSend: true,
        appBaseUrl: window.location.origin
      };

      let res: Response | null = null;
      let data: any = null;

      try {
        res = await fetch('/api/cron/daily-inactivity?manual=true&force=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-manual-trigger': 'true'
          },
          body: JSON.stringify(payload)
        });
        data = await res.json().catch(() => null);
      } catch (e) {
        console.warn('Local endpoint failed, attempting production URL:', e);
      }

      if (!res || !res.ok || !data) {
        res = await fetch('https://bpsc.dpdns.org/api/cron/daily-inactivity?manual=true&force=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-manual-trigger': 'true'
          },
          body: JSON.stringify(payload)
        });
        data = await res.json().catch(() => ({}));
      }

      if (res && res.ok && data?.success) {
        setInactivityResultMsg({
          type: 'success',
          text: '🚀 दैनिक इनएक्टिविटी अलर्ट ई-मेल छात्र व अभिभावक दोनों को सफलतापूर्वक भेजा गया!'
        });
      } else {
        setInactivityResultMsg({
          type: 'error',
          text: data?.message || data?.error || 'ईमेल भेजने में सर्वर त्रुटि हुई।'
        });
      }
    } catch (err: any) {
      setInactivityResultMsg({
        type: 'error',
        text: `त्रुटि: ${err?.message || err}`
      });
    } finally {
      setIsSendingInactivity(false);
      setTimeout(() => setInactivityResultMsg(null), 7000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>मोबाइल नोटिफिकेशन व अनुशासन केंद्र</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">हिंदी</span>
              </h3>
              <p className="text-xs text-slate-400">हर घंटे मोटिवेशन, रिजल्ट रियलिटी चेक व अभिभावक अलर्ट</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner */}
        {permission !== 'granted' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>मोबाइल व लैपटॉप नोटिफिकेशन बंद हैं</span>
              </div>
              <p className="text-slate-300">
                1-क्लिक में चालू करें ताकि फोन या लैपटॉप पर अभ्यास स्मरण व परीक्षा रिजल्ट अलर्ट तुरंत आएं।
              </p>
            </div>
            <button
              onClick={handleTogglePush}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shrink-0 hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 animate-pulse"
            >
              तुरंत चालू करें (1-Click Enable)
            </button>
          </div>
        )}

        {/* Feature Toggles Card */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>नोटिफिकेशन सेटिंग्स (Controls)</span>
          </h4>

          {/* Hourly Motivation */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>प्रति घंटा मोटिवेशन व अनुशासन अलर्ट</span>
              </div>
              <p className="text-xs text-slate-400">
                नियमित अंतराल पर अभ्यास स्मरण, फॉर्मूला रिविजन और स्पीड ड्रिल अलर्ट।
              </p>
            </div>
            <button
              onClick={handleToggleHourly}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.hourlyMotivationEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.hourlyMotivationEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Interval Selector */}
          {settings.hourlyMotivationEnabled && (
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-medium">अलर्ट आवृत्ति (Interval):</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((hrs) => (
                  <button
                    key={hrs}
                    onClick={() => handleIntervalChange(hrs)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      settings.hourlyIntervalHours === hrs
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    हर {hrs} घंटे
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reality Check Alarm */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>सख्त रिजल्ट चेतावनी (Reality Check Alert)</span>
              </div>
              <p className="text-xs text-slate-400">
                यदि स्कोर या एक्यूरेसी 50% से कम हो तो तुरंत सख्त चेतावनी: "इस तरह BPSC qualify नहीं होगा!"
              </p>
            </div>
            <button
              onClick={handleToggleRealityCheck}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.strictRealityCheckEnabled ? 'bg-red-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.strictRealityCheckEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Sound & Vibration Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleToggleSound}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{settings.soundEnabled ? 'ध्वनि: चालू (ON)' : 'ध्वनि: बंद (OFF)'}</span>
            </button>

            <button
              onClick={handleToggleVibration}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                settings.vibrationEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{settings.vibrationEnabled ? 'कंपन: चालू (ON)' : 'कंपन: बंद (OFF)'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Actions */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>लाइव टेस्ट व सत्यापन (Test Triggers)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleTestNotification}
              disabled={isTestingAlert}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>मोबाइल ऑडियो/पुश टेस्ट</span>
            </button>

            <button
              onClick={handleTriggerHourlyNow}
              disabled={isTestingAlert}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>मोटिवेशनल अलर्ट भेजें</span>
            </button>

            <button
              onClick={handleTriggerStrictRealityCheckNow}
              disabled={isTestingAlert}
              className="py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>कड़क डांट (Reality Check)</span>
            </button>

            <button
              onClick={handleTriggerCelebrationNow}
              disabled={isTestingAlert}
              className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>हाई स्कोर (शाबाशी) अलर्ट</span>
            </button>
          </div>

          {/* Trigger Daily Inactivity Mail to Student & Parent */}
          <button
            onClick={handleTriggerInactivityEmailNow}
            disabled={isSendingInactivity}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isSendingInactivity
                ? 'ईमेल भेजा जा रहा है...'
                : 'छात्र व अभिभावक को इनएक्टिविटी अलर्ट ईमेल भेजें'}
            </span>
          </button>

          {inactivityResultMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold text-center animate-in fade-in ${
                inactivityResultMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}
            >
              {inactivityResultMsg.text}
            </div>
          )}
        </div>

        {/* Notification History Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>हालिया अलर्ट इतिहास ({history.length})</span>
            </h4>
            {history.length > 0 && (
              <button
                onClick={clearNotificationHistory}
                className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>इतिहास हटाएं (Clear)</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-500">
              कोई हालिया नोटिफिकेशन नहीं है। ऊपर दिए गए बटन से परीक्षण नोटिफिकेशन भेजें।
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                    item.severity === 'urgent'
                      ? 'bg-red-500/10 border-red-500/30 text-red-200'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-100">{item.title}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
