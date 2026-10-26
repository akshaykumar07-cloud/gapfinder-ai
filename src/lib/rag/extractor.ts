/**
 * Document Text Extractor for PDF and Text files
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileType: string,
  filename: string
): Promise<{ text: string; pagesCount?: number }> {
  // If text or markdown file
  if (fileType.includes("text/") || filename.endsWith(".txt") || filename.endsWith(".md")) {
    const text = fileBuffer.toString("utf-8");
    return { text, pagesCount: 1 };
  }

  // If PDF file
  if (fileType === "application/pdf" || filename.endsWith(".pdf")) {
    try {
      // Dynamic import to avoid bundling issues in certain environments
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(fileBuffer);
      return {
        text: pdfData.text,
        pagesCount: pdfData.numpages || 1,
      };
    } catch (err: any) {
      console.warn("pdf-parse primary parser error, using stream fallback:", err?.message);
      // Fallback: extract visible ASCII/UTF-8 streams from PDF buffer
      const raw = fileBuffer.toString("latin1");
      const textChunks: string[] = [];
      const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let match;
      while ((match = streamRegex.exec(raw)) !== null) {
        const streamData = match[1];
        // Extract text between parentheses in Tj and TJ operators
        const tjMatches = streamData.match(/\((.*?)\)\s*Tj/g);
        if (tjMatches) {
          const streamText = tjMatches.map(m => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')).join(' ');
          textChunks.push(streamText);
        }
      }

      if (textChunks.length > 0) {
        return { text: textChunks.join('\n\n'), pagesCount: 1 };
      }

      // If all else fails, extract printable characters
      const cleanText = raw.replace(/[^\x20-\x7E\t\r\n]/g, " ").replace(/\s{2,}/g, " ");
      return { text: cleanText.slice(0, 50000), pagesCount: 1 };
    }
  }

  // Generic fallback
  return { text: fileBuffer.toString("utf-8"), pagesCount: 1 };
}
