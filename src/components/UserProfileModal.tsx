import React, { useState } from 'react';
import { X, User, Copy, Check, RefreshCw, ShieldCheck, Sparkles, Smartphone, Laptop } from 'lucide-react';
import { getUserProfile, saveUserProfile, getUserSyncId, setUserSyncId } from '../utils/userProfile';
import { syncFromFirestore } from '../services/firebaseSyncService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (name: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState(() => getUserProfile());
  const [syncIdInput, setSyncIdInput] = useState(() => getUserSyncId());
  const [displayNameInput, setDisplayNameInput] = useState(() => profile.displayName);
  const [isCopied, setIsCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySyncId = async () => {
    try {
      await navigator.clipboard.writeText(syncIdInput);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSave = () => {
    saveUserProfile({
      syncId: syncIdInput.trim(),
      displayName: displayNameInput.trim()
    });
    if (onProfileUpdated) {
      onProfileUpdated(displayNameInput.trim());
    }
    setSyncSuccessMsg('Profile & Universal Sync ID saved! (सिंक आईडी सुरक्षित)');
    setTimeout(() => setSyncSuccessMsg(null), 3000);
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      setUserSyncId(syncIdInput.trim());
      await syncFromFirestore();
      setSyncSuccessMsg('Cloud Sync Completed! सभी टेस्ट और परिणाम सिंक हो गए हैं।');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
        window.dispatchEvent(new CustomEvent('bpsc_history_updated'));
      }
    } catch (err: any) {
      setSyncSuccessMsg('Sync error: ' + (err?.message || 'Failed to sync'));
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Universal Candidate ID & Cloud Sync</h3>
              <p className="text-xs text-slate-400">सभी डिवाइस और वेबसाइट्स पर एक जैसा डेटा व रिजल्ट</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Explanation Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-amber-500/10 to-transparent border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Cross-Device & Multi-Website Sync Active</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            चाहे आप <strong>bpsc.dpdns.org</strong> खोलें या <strong>bpsc-chi.vercel.app</strong> या कोई अन्य मोबाइल/लैपटॉप — इस User ID की मदद से आपके सभी <strong>Mock Sets</strong> और <strong>Test Results</strong> एक समान रहेंगे।
          </p>
          <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Phone</span>
            <span className="flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-indigo-400" /> PC/Laptop</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Cloud Firestore</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Candidate Display Name (परीक्षार्थी नाम)
            </label>
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-hidden focus:border-amber-400 text-sm"
              placeholder="e.g. PrIyA PaTeL"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-300">
                Universal Sync ID (क्लाउड सिंक यूज़र आईडी)
              </label>
              <button
                type="button"
                onClick={handleCopySyncId}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>
            <input
              type="text"
              value={syncIdInput}
              onChange={(e) => setSyncIdInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-hidden focus:border-amber-400 text-sm"
              placeholder="e.g. BPSC-PRIYA-2026"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              दूसरे फोन या वेबसाइट पर इसी आईडी को डालकर <strong>Sync Now</strong> दबाएं।
            </p>
          </div>
        </div>

        {/* Success Message Banner */}
        {syncSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now (अभी क्लाउड सिंक करें)'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md shadow-amber-400/20"
          >
            Save ID (सुरक्षित करें)
          </button>
        </div>
      </div>
    </div>
  );
};
