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
import { Smartphone, Download, X, Trophy } from 'lucide-react';
import {
  getAllAvailableTests,
  deleteTest,
  restoreAllDefaultTests,
  getStoredTheme,
  setStoredTheme,
  saveAttemptRecord,
  saveFullTestResult,
  getSavedTestResults,
  getAllQuestionBank,
  calculateTopicBreakdown
} from './utils/questionBankStorage';
import { syncFromFirestore, setupRealtimeSync, saveAttemptRecordToCloud } from './services/firebaseSyncService';
import { usePortalLanguage } from './utils/language';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationToastBanner } from './components/NotificationToastBanner';
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt';
import {
  startNotificationWatcher,
  stopNotificationWatcher,
  triggerPoorResultRealityCheck,
  triggerHighScoreCelebrationAlert,
  setupAutoNotificationPermissionPrompt
} from './utils/mobileNotificationService';
import { parseUrlRoute, updateBrowserUrl } from './utils/urlRouting';

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
import { UserProfileModal } from './components/UserProfileModal';
import { getUserProfile, getUserSyncId } from './utils/userProfile';

type AppView = 'intro' | 'testing' | 'results' | 'bank' | 'create-test' | 'bulk-import' | 'history' | 'progress';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [language, setLanguage] = usePortalLanguage();
  const [availableSets, setAvailableSets] = useState<MockTestSet[]>(() => getAllAvailableTests() || []);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(() => getAllQuestionBank().length);
  const initialRoute = parseUrlRoute();
  const [currentSetId, setCurrentSetId] = useState<string>(() => initialRoute.testId || availableSets[0]?.id || '');
  const [activeView, setActiveView] = useState<AppView>(() => initialRoute.view);
  const [viewHistory, setViewHistory] = useState<AppView[]>([initialRoute.view]);
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

  const [candidateProfile, setCandidateProfile] = useState(() => getUserProfile());
  const candidateName = candidateProfile.displayName || 'PrIyA PaTeL';
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Start Background Mobile Notification Watcher & Auto-Prompt Permission on Open
  useEffect(() => {
    startNotificationWatcher();
    setupAutoNotificationPermissionPrompt();
    return () => stopNotificationWatcher();
  }, []);

  // Handle direct navigation from email notifications & mobile push links: ?testId=... or ?reviewTestId=...
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const route = parseUrlRoute();

    if (route.enableNotif) {
      setIsNotificationCenterOpen(true);
    }

    if (route.testId && availableSets.length > 0) {
      const found = availableSets.find((s) => s.id === route.testId);
      if (found) {
        setCurrentSetId(found.id);
        if (route.view === 'testing') {
          setActiveView('testing');
        } else {
          setActiveView('intro');
        }
      }
    } else if (route.reviewTestId && availableSets.length > 0) {
      const historyResults = getSavedTestResults();
      const match = historyResults.find((r) => r.setId === route.reviewTestId || r.id === route.reviewTestId);
      if (match) {
        const matchingSet = availableSets.find((s) => s.id === match.setId) || availableSets[0];
        handleReviewHistoryResult(match, matchingSet);
      }
    } else if (route.view === 'results') {
      const historyResults = getSavedTestResults();
      if (historyResults.length > 0 && availableSets.length > 0) {
        const latest = historyResults[0];
        const matchingSet = availableSets.find((s) => s.id === latest.setId) || availableSets[0];
        handleReviewHistoryResult(latest, matchingSet);
      } else {
        setActiveView('results');
      }
    } else if (route.view && route.view !== 'intro') {
      setActiveView(route.view);
    }
  }, [availableSets]);

  // Handle browser Back / Forward navigation (PopState)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseUrlRoute();
      if (route.testId) {
        setCurrentSetId(route.testId);
      }
      if (route.reviewTestId) {
        const historyResults = getSavedTestResults();
        const match = historyResults.find((r) => r.setId === route.reviewTestId || r.id === route.reviewTestId);
        if (match) {
          const matchingSet = availableSets.find((s) => s.id === match.setId) || availableSets[0];
          handleReviewHistoryResult(match, matchingSet);
          return;
        }
      }
      if (route.view === 'results') {
        const historyResults = getSavedTestResults();
        if (historyResults.length > 0 && availableSets.length > 0) {
          const latest = historyResults[0];
          const matchingSet = availableSets.find((s) => s.id === latest.setId) || availableSets[0];
          handleReviewHistoryResult(latest, matchingSet);
          return;
        }
      }
      setActiveView(route.view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [availableSets]);

  // Handle incoming deep link clicks from Service Worker
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'BPSC_NOTIFICATION_CLICK') {
          const targetUrl = event.data.url;
          if (targetUrl) {
            try {
              const parsed = new URL(targetUrl, window.location.origin);
              if (parsed.searchParams.get('enableNotif') === 'true') {
                setIsNotificationCenterOpen(true);
              }
              const testId = parsed.searchParams.get('testId');
              const reviewTestId = parsed.searchParams.get('reviewTestId');
              const view = parsed.searchParams.get('view');
              if (reviewTestId) {
                const historyResults = getSavedTestResults();
                const match = historyResults.find((r) => r.setId === reviewTestId || r.id === reviewTestId);
                if (match) {
                  const matchingSet = availableSets.find((s) => s.id === match.setId) || availableSets[0];
                  handleReviewHistoryResult(match, matchingSet);
                  return;
                }
              }
              if (testId) {
                const found = availableSets.find((s) => s.id === testId);
                if (found) {
                  setCurrentSetId(found.id);
                  if (parsed.searchParams.get('start') === 'true' || view === 'test') {
                    setActiveView('testing');
                  } else {
                    setActiveView('intro');
                  }
                  return;
                }
              }
              if (view === 'bank') setActiveView('bank');
              else if (view === 'create') setActiveView('create-test');
              else if (view === 'import') setActiveView('bulk-import');
              else if (view === 'history') setActiveView('history');
              else if (view === 'progress') setActiveView('progress');
            } catch {}
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    }
  }, [availableSets]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCandidateProfile(getUserProfile());
    };
    window.addEventListener('bpsc_user_profile_updated', handleProfileUpdate);
    window.addEventListener('bpsc_user_sync_id_changed', handleProfileUpdate);
    return () => {
      window.removeEventListener('bpsc_user_profile_updated', handleProfileUpdate);
      window.removeEventListener('bpsc_user_sync_id_changed', handleProfileUpdate);
    };
  }, []);

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
    updateBrowserUrl({
      view: nextView,
      testId: currentSetId,
      reviewTestId: testResult?.setId
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSetId, testResult]);

  const handleGoBack = useCallback(() => {
    setViewHistory((prev) => {
      if (prev.length > 1) {
        const updated = [...prev];
        updated.pop();
        const prevView = updated[updated.length - 1] || 'intro';
        setActiveView(prevView);
        updateBrowserUrl({
          view: prevView,
          testId: currentSetId
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return updated;
      } else {
        setActiveView('intro');
        updateBrowserUrl({ view: 'intro' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return ['intro'];
      }
    });
  }, [currentSetId]);

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
    updateBrowserUrl({
      view: 'intro',
      testId: setId
    });
  };

  const handleStartTest = (setId?: string) => {
    const targetId = setId || currentSetId;
    if (targetId) {
      setCurrentSetId(targetId);
    }
    navigateToView('testing');
    updateBrowserUrl({
      view: 'testing',
      testId: targetId
    });
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

    updateBrowserUrl({
      view: 'results',
      reviewTestId: result.setId,
      resultId: attemptId
    });

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
      studentName: candidateName,
      userId: getUserSyncId(),
      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      safeSkipCount: result.safeSkipCount,
      blankPenaltyCount: result.blankPenaltyCount,
      totalTimeSpentSeconds: result.totalTimeSpentSeconds,
      topicBreakdown,
      responses: result.responses,
      questions: result.questions || (currentSet && currentSet.questions) || []
    };

    saveAttemptRecord(attemptRecord);

    saveFullTestResult({
      ...result,
      id: attemptId,
      dateFormatted,
      completedAtIso,
      topicBreakdown,
      questions: result.questions || (currentSet && currentSet.questions) || []
    });

    // Write attempt directly to Firebase Firestore
    saveAttemptRecordToCloud(attemptRecord).catch((err) => {
      console.warn('Direct attempt cloud sync warning:', err);
    });

    // Trigger Reality Check alert if score or accuracy is poor
    triggerPoorResultRealityCheck({
      testTitle: result.setTitle,
      score: result.score,
      totalMarks: result.totalMarks,
      accuracy: result.accuracy,
      incorrectCount: result.incorrectCount,
      testId: result.setId
    }).catch(() => null);

    // Trigger Celebration Alert if student scored well
    triggerHighScoreCelebrationAlert({
      testTitle: result.setTitle,
      score: result.score,
      totalMarks: result.totalMarks,
      accuracy: result.accuracy,
      testId: result.setId
    }).catch(() => null);
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
    updateBrowserUrl({
      view: 'results',
      reviewTestId: testSet.id
    });
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-150 relative max-w-full overflow-x-hidden">
      {/* Floating In-App Notification Toast Banner */}
      <NotificationToastBanner onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)} />

      {/* Mobile & Laptop Notification Prompt on App Open */}
      <NotificationPermissionPrompt onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)} />

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
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
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
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
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
        onOpenProfileModal={() => setIsUserProfileModalOpen(true)}
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

        {activeView === 'results' && (
          testResult ? (
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
          ) : (
            <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">कोई हालिया टेस्ट परिणाम नहीं मिला</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                आपने अभी तक कोई टेस्ट सबमिट नहीं किया है या पिछला परिणाम हिस्ट्री में सुरक्षित है।
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleStartTest()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shadow-md cursor-pointer"
                >
                  नया टेस्ट शुरू करें
                </button>
                <button
                  onClick={handleOpenResultsHistory}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer"
                >
                  हिस्ट्री देखें
                </button>
              </div>
            </div>
          )
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
          initialTopicKey={bulkImportTopic}
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

      {isUserProfileModalOpen && (
        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          onProfileUpdated={() => {
            setCandidateProfile(getUserProfile());
            setAvailableSets(getAllAvailableTests());
          }}
        />
      )}

      {/* Mobile Notification Center & Hourly Discipline Modal */}
      {isNotificationCenterOpen && (
        <NotificationCenterModal
          isOpen={isNotificationCenterOpen}
          onClose={() => setIsNotificationCenterOpen(false)}
          onOpenTest={(setId) => handleStartTest(setId)}
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