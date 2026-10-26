"use client";

import React, { useState } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Flame,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";

export default function ProgressAnalyticsPage() {
  const { state, getAnalyticsSummary } = useGapFinderStore();
  const summary = getAnalyticsSummary();

  const [dateRange, setDateRange] = useState<"week" | "month" | "all">("month");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = () => {
    setIsExporting(true);
    // Deterministic client-side CSV download
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Metric", "Value"],
        ["Overall Mastery", `${summary.overallMasteryPercent}%`],
        ["Daily Study Streak", `${summary.dailyStudyStreakDays} days`],
        ["Planned Study Hours", `${summary.plannedStudyHours} hrs`],
        ["Completed Study Hours", `${summary.completedStudyHours} hrs`],
        ["Plan Completion Rate", `${summary.planCompletionRatePercent}%`],
        ["Overall Accuracy", `${summary.overallAccuracyPercent}%`],
        ["Weak Topics Count", `${summary.masteryDistribution.weakCount}`],
        ["Medium Topics Count", `${summary.masteryDistribution.mediumCount}`],
        ["Strong Topics Count", `${summary.masteryDistribution.strongCount}`],
        ["Unassessed Topics Count", `${summary.masteryDistribution.unassessedCount}`],
      ]
        .map((e) => e.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `GapFinder_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Progress & Performance Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical telemetry computed from stored assessment attempts and study completion records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="bg-slate-200 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => setDateRange("week")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                dateRange === "week" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange("month")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                dateRange === "month" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Past Month
            </button>
            <button
              onClick={() => setDateRange("all")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                dateRange === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Exporting..." : "Export CSV Report"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Overall Evidence Mastery</p>
              <div className="text-2xl font-bold text-brand-600 mt-1">
                {summary.overallMasteryPercent}%
              </div>
              <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +14% since diagnostic
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Study Hours (Done / Plan)</p>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {summary.completedStudyHours} <span className="text-sm font-normal text-slate-500">/ {summary.plannedStudyHours}h</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {summary.planCompletionRatePercent}% plan completion
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Test Accuracy</p>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {summary.overallAccuracyPercent}%
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Across {summary.totalQuestionsAttempted} questions
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Study Streak</p>
              <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
                {summary.dailyStudyStreakDays} <span className="text-sm font-normal text-slate-500">days</span>
              </div>
              <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                Consistent daily sessions
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Accuracy Trend Line */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Assessment Accuracy Over Time
            </CardTitle>
            <p className="text-xs text-slate-500">
              Progression from baseline diagnostic to current weekly evaluations.
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Weekly Scores Bar Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Weekly Test Scores vs Target Benchmarks
            </CardTitle>
            <p className="text-xs text-slate-500">
              Empirical milestone marks compared against cohort averages.
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.weeklyScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="weekLabel" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="score" name="Alex's Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="averageScore" name="Cohort Average" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improving Topics vs Topics That Remain Difficult */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Improving Topics */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Measurably Improving Topics
            </CardTitle>
            <p className="text-xs text-slate-500">
              Topics demonstrating verified score gains between assessment attempts.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.improvingTopics.map((top) => (
              <div
                key={top.topicId}
                className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{top.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Previous: {top.previousScore}% → Current: <strong>{top.currentScore}%</strong>
                  </div>
                </div>
                <span className="font-bold font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  +{top.delta}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Difficult Topics Remaining */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Persistent Knowledge Gaps
            </CardTitle>
            <p className="text-xs text-slate-500">
              Topics requiring continued practical drills before final exams.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.difficultTopics.map((top) => (
              <div
                key={top.topicId}
                className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{top.title}</h4>
                  <span className="font-bold font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    {top.currentScore}%
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Struggle: {top.primaryStruggle}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
