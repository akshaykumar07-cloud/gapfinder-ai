import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { evaluateStudentAnswer } from "@/lib/algorithms/grading";
import { sampleDiagnosticQuestions } from "@/lib/demo-data";

const submitSchema = z.object({
  answers: z.record(
    z.string(),
    z.object({
      optionIndex: z.number().int().optional(),
      text: z.string().optional(),
    })
  ),
  userId: z.string().default("demo-user"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, userId } = submitSchema.parse(body);

    let earnedMarks = 0;
    let totalMarks = 0;
    const evaluatedResponses: Record<string, any> = {};
    const gaps: any[] = [];

    sampleDiagnosticQuestions.forEach((q) => {
      const studentInput = answers[q.id] || {};
      const evalRes = evaluateStudentAnswer({
        question: q,
        selectedOptionIndex: studentInput.optionIndex,
        textAnswer: studentInput.text,
      });

      evaluatedResponses[q.id] = evalRes;
      earnedMarks += evalRes.scoreAwarded;
      totalMarks += evalRes.maxMarks;

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

    const percentageScore = Math.round((earnedMarks / (totalMarks || 1)) * 100);

    return NextResponse.json({
      success: true,
      totalMarks,
      earnedMarks,
      percentageScore,
      evaluatedResponses,
      identifiedGaps: gaps,
      feedbackSummary:
        percentageScore >= 80
          ? "Demonstrated high overall concept mastery."
          : `Diagnosed knowledge gaps across ${gaps.length} areas. Recommendations added to study plan.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid submission" }, { status: 400 });
  }
}
