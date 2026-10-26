"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGapFinderStore } from "@/lib/db/store";
import {
  FileCheck2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  TrendingUp,
  Award,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CitationBadge } from "@/components/ui/citation-badge";
import { evaluateStudentAnswer } from "@/lib/algorithms/grading";
import { formatDate } from "@/lib/utils";
import { Question, StudentResponse, AssessmentAttempt } from "@/lib/types";

export default function WeeklyTestsPage() {
  const { state, recordAssessmentAttempt } = useGapFinderStore();
  const { weeklyTestQuestions, assessmentHistory } = state;

  const [isTakingTest, setIsTakingTest] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, { optionIndex?: number; text?: string }>>({});
  const [testComplete, setTestComplete] = useState(false);
  const [lastWeeklyAttempt, setLastWeeklyAttempt] = useState<AssessmentAttempt | null>(null);

  const currentQ = weeklyTestQuestions[currentIdx];

  const handleSelectOption = (qId: string, optIndex: number) => {
    setUserAnswers({
      ...userAnswers,
      [qId]: { ...userAnswers[qId], optionIndex: optIndex },
    });
  };

  const handleTextAnswer = (qId: string, text: string) => {
    setUserAnswers({
      ...userAnswers,
      [qId]: { ...userAnswers[qId], text },
    });
  };

  const handleSubmitTest = () => {
    let earned = 0;
    let total = 0;
    const evaluatedResponses: Record<string, StudentResponse> = {};
    const gaps: AssessmentAttempt["identifiedGaps"] = [];

    weeklyTestQuestions.forEach((q) => {
      const ans = userAnswers[q.id] || {};
      const evalRes = evaluateStudentAnswer({
        question: q,
        selectedOptionIndex: ans.optionIndex,
        textAnswer: ans.text,
      });

      evaluatedResponses[q.id] = evalRes;
      earned += evalRes.scoreAwarded;
      total += evalRes.maxMarks;

      if (!evalRes.isCorrect) {
        gaps.push({
          topicId: q.topicId,
          topicTitle: q.topicTitle,
          scorePercent: Math.round((evalRes.scoreAwarded / evalRes.maxMarks) * 100),
          feedback: evalRes.conceptFeedback,
          suggestedAction: evalRes.suggestedPractice,
        });
      }
    });

    const percentage = Math.round((earned / (total || 1)) * 100);

    const attempt: AssessmentAttempt = {
      id: `attempt-weekly-${Date.now()}`,
      userId: state.profile.id,
      subjectId: "sub-cs301",
      assessmentType: "weekly_test",
      title: "Weekly Assessment: Concurrency & Consensus Checkpoint",
      totalMarks: total,
      earnedMarks: earned,
      percentageScore: percentage,
      questions: weeklyTestQuestions,
      responses: evaluatedResponses,
      completedAt: new Date().toISOString(),
      feedbackSummary: `Weekly checkpoint completed at ${percentage}%. Topic mastery and spaced revision schedules have been recalculated.`,
      identifiedGaps: gaps,
    };

    recordAssessmentAttempt(attempt, evaluatedResponses);
    setLastWeeklyAttempt(attempt);
    setTestComplete(true);
    setIsTakingTest(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Weekly Tests & Adaptive Evaluations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periodic assessments to measure retention, eliminate persistent errors, and automatically adjust upcoming revision sessions.
          </p>
        </div>

        {!isTakingTest && (
          <button
            onClick={() => {
              setIsTakingTest(true);
              setTestComplete(false);
              setCurrentIdx(0);
              setUserAnswers({});
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Weekly Test</span>
          </button>
        )}
      </div>

      {/* Taking Weekly Test Mode */}
      {isTakingTest && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-1 pb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-600">
                Question {currentIdx + 1} of {weeklyTestQuestions.length}
              </span>
              <span className="font-mono text-slate-500">
                {currentQ.difficulty.toUpperCase()} • {currentQ.maxMarks} Marks
              </span>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {currentQ.type === "mcq" && currentQ.options && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, i) => {
                  const isSelected = userAnswers[currentQ.id]?.optionIndex === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, i)}
                      className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-start gap-3 ${
                        isSelected
                          ? "bg-brand-50/80 border-brand-500 text-brand-900 ring-2 ring-brand-500/20 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                          isSelected
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "border-slate-300 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === "short_answer" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  State your concise answer:
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain the invariant..."
                  value={userAnswers[currentQ.id]?.text || ""}
                  onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>

              {currentIdx === weeklyTestQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="px-6 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm flex items-center gap-2"
                >
                  <span>Submit Weekly Test</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Banner */}
      {testComplete && lastWeeklyAttempt && (
        <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Weekly Test Graded: {lastWeeklyAttempt.percentageScore}%
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {lastWeeklyAttempt.feedbackSummary} Your future revision tasks have been rebalanced to focus on any remaining errors.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/planner"
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                View Updated Study Plan
              </Link>
              <Link
                href="/gaps"
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Inspect Topic Gaps
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Assessments History Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            Assessment History ({assessmentHistory.length} attempts recorded)
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of all diagnostic quizzes and weekly milestone evaluations.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4">Completed Date</th>
                  <th className="py-3 px-4">Identified Gaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessmentHistory.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {att.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {att.assessmentType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold text-xs ${
                          att.percentageScore >= 80
                            ? "text-emerald-600"
                            : att.percentageScore >= 50
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {att.percentageScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {att.earnedMarks} / {att.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(att.completedAt)}
                    </td>
                    <td className="py-3 px-4">
                      {att.identifiedGaps.length === 0 ? (
                        <span className="text-[11px] text-emerald-600 font-medium">No gaps detected</span>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-semibold">
                          {att.identifiedGaps.length} weak areas diagnosed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
