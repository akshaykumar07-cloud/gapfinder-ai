"use client";

import { useState, useEffect } from "react";
import {
  UserProfile,
  Subject,
  Topic,
  StudyDocument,
  DocumentChunk,
  Question,
  AssessmentAttempt,
  StudyPlan,
  StudyTask,
  PracticalExercise,
  TutorChatMessage,
  NotificationItem,
  AnalyticsSummary,
  MasteryLevel,
  StudentResponse,
} from "../types";
import {
  initialDemoProfile,
  initialDemoSubjects,
  initialDemoDocuments,
  initialDemoChunks,
  initialDemoTopics,
  sampleDiagnosticQuestions,
  sampleAssessmentHistory,
  sampleWeeklyTest,
  initialDemoPlan,
  samplePracticalExercise,
  sampleTutorMessages,
  sampleNotifications,
  sampleAnalyticsSummary,
} from "../demo-data";
import { calculateTopicMastery } from "../algorithms/mastery";
import { generatePersonalizedStudyPlan } from "../algorithms/scheduler";

const STORAGE_KEY = "gapfinder_state_v1";

export interface AppState {
  profile: UserProfile;
  subjects: Subject[];
  documents: StudyDocument[];
  chunks: DocumentChunk[];
  topics: Topic[];
  diagnosticQuestions: Question[];
  assessmentHistory: AssessmentAttempt[];
  weeklyTestQuestions: Question[];
  currentPlan: StudyPlan;
  practicalExercise: PracticalExercise;
  tutorMessages: TutorChatMessage[];
  notifications: NotificationItem[];
}

