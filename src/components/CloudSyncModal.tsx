import { useState, useEffect } from 'react';
import {
  Cloud,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Database,
  LogIn,
  LogOut,
  X,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import {
  CloudSyncState,
  subscribeToSyncState,
  syncFromFirestore,
  seedAllQuestionsToCloud
} from '../services/firebaseSyncService';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged } from '../firebase';
import { User } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRefreshed?: () => void;
}

export function CloudSyncModal({ isOpen, onClose, onDataRefreshed }: CloudSyncModalProps) {
  const [syncState, setSyncState] = useState<CloudSyncState>({
    isConnected: true,
    isSyncing: false,
    lastSyncedAt: null,
    cloudQuestionCount: 0,
    cloudTestCount: 0,
    error: null
  });
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubSync = subscribeToSyncState(setSyncState);
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubSync();
      unsubAuth();
    };
  }, []);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    await syncFromFirestore();
    if (onDataRefreshed) onDataRefreshed();
  };

  const handleSeedCloudDatabase = async () => {
    setIsSeeding(true);
    setSeedSuccessMsg(null);
    setSeedError(null);
    try {
      const res = await seedAllQuestionsToCloud();
      setSeedSuccessMsg(`✅ क्लाउड में कुल ${res.count} प्रश्न और ${res.testsCount} टेस्ट सफलतापूर्वक सिंक हो गए हैं!`);
      if (onDataRefreshed) onDataRefreshed();
    } catch (err: any) {
      console.error(err);
      setSeedError(err?.message || 'क्लाउड डेटाबेस में सिंक करने में त्रुटि');
      setSeedSuccessMsg(null);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <span>Cloud Database (Auto-Sync)</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Always
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                बिना लॉगिन के सभी डिवाइसों में रियल-टाइम ऑटो-सिंक (No Sign-in Needed)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm">
          {/* Highlight Banner: No Sign In Required */}
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-black text-sm">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ऑटो-सिंक चालू है (कोई साइन-इन नहीं चाहिए)</span>
            </div>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed font-medium">
              आप किसी भी मोबाइल, लैपटॉप या नए ब्राउज़र से प्रश्न जोड़ेंगे, टेस्ट बनाएंगे या हटाएंगे — वह <strong>तुरंत ऑटोमैटिक क्लाउड डेटाबेस (Firestore) में सेव हो जाएगा</strong> और सभी छात्रों को लाइव दिखेगा।
            </p>
            {syncState.lastSyncedAt && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>अंतिम सिंक समय (Last Synced): {syncState.lastSyncedAt.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              डेटाबेस नियंत्रण (Database Controls)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleManualSync}
                disabled={syncState.isSyncing}
                className="flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-500 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                <span>{syncState.isSyncing ? 'सिंक हो रहा है...' : 'अभी क्लाउड से सिंक करें'}</span>
              </button>

              <button
                onClick={handleSeedCloudDatabase}
                disabled={isSeeding}
                className="flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 transition-all shadow-xs disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isSeeding ? 'animate-bounce' : ''}`} />
                <span>{isSeeding ? 'क्लाउड में सिंक हो रहा है...' : 'सभी प्रश्न क्लाउड में सिंक करें'}</span>
              </button>
            </div>

            {seedSuccessMsg && (
              <div className="p-3 text-xs rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{seedSuccessMsg}</span>
              </div>
            )}

            {seedError && (
              <div className="p-3 text-xs rounded-xl bg-red-100/70 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{seedError}</span>
              </div>
            )}
          </div>

          {/* Multi-Device Guarantee Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>पब्लिश / डिप्लॉय गारंटी (Publish Ready):</span>
            </div>
            <p className="leading-relaxed">
              Google Firestore डेटाबेस कनेक्टेड है। जब आप इस ऐप को पब्लिश या शेयर करेंगे, तो जो भी प्रश्न, कस्टम मॉक टेस्ट या बदलाव आप करेंगे, वह सभी यूज़र्स के डिवाइस पर ऑटोमैटिक रीयल-टाइम में अपडेट रहेगा।
            </p>
          </div>

          {/* Optional Google Sign-in Footer Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>लॉग्ड-इन: <strong>{currentUser.displayName || currentUser.email}</strong></span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 font-bold ml-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span>साइन-इन अनिवार्य नहीं है (गेस्ट मोड सक्रिय)</span>
                <button
                  onClick={handleLogin}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google से जुड़ें (वैकल्पिक)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-xs"
          >
            ठीक है (OK)
          </button>
        </div>
      </div>
    </div>
  );
}
