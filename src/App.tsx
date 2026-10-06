import { useState, useEffect, useCallback } from 'react';
import { MockTestSet, TestResult, ThemeMode } from './types';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
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
import { Smartphone, Download, X } from 'lucide-react';
import {
  getAllAvailableTests,
  deleteTest,
  restoreAllDefaultTests,
  getStoredTheme,
  setStoredTheme,
  saveAttemptRecord,
  saveFullTestResult,
  getAllQuestionBank,
  calculateTopicBreakdown
} from './utils/questionBankStorage';
import { syncFromFirestore, setupRealtimeSync } from './services/firebaseSyncService';
import { usePortalLanguage } from './utils/language';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

import { AiWeakSpotModal } from './components/AiWeakSpotModal';
import { RapidDrillModal } from './components/RapidDrillModal';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { CreateTestView } from './components/CreateTestView';
import { BulkImportView } from './components/BulkImportView';

type AppView = 'intro' | 'testing' | 'results' | 'bank' | 'create-test' | 'bulk-import' | 'history' | 'progress';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [language, setLanguage] = usePortalLanguage();
  const [availableSets, setAvailableSets] = useState<MockTestSet[]>(() => getAllAvailableTests() || []);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(() => getAllQuestionBank().length);
  const [currentSetId, setCurrentSetId] = useState<string>(() => availableSets[0]?.id || '');
  const [activeView, setActiveView] = useState<AppView>('intro');
  const [viewHistory, setViewHistory] = useState<AppView[]>(['intro']);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Modals & Navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomTestModalOpen, setIsCustomTestModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAiWeakSpotModalOpen, setIsAiWeakSpotModalOpen] = useState(false);
  const [isRapidDrillModalOpen, setIsRapidDrillModalOpen] = useState(false);
  const [bulkImportTopic, setBulkImportTopic] = useState<string | undefined>(undefined);

  const candidateName = 'PrIyA PaTeL';

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
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
        'Mobile Web App Setup Instructions:\n\n' +
        '• Android / Chrome: Tap browser menu (⋮) -> Select "Install App" or "Add to Home Screen"\n' +
        '• iPhone / Safari: Tap Share button (↑) -> Scroll down & tap "Add to Home Screen"\n\n' +
        'This allows the BPSC Portal to run directly like a native app without Chrome address bar!'
      );
    }
  };

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

  // Sync with Firestore Cloud Database
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
    (Array.isArray(availableSets) ? availableSets : []).find((s) => s?.id === currentSetId) ||
    availableSets[0] || {
      id: 'default',
      title: 'Mathematics Practice Set',
      subtitle: 'BPSC TRE 4.0 Standard',
      targetExam: 'BPSC TRE 4.0',
      category: 'tri_topic',
      categoryTitle: 'General',
      topicBadges: ['LCM & HCF', 'Percentage', 'Profit & Loss'],
      totalQuestions: 0,
      totalTimeMinutes: 20,
      questions: []
    };

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

    const dateFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const completedAtIso = new Date().toISOString();
    const attemptId = `${result.setId}_${Date.now()}`;

    // Compute topic breakdown from current test questions
    const testQuestions = (currentSet && currentSet.questions) || [];
    const topicBreakdown = calculateTopicBreakdown(testQuestions, result.responses);

    const attemptRecord = {
      id: attemptId,
      testId: result.setId,
      testTitle: result.setTitle,
      score: result.score,
      totalMarks: result.totalMarks,
      accuracy: result.accuracy,
      date: dateFormatted,
      completedAtIso,
      studentEmail: 'patel000priya000@gmail.com',
      parentEmail: 'arjittreadingcompany@gmail.com',
      studentName: 'Priya Patel',
      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      safeSkipCount: result.safeSkipCount,
      blankPenaltyCount: result.blankPenaltyCount,
      totalTimeSpentSeconds: result.totalTimeSpentSeconds,
      topicBreakdown
    };

    saveAttemptRecord(attemptRecord);

    saveFullTestResult({
      ...result,
      id: `result_${Date.now()}`,
      dateFormatted,
      completedAtIso,
      topicBreakdown
    });

    // Non-blocking server-side email dispatch after attempt is saved
    fetch('/api/email/send-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId })
    }).catch((err) => {
      console.warn('[Email Notification] Non-blocking result email dispatch note:', err);
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
    navigateToView('bulk-import');
    setTestResult(null);
  };

  const handleOpenCustomTest = (topicKey?: string) => {
    setBulkImportTopic(topicKey);
    navigateToView('create-test');
    setTestResult(null);
  };

  const handleStartCustomCreatedTest = (newTest: MockTestSet) => {
    refreshAvailableTests();
    setCurrentSetId(newTest.id);
    navigateToView('testing');
    setTestResult(null);
  };

  // Universal Delete Test Handler (Works on ANY test)
  const handleDeleteTest = (testId: string) => {
    deleteTest(testId);
    const updated = getAllAvailableTests();
    setAvailableSets(updated);
    if (currentSetId === testId) {
      setCurrentSetId(updated[0]?.id || '');
    }
  };

  // Restore Default Tests Handler
  const handleRestoreTests = () => {
    restoreAllDefaultTests();
    setAvailableSets(getAllAvailableTests());
  };

  const handleNextSet = () => {
    const currentIdx = availableSets.findIndex((s) => s.id === currentSetId);
    const nextIdx = (currentIdx + 1) % availableSets.length;
    setCurrentSetId(availableSets[nextIdx]?.id || '');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col items-center justify-center p-6 blueprint-grid-34">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-xl shadow-amber-500/10">
            BPSC
          </div>
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-200">
              BPSC TRE 4.0 Mathematics Portal
            </h2>
            <p className="text-xs text-slate-400">Loading portal resources, please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-150 relative">
      {/* Sidebar Navigation Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onNavigateView={navigateToView}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onOpenCustomTest={() => handleOpenCustomTest()}
        onOpenBulkImport={() => handleOpenBulkImportWithTopic(undefined)}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onRestoreTests={handleRestoreTests}
        onOpenAiWeakSpots={() => setIsAiWeakSpotModalOpen(true)}
        onOpenRapidDrills={() => setIsRapidDrillModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        onInstallApp={handleInstallApp}
        userName={candidateName}
      />

      {/* Top Bar Navigation */}
      <TopBar
        currentSet={currentSet}
        availableSets={availableSets}
        onSelectSet={handleSelectSet}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onDownloadHtml={handleDownloadHtml}
        onGoHome={handleGoHome}
        onOpenQuestionBank={handleOpenBank}
        onOpenCustomTest={() => handleOpenCustomTest()}
        onOpenBulkImport={() => handleOpenBulkImportWithTopic(undefined)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenResultsHistory={handleOpenResultsHistory}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onGoBack={handleGoBack}
        canGoBack={canGoBack}
        onInstallApp={handleInstallApp}
        isAppInstallable={!isInstalled}
        isTesting={activeView === 'testing'}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        activeView={activeView}
        totalQuestionsCount={totalQuestionsCount}
        userName={candidateName}
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
            onOpenCustomTest={() => handleOpenCustomTest()}
            onOpenBulkImport={handleOpenBulkImportWithTopic}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenResultsHistory={handleOpenResultsHistory}
            onDeleteTest={handleDeleteTest}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
            onInstallApp={handleInstallApp}
            isAppInstallable={!isInstalled}
            totalQuestionsCount={totalQuestionsCount}
            userName={candidateName}
          />
        )}

        {activeView === 'bank' && (
          <QuestionBankView
            onBackToTests={handleGoBack}
            onOpenBulkImport={handleOpenBulkImportWithTopic}
            onOpenCustomTest={handleOpenCustomTest}
            onStartTest={(testId) => handleStartTest(testId)}
          />
        )}

        {activeView === 'create-test' && (
          <CreateTestView
            onBack={handleGoBack}
            onStartTest={handleStartCustomCreatedTest}
            onOpenBulkImport={handleOpenBulkImportWithTopic}
            preselectedTopic={bulkImportTopic}
          />
        )}

        {activeView === 'bulk-import' && (
          <BulkImportView
            onBack={handleGoBack}
            defaultTopic={bulkImportTopic}
            onSuccess={() => {
              setAvailableSets(getAllAvailableTests());
              setTotalQuestionsCount(getAllQuestionBank().length);
            }}
            onStartTestImmediately={handleStartCustomCreatedTest}
            onNavigateToBank={handleOpenBank}
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

        {activeView === 'progress' && (
          <ProgressAnalyticsView
            onBackToTests={handleGoBack}
            onOpenCustomTest={() => handleOpenCustomTest()}
            onOpenRapidDrills={() => setIsRapidDrillModalOpen(true)}
          />
        )}

        {activeView === 'testing' && (
          <CBTTestView
            testSet={currentSet}
            onSubmitTest={handleSubmitTest}
            onExitTest={handleGoBack}
            onViewResultsHistory={handleOpenResultsHistory}
            userName={candidateName}
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
            userName={candidateName}
          />
        )}
      </main>

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

      {isAiWeakSpotModalOpen && (
        <AiWeakSpotModal
          isOpen={isAiWeakSpotModalOpen}
          onClose={() => setIsAiWeakSpotModalOpen(false)}
          onStartTest={handleStartCustomCreatedTest}
        />
      )}

      {isRapidDrillModalOpen && (
        <RapidDrillModal
          isOpen={isRapidDrillModalOpen}
          onClose={() => setIsRapidDrillModalOpen(false)}
          onStartTest={handleStartCustomCreatedTest}
        />
      )}

      {/* Global Dynamic Footer */}
      {activeView !== 'testing' && (
        <footer className="border-t border-white/10 bg-slate-950/90 py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-bold text-slate-200">
                BPSC TRE 4.0 Mathematics CBT Exam Portal
              </span>{' '}
              · Candidate: <strong className="text-amber-400">{candidateName}</strong> · {totalQuestionsCount}+ Questions
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <span>BPSC Standard</span>
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