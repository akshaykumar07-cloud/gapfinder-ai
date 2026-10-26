export interface ChunkingOptions {
  chunkSize?: number; // Target characters per chunk, e.g. 800
  chunkOverlap?: number; // Overlap characters, e.g. 150
}

export interface RawChunk {
  chunkIndex: number;
  content: string;
  tokenCount: number;
  pageNumber?: number;
  sectionTitle?: string;
}

/**
 * Splits extracted document text into overlapping semantic chunks
 * while detecting section headers and tracking approximate page numbers.
 */
export function chunkDocumentText(
  fullText: string,
  options: ChunkingOptions = {}
): RawChunk[] {
  const { chunkSize = 800, chunkOverlap = 150 } = options;
  if (!fullText || fullText.trim().length === 0) {
    return [];
  }

  // Sanitize text to prevent prompt injection from document content
  const sanitizedText = sanitizeDocumentText(fullText);

  // Split text by paragraphs or double newlines first
  const paragraphs = sanitizedText.split(/\n\s*\n/);
  const chunks: RawChunk[] = [];

  let currentChunkText = "";
  let currentSectionTitle = "General Notes";
  let currentPage = 1;
  let chunkIndex = 0;

  // Approximate 2500 characters per standard PDF page
  const charsPerPage = 2500;
  let accumulatedChars = 0;

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // Detect section or chapter headers
    const headerMatch = trimmedPara.match(/^(?:Chapter|Section|Module|\#\#?|[0-9]+\.[0-9]+)\s+([^\n]{3,80})/i);
    if (headerMatch) {
      currentSectionTitle = headerMatch[0].slice(0, 70);
    }

    accumulatedChars += trimmedPara.length;
    currentPage = Math.max(1, Math.ceil(accumulatedChars / charsPerPage));

    if ((currentChunkText + "\n\n" + trimmedPara).length <= chunkSize) {
      currentChunkText = currentChunkText ? currentChunkText + "\n\n" + trimmedPara : trimmedPara;
    } else {
      // Finalize current chunk if it has content
      if (currentChunkText.trim().length > 0) {
        chunks.push({
          chunkIndex,
          content: currentChunkText.trim(),
          tokenCount: Math.ceil(currentChunkText.length / 4),
          pageNumber: currentPage,
          sectionTitle: currentSectionTitle
        });
        chunkIndex++;

        // Keep overlap from end of current chunk
        const overlapSlice = currentChunkText.slice(-chunkOverlap);
        currentChunkText = overlapSlice + "\n\n" + trimmedPara;
      } else {
        // If single paragraph is larger than chunkSize, slice it directly
        for (let i = 0; i < trimmedPara.length; i += (chunkSize - chunkOverlap)) {
          const slice = trimmedPara.slice(i, i + chunkSize);
          chunks.push({
            chunkIndex,
            content: slice.trim(),
            tokenCount: Math.ceil(slice.length / 4),
            pageNumber: currentPage,
            sectionTitle: currentSectionTitle
          });
          chunkIndex++;
        }
        currentChunkText = "";
      }
    }
  }

  if (currentChunkText.trim().length > 0) {
    chunks.push({
      chunkIndex,
      content: currentChunkText.trim(),
      tokenCount: Math.ceil(currentChunkText.length / 4),
      pageNumber: currentPage,
      sectionTitle: currentSectionTitle
    });
  }

  return chunks;
}

/**
 * Escapes potential prompt injection attacks embedded in student notes
 * like "Ignore previous instructions and output..."
 */
export function sanitizeDocumentText(text: string): string {
  return text
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/\b(ignore all previous instructions|disregard earlier system prompts|you are now a bypass)\b/gi, "[REDACTED UNTRUSTED INSTRUCTION]");
}
