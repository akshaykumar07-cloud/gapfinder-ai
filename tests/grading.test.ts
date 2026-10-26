import { describe, it, expect } from "vitest";
import { evaluateStudentAnswer } from "../src/lib/algorithms/grading";
import { Question } from "../src/lib/types";

describe("Question Evaluation & Grading", () => {
  const sampleMCQ: Question = {
    id: "q-mcq-1",
    topicId: "top-1",
    topicTitle: "Two-Phase Locking",
    subjectId: "sub-1",
    type: "mcq",
    difficulty: "medium",
    questionText: "What does Strict 2PL prevent?",
    options: ["Deadlocks", "Cascading aborts", "Serializability", "Starvation"],
    correctOptionIndex: 1,
    expectedAnswer: "Cascading aborts",
    rubric: [{ criteria: "Correctly identifies cascading aborts", points: 25 }],
    explanation: "Strict 2PL holds write locks until commit.",
    citations: [],
    maxMarks: 25,
  };

  const sampleNumerical: Question = {
    id: "q-num-1",
    topicId: "top-2",
    topicTitle: "ARIES Recovery",
    subjectId: "sub-1",
    type: "numerical",
    difficulty: "easy",
    questionText: "What is min recLSN?",
    expectedAnswer: "98",
    rubric: [{ criteria: "Calculates 98", points: 25 }],
    explanation: "Smallest recLSN is 98.",
    citations: [],
    maxMarks: 25,
  };

  it("grades MCQ accurately against answer key", () => {
    const correctRes = evaluateStudentAnswer({
      question: sampleMCQ,
      selectedOptionIndex: 1,
    });
    expect(correctRes.isCorrect).toBe(true);
    expect(correctRes.scoreAwarded).toBe(25);

    const wrongRes = evaluateStudentAnswer({
      question: sampleMCQ,
      selectedOptionIndex: 0,
    });
    expect(wrongRes.isCorrect).toBe(false);
    expect(wrongRes.scoreAwarded).toBe(0);
  });

  it("grades numerical answer accurately with string trimming", () => {
    const res = evaluateStudentAnswer({
      question: sampleNumerical,
      textAnswer: " 98 ",
    });
    expect(res.isCorrect).toBe(true);
    expect(res.scoreAwarded).toBe(25);
  });
});