function getInitialState(): AppState {
  if (typeof window === "undefined") {
    return {
      profile: initialDemoProfile,
      subjects: initialDemoSubjects,
      documents: initialDemoDocuments,
      chunks: initialDemoChunks,
      topics: initialDemoTopics,
      diagnosticQuestions: sampleDiagnosticQuestions,
      assessmentHistory: sampleAssessmentHistory,
      weeklyTestQuestions: sampleWeeklyTest,
      currentPlan: initialDemoPlan,
      practicalExercise: samplePracticalExercise,
      tutorMessages: sampleTutorMessages,
      notifications: sampleNotifications,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
  }

  return {
    profile: initialDemoProfile,
    subjects: initialDemoSubjects,
    documents: initialDemoDocuments,
    chunks: initialDemoChunks,
    topics: initialDemoTopics,
    diagnosticQuestions: sampleDiagnosticQuestions,
    assessmentHistory: sampleAssessmentHistory,
    weeklyTestQuestions: sampleWeeklyTest,
    currentPlan: initialDemoPlan,
    practicalExercise: samplePracticalExercise,
    tutorMessages: sampleTutorMessages,
    notifications: sampleNotifications,
  };
}

export function useGapFinderStore() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw));
      }
    } catch (e) {
      console.warn("Could not parse storage state:", e);
    }
    setIsLoaded(true);
  }, []);

  const saveState = (newState: AppState) => {
    setState(newState);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (err) {
        console.error("Failed to persist state:", err);
      }
    }
  };

  // --- ACTIONS ---

  // 1. Reset Demo State
  const resetToDemoDefaults = () => {
    const defaults: AppState = {
      profile: initialDemoProfile,
      subjects: initialDemoSubjects,
      documents: initialDemoDocuments,
      chunks: initialDemoChunks,
      topics: initialDemoTopics,
      diagnosticQuestions: sampleDiagnosticQuestions,
      assessmentHistory: sampleAssessmentHistory,
      weeklyTestQuestions: sampleWeeklyTest,
      currentPlan: initialDemoPlan,
      practicalExercise: samplePracticalExercise,
      tutorMessages: sampleTutorMessages,
      notifications: sampleNotifications,
    };
    saveState(defaults);
  };

  // 2. Profile & Onboarding
  const updateProfile = (partial: Partial<UserProfile>) => {
    const updated = { ...state.profile, ...partial };
    saveState({ ...state, profile: updated });
  };

  // 3. Document Management
  const addDocument = (
    doc: StudyDocument,
    newChunks: DocumentChunk[],
    newTopics?: Topic[]
  ) => {
    const nextDocs = [doc, ...state.documents];
    const nextChunks = [...state.chunks, ...newChunks];
    const nextTopics = newTopics ? [...state.topics, ...newTopics] : state.topics;

    saveState({
      ...state,
      documents: nextDocs,
      chunks: nextChunks,
      topics: nextTopics,
    });
  };

  const deleteDocument = (documentId: string) => {
    const nextDocs = state.documents.filter((d) => d.id !== documentId);
    const nextChunks = state.chunks.filter((c) => c.documentId !== documentId);
    saveState({
      ...state,
      documents: nextDocs,
      chunks: nextChunks,
    });
  };

  // 4. Topic Management
  const updateTopic = (topicId: string, partial: Partial<Topic>) => {
    const nextTopics = state.topics.map((t) =>
      t.id === topicId ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t
    );
    saveState({ ...state, topics: nextTopics });
  };

  const addTopic = (newTopic: Topic) => {
    saveState({ ...state, topics: [...state.topics, newTopic] });
  };

  const markTopicLearned = (topicId: string, isLearned: boolean) => {
    updateTopic(topicId, { isLearned });
  };

  // 5. Submit Assessment Attempt
  const recordAssessmentAttempt = (
    attempt: AssessmentAttempt,
    responses: Record<string, StudentResponse>
  ) => {
    const nextHistory = [attempt, ...state.assessmentHistory];

    // Re-evaluate mastery for all topics affected by this assessment
    const affectedTopicIds = new Set<string>();
    attempt.questions.forEach((q) => affectedTopicIds.add(q.topicId));

    const nextTopics = state.topics.map((topic) => {
      if (affectedTopicIds.has(topic.id)) {
        const masteryRes = calculateTopicMastery(topic, nextHistory);
        return {
          ...topic,
          masteryScore: masteryRes.score,
          masteryLevel: masteryRes.level,
          masteryReason: masteryRes.reason,
          repeatedErrorPatterns: masteryRes.repeatedErrors,
          questionsAttempted: topic.questionsAttempted + 1,
          lastAssessedAt: attempt.completedAt,
          updatedAt: new Date().toISOString(),
        };
      }
      return topic;
    });

    // Auto-rebalance future study plan tasks
    const { plan: newPlan } = generatePersonalizedStudyPlan({
      profile: state.profile,
      subjects: state.subjects,
      topics: nextTopics,
      startDateStr: new Date().toISOString().split("T")[0],
      daysCount: 7,
    });

    // Create persistent notification for student
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: state.profile.id,
      title: `${attempt.title} Completed`,
      message: `Score: ${attempt.percentageScore}%. Your topic mastery and study plan have been automatically updated.`,
      type: "weekly_test",
      createdAt: new Date().toISOString(),
      isRead: false,
      targetRoute: "/gaps",
    };

    saveState({
      ...state,
      assessmentHistory: nextHistory,
      topics: nextTopics,
      currentPlan: newPlan,
      notifications: [newNotif, ...state.notifications],
    });
  };

  // 6. Study Plan & Tasks
  const markTaskCompleted = (taskId: string, actualMinutes?: number) => {
    const nextTasks = state.currentPlan.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: "completed" as const,
            completedAt: new Date().toISOString(),
            actualDurationMinutes: actualMinutes || task.durationMinutes,
          }
        : task
    );

    const completedCount = nextTasks.filter((t) => t.status === "completed").length;

    saveState({
      ...state,
      currentPlan: {
        ...state.currentPlan,
        completedTasks: completedCount,
        tasks: nextTasks,
      },
    });
  };

  const skipTask = (taskId: string, reason: string) => {
    const nextTasks = state.currentPlan.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: "skipped" as const,
            skipReason: reason,
          }
        : task
    );

    saveState({
      ...state,
      currentPlan: {
        ...state.currentPlan,
        tasks: nextTasks,
      },
    });
  };

  const rescheduleTask = (taskId: string, newDateStr: string) => {
    const nextTasks = state.currentPlan.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            scheduledDate: newDateStr,
          }
        : task
    );

    saveState({
      ...state,
      currentPlan: {
        ...state.currentPlan,
        tasks: nextTasks,
      },
    });
  };

  const regeneratePlan = () => {
    const { plan, warnings } = generatePersonalizedStudyPlan({
      profile: state.profile,
      subjects: state.subjects,
      topics: state.topics,
      startDateStr: new Date().toISOString().split("T")[0],
      daysCount: 7,
    });

    saveState({
      ...state,
      currentPlan: plan,
    });
    return { plan, warnings };
  };

  // 7. Tutor Messages
  const addTutorMessage = (msg: TutorChatMessage) => {
    saveState({
      ...state,
      tutorMessages: [...state.tutorMessages, msg],
    });
  };

  // 8. Notifications
  const markNotificationRead = (id: string) => {
    const nextNotifs = state.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    saveState({ ...state, notifications: nextNotifs });
  };

  const markAllNotificationsRead = () => {
    const nextNotifs = state.notifications.map((n) => ({ ...n, isRead: true }));
    saveState({ ...state, notifications: nextNotifs });
  };

  // 9. Practical Exercises
  const updatePracticalExercise = (partial: Partial<PracticalExercise>) => {
    saveState({
      ...state,
      practicalExercise: { ...state.practicalExercise, ...partial },
    });
  };

  // 10. Analytics calculation from real state
  const getAnalyticsSummary = (): AnalyticsSummary => {
    const totalTopics = state.topics.length || 1;
    const weakCount = state.topics.filter((t) => t.masteryLevel === "weak").length;
    const mediumCount = state.topics.filter((t) => t.masteryLevel === "medium").length;
    const strongCount = state.topics.filter((t) => t.masteryLevel === "strong").length;
    const unassessedCount = state.topics.filter(
      (t) => t.masteryLevel === "insufficient_evidence"
    ).length;

    const evaluatedTopics = state.topics.filter(
      (t) => t.masteryLevel !== "insufficient_evidence"
    );
    const avgMastery =
      evaluatedTopics.length > 0
        ? Math.round(
            evaluatedTopics.reduce((acc, t) => acc + t.masteryScore, 0) /
              evaluatedTopics.length
          )
        : 0;

    let totalQuestions = 0;
    let correctQuestions = 0;
    state.topics.forEach((t) => {
      totalQuestions += t.questionsAttempted;
      correctQuestions += t.questionsCorrect;
    });

    const accuracy =
      totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

    // Study hours
    const completedTasks = state.currentPlan.tasks.filter((t) => t.status === "completed");
    const completedMinutes = completedTasks.reduce(
      (acc, t) => acc + (t.actualDurationMinutes || t.durationMinutes),
      0
    );
    const completedHours = parseFloat((completedMinutes / 60).toFixed(1));

    return {
      overallMasteryPercent: avgMastery,
      dailyStudyStreakDays: 6,
      plannedStudyHours: state.currentPlan.totalAllocatedHours,
      completedStudyHours: completedHours,
      planCompletionRatePercent: Math.round(
        (completedTasks.length / (state.currentPlan.tasks.length || 1)) * 100
      ),
      totalQuestionsAttempted: totalQuestions,
      overallAccuracyPercent: accuracy,
      masteryDistribution: {
        weakCount,
        mediumCount,
        strongCount,
        unassessedCount,
      },
      weeklyScores: sampleAnalyticsSummary.weeklyScores,
      accuracyTrend: sampleAnalyticsSummary.accuracyTrend,
      improvingTopics: sampleAnalyticsSummary.improvingTopics,
      difficultTopics: state.topics
        .filter((t) => t.masteryLevel === "weak")
        .map((t) => ({
          topicId: t.id,
          title: t.title,
          subjectName: "CS301",
          currentScore: t.masteryScore,
          errorCount: t.repeatedErrorPatterns.length || 1,
          primaryStruggle: t.masteryReason,
        })),
    };
  };

  return {
    state,
    isLoaded,
    resetToDemoDefaults,
    updateProfile,
    addDocument,
    deleteDocument,
    updateTopic,
    addTopic,
    markTopicLearned,
    recordAssessmentAttempt,
    markTaskCompleted,
    skipTask,
    rescheduleTask,
    regeneratePlan,
    addTutorMessage,
    markNotificationRead,
    markAllNotificationsRead,
    updatePracticalExercise,
    getAnalyticsSummary,
  };
}
