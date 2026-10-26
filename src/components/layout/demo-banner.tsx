"use client";

import React, { useState } from "react";
import { Info, Sparkles, X, CheckCircle, Database } from "lucide-react";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-navy-900 via-indigo-950 to-navy-900 text-white text-xs px-6 py-2 border-b border-indigo-900/50 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded bg-brand-500/30 text-brand-300 font-mono text-[10px] font-bold border border-brand-400/30">
          DEMO MODE
        </span>
        <span className="text-slate-200">
          Loaded with verified curriculum: <strong>CS301 Distributed Systems & Databases</strong>.
        </span>
        <span className="hidden md:inline text-slate-400">
          All 13 routes, RAG citations, diagnostic grading, and adaptive planner are fully functional.
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Database className="w-3 h-3 text-brand-400" />
          <span>Storage: {isSupabaseConfigured ? "Supabase PostgreSQL" : "Local Vector Store (Demo)"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>AI Engine: {isGeminiConfigured ? "Google Gemini 1.5" : "Grounded Mock RAG"}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-0.5 rounded"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
