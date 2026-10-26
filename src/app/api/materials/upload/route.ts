import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractTextFromFile } from "@/lib/rag/extractor";
import { chunkDocumentText } from "@/lib/rag/chunker";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subjectId = (formData.get("subjectId") as string) || "sub-cs301";
    const userId = (formData.get("userId") as string) || "demo-user";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Size constraint: 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 25MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Text extraction
    const { text, pagesCount } = await extractTextFromFile(buffer, file.type, file.name);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract readable text from document." },
        { status: 422 }
      );
    }

    // Chunking with meaningful overlap
    const rawChunks = chunkDocumentText(text, {
      chunkSize: 750,
      chunkOverlap: 150,
    });

    const docId = `doc-${Date.now()}`;
    const documentRecord = {
      id: docId,
      userId,
      subjectId,
      filename: file.name,
      originalName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type || "application/pdf",
      processingStatus: "indexed",
      totalChunks: rawChunks.length,
      totalCharacters: text.length,
      extractedTextSnippet: text.slice(0, 300),
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    const chunks = rawChunks.map((rc) => ({
      id: `chunk-${docId}-${rc.chunkIndex}`,
      documentId: docId,
      subjectId,
      userId,
      chunkIndex: rc.chunkIndex,
      content: rc.content,
      tokenCount: rc.tokenCount,
      pageNumber: rc.pageNumber,
      sectionTitle: rc.sectionTitle,
      metadata: { documentName: file.name },
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      document: documentRecord,
      chunks,
      extractedPagesCount: pagesCount,
    });
  } catch (err: any) {
    console.error("Material upload error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
