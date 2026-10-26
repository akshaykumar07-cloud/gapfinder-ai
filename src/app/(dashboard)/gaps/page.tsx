"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGapFinderStore } from "@/lib/db/store";
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  Star,
  History,
  Dumbbell,
  HelpCircle,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMasteryBadgeDetails, formatDate } from "@/lib/utils";
import { MasteryLevel } from "@/lib/types";

export default function TopicGapAnalysisPage() {
  const { state } = useGapFinderStore();
  const { topics, assessmentHistory } = state;

  const [levelFilter, setLevelFilter] = useState<MasteryLevel | "all">("all");

  const filteredTopics = topics.filter((t) => {
    if (levelFilter === "all") return true;
    return t.masteryLevel === levelFilter;
  });

  const weakCount = topics.filter((t) => t.masteryLevel === "weak").length;
  const mediumCount = topics.filter((t) => t.masteryLevel === "medium").length;
  const strongCount = topics.filter((t) => t.masteryLevel === "strong").length;
  const unassessedCount = topics.filter((t) => t.masteryLevel === "insufficient_evidence").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Topic-Level Knowledge Gap Analysis</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence-grounded mastery calculation factoring in assessment accuracy, question difficulty weighting, attempt recency, and sample sizes.
          </p>
        </div>
      </div>

      {/* Filter Tabs / Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setLevelFilter(levelFilter === "weak" ? "all" : "weak")}
          className={`p-4 rounded-xl border text-left transition-all ${
            levelFilter === "weak"
              ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Weak (&lt;50%)</span>
            <span className="text-lg font-black text-rose-600">{weakCount}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">High priority concept gaps</p>
        </button>

        <button
          onClick={() => setLevelFilter(levelFilter === "medium" ? "all" : "medium")}
          className={`p-4 rounded-xl border text-left transition-all ${
            levelFilter === "medium"
              ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Medium (50–79%)</span>
            <span className="text-lg font-black text-amber-600">{mediumCount}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Developing competency</p>
        </button>

        <button
          onClick={() => setLevelFilter(levelFilter === "strong" ? "all" : "strong")}
          className={`p-4 rounded-xl border text-left transition-all ${
            levelFilter === "strong"
              ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Strong (80%+)</span>
            <span className="text-lg font-black text-emerald-600">{strongCount}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Spaced revision maintained</p>
        </button>

        <button
          onClick={() => setLevelFilter(levelFilter === "insufficient_evidence" ? "all" : "insufficient_evidence")}
          className={`p-4 rounded-xl border text-left transition-all ${
            levelFilter === "insufficient_evidence"
              ? "bg-slate-100 border-slate-500 ring-2 ring-slate-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Insufficient Data</span>
            <span className="text-lg font-black text-slate-600">{unassessedCount}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">&lt;2 verified test attempts</p>
        </button>
      </div>

      {/* Topics Detailed Cards */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const badge = getMasteryBadgeDetails(topic.masteryLevel, topic.masteryScore);
          return (
            <Card key={topic.id} className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        {topic.chapterTitle}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bgColor}`}>
                        {badge.label}: {topic.masteryScore}%
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        Source: {topic.provenance}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{topic.title}</h3>
                    {topic.subtopicTitle && (
                      <p className="text-xs text-slate-500">{topic.subtopicTitle}</p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href="/practice"
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Targeted Practice</span>
                    </Link>
                  </div>
                </div>

                {/* Mastery Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Evidence Mastery Progress</span>
                    <span className="font-mono font-bold text-slate-700">{topic.masteryScore}% / 100%</span>
                  </div>
                  <Progress value={topic.masteryScore} barColor={badge.barColor} />
                </div>

                {/* Mathematical Justification / Rationale */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-3.5 h-3.5 text-brand-600" />
                    Classification Justification
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {topic.masteryReason}
                  </p>
                </div>

                {/* Repeated Error Patterns */}
                {topic.repeatedErrorPatterns && topic.repeatedErrorPatterns.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Identified Error Patterns (Requires Remediation)
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-rose-800">
                      {topic.repeatedErrorPatterns.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata Footer: Self-Confidence vs Test Evidence */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-400">Self-Confidence:</span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= topic.confidence ? "fill-amber-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-400">Attempts: </span>
                      <span className="font-medium text-slate-700">{topic.questionsAttempted}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-400">Last Assessed: </span>
                      <span className="font-medium text-slate-700">{formatDate(topic.lastAssessedAt)}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Next Action:{" "}
                    <strong className="text-slate-700 font-semibold">
                      {topic.masteryLevel === "weak"
                        ? "Immediate high-priority drill"
                        : topic.masteryLevel === "insufficient_evidence"
                        ? "Diagnostic quiz coverage"
                        : "Maintain spaced retention"}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
