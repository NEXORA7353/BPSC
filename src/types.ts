export interface Question {
  id: string;
  originalNumber?: number;
  topic: string; // 'lcm_hcf' | 'percentage' | 'profit_loss' or custom string
  topicNameHindi: string;
  exam: string;
  questionText: string;
  options: {
    key: 'a' | 'b' | 'c' | 'd' | 'e';
    text: string;
  }[];
  correctOption: 'a' | 'b' | 'c' | 'd' | 'e';
  explanation: string;
  imageUrl?: string;
  svgContent?: string;
  isCustomE?: boolean;
  isUserAdded?: boolean;
  createdAt?: string;
}

export interface QuestionResponse {
  questionId: string;
  selectedOption: 'a' | 'b' | 'c' | 'd' | 'e' | null;
  status: 'answered' | 'not_answered' | 'marked_review' | 'answered_marked_review' | 'not_visited';
  timeSpentSeconds: number;
}

export interface TopicSegment {
  topicKey: string;
  label: string;
  count: number;
  colorClass: string;
}

export interface MockTestSet {
  id: string;
  cardIndex?: string; // '01', '02', '03' etc.
  badge1?: string; // 'MOCK-01', 'MIX-01' etc.
  badge2?: string; // 'Basic to Advance', '3 Topics Combined'
  title: string;
  subtitle: string;
  targetExam: string;
  category: 'tri_topic' | 'profit_loss' | 'lcm_percentage' | 'custom';
  categoryTitle: string;
  topicBadges: string[];
  topicBreakdown?: TopicSegment[];
  totalQuestions: number;
  totalTimeMinutes: number;
  questions: Question[];
  negativeMarkingValue?: number; // default 0.33
  isCustom?: boolean;
  createdAt?: string;
}

export interface TestResult {
  setId: string;
  setTitle: string;
  totalQuestions: number;
  totalMarks: number;
  score: number;
  correctCount: number;
  incorrectCount: number;
  safeSkipCount: number;
  blankPenaltyCount: number;
  totalTimeSpentSeconds: number;
  accuracy: number;
  responses: Record<string, QuestionResponse>;
  completedAt: string;
  negativeMarkingValue?: number;
}

export interface TestAttemptRecord {
  testId: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  date: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
}

export interface RegisteredTopic {
  key: string;
  labelHindi: string;
  labelEnglish: string;
  isUserCreated?: boolean;
}

export interface SavedTestResult extends TestResult {
  id: string;
  dateFormatted: string;
}

export interface CustomTestConfig {
  title: string;
  subtitle?: string;
  creationMode?: 'topic_distribution' | 'handpick' | 'direct_paste';
  selectedTopics: string[];
  topicDistribution?: Record<string, number>; // topicKey -> question count
  specificQuestionIds?: string[];
  directQuestions?: Question[];
  questionCount: number;
  timeMinutes: number;
  selectionMode: 'random' | 'sequential' | 'bookmarked';
  negativeMarking: number; // 0.33, 0.25, 0
  targetExam?: string;
}

export type ThemeMode = 'light' | 'dark';
