import { describe, it, expect } from "vitest";
import { chunkDocumentText } from "../src/lib/rag/chunker";
import { searchDocumentChunks } from "../src/lib/rag/vector-store";
import { validateCitations } from "../src/lib/rag/citations";
import { DocumentChunk, StudyDocument } from "../src/lib/types";

describe("RAG Pipeline & Document Indexing", () => {
  it("splits text into chunks with meaningful overlap and preserves section headers", () => {
    const text = `Chapter 1: Storage Invariants\n\nSection 1.1: WAL Rules\nParagraph 1 describing WAL rules and memory buffers.\n\nParagraph 2 explaining crash recovery and checkpointing.`;
    const chunks = chunkDocumentText(text, { chunkSize: 120, chunkOverlap: 30 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].sectionTitle).toContain("Section 1.1");
    expect(chunks[0].content.length).toBeGreaterThan(0);
  });

  it("isolates retrieval strictly between students", () => {
    const chunks: DocumentChunk[] = [
      {
        id: "c-1",
        documentId: "d-1",
        subjectId: "sub-1",
        userId: "student-A",
        chunkIndex: 0,
        content: "Two phase locking ensures conflict serializability.",
        tokenCount: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: "c-2",
        documentId: "d-2",
        subjectId: "sub-1",
        userId: "student-B",
        chunkIndex: 0,
        content: "Two phase locking ensures conflict serializability.",
        tokenCount: 10,
        createdAt: new Date().toISOString(),
      },
    ];

    const resultsA = searchDocumentChunks(chunks, {
      query: "locking",
      userId: "student-A",
      threshold: 0.1,
    });

    expect(resultsA.length).toBe(1);
    expect(resultsA[0].chunk.userId).toBe("student-A");
  });

  it("filters out fabricated citations that do not exist in document library", () => {
    const docs: StudyDocument[] = [
      {
        id: "doc-real",
        userId: "user-1",
        subjectId: "sub-1",
        filename: "notes.pdf",
        originalName: "notes.pdf",
        fileSizeBytes: 1000,
        fileType: "application/pdf",
        processingStatus: "indexed",
        totalChunks: 1,
        totalCharacters: 100,
        createdAt: new Date().toISOString(),
      },
    ];

    const candidateCitations = [
      {
        documentId: "doc-real",
        documentName: "notes.pdf",
        relevantExcerpt: "Real text",
      },
      {
        documentId: "doc-fake-nonexistent",
        documentName: "fake.pdf",
        relevantExcerpt: "Fabricated excerpt",
      },
    ];

    const validated = validateCitations(candidateCitations, [], docs);
    expect(validated.length).toBe(1);
    expect(validated[0].documentId).toBe("doc-real");
  });
});
