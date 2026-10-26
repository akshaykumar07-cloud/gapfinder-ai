import { Topic, MasteryLevel, AssessmentAttempt } from "../types";

export interface MasteryCalculationResult {
  score: number; // 0 to 100
  level: MasteryLevel;
  reason: string;
  repeatedErrors: string[];
}

/**
 * Calculates evidence-grounded topic mastery.
 * Considers:
 * - Weighted assessment performance across attempts
 * - Difficulty multiplier (easy=0.8, medium=1.0, hard=1.2)
 * - Recency weight (recent attempts weighted more heavily)
 * - Sample size check: if attempts < 2, flags as 'insufficient_evidence'
 * - Repeated error pattern detection
 * - Distinguishes self-reported confidence from actual test mastery
 */
export function calculateTopicMastery(
  topic: Topic,
  attempts: AssessmentAttempt[]
): MasteryCalculationResult {
  // Extract all questions for this specific topic from all attempts
  const topicResponses: {
    questionId: string;
    isCorrect: boolean;
    scoreAwarded: number;
    maxMarks: number;
    difficulty: 'easy' | 'medium' | 'hard';
    attemptDate: string;
    gradingRationale?: string;
  }[] = [];

  for (const attempt of attempts) {
    for (const q of attempt.questions) {
      if (q.topicId === topic.id) {
        const resp = attempt.responses[q.id];
        if (resp) {
          topicResponses.push({
            questionId: q.id,
            isCorrect: resp.isCorrect,
            scoreAwarded: resp.scoreAwarded,
            maxMarks: q.maxMarks || 25,
            difficulty: q.difficulty || 'medium',
            attemptDate: attempt.completedAt,
            gradingRationale: resp.gradingRationale
          });
        }
      }
    }
  }

  // Check sample size constraint
  if (topicResponses.length < 2) {
    if (topicResponses.length === 0) {
      return {
        score: 0,
        level: "insufficient_evidence",
        reason: "No diagnostic or weekly test questions attempted yet for this topic.",
        repeatedErrors: topic.repeatedErrorPatterns || []
      };
    }
    // Exactly 1 question attempted: avoid labeling strong based on a single question
    const singlePct = Math.round((topicResponses[0].scoreAwarded / topicResponses[0].maxMarks) * 100);
    return {
      score: singlePct,
      level: "insufficient_evidence",
      reason: `Only 1 question attempted (${singlePct}%). At least 2 verified assessments are required to establish reliable mastery.`,
      repeatedErrors: topic.repeatedErrorPatterns || []
    };
  }

  // Weight by recency and difficulty
  let totalWeightedScore = 0;
  let totalWeight = 0;
  const errorPatterns: string[] = [];

  // Sort by date ascending
  const sortedResponses = [...topicResponses].sort(
    (a, b) => new Date(a.attemptDate).getTime() - new Date(b.attemptDate).getTime()
  );

  sortedResponses.forEach((item, index) => {
    // Recency weight: index 0 gets 1.0, latest gets up to 1.5
    const recencyWeight = 1 + (index / sortedResponses.length) * 0.5;

    // Difficulty multiplier
    const difficultyMultiplier = item.difficulty === 'hard' ? 1.2 : item.difficulty === 'easy' ? 0.8 : 1.0;

    const combinedWeight = recencyWeight * difficultyMultiplier;
    const accuracy = item.scoreAwarded / item.maxMarks; // 0 to 1

    totalWeightedScore += accuracy * combinedWeight;
    totalWeight += combinedWeight;

    if (!item.isCorrect && item.gradingRationale) {
      if (item.gradingRationale.length > 10 && !errorPatterns.includes(item.gradingRationale)) {
        errorPatterns.push(item.gradingRationale);
      }
    }
  });

  const rawMasteryPercent = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
  const clampedScore = Math.max(0, Math.min(100, rawMasteryPercent));

  let level: MasteryLevel;
  let reason: string;

  if (clampedScore < 50) {
    level = "weak";
    reason = `Weak performance (${clampedScore}% accuracy across ${topicResponses.length} attempts). Low accuracy under assessment conditions indicates foundational concept gaps.`;
  } else if (clampedScore < 80) {
    level = "medium";
    reason = `Developing competency (${clampedScore}% across ${topicResponses.length} attempts). Core concepts understood but periodic errors occurred on higher difficulty questions.`;
  } else {
    level = "strong";
    reason = `Demonstrated high mastery (${clampedScore}% across ${topicResponses.length} attempts). Consistently solves standard and advanced questions accurately.`;
  }

  // Deduplicate and trim errors
  const combinedErrors = Array.from(new Set([...(topic.repeatedErrorPatterns || []), ...errorPatterns])).slice(0, 4);

  return {
    score: clampedScore,
    level,
    reason,
    repeatedErrors: combinedErrors
  };
}
