import { Question, StudentResponse } from "../types";

export interface GradeInput {
  question: Question;
  selectedOptionIndex?: number;
  textAnswer?: string;
}

export function evaluateStudentAnswer(input: GradeInput): StudentResponse {
  const { question, selectedOptionIndex, textAnswer } = input;
  const maxMarks = question.maxMarks || 25;

  // 1. Multiple Choice Question (MCQ) Evaluation
  if (question.type === "mcq") {
    const isCorrect = selectedOptionIndex !== undefined && selectedOptionIndex === question.correctOptionIndex;
    const scoreAwarded = isCorrect ? maxMarks : 0;

    let gradingRationale = "";
    let conceptFeedback = "";

    if (isCorrect) {
      gradingRationale = `Correct! Selected option ${selectedOptionIndex !== undefined ? `[${selectedOptionIndex + 1}]` : ''} matches the validated syllabus key.`;
      conceptFeedback = `Great work on "${question.topicTitle}". You accurately identified the correct mechanism.`;
    } else {
      const chosenText = selectedOptionIndex !== undefined && question.options 
        ? `"${question.options[selectedOptionIndex]}"` 
        : "no option chosen";
      const correctText = question.correctOptionIndex !== undefined && question.options
        ? `"${question.options[question.correctOptionIndex]}"`
        : question.expectedAnswer;

      gradingRationale = `Incorrect. You chose ${chosenText}, but the correct choice is ${correctText}.`;
      conceptFeedback = `Review ${question.explanation}`;
    }

    return {
      questionId: question.id,
      selectedOptionIndex,
      isCorrect,
      scoreAwarded,
      maxMarks,
      gradingRationale,
      conceptFeedback,
      remedialCitations: isCorrect ? [] : question.citations,
      suggestedPractice: isCorrect 
        ? `Proceed to next topic or challenge level.` 
        : `Review cited passage in ${question.citations[0]?.documentName || 'notes'} and attempt targeted exercises.`
    };
  }

  // 2. Numerical Question Evaluation
  if (question.type === "numerical") {
    const cleanAnswer = (textAnswer || "").trim().toLowerCase();
    const cleanExpected = question.expectedAnswer.trim().toLowerCase();
    
    // Check exact match or numerical parse match
    const numAns = parseFloat(cleanAnswer.replace(/[^0-9.-]/g, ''));
    const numExp = parseFloat(cleanExpected.replace(/[^0-9.-]/g, ''));

    const isMatch = cleanAnswer === cleanExpected || (!isNaN(numAns) && !isNaN(numExp) && Math.abs(numAns - numExp) < 0.001);

    return {
      questionId: question.id,
      textAnswer,
      isCorrect: isMatch,
      scoreAwarded: isMatch ? maxMarks : 0,
      maxMarks,
      gradingRationale: isMatch 
        ? `Correct numerical value: ${cleanAnswer}. Matches expected result ${cleanExpected}.`
        : `Calculated ${cleanAnswer || 'blank'}, expected ${cleanExpected}.`,
      conceptFeedback: isMatch
        ? `Solid quantitative computation for ${question.topicTitle}.`
        : `Calculation discrepancy. ${question.explanation}`,
      remedialCitations: isMatch ? [] : question.citations,
      suggestedPractice: isMatch 
        ? "Advance to practical problem set." 
        : `Check the formula in ${question.citations[0]?.sectionTitle || 'study material'}.`
    };
  }

  // 3. Short Answer / Free Text Evaluation (Rubric-grounded grading)
  const answer = (textAnswer || "").trim();
  if (!answer) {
    return {
      questionId: question.id,
      textAnswer: "",
      isCorrect: false,
      scoreAwarded: 0,
      maxMarks,
      gradingRationale: "No answer provided. (0 marks awarded)",
      conceptFeedback: `Topic: ${question.topicTitle}. Expected answer: ${question.expectedAnswer}`,
      remedialCitations: question.citations,
      suggestedPractice: "Read the cited section and formulate an explanation."
    };
  }

  // Check key rubric criteria matches
  let earnedPoints = 0;
  const matchedCriteria: string[] = [];
  const missedCriteria: string[] = [];

  const lowerAns = answer.toLowerCase();

  // Extract core keywords from expected answer & rubric
  for (const criterion of question.rubric) {
    const words = criterion.criteria
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(' ')
      .filter(w => w.length > 4);

    const matchCount = words.filter(w => lowerAns.includes(w)).length;
    const ratio = words.length > 0 ? matchCount / words.length : 0;

    if (ratio >= 0.35 || lowerAns.includes(criterion.criteria.toLowerCase().slice(0, 15))) {
      earnedPoints += criterion.points;
      matchedCriteria.push(criterion.criteria);
    } else {
      missedCriteria.push(criterion.criteria);
    }
  }

  // Fallback points if criteria didn't match directly but answer is substantial
  if (earnedPoints === 0 && answer.length > 40) {
    earnedPoints = Math.round(maxMarks * 0.3); // partial effort credit
  }

  const clampedScore = Math.min(maxMarks, earnedPoints);
  const isPassing = clampedScore >= maxMarks * 0.7;

  let rationale = `Earned ${clampedScore}/${maxMarks} marks based on syllabus rubric evaluation.`;
  if (matchedCriteria.length > 0) {
    rationale += ` Criteria satisfied: "${matchedCriteria.join('", "')}".`;
  }
  if (missedCriteria.length > 0) {
    rationale += ` Missing or incomplete: "${missedCriteria.join('", "')}".`;
  }

  return {
    questionId: question.id,
    textAnswer: answer,
    isCorrect: isPassing,
    scoreAwarded: clampedScore,
    maxMarks,
    gradingRationale: rationale,
    conceptFeedback: isPassing
      ? `Strong explanation demonstrating core concepts. ${question.explanation}`
      : `Incomplete definition. Why expected answer is better: ${question.expectedAnswer}`,
    remedialCitations: isPassing ? [] : question.citations,
    suggestedPractice: isPassing
      ? "Good conceptual grasp! Continue with application problems."
      : `Review ${question.citations[0]?.sectionTitle || 'syllabus material'} to solidify missing criteria.`
  };
}
