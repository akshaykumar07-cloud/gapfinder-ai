export type EducationLevel = 'high_school' | 'undergraduate' | 'postgraduate' | 'professional';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  educationLevel: EducationLevel;
  examGoals: string[];
  syllabusName?: string;
  targetExamDate: string; // ISO string
  availableDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  dailyStudyHours: number;
  sessionDurationMinutes: number;
  preferredLanguage: string;
  reminderTimes: string[]; // e.g. ["09:00", "19:00"]
  browserNotificationsEnabled: boolean;
  emailRemindersEnabled: boolean;
  onboardingCompleted: boolean;
  isDemoUser?: boolean;
  createdAt: string;
}

export type ProvenanceType = 'syllabus' | 'notes' | 'manual';

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  description?: string;
  color: string;
  icon?: string;
  targetExamDate?: string;
  createdAt: string;
}

export type MasteryLevel = 'weak' | 'medium' | 'strong' | 'insufficient_evidence';

export interface Topic {
  id: string;
  subjectId: string;
  userId: string;
  chapterTitle: string;
  title: string;
  subtopicTitle?: string;
  confidence: number; // self-reported: 1 (lowest) to 5 (highest)
  masteryScore: number; // 0 to 100 percentage
  masteryLevel: MasteryLevel;
  masteryReason: string;
  provenance: ProvenanceType;
  sourceDocumentIds: string[];
  questionsAttempted: number;
  questionsCorrect: number;
  lastAssessedAt?: string;
  repeatedErrorPatterns: string[];
  isLearned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DocumentProcessingStatus = 'pending' | 'extracting' | 'chunking' | 'embedding' | 'indexed' | 'failed';

export interface StudyDocument {
  id: string;
  userId: string;
  subjectId: string;
  filename: string;
  originalName: string;
  fileSizeBytes: number;
  fileType: 'application/pdf' | 'text/plain' | 'text/markdown';
  storagePath?: string;
  processingStatus: DocumentProcessingStatus;
  errorMessage?: string;
  totalChunks: number;
  totalCharacters: number;
  extractedTextSnippet?: string;
  createdAt: string;
  processedAt?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  subjectId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  pageNumber?: number;
  sectionTitle?: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CitationReference {
  documentId: string;
  documentName: string;
  pageNumber?: number;
  sectionTitle?: string;
  relevantExcerpt: string;
  similarityScore?: number;
}

export type QuestionType = 'mcq' | 'short_answer' | 'numerical';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  topicId: string;
  topicTitle: string;
  subjectId: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  options?: string[]; // For MCQ: 4 options
  correctOptionIndex?: number; // 0-3 for MCQ
  expectedAnswer: string;
  rubric: {
    criteria: string;
    points: number;
    partialCreditNotes?: string;
  }[];
  explanation: string;
  citations: CitationReference[];
  maxMarks: number;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  subjectId: string;
  assessmentType: 'diagnostic' | 'weekly_test';
  title: string;
  totalMarks: number;
  earnedMarks: number;
  percentageScore: number;
  questions: Question[];
  responses: Record<string, StudentResponse>;
  completedAt: string;
  feedbackSummary: string;
  identifiedGaps: {
    topicId: string;
    topicTitle: string;
    scorePercent: number;
    feedback: string;
    suggestedAction: string;
  }[];
}

export interface StudentResponse {
  questionId: string;
  selectedOptionIndex?: number;
  textAnswer?: string;
  isCorrect: boolean;
  scoreAwarded: number;
  maxMarks: number;
  gradingRationale: string;
  conceptFeedback: string;
  remedialCitations: CitationReference[];
  suggestedPractice: string;
}

export type StudyActivityType = 
  | 'concept_review'
  | 'practice_problems'
  | 'quiz_revision'
  | 'flashcards'
  | 'deep_dive';

export type TaskStatus = 'scheduled' | 'completed' | 'skipped';

export interface StudyTask {
  id: string;
  planId: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topicId: string;
  topicTitle: string;
  activityType: StudyActivityType;
  title: string;
  description: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  scheduledDate: string; // YYYY-MM-DD
  status: TaskStatus;
  completedAt?: string;
  actualDurationMinutes?: number;
  skipReason?: string;
  reasonWhyRecommended: string;
  citationReferences?: CitationReference[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalAllocatedHours: number;
  totalTasks: number;
  completedTasks: number;
  isAdaptiveRevision: boolean;
  generatedReason: string;
  tasks: StudyTask[];
}

export interface PracticalExercise {
  id: string;
  subjectId: string;
  topicId: string;
  topicTitle: string;
  title: string;
  problemStatement: string;
  scenario?: string;
  difficulty: QuestionDifficulty;
  workedExample: {
    step: number;
    title: string;
    content: string;
    notes?: string;
  }[];
  challengeSteps: {
    id: string;
    instruction: string;
    hint: string;
    expectedOutcome: string;
  }[];
  sampleSolution: string;
  reflectionPrompt: string;
  citations: CitationReference[];
  isCompleted?: boolean;
  studentNotes?: string;
  studentReflection?: string;
}

export interface TutorChatMessage {
  id: string;
  userId: string;
  subjectId: string;
  topicId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  citations: CitationReference[];
  isUnsupported: boolean; // Flagged when insufficient documents match
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'study_reminder' | 'weekly_test' | 'incomplete_task' | 'milestone' | 'revision';
  createdAt: string;
  isRead: boolean;
  targetRoute?: string;
}

export interface AnalyticsSummary {
  overallMasteryPercent: number;
  dailyStudyStreakDays: number;
  plannedStudyHours: number;
  completedStudyHours: number;
  planCompletionRatePercent: number;
  totalQuestionsAttempted: number;
  overallAccuracyPercent: number;
  masteryDistribution: {
    weakCount: number;
    mediumCount: number;
    strongCount: number;
    unassessedCount: number;
  };
  weeklyScores: {
    weekLabel: string;
    score: number;
    averageScore: number;
  }[];
  accuracyTrend: {
    date: string;
    accuracy: number;
  }[];
  improvingTopics: {
    topicId: string;
    title: string;
    subjectName: string;
    previousScore: number;
    currentScore: number;
    delta: number;
  }[];
  difficultTopics: {
    topicId: string;
    title: string;
    subjectName: string;
    currentScore: number;
    errorCount: number;
    primaryStruggle: string;
  }[];
}
