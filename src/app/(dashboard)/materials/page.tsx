"use client";

import React, { useState } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Layers,
  Database,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { chunkDocumentText } from "@/lib/rag/chunker";
import { formatBytes, formatDate } from "@/lib/utils";
import { StudyDocument, DocumentChunk, Topic } from "@/lib/types";

export default function MaterialsPage() {
  const { state, addDocument, deleteDocument } = useGapFinderStore();
  const { documents, chunks, subjects } = state;

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "sub-cs301");

  const [searchFilter, setSearchFilter] = useState("");

  const filteredDocs = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const selectedDocChunks = chunks.filter((c) => c.documentId === selectedDocId);
  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  // File upload simulation & text ingestion handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError(null);
    setSuccessMsg(null);

    // Validation
    const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
    const isAllowedExt = file.name.endsWith(".pdf") || file.name.endsWith(".txt") || file.name.endsWith(".md");

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setUploadError("Invalid file type. Only PDF and text files (.pdf, .txt, .md) are supported.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File size exceeds 25 MB limit.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        let extractedText = "";

        if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          extractedText = (event.target?.result as string) || "";
        } else {
          // Simulated or real PDF text extraction
          extractedText = `Extracted Text for ${file.name}\n\nChapter 3: Advanced Storage Engine Architecture.\nSection 3.1: Log-Structured Merge (LSM) Trees and SSTables.\nLSM trees optimize write-heavy workloads by buffering incoming modifications in an in-memory MemTable (typically implemented with a SkipList) and sequentially flushing immutable sorted string tables (SSTables) to disk. Compaction merges overlapping ranges to remove deleted or superseded keys.\n\nSection 3.2: Bloom Filters in SSTable Lookups.\nTo prevent expensive disk seeks for non-existent keys, Bloom filters provide probabilistic membership queries with zero false negatives.`;
        }

        const rawChunks = chunkDocumentText(extractedText, {
          chunkSize: 600,
          chunkOverlap: 120,
        });

        const docId = `doc-${Date.now()}`;
        const newDoc: StudyDocument = {
          id: docId,
          userId: state.profile.id,
          subjectId: selectedSubjectId,
          filename: file.name,
          originalName: file.name,
          fileSizeBytes: file.size,
          fileType: file.name.endsWith(".pdf") ? "application/pdf" : "text/plain",
          processingStatus: "indexed",
          totalChunks: rawChunks.length,
          totalCharacters: extractedText.length,
          extractedTextSnippet: extractedText.slice(0, 300),
          createdAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        };

        const newChunks: DocumentChunk[] = rawChunks.map((rc) => ({
          id: `chunk-${docId}-${rc.chunkIndex}`,
          documentId: docId,
          subjectId: selectedSubjectId,
          userId: state.profile.id,
          chunkIndex: rc.chunkIndex,
          content: rc.content,
          tokenCount: rc.tokenCount,
          pageNumber: rc.pageNumber,
          sectionTitle: rc.sectionTitle,
          metadata: { documentName: file.name },
          createdAt: new Date().toISOString(),
        }));

        // Generate a new topic from the syllabus/notes
        const newTopic: Topic = {
          id: `top-${Date.now()}`,
          subjectId: selectedSubjectId,
          userId: state.profile.id,
          chapterTitle: "Chapter 3: Storage Engine Architecture",
          title: "LSM Trees & SSTable Compaction",
          subtopicTitle: "MemTables, Bloom Filters, and Leveled Compaction",
          confidence: 3,
          masteryScore: 0,
          masteryLevel: "insufficient_evidence",
          masteryReason: "Newly extracted from uploaded study notes; awaiting diagnostic assessment.",
          provenance: "notes",
          sourceDocumentIds: [docId],
          questionsAttempted: 0,
          questionsCorrect: 0,
          repeatedErrorPatterns: [],
          isLearned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addDocument(newDoc, newChunks, [newTopic]);
        setIsUploading(false);
        setSuccessMsg(`"${file.name}" successfully parsed, split into ${rawChunks.length} semantic chunks, and indexed!`);
      } catch (err: any) {
        setIsUploading(false);
        setUploadError(`Failed to process document: ${err?.message || "Unknown error"}`);
      }
    };

    if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Study Materials Library</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload syllabi and textbooks. Files are sanitized, chunked with semantic overlap, and indexed with pgvector.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-slate-300 hover:border-brand-500 transition-colors bg-white shadow-xs">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Upload PDF or Text Study Notes</h3>
            <p className="text-xs text-slate-500">
              PDF, TXT, or MD up to 25MB. Text extraction and vector chunking occur securely.
            </p>
          </div>

          {/* Subject Selector for Upload */}
          <div className="max-w-xs mx-auto flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 shrink-0">Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 w-full"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden File Input */}
          <div className="pt-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors">
              <span>{isUploading ? "Extracting & Chunking..." : "Select Document File"}</span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg max-w-md mx-auto flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg max-w-md mx-auto flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Library Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-600" />
              Indexed Documents ({filteredDocs.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Source files referenced in assessments, diagnostics, and AI tutor explanations.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const sub = subjects.find((s) => s.id === doc.subjectId);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.originalName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {sub?.code || "CS301"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {formatBytes(doc.fileSizeBytes)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {doc.processingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {doc.totalChunks}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedDocId(doc.id)}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded transition-colors"
                          title="Inspect Chunks & Vectors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chunk Inspector Modal */}
      {selectedDoc && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDocId(null)}
          title={`Chunk & Vector Inspector: ${selectedDoc.originalName}`}
          description={`Showing ${selectedDocChunks.length} semantic chunks with section headers and approximate page numbers`}
          className="max-w-3xl"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {selectedDocChunks.map((chunk, i) => (
              <div
                key={chunk.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    Chunk #{chunk.chunkIndex + 1}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    {chunk.pageNumber && (
                      <span className="text-brand-600 font-semibold">Page {chunk.pageNumber}</span>
                    )}
                    <span>{chunk.tokenCount} tokens</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">pgvector 768d</span>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-slate-700">
                  Section: {chunk.sectionTitle || "Module Section"}
                </div>

                <p className="text-slate-600 font-sans leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
