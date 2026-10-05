import { useState, useEffect, useCallback } from 'react';
import { MockTestSet, TestResult, ThemeMode } from './types';
import { TopBar } from './components/TopBar';
import { TestIntroView } from './components/TestIntroView';
import { CBTTestView } from './components/CBTTestView';
import { ResultAnalytics } from './components/ResultAnalytics';
import { PatternGuideModal } from './components/PatternGuideModal';
import { ShareModal } from './components/ShareModal';
import { CustomTestModal } from './components/CustomTestModal';
import { BulkImportModal } from './components/BulkImportModal';
import { QuestionBankView } from './components/QuestionBankView';
import { ResultsHistoryView } from './components/ResultsHistoryView';
import { CloudSyncModal } from './components/CloudSyncModal';
import { generateStandaloneHtml } from './utils/exportHtml';
import { Smartphone, Download, X, Check } from 'lucide-react';
import {
  getAllAvailableTests,
  deleteCustomTest,
  getStoredTheme,
  setStoredTheme,
  saveAttemptRecord,
  saveFullTestResult,
  getAllQuestionBank
} from './utils/questionBankStorage';
import { syncFromFirestore, setupRealtimeSync } from './services/firebaseSyncService';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type AppView = 'intro' | 'testing' | 'results' | 'bank' | 'history';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [availableSets, setAvailableSets] = useState<MockTestSet[]>(() => getAllAvailableTests());
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(() => getAllQuestionBank().length);
  const [currentSetId, setCurrentSetId] = useState<string>(() => availableSets[0]?.id || 'bpsc_tre4_tri_mock_1');
  const [activeView, setActiveView] = useState<AppView>('intro');
  const [viewHistory, setViewHistory] = useState<AppView[]>(['intro']);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Modals
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomTestModalOpen, setIsCustomTestModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [bulkImportTopic, setBulkImportTopic] = useState<string | undefined>(undefined);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Catch PWA BeforeInstallPrompt Event
  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
        setIsInstalled(true);
      }
    } else {
      alert(
        '📱 Mobile Web App Setup Instructions:\n\n' +
        '• Android / Chrome: Tap browser menu (⋮) -> Select "Install App" or "Add to Home Screen"\n' +
        '• iPhone / Safari: Tap Share button (↑) -> Scroll down & tap "Add to Home Screen"\n\n' +
        'This allows the BPSC Portal to run directly like a native app without Chrome address bar!'
      );
    }
  };

  // Navigation History Stack Management
  const navigateToView = useCallback((nextView: AppView) => {
    setViewHistory((prev) => {
      if (prev[prev.length - 1] === nextView) return prev;
      return [...prev, nextView];
    });
    setActiveView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoBack = useCallback(() => {
    setViewHistory((prev) => {
      if (prev.length > 1) {
        const updated = [...prev];
        updated.pop();
        const prevView = updated[updated.length - 1] || 'intro';
        setActiveView(prevView);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return updated;
      } else {
        setActiveView('intro');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return ['intro'];
      }
    });
  }, []);

  // Connect & sync with Firestore Cloud Database on mount
  useEffect(() => {
    const handleUpdate = () => {
      setAvailableSets(getAllAvailableTests());
      setTotalQuestionsCount(getAllQuestionBank().length);
    };

    window.addEventListener('bpsc_cloud_data_updated', handleUpdate);

    syncFromFirestore()
      .then(() => {
        handleUpdate();
      })
      .catch((err) => {
        console.warn('Initial Firestore sync:', err);
      });

    const unsubscribe = setupRealtimeSync(() => {
      handleUpdate();
    });

    return () => {
      window.removeEventListener('bpsc_cloud_data_updated', handleUpdate);
      unsubscribe();
    };
  }, []);

  // Sync theme to DOM & storage
  useEffect(() => {
    setStoredTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const refreshAvailableTests = () => {
    setAvailableSets(getAllAvailableTests());
  };

  const currentSet: MockTestSet =
    availableSets.find((s) => s.id === currentSetId) || availableSets[0];

  const handleSelectSet = (setId: string) => {
    setCurrentSetId(setId);
    navigateToView('intro');
    setTestResult(null);
  };

  const handleStartTest = (setId?: string) => {
    if (setId) {
      setCurrentSetId(setId);
    }
    navigateToView('testing');
  };

  const handleSubmitTest = (result: TestResult) => {
    setTestResult(result);
    navigateToView('results');

    // Persist attempt history
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    saveAttemptRecord({
      testId: result.setId,
      testTitle: result.setTitle,
      score: result.score,
      totalMarks: result.totalMarks,
      accuracy: result.accuracy,
      date: dateFormatted,
      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount
    });

    // Save full result in database archive
    saveFullTestResult({
      ...result,
      id: `result_${Date.now()}`,
      dateFormatted
    });
  };

  const handleReattempt = () => {
    navigateToView('testing');
    setTestResult(null);
  };

  const handleReattemptMissed = (miniTestSet: MockTestSet) => {
    refreshAvailableTests();
    setCurrentSetId(miniTestSet.id);
    navigateToView('testing');
    setTestResult(null);
  };

  const handleGoHome = () => {
    navigateToView('intro');
    setTestResult(null);
  };

  const handleOpenBank = () => {
    navigateToView('bank');
    setTestResult(null);
  };

  const handleOpenResultsHistory = () => {
    navigateToView('history');
    setTestResult(null);
  };

  const handleReviewHistoryResult = (result: TestResult, testSet: MockTestSet) => {
    setCurrentSetId(testSet.id);
    setTestResult(result);
    navigateToView('results');
  };

  const handleOpenBulkImportWithTopic = (topicKey?: string) => {
    setBulkImportTopic(topicKey);
    setIsBulkImportModalOpen(true);
  };

  const handleStartCustomCreatedTest = (newTest: MockTestSet) => {
    refreshAvailableTests();
    setCurrentSetId(newTest.id);
    navigateToView('testing');
    setTestResult(null);
  };

  const handleDeleteCustomTest = (testId: string) => {
    deleteCustomTest(testId);
    const updated = getAllAvailableTests();
    setAvailableSets(updated);
    if (currentSetId === testId) {
      setCurrentSetId(updated[0]?.id || '');
    }
  };

  const handleNextSet = () => {
    const currentIdx = availableSets.findIndex((s) => s.id === currentSetId);
    const nextIdx = (currentIdx + 1) % availableSets.length;
    setCurrentSetId(availableSets[nextIdx].id);
    navigateToView('intro');
    setTestResult(null);
  };

  const triggerDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = (set: MockTestSet) => {
    const htmlString = generateStandaloneHtml(set);
    const fileName = `BPSC_TRE4_${set.id}.html`;
    triggerDownload(fileName, htmlString);
  };

  const handleDownloadAllHtml = () => {
    availableSets.forEach((set, index) => {
      setTimeout(() => {
        const htmlString = generateStandaloneHtml(set);
        const fileName = `BPSC_TRE4_Test_${index + 1}_${set.id}.html`;
        triggerDownload(fileName, htmlString);
      }, index * 250);
    });
  };

  const canGoBack = viewHistory.length > 1;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150 relative">
      {/* Top Bar Navigation */}
      <TopBar
        currentSet={currentSet}
        availableSets={availableSets}
        onSelectSet={handleSelectSet}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onDownloadHtml={handleDownloadHtml}
        onGoHome={handleGoHome}
        onOpenQuestionBank={handleOpenBank}
        onOpenCustomTest={() => setIsCustomTestModalOpen(true)}
        onOpenBulkImport={() => handleOpenBulkImportWithTopic(undefined)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenResultsHistory={handleOpenResultsHistory}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onGoBack={handleGoBack}
        canGoBack={canGoBack}
        onInstallApp={handleInstallApp}
        isAppInstallable={!isInstalled}
        isTesting={activeView === 'testing'}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeView={activeView}
        totalQuestionsCount={totalQuestionsCount}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'intro' && (
          <TestIntroView
            currentSet={currentSet}
            availableSets={availableSets}
            onSelectSet={handleSelectSet}
            onStartTest={handleStartTest}
            onDownloadHtml={handleDownloadHtml}
            onDownloadAllHtml={handleDownloadAllHtml}
            onOpenQuestionBank={handleOpenBank}
            onOpenCustomTest={() => setIsCustomTestModalOpen(true)}
            onOpenBulkImport={handleOpenBulkImportWithTopic}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenResultsHistory={handleOpenResultsHistory}
            onDeleteCustomTest={handleDeleteCustomTest}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
            onInstallApp={handleInstallApp}
            isAppInstallable={!isInstalled}
            totalQuestionsCount={totalQuestionsCount}
          />
        )}

        {activeView === 'bank' && (
          <QuestionBankView
            onBackToTests={handleGoBack}
            onOpenBulkImport={handleOpenBulkImportWithTopic}
            onOpenCustomTest={() => setIsCustomTestModalOpen(true)}
          />
        )}

        {activeView === 'history' && (
          <ResultsHistoryView
            onBackToTests={handleGoBack}
            onReviewResult={handleReviewHistoryResult}
            onRetakeTest={(setId) => handleStartTest(setId)}
            onStartAnyTest={() => handleStartTest()}
          />
        )}

        {activeView === 'testing' && (
          <CBTTestView
            testSet={currentSet}
            onSubmitTest={handleSubmitTest}
            onExitTest={handleGoBack}
            onViewResultsHistory={handleOpenResultsHistory}
          />
        )}

        {activeView === 'results' && testResult && (
          <ResultAnalytics
            result={testResult}
            testSet={currentSet}
            onReattempt={handleReattempt}
            onReattemptMissed={handleReattemptMissed}
            onNextSet={handleNextSet}
            onGoHome={handleGoHome}
            onDownloadHtml={handleDownloadHtml}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}
      </main>

      {/* PWA Floating Install Banner / Toast */}
      {showInstallBanner && !isInstalled && activeView !== 'testing' && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 max-w-md bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-3xl shadow-2xl border border-blue-500/40 z-50 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="App Icon" className="w-11 h-11 rounded-2xl shadow-md shrink-0 bg-blue-600" />
            <div>
              <div className="font-black text-sm leading-snug">Install BPSC TRE 4.0 App</div>
              <div className="text-xs text-blue-200">Open directly without Chrome address bar</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallApp}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1.5 text-blue-300 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isRulesModalOpen && (
        <PatternGuideModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />
      )}

      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          testTitle={currentSet?.title ?? 'BPSC Test'}
        />
      )}

      {isCustomTestModalOpen && (
        <CustomTestModal
          isOpen={isCustomTestModalOpen}
          onClose={() => setIsCustomTestModalOpen(false)}
          onStartCustomTest={handleStartCustomCreatedTest}
          onOpenBulkImport={handleOpenBulkImportWithTopic}
        />
      )}

      {isBulkImportModalOpen && (
        <BulkImportModal
          isOpen={isBulkImportModalOpen}
          onClose={() => setIsBulkImportModalOpen(false)}
          defaultTopic={bulkImportTopic}
          onSuccess={() => {
            setAvailableSets(getAllAvailableTests());
            setTotalQuestionsCount(getAllQuestionBank().length);
          }}
        />
      )}

      {isCloudModalOpen && (
        <CloudSyncModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          onDataRefreshed={() => {
            setAvailableSets(getAllAvailableTests());
            setTotalQuestionsCount(getAllQuestionBank().length);
          }}
        />
      )}

      {/* Global Dynamic Footer */}
      {activeView !== 'testing' && (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                BPSC TRE 4.0 Mathematics CBT Exam & Practice Portal
              </span>{' '}
              · {totalQuestionsCount > 0 ? `${totalQuestionsCount}+` : ''} STET & TRE Real Questions · Questions & Solutions in Hindi · English Interface
            </div>
            <div className="flex items-center gap-4 text-slate-500 font-medium">
              <span>BPSC TRE 4.0 Standard</span>
              <span>·</span>
              <span>Negative Marking: -0.33</span>
              <span>·</span>
              <span>Option (E) Safe Skip</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}