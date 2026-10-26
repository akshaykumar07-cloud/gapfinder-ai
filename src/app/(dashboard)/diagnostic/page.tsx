"use client";

import React, { useState } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CitationBadge } from "@/components/ui/citation-badge";
import { evaluateStudentAnswer } from "@/lib/algorithms/grading";
import { Question, StudentResponse, AssessmentAttempt } from "@/lib/types";

export default function DiagnosticQuizPage() {
  const { state, recordAssessmentAttempt } = useGapFinderStore();
  const { diagnosticQuestions } = state;

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, { optionIndex?: number; text?: string }>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<AssessmentAttempt | null>(null);

  const currentQ = diagnosticQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === diagnosticQuestions.length - 1;

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: { ...selectedAnswers[qId], optionIndex: optIndex },
    });
  };

  const handleTextAnswerChange = (qId: string, text: string) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: { ...selectedAnswers[qId], text },
    });
  };

  const handleSubmitQuiz = () => {
    let earnedMarks = 0;
    let totalMarks = 0;
    const evaluatedResponses: Record<string, StudentResponse> = {};
    const gaps: AssessmentAttempt["identifiedGaps"] = [];

    diagnosticQuestions.forEach((q) => {
      const studentInput = selectedAnswers[q.id] || {};
      const evalResult = evaluateStudentAnswer({
        question: q,
        selectedOptionIndex: studentInput.optionIndex,
        textAnswer: studentInput.text,
      });

      evaluatedResponses[q.id] = evalResult;
      earnedMarks += evalResult.scoreAwarded;
      totalMarks += evalResult.maxMarks;

      if (!evalResult.isCorrect) {
        gaps.push({
          topicId: q.topicId,
          topicTitle: q.topicTitle,
          scorePercent: Math.round((evalResult.scoreAwarded / evalResult.maxMarks) * 100),
          feedback: evalResult.conceptFeedback,
          suggestedAction: evalResult.suggestedPractice,
        });
      }
    });

    const percentage = Math.round((earnedMarks / (totalMarks || 1)) * 100);

    const attempt: AssessmentAttempt = {
      id: `attempt-${Date.now()}`,
      userId: state.profile.id,
      subjectId: "sub-cs301",
      assessmentType: "diagnostic",
      title: "Diagnostic Assessment: Concurrency & Storage Invariants",
      totalMarks,
      earnedMarks,
      percentageScore: percentage,
      questions: diagnosticQuestions,
      responses: evaluatedResponses,
      completedAt: new Date().toISOString(),
      feedbackSummary:
        percentage >= 80
          ? "Solid overall understanding! Identified minor edge-cases to reinforce."
          : `Diagnosed knowledge gaps in ${gaps.length} areas. High priority given to Two-Phase Locking and ARIES recovery in your study plan.`,
      identifiedGaps: gaps,
    };

    recordAssessmentAttempt(attempt, evaluatedResponses);
    setLastAttempt(attempt);
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setLastAttempt(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Diagnostic Assessment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated questions generated from your uploaded study materials. Free-text questions are graded using rubric criteria.
          </p>
        </div>

        {isSubmitted && (
          <button
            onClick={handleRetake}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Diagnostic</span>
          </button>
        )}
      </div>

      {/* If Not Submitted: Question Runner */}
      {!isSubmitted && (
        <div className="space-y-6">
          {/* Question Stepper Indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
            <span className="font-semibold text-slate-600">
              Question {currentQuestionIndex + 1} of {diagnosticQuestions.length}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-slate-400">
              {diagnosticQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                    idx === currentQuestionIndex
                      ? "bg-brand-600 text-white"
                      : selectedAnswers[diagnosticQuestions[idx].id]
                      ? "bg-brand-100 text-brand-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Question Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {currentQ.topicTitle}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {currentQ.maxMarks} Marks • {currentQ.difficulty.toUpperCase()}
                </span>
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Type: Multiple Choice */}
              {currentQ.type === "mcq" && currentQ.options && (
                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQ.id]?.optionIndex === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full text-left p-4 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-brand-50/80 border-brand-500 text-brand-900 ring-2 ring-brand-500/20 shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                            isSelected
                              ? "bg-brand-600 border-brand-600 text-white"
                              : "border-slate-300 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type: Numerical or Short Answer */}
              {(currentQ.type === "short_answer" || currentQ.type === "numerical") && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    {currentQ.type === "numerical" ? "Enter Numerical Value:" : "Write your concise answer:"}
                  </label>
                  <textarea
                    rows={currentQ.type === "numerical" ? 2 : 4}
                    placeholder={
                      currentQ.type === "numerical"
                        ? "e.g. 98"
                        : "Explain the mechanism step-by-step..."
                    }
                    value={selectedAnswers[currentQ.id]?.text || ""}
                    onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {currentQ.type === "short_answer" && (
                    <div className="text-[11px] text-slate-400">
                      💡 Graded against syllabus rubric criteria: range queries, row locks, and query re-execution.
                    </div>
                  )}
                </div>
              )}

              {/* Question Navigation Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>

                {isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-md shadow-brand-600/30 transition-all flex items-center gap-2"
                  >
                    <span>Submit Diagnostic for Grading</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* If Submitted: Full Feedback, Citations & Grading Breakdown */}
      {isSubmitted && lastAttempt && (
        <div className="space-y-6">
          {/* Result Banner */}
          <Card className="border-slate-200 bg-gradient-to-r from-brand-900 via-indigo-950 to-navy-950 text-white shadow-md">
            <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/20">
                  <Award className="w-3.5 h-3.5 text-brand-400" />
                  Assessment Evaluated
                </div>
                <h3 className="text-2xl font-bold">
                  Diagnostic Score: {lastAttempt.percentageScore}%
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {lastAttempt.feedbackSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-center shrink-0 space-y-1">
                <div className="text-3xl font-black font-mono text-emerald-400">
                  {lastAttempt.earnedMarks} / {lastAttempt.totalMarks}
                </div>
                <div className="text-[11px] text-slate-300">Total Marks Awarded</div>
              </div>
            </CardContent>
          </Card>

          {/* Question-by-Question Deep Feedback */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              Evidence-Grounded Question Breakdown
            </h3>

            {diagnosticQuestions.map((q, idx) => {
              const resp = lastAttempt.responses[q.id];
              return (
                <Card
                  key={q.id}
                  className={`border transition-all ${
                    resp?.isCorrect
                      ? "border-emerald-200 bg-white"
                      : "border-rose-200 bg-rose-50/20"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-500">
                          Q{idx + 1}.
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {q.topicTitle}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          resp?.isCorrect
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {resp?.isCorrect ? "Correct" : "Gap Detected"} • {resp?.scoreAwarded}/{resp?.maxMarks} marks
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900 mt-1">
                      {q.questionText}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    {/* Student Answer vs Expected Answer */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                      <div>
                        <span className="font-bold text-slate-700">Your Answer: </span>
                        <span className={resp?.isCorrect ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>
                          {q.type === "mcq" && resp?.selectedOptionIndex !== undefined && q.options
                            ? q.options[resp.selectedOptionIndex]
                            : resp?.textAnswer || "No answer submitted"}
                        </span>
                      </div>
                      {!resp?.isCorrect && (
                        <div>
                          <span className="font-bold text-slate-700">Expected Syllabus Answer: </span>
                          <span className="text-slate-900 font-medium">{q.expectedAnswer}</span>
                        </div>
                      )}
                    </div>

                    {/* Rationale and Concept Feedback */}
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800">Grading Rationale & Rubric:</span>
                      <p className="text-slate-600 leading-relaxed">{resp?.gradingRationale}</p>
                    </div>

                    {/* Explanatory Concept */}
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800">Why Expected Answer is Better:</span>
                      <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                    </div>

                    {/* Authentic Source Citations */}
                    <CitationBadge citations={q.citations} />

                    {/* Suggested Practice */}
                    {resp?.suggestedPractice && (
                      <div className="text-[11px] text-brand-800 bg-brand-50/70 p-2.5 rounded-lg border border-brand-200/50">
                        <strong>Suggested Follow-up: </strong>
                        {resp.suggestedPractice}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
