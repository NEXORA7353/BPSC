/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [availableSets, setAvailableSets] = useState<MockTestSet[]>(() => getAllAvailableTests());
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(() => getAllQuestionBank().length);
  const [currentSetId, setCurrentSetId] = useState<string>(() => availableSets[0]?.id || 'bpsc_tre4_tri_mock_1');
  const [activeView, setActiveView] = useState<'intro' | 'testing' | 'results' | 'bank' | 'history'>('intro');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Modals
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomTestModalOpen, setIsCustomTestModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [bulkImportTopic, setBulkImportTopic] = useState<string | undefined>(undefined);

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
    setActiveView('intro');
    setTestResult(null);
  };

  const handleStartTest = (setId?: string) => {
    if (setId) {
      setCurrentSetId(setId);
    }
    setActiveView('testing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitTest = (result: TestResult) => {
    setTestResult(result);
    setActiveView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
    setActiveView('testing');
    setTestResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReattemptMissed = (miniTestSet: MockTestSet) => {
    refreshAvailableTests();
    setCurrentSetId(miniTestSet.id);
    setActiveView('testing');
    setTestResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setActiveView('intro');
    setTestResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBank = () => {
    setActiveView('bank');
    setTestResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenResultsHistory = () => {
    setActiveView('history');
    setTestResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewHistoryResult = (result: TestResult, testSet: MockTestSet) => {
    setCurrentSetId(testSet.id);
    setTestResult(result);
    setActiveView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBulkImportWithTopic = (topicKey?: string) => {
    setBulkImportTopic(topicKey);
    setIsBulkImportModalOpen(true);
  };

  const handleStartCustomCreatedTest = (newTest: MockTestSet) => {
    refreshAvailableTests();
    setCurrentSetId(newTest.id);
    setActiveView('testing');
    setTestResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setActiveView('intro');
    setTestResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to trigger browser file download
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150">
      {/* Top Bar with English Navigation & Controls */}
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
            totalQuestionsCount={totalQuestionsCount}
          />
        )}

        {activeView === 'bank' && (
          <QuestionBankView
            onBackToTests={handleGoHome}
            onOpenBulkImport={handleOpenBulkImportWithTopic}
            onOpenCustomTest={() => setIsCustomTestModalOpen(true)}
          />
        )}

        {activeView === 'history' && (
          <ResultsHistoryView
            onBackToTests={handleGoHome}
            onReviewResult={handleReviewHistoryResult}
            onRetakeTest={(setId) => handleStartTest(setId)}
            onStartAnyTest={() => handleStartTest()}
          />
        )}

        {activeView === 'testing' && (
          <CBTTestView
            testSet={currentSet}
            onSubmitTest={handleSubmitTest}
            onExitTest={handleGoHome}
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

      {/* Pattern Guide Modal */}
      {isRulesModalOpen && (
        <PatternGuideModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />
      )}

      {/* Share Modal with Link & QR */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          testTitle={currentSet.title}
        />
      )}

      {/* Custom Random Test Generator Modal */}
      {isCustomTestModalOpen && (
        <CustomTestModal
          isOpen={isCustomTestModalOpen}
          onClose={() => setIsCustomTestModalOpen(false)}
          onStartCustomTest={handleStartCustomCreatedTest}
          onOpenBulkImport={handleOpenBulkImportWithTopic}
        />
      )}

      {/* Smart Bulk Question Paste / Importer Modal */}
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

      {/* Cloud Database (Firestore) Modal */}
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

      {/* Clean Global Footer */}
      {activeView !== 'testing' && (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                BPSC TRE 4.0 Mathematics CBT Exam & Practice Portal
              </span>{' '}
              · 155+ STET & TRE Real Questions · Questions & Solutions in Hindi · English Interface
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
