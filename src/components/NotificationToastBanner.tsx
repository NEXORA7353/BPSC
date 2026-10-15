import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { PortalNotificationItem } from '../utils/mobileNotificationService';

interface NotificationToastBannerProps {
  onOpenTest?: (testId: string) => void;
  onOpenNotificationCenter?: () => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({
  onOpenTest,
  onOpenNotificationCenter
}) => {
  const [activeNotification, setActiveNotification] = useState<PortalNotificationItem | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<PortalNotificationItem>;
      if (customEvent.detail) {
        setActiveNotification(customEvent.detail);
        // Auto-dismiss after 8 seconds if not urgent
        if (customEvent.detail.severity !== 'urgent') {
          const timer = setTimeout(() => {
            setActiveNotification((current) => (current?.id === customEvent.detail.id ? null : current));
          }, 8000);
          return () => clearTimeout(timer);
        }
      }
    };

    window.addEventListener('bpsc_in_app_notification', handleNotification as EventListener);
    return () => {
      window.removeEventListener('bpsc_in_app_notification', handleNotification as EventListener);
    };
  }, []);

  if (!activeNotification) return null;

  const isUrgent = activeNotification.severity === 'urgent';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-in slide-in-from-top-4 duration-300">
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3.5 ${
          isUrgent
            ? 'bg-red-950/95 border-red-500/50 text-red-100 shadow-red-950/60'
            : 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-slate-950/60'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {isUrgent ? <ShieldAlert className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h5 className="font-black text-xs sm:text-sm tracking-tight truncate text-white">
              {activeNotification.title}
            </h5>
            <span className="text-[10px] text-slate-400 shrink-0">अभी-अभी</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {activeNotification.body}
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs">
            {activeNotification.url && (
              <a
                href={activeNotification.url}
                className="font-bold underline text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>👉 तुरंत देखें</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
            {onOpenNotificationCenter && (
              <button
                onClick={() => {
                  setActiveNotification(null);
                  onOpenNotificationCenter();
                }}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                🔔 सभी अलर्ट देखें
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setActiveNotification(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
