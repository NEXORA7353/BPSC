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
  ExternalLink
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
  const [inactivityResultMsg, setInactivityResultMsg] = useState<string | null>(null);

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
        title: '[TEST NOTIFICATION]: Mobile Alert System Active',
        body: 'BPSC TRE 4.0 Mobile Notification Engine is fully functional with sound and vibration feedback.',
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

  const handleTriggerInactivityEmailNow = async () => {
    setIsSendingInactivity(true);
    setInactivityResultMsg(null);
    try {
      const profile = getUserProfile();
      const res = await fetch('/api/cron/daily-inactivity?manual=true&force=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-manual-trigger': 'true'
        },
        body: JSON.stringify({
          studentEmail: profile.email || 'patel000priya000@gmail.com',
          parentEmail: profile.parentEmail || 'arjittreadingcompany@gmail.com',
          studentName: profile.displayName || 'PrIyA PaTeL',
          forceSend: true,
          appBaseUrl: window.location.origin
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setInactivityResultMsg('Inactivity alert email dispatched to Student and Parent successfully!');
      } else {
        setInactivityResultMsg(`Email notice: ${data.message || data.error || 'Server processed request'}`);
      }
    } catch (err: any) {
      setInactivityResultMsg(`Trigger error: ${err?.message || err}`);
    } finally {
      setIsSendingInactivity(false);
      setTimeout(() => setInactivityResultMsg(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Mobile Notification & Discipline Engine</h3>
              <p className="text-xs text-slate-400">हर घंटे मोटिवेशन, रिजल्ट रियलिटी चेक व इनएक्टिविटी अलर्ट</p>
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
                <span>Mobile Lockscreen Notifications Inactive</span>
              </div>
              <p className="text-slate-300">
                ब्राउज़र नोटिफिकेशन अनुमति चालू करें ताकि फोन की स्क्रीन लॉक होने पर भी हर घंटे अलर्ट मिले।
              </p>
            </div>
            <button
              onClick={handleTogglePush}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black shrink-0 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              अनुमति दें (Enable)
            </button>
          </div>
        )}

        {/* Feature Toggles Card */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notification Settings</h4>

          {/* Hourly Motivation */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Hourly Motivation & Discipline Alerts</span>
              </div>
              <p className="text-xs text-slate-400">
                नियमित अंतराल पर अभ्यास स्मरण व गणित फॉर्मूला रिवीजन अलर्ट।
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
              <span className="text-slate-300 font-medium">Alert Frequency (अलर्ट अंतराल):</span>
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
                    {hrs} Hr
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
                <span>Strict Reality Check (खराब परिणाम पर चेतावनी)</span>
              </div>
              <p className="text-xs text-slate-400">
                यदि एक्यूरेसी 50% से कम हो तो तुरंत सख्त अलर्ट: "इस तरह BPSC qualify नहीं होगा"।
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
              <span>{settings.soundEnabled ? 'Alert Tone: ON' : 'Alert Tone: OFF'}</span>
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
              <span>{settings.vibrationEnabled ? 'Vibration: ON' : 'Vibration: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Test Actions */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Live Test Actions (सिस्टम सत्यापन)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleTestNotification}
              disabled={isTestingAlert}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Mobile Audio/Push</span>
            </button>

            <button
              onClick={handleTriggerHourlyNow}
              disabled={isTestingAlert}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dispatch Hourly Motivation</span>
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
                ? 'Sending Inactivity Alert...'
                : 'Send Daily Inactivity Alert Email to Student & Parent Now'}
            </span>
          </button>

          {inactivityResultMsg && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-400/30 text-[11px] font-bold text-amber-300 text-center animate-in fade-in">
              {inactivityResultMsg}
            </div>
          )}
        </div>

        {/* Notification History Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Alerts Log ({history.length})
            </h4>
            {history.length > 0 && (
              <button
                onClick={clearNotificationHistory}
                className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-500">
              No recent notifications logged yet. Trigger a test notification above.
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
