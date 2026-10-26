import { UserProfile, Subject, Topic, StudyTask, StudyPlan, StudyActivityType } from "../types";

export interface ScheduleGenerationOptions {
  profile: UserProfile;
  subjects: Subject[];
  topics: Topic[];
  startDateStr?: string; // YYYY-MM-DD
  daysCount?: number; // Default 7 days
}

export interface ScheduleGenerationResult {
  plan: StudyPlan;
  exceededCapacity: boolean;
  warnings: string[];
}

export function generatePersonalizedStudyPlan(options: ScheduleGenerationOptions): ScheduleGenerationResult {
  const { profile, subjects, topics, startDateStr, daysCount = 7 } = options;
  const warnings: string[] = [];

  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const maxDailyMinutes = Math.round(profile.dailyStudyHours * 60);
  const sessionDuration = profile.sessionDurationMinutes || 45;

  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.id, s));

  // Score each topic by revision urgency:
  // Higher urgency = lower mastery, lower confidence, unassessed, or older last revision
  interface UrgencyItem {
    topic: Topic;
    subject: Subject;
    urgencyScore: number;
    recommendedActivity: StudyActivityType;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }

  const topicUrgencies: UrgencyItem[] = topics.map(t => {
    const subject = subjectMap.get(t.subjectId) || {
      id: t.subjectId,
      userId: profile.id,
      name: "Core Studies",
      color: "#4F46E5",
      createdAt: new Date().toISOString()
    };

    let urgency = 0;
    let recommendedActivity: StudyActivityType = "concept_review";
    let reason = "";
    let priority: 'high' | 'medium' | 'low' = "medium";

    if (t.masteryLevel === 'weak') {
      urgency += 150 + (100 - t.masteryScore);
      priority = "high";
      recommendedActivity = t.repeatedErrorPatterns?.length > 0 ? "practice_problems" : "concept_review";
      reason = `Critical knowledge gap (${t.masteryScore}% mastery). High-priority review required to address recurring errors.`;
    } else if (t.masteryLevel === 'insufficient_evidence') {
      urgency += 80;
      priority = "medium";
      recommendedActivity = "quiz_revision";
      reason = `Unassessed topic. Diagnostic coverage needed before exam.`;
    } else if (t.masteryLevel === 'medium') {
      urgency += 50 - (t.masteryScore - 50);
      priority = "medium";
      recommendedActivity = "practice_problems";
      reason = `Moderate mastery (${t.masteryScore}%). Problem-solving exercises needed to reach mastery threshold.`;
    } else {
      // Strong topic: spaced repetition
      const daysSince = t.lastAssessedAt 
        ? Math.floor((Date.now() - new Date(t.lastAssessedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 7;
      urgency += Math.min(30, daysSince * 3);
      priority = "low";
      recommendedActivity = "flashcards";
      reason = `Spaced revision. Previously mastered (${t.masteryScore}%), scheduled to prevent memory decay.`;
    }

    // Adjust for self-confidence dissonance (e.g. low confidence despite high mastery or vice versa)
    if (t.confidence <= 2 && t.masteryLevel !== 'weak') {
      urgency += 15;
      reason += " Self-reported confidence is low.";
    }

    return {
      topic: t,
      subject,
      urgencyScore: urgency,
      recommendedActivity,
      reason,
      priority
    };
  });

  // Sort descending by urgency
  topicUrgencies.sort((a, b) => b.urgencyScore - a.urgencyScore);

  const tasks: StudyTask[] = [];
  let exceededCapacity = false;
  let totalAllocatedMinutes = 0;

  // Day names helper
  const dayKeys: ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[] = [
    'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
  ];

  let topicPointer = 0;

  for (let i = 0; i < daysCount; i++) {
    const currentDay = new Date(startDate);
    currentDay.setDate(currentDay.getDate() + i);
    const dayName = dayKeys[currentDay.getDay()];

    // Check if student is available on this day
    const isAvailableDay = profile.availableDays.includes(dayName as any);
    if (!isAvailableDay) {
      continue;
    }

    const dateStr = currentDay.toISOString().split('T')[0];
    let dayMinutesAllocated = 0;

    // Allocate tasks up to maxDailyMinutes
    while (
      dayMinutesAllocated + sessionDuration <= maxDailyMinutes && 
      topicPointer < topicUrgencies.length
    ) {
      const item = topicUrgencies[topicPointer];
      const taskId = `task-gen-${dateStr}-${topicPointer}`;

      tasks.push({
        id: taskId,
        planId: "plan-generated",
        userId: profile.id,
        subjectId: item.subject.id,
        subjectName: item.subject.name,
        subjectColor: item.subject.color,
        topicId: item.topic.id,
        topicTitle: item.topic.title,
        activityType: item.recommendedActivity,
        title: `${getActivityTitlePrefix(item.recommendedActivity)}: ${item.topic.title}`,
        description: `Targeted session on ${item.topic.title} (${item.topic.chapterTitle}). Focus on: ${item.reason}`,
        durationMinutes: sessionDuration,
        priority: item.priority,
        scheduledDate: dateStr,
        status: "scheduled",
        reasonWhyRecommended: item.reason
      });

      dayMinutesAllocated += sessionDuration;
      totalAllocatedMinutes += sessionDuration;
      topicPointer++;
    }
  }

  // Check if there are critical weak topics remaining that couldn't fit
  if (topicPointer < topicUrgencies.length) {
    const remainingHighPriority = topicUrgencies
      .slice(topicPointer)
      .filter(t => t.priority === 'high');
    
    if (remainingHighPriority.length > 0) {
      exceededCapacity = true;
      warnings.push(
        `${remainingHighPriority.length} high-priority topics could not fit within your configured ${profile.dailyStudyHours}h/day limit. Consider increasing daily study time or extending target dates.`
      );
    }
  }

  const planId = `plan-${Date.now()}`;
  tasks.forEach(t => (t.planId = planId));

  const plan: StudyPlan = {
    id: planId,
    userId: profile.id,
    startDate: startDate.toISOString().split('T')[0],
    endDate: new Date(startDate.getTime() + daysCount * 86400000).toISOString().split('T')[0],
    totalAllocatedHours: parseFloat((totalAllocatedMinutes / 60).toFixed(1)),
    totalTasks: tasks.length,
    completedTasks: 0,
    isAdaptiveRevision: true,
    generatedReason: `Personalized schedule prioritizing ${
      topicUrgencies.filter(t => t.priority === 'high').length
    } weak topics, balanced with spaced repetition and strictly capped at ${profile.dailyStudyHours}h per study day.`,
    tasks
  };

  return {
    plan,
    exceededCapacity,
    warnings
  };
}

function getActivityTitlePrefix(activity: StudyActivityType): string {
  switch (activity) {
    case 'concept_review':
      return 'Concept Review';
    case 'practice_problems':
      return 'Problem Drill';
    case 'quiz_revision':
      return 'Diagnostic Check';
    case 'flashcards':
      return 'Active Recall';
    case 'deep_dive':
      return 'Deep Dive Analysis';
    default:
      return 'Study Session';
  }
}
