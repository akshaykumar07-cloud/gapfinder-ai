"use client";

import React from "react";
import Link from "next/link";
import { useGapFinderStore } from "@/lib/db/store";
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  BookOpen,
  Award,
  Flame,
  ChevronRight,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMasteryBadgeDetails, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { state, markTaskCompleted } = useGapFinderStore();
  const { profile, topics, currentPlan, assessmentHistory, documents } = state;

  const weakTopics = topics.filter((t) => t.masteryLevel === "weak");
  const unassessedTopics = topics.filter((t) => t.masteryLevel === "insufficient_evidence");
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = currentPlan.tasks.filter((t) => t.scheduledDate === todayStr || t.status === "scheduled").slice(0, 3);

  const completedCount = currentPlan.tasks.filter((t) => t.status === "completed").length;
  const planProgress = Math.round((completedCount / (currentPlan.tasks.length || 1)) * 100);

  // Time remaining today
  const remainingMinutes = todayTasks
    .filter((t) => t.status === "scheduled")
    .reduce((acc, t) => acc + t.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* 1. Personalized Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-indigo-950 to-navy-900 text-white p-6 sm:p-8 shadow-md border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Target Exam: {formatDate(profile.targetExamDate)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              GapFinder AI analyzed your recent assessments. Today&apos;s primary objective is eliminating the critical gap in{" "}
              <strong className="text-white underline decoration-rose-400 decoration-2">
                {weakTopics[0]?.title || "Two-Phase Locking & Isolation"}
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/diagnostic"
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-brand-600/30"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Resume Diagnostic</span>
            </Link>
            <Link
              href="/materials"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Upload Notes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Study Time Remaining Today */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Today&apos;s Remaining Study</p>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {remainingMinutes} <span className="text-sm font-normal text-slate-500">mins</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cap: {profile.dailyStudyHours}h max / day
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Weak Topic Alerts */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Critical Weak Topics</p>
              <div className="text-2xl font-bold text-rose-600 mt-1">
                {weakTopics.length} <span className="text-xs font-normal text-slate-500">topics</span>
              </div>
              <p className="text-[11px] text-rose-600/80 mt-0.5">Below 50% threshold</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Weekly Plan Completion */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Plan Completion</p>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {planProgress}%
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {completedCount} of {currentPlan.tasks.length} tasks finished
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Consecutive Streak */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Study Streak</p>
              <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
                6 <span className="text-sm font-normal text-slate-500">days</span>
              </div>
              <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                Consistent revision
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Dashboard Body: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks & Urgent Weak Topics (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Learning Tasks */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  Today&apos;s Recommended Learning Tasks
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled based on exam proximity and diagnosed weaknesses.
                </p>
              </div>
              <Link
                href="/planner"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View Full Calendar <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                  All scheduled tasks for today are completed! Great job.
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      task.status === "completed"
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {task.durationMinutes} mins
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            task.priority === "high"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span className="text-xs text-slate-400">
                          {task.subjectName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
                      <div className="text-[11px] text-amber-700 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200/50 inline-block">
                        Why: {task.reasonWhyRecommended}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {task.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      ) : (
                        <button
                          onClick={() => markTaskCompleted(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Topic Mastery Summary */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  Topic Mastery Status
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated from assessment evidence and difficulty weights.
                </p>
              </div>
              <Link
                href="/gaps"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Deep Gap Report <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic) => {
                const badge = getMasteryBadgeDetails(topic.masteryLevel, topic.masteryScore);
                return (
                  <div key={topic.id} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{topic.title}</span>
                        <span className="text-[11px] text-slate-400">({topic.chapterTitle})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${badge.bgColor}`}>
                        {badge.label}: {topic.masteryScore}%
                      </span>
                    </div>
                    <Progress value={topic.masteryScore} barColor={badge.barColor} />
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {topic.masteryReason}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Alerts & Recent Assessment Results */}
        <div className="space-y-6">
          {/* Weak Topic Alert Card */}
          {weakTopics.length > 0 && (
            <Card className="border-rose-200 bg-rose-50/40 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-rose-800 leading-relaxed">
                  Your lowest mastery score is on <strong>{weakTopics[0].title}</strong> ({weakTopics[0].masteryScore}%).
                </p>
                {weakTopics[0].repeatedErrorPatterns?.length > 0 && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-rose-200 space-y-1">
                    <span className="font-bold text-[11px] text-rose-900">Repeated Error Pattern:</span>
                    <p className="text-[11px] text-rose-700 italic">
                      &ldquo;{weakTopics[0].repeatedErrorPatterns[0]}&rdquo;
                    </p>
                  </div>
                )}
                <Link
                  href="/practice"
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Start Targeted Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Assessment Result */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600" />
                Latest Assessment Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {assessmentHistory.length > 0 ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">
                        {assessmentHistory[0].title}
                      </span>
                      <span className="font-mono font-bold text-brand-600">
                        {assessmentHistory[0].percentageScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {assessmentHistory[0].feedbackSummary}
                    </p>
                  </div>
                  <Link
                    href="/tests"
                    className="block text-center text-xs font-semibold text-brand-600 hover:underline"
                  >
                    View All Past Assessments ({assessmentHistory.length})
                  </Link>
                </>
              ) : (
                <p className="text-slate-400">No assessments taken yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Materials Summary */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                Indexed Study Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="truncate max-w-[160px] font-medium text-slate-700">
                    {doc.originalName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    {doc.totalChunks} chunks
                  </span>
                </div>
              ))}
              <Link
                href="/materials"
                className="mt-2 block text-center text-xs font-semibold text-brand-600 hover:underline"
              >
                Manage Library & Extraction
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
