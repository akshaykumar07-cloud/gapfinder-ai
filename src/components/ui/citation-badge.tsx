"use client";

import React, { useState } from "react";
import { CitationReference } from "@/lib/types";
import { BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { Modal } from "./modal";

interface CitationBadgeProps {
  citations?: CitationReference[];
  compact?: boolean;
}

export function CitationBadge({ citations, compact = false }: CitationBadgeProps) {
  const [selectedCitation, setSelectedCitation] = useState<CitationReference | null>(null);

  if (!citations || citations.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-brand-600" />
          Sources:
        </span>
        {citations.map((cit, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedCitation(cit)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
          >
            <span className="truncate max-w-[140px]">{cit.documentName}</span>
            {cit.pageNumber && <span className="text-brand-500 font-mono">p.{cit.pageNumber}</span>}
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </button>
        ))}
      </div>

      {selectedCitation && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCitation(null)}
          title="Verified Source Citation"
          description="Direct passage retrieved from student's indexed study documents"
        >
          <div className="space-y-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Document:</span>
                <span>{selectedCitation.documentName}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Section:</span>
                <span>{selectedCitation.sectionTitle || "Module Section"}</span>
              </div>
              {selectedCitation.pageNumber && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Page Reference:</span>
                  <span className="font-mono font-bold text-brand-600">Page {selectedCitation.pageNumber}</span>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Retrieved Source Excerpt
              </div>
              <blockquote className="border-l-4 border-brand-500 bg-brand-50/40 p-3 italic text-slate-800 rounded-r-md text-xs leading-relaxed">
                &ldquo;{selectedCitation.relevantExcerpt}&rdquo;
              </blockquote>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
