import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchDocumentChunks } from "@/lib/rag/vector-store";
import { initialDemoChunks } from "@/lib/demo-data";

const querySchema = z.object({
  query: z.string().min(2),
  userId: z.string(),
  subjectId: z.string().optional(),
  threshold: z.number().min(0).max(1).optional(),
  maxResults: z.number().int().min(1).max(10).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = querySchema.parse(body);

    const results = searchDocumentChunks(initialDemoChunks, {
      query: parsed.query,
      userId: parsed.userId,
      subjectId: parsed.subjectId,
      threshold: parsed.threshold ?? 0.4,
      maxResults: parsed.maxResults ?? 4,
    });

    return NextResponse.json({
      success: true,
      query: parsed.query,
      matchCount: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid retrieval request" }, { status: 400 });
  }
}
