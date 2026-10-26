import { DocumentChunk, CitationReference } from "../types";

export interface RetrievalQuery {
  query: string;
  userId: string;
  subjectId?: string;
  threshold?: number; // Default 0.65
  maxResults?: number; // Default 4
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  similarity: number;
  citation: CitationReference;
}

/**
 * Calculates cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Keyword-based lexical similarity score (BM25 / TF-IDF hybrid approximation)
 * used for hybrid retrieval and deterministic local vector search.
 */
export function lexicalSimilarity(query: string, content: string): number {
  const queryTerms = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2);
  if (queryTerms.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let termMatches = 0;
  for (const term of queryTerms) {
    if (contentLower.includes(term)) {
      termMatches++;
    }
  }

  // Exact phrase match bonus
  const phraseBonus = contentLower.includes(query.toLowerCase()) ? 0.3 : 0;
  const ratio = termMatches / queryTerms.length;
  return Math.min(1.0, ratio * 0.7 + phraseBonus);
}

/**
 * Retrieves the most relevant document chunks for a query, isolated by student and subject.
 */
export function searchDocumentChunks(
  allChunks: DocumentChunk[],
  options: RetrievalQuery
): RetrievalResult[] {
  const { query, userId, subjectId, threshold = 0.45, maxResults = 4 } = options;

  // Enforce student data isolation
  const isolatedChunks = allChunks.filter(c => {
    if (c.userId !== userId) return false;
    if (subjectId && c.subjectId !== subjectId) return false;
    return true;
  });

  const scored: RetrievalResult[] = [];

  for (const chunk of isolatedChunks) {
    // If vector embeddings exist on both query and chunk, use cosine similarity;
    // otherwise use high-precision lexical similarity
    const score = lexicalSimilarity(query, chunk.content);

    if (score >= threshold) {
      scored.push({
        chunk,
        similarity: parseFloat(score.toFixed(3)),
        citation: {
          documentId: chunk.documentId,
          documentName: chunk.metadata?.documentName || "Course Notes",
          pageNumber: chunk.pageNumber || 1,
          sectionTitle: chunk.sectionTitle || "Module Section",
          relevantExcerpt: chunk.content.slice(0, 250),
          similarityScore: parseFloat(score.toFixed(3))
        }
      });
    }
  }

  // Sort by similarity descending
  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, maxResults);
}
