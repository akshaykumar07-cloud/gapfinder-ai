import { describe, it, expect } from "vitest";
import { calculateTopicMastery } from "../src/lib/algorithms/mastery";
import { Topic, AssessmentAttempt } from "../src/lib/types";

describe("Topic Mastery Calculation Algorithm", () => {
  const baseTopic: Topic = {
    id: "test-topic-1",
    subjectId: "sub-1",
    userId: "user-1",
    chapterTitle: "Chapter 1",
    title: "Test Invariants",
    confidence: 3,
    masteryScore: 0,
    masteryLevel: "insufficient_evidence",
    masteryReason: "",
    provenance: "syllabus",
    sourceDocumentIds: [],
    questionsAttempted: 0,
    questionsCorrect: 0,
    repeatedErrorPatterns: [],
    isLearned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("flags topic as insufficient_evidence if fewer than 2 questions attempted", () => {
    const singleAttempt: AssessmentAttempt[] = [
      {
        id: "att-1",
        userId: "user-1",
        subjectId: "sub-1",
        assessmentType: "diagnostic",
        title: "Test",
        totalMarks: 25,
        earnedMarks: 25,
        percentageScore: 100,
        completedAt: new Date().toISOString(),
        feedbackSummary: "Good",
        identifiedGaps: [],
        questions: [
          {
            id: "q-1",
            topicId: "test-topic-1",
            topicTitle: "Test Invariants",
            subjectId: "sub-1",
            type: "mcq",
            difficulty: "easy",
            questionText: "Sample question?",
            expectedAnswer: "Ans",
            rubric: [],
            explanation: "Expl",
            citations: [],
            maxMarks: 25,
          },
        ],
        responses: {
          "q-1": {
            questionId: "q-1",
            isCorrect: true,
            scoreAwarded: 25,
            maxMarks: 25,
            gradingRationale: "Correct",
            conceptFeedback: "",
            remedialCitations: [],
            suggestedPractice: "",
          },
        },
      },
    ];

    const result = calculateTopicMastery(baseTopic, singleAttempt);
    expect(result.level).toBe("insufficient_evidence");
    expect(result.reason).toContain("At least 2 verified assessments are required");
  });

  it("classifies topic as weak when weighted performance is below 50%", () => {
    const attempts: AssessmentAttempt[] = [
      {
        id: "att-1",
        userId: "user-1",
        subjectId: "sub-1",
        assessmentType: "diagnostic",
        title: "Test",
        totalMarks: 50,
        earnedMarks: 10,
        percentageScore: 20,
        completedAt: new Date().toISOString(),
        feedbackSummary: "Needs work",
        identifiedGaps: [],
        questions: [
          {
            id: "q-1",
            topicId: "test-topic-1",
            topicTitle: "Test Invariants",
            subjectId: "sub-1",
            type: "mcq",
            difficulty: "medium",
            questionText: "Q1",
            expectedAnswer: "A",
            rubric: [],
            explanation: "E",
            citations: [],
            maxMarks: 25,
          },
          {
            id: "q-2",
            topicId: "test-topic-1",
            topicTitle: "Test Invariants",
            subjectId: "sub-1",
            type: "mcq",
            difficulty: "medium",
            questionText: "Q2",
            expectedAnswer: "B",
            rubric: [],
            explanation: "E",
            citations: [],
            maxMarks: 25,
          },
        ],
        responses: {
          "q-1": {
            questionId: "q-1",
            isCorrect: false,
            scoreAwarded: 0,
            maxMarks: 25,
            gradingRationale: "Confused A with B",
            conceptFeedback: "",
            remedialCitations: [],
            suggestedPractice: "",
          },
          "q-2": {
            questionId: "q-2",
            isCorrect: false,
            scoreAwarded: 5,
            maxMarks: 25,
            gradingRationale: "Partial error",
            conceptFeedback: "",
            remedialCitations: [],
            suggestedPractice: "",
          },
        },
      },
    ];

    const result = calculateTopicMastery(baseTopic, attempts);
    expect(result.level).toBe("weak");
    expect(result.score).toBeLessThan(50);
    expect(result.repeatedErrors.length).toBeGreaterThan(0);
  });
});
