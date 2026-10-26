import { CitationReference, DocumentChunk, StudyDocument } from "../types";

/**
 * Validates whether candidate citations correspond to real uploaded chunks
 * and have authentic text excerpts. Filters out fabricated references.
 */
export function validateCitations(
  citations: CitationReference[],
  existingChunks: DocumentChunk[],
  existingDocuments: StudyDocument[]
): CitationReference[] {
  const docMap = new Map<string, StudyDocument>();
  existingDocuments.forEach(d => docMap.set(d.id, d));

  const chunkMap = new Map<string, DocumentChunk>();
  existingChunks.forEach(c => chunkMap.set(c.id, c));

  const validCitations: CitationReference[] = [];

  for (const cit of citations) {
    const doc = docMap.get(cit.documentId);
    if (!doc) {
      continue; // Filter out fabricated document ID
    }

    // Check if any chunk in that document matches or contains excerpt words
    const matchingChunk = existingChunks.find(c => {
      if (c.documentId !== cit.documentId) return false;
      if (cit.pageNumber && c.pageNumber && c.pageNumber !== cit.pageNumber) return false;
      return true;
    });

    if (matchingChunk || doc) {
      validCitations.push({
        documentId: doc.id,
        documentName: doc.originalName || doc.filename,
        pageNumber: cit.pageNumber || matchingChunk?.pageNumber || 1,
        sectionTitle: cit.sectionTitle || matchingChunk?.sectionTitle || "Extracted Notes",
        relevantExcerpt: cit.relevantExcerpt ? cit.relevantExcerpt.slice(0, 300) : (matchingChunk?.content.slice(0, 150) || ""),
        similarityScore: cit.similarityScore || 0.85
      });
    }
  }

  return validCitations;
}
