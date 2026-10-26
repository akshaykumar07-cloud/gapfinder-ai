import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchDocumentChunks } from "@/lib/rag/vector-store";
import { isGeminiConfigured, generateGeminiText } from "@/lib/ai/gemini";
import { generateMockTutorResponse } from "@/lib/ai/mock-ai";
import { initialDemoChunks } from "@/lib/demo-data";

const tutorRequestSchema = z.object({
  query: z.string().min(2),
  topicTitle: z.string().default("Distributed Systems"),
  subjectId: z.string().default("sub-cs301"),
  userId: z.string().default("demo-user-student-01"),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topicTitle, subjectId, userId, difficultyLevel } = tutorRequestSchema.parse(body);

    // 1. Vector Retrieval isolated to authenticated student
    const retrievalResults = searchDocumentChunks(initialDemoChunks, {
      query,
      userId,
      subjectId,
      threshold: 0.35,
      maxResults: 3,
    });

    const citations = retrievalResults.map((r) => r.citation);

    // Check if sufficient evidence exists
    if (citations.length === 0) {
      return NextResponse.json({
        content: `⚠️ **Insufficient Grounding Material**: The uploaded study materials for this subject do not contain enough relevant text to ground an answer for "${query}".\n\nTo ensure academic precision and prevent hallucinations, please upload your course notes or textbook chapter covering this topic.`,
        citations: [],
        isUnsupported: true,
      });
    }

    // 2. Generation: Live Gemini if configured, else deterministic Mock RAG
    if (isGeminiConfigured) {
      try {
        const contextPassages = citations
          .map(
            (c, i) =>
              `[Source ${i + 1}] (${c.documentName}, ${c.sectionTitle}, Page ${c.pageNumber}):\n"${c.relevantExcerpt}"`
          )
          .join("\n\n");

        const systemPrompt = `You are an expert academic tutor for GapFinder AI. You are strictly grounded in the student's uploaded course materials.
You must ONLY state facts supported by the provided source passages.
Never fabricate page numbers, titles, or citations.
If the student asks something not supported by the passages, tell them clearly that the notes do not specify this.
Tone: Encouraging, rigorous, student-focused. Difficulty level: ${difficultyLevel}.`;

        const userPrompt = `Retrieved Course Materials:\n${contextPassages}\n\nStudent Question regarding ${topicTitle}:\n"${query}"\n\nExplain the concept clearly and reference the source passages.`;

        const generatedText = await generateGeminiText(systemPrompt, userPrompt);

        return NextResponse.json({
          content: generatedText,
          citations,
          isUnsupported: false,
        });
      } catch (geminiErr: any) {
        console.warn("Live Gemini generation error, using deterministic fallback:", geminiErr?.message);
      }
    }

    // Deterministic Mock RAG response
    const mockRes = generateMockTutorResponse({
      topicTitle,
      query,
      citations,
    });

    return NextResponse.json(mockRes);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 400 });
  }
}
