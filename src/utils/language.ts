import { useState, useEffect } from 'react';

export type PortalLanguage = 'en' | 'hi';

const LANG_STORAGE_KEY = 'bpsc_portal_language_v1';

export function getStoredPortalLanguage(): PortalLanguage {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
    return 'en'; // English by default
  } catch {
    return 'en';
  }
}

export function setStoredPortalLanguage(lang: PortalLanguage): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_lang_changed', { detail: lang }));
    }
  } catch (err) {
    console.error('Failed to set portal language', err);
  }
}

export function usePortalLanguage(): [PortalLanguage, (lang: PortalLanguage) => void] {
  const [lang, setLang] = useState<PortalLanguage>(() => getStoredPortalLanguage());

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e?.detail) setLang(e.detail);
    };
    window.addEventListener('bpsc_lang_changed', handleLangChange);
    return () => window.removeEventListener('bpsc_lang_changed', handleLangChange);
  }, []);

  const updateLang = (nextLang: PortalLanguage) => {
    setLang(nextLang);
    setStoredPortalLanguage(nextLang);
  };

  return [lang, updateLang];
}

// Clean English-first dictionary
export const translations = {
  en: {
    mockTests: 'Mock Tests',
    questionBank: 'Question Bank',
    customTest: 'Custom Test',
    history: 'History',
    bulkImport: 'Bulk Import',
    cloudDb: 'Cloud DB',
    menu: 'Menu',
    share: 'Share',
    downloadHtml: 'Download HTML',
    startExam: 'Start Examination',
    candidate: 'Candidate',
    totalQuestions: 'Total Questions',
    activeSets: 'Active Mock Sets',
    markingScheme: 'Marking Scheme',
    speedTarget: 'Speed Target',
    safeSkip: 'Option (E) Safe Skip',
    negativeMarking: 'Negative: -0.33',
    createCustomTest: 'Create Custom Test',
    roughSheet: 'Rough Sheet',
    formulas: 'Formulas',
    deleteTest: 'Delete Test',
    allTests: 'All Tests',
    searchQuestions: 'Search questions in English or Hindi...',
    chapters: 'Chapters & Syllabus',
    auditAndClean: 'Quality Audit & Cleaner',
    cloudSyncStudio: 'Cloud Sync & Backup Studio',
    step1: '1. Mode & Setup',
    step2: '2. Chapters & Quotas',
    step3: '3. Review & Launch'
  },
  hi: {
    mockTests: 'मॉक टेस्ट',
    questionBank: 'क्वेश्चन बैंक',
    customTest: 'कस्टम टेस्ट',
    history: 'इतिहास',
    bulkImport: 'बल्क इम्पोर्ट',
    cloudDb: 'क्लाउड DB',
    menu: 'मेनू',
    share: 'शेयर',
    downloadHtml: 'HTML डाउनलोड',
    startExam: 'परीक्षा शुरू करें',
    candidate: 'परीक्षार्थी',
    totalQuestions: 'कुल प्रश्न',
    activeSets: 'सक्रिय टेस्ट सेट्स',
    markingScheme: 'अंक योजना',
    speedTarget: 'गति लक्ष्य',
    safeSkip: 'विकल्प (E) सुरक्षित स्किप',
    negativeMarking: 'नेगेटिव: -0.33',
    createCustomTest: 'कस्टम टेस्ट बनाएं',
    roughSheet: 'रफ शीट',
    formulas: 'सूत्र सूची',
    deleteTest: 'हटाएं',
    allTests: 'सभी टेस्ट',
    searchQuestions: 'प्रश्न खोजें...',
    chapters: 'अध्याय व पाठ्यक्रम',
    auditAndClean: 'गुणवत्ता जाँच',
    cloudSyncStudio: 'क्लाउड सिंक व बैकअप',
    step1: '1. मोड व सेटिंग्स',
    step2: '2. अध्याय व प्रश्न',
    step3: '3. समीक्षा व शुरुआत'
  }
};
