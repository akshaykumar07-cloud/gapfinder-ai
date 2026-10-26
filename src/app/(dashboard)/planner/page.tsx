"use client";

import React, { useState } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Calendar,
  AlertTriangle,
  MoveRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { StudyTask } from "@/lib/types";

export default function StudyPlannerPage() {
  const {
    state,
    markTaskCompleted,
    skipTask,
    rescheduleTask,
    regeneratePlan,
  } = useGapFinderStore();
  const { currentPlan, profile, topics } = state;

  const [activeView, setActiveView] = useState<"daily" | "weekly">("weekly");
  const [selectedTaskForReschedule, setSelectedTaskForReschedule] = useState<StudyTask | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [skipModalTask, setSkipModalTask] = useState<StudyTask | null>(null);
  const [skipReason, setSkipReason] = useState("Lack of time today");
  const [planWarnings, setPlanWarnings] = useState<string[]>([]);
  const [showRegenNotice, setShowRegenNotice] = useState(false);

  // Group tasks by date
  const tasksByDate = new Map<string, StudyTask[]>();
  currentPlan.tasks.forEach((t) => {
    const list = tasksByDate.get(t.scheduledDate) || [];
    list.push(t);
    tasksByDate.set(t.scheduledDate, list);
  });

  const uniqueDates = Array.from(tasksByDate.keys()).sort();

  const handleManualRegenerate = () => {
    const { warnings } = regeneratePlan();
    setPlanWarnings(warnings);
    setShowRegenNotice(true);
    setTimeout(() => setShowRegenNotice(false), 4000);
  };

  const handleConfirmReschedule = () => {
    if (!selectedTaskForReschedule || !newScheduleDate) return;
    rescheduleTask(selectedTaskForReschedule.id, newScheduleDate);
    setSelectedTaskForReschedule(null);
  };

  const handleConfirmSkip = () => {
    if (!skipModalTask) return;
    skipTask(skipModalTask.id, skipReason);
    setSkipModalTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Adaptive Study Planner</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized schedule capped at {profile.dailyStudyHours} hours/day. Weak topics are prioritized while maintaining spaced revision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Daily vs Weekly Toggle */}
          <div className="bg-slate-200 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveView("weekly")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === "weekly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setActiveView("daily")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === "daily" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Today Only
            </button>
          </div>

          <button
            onClick={handleManualRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-Optimize Plan</span>
          </button>
        </div>
      </div>

      {/* Plan Details & Constraints Banner */}
      <Card className="border-indigo-100 bg-indigo-50/50 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-indigo-950">
          <div className="space-y-0.5">
            <span className="font-bold text-brand-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Scheduling Strategy
            </span>
            <p className="text-indigo-900/80 leading-relaxed">
              {currentPlan.generatedReason}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-4 text-xs font-mono font-bold text-slate-700">
            <div>
              <span className="text-slate-400 font-sans block text-[10px]">Total Hours:</span>
              <span>{currentPlan.totalAllocatedHours} hrs</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block text-[10px]">Daily Cap:</span>
              <span>{profile.dailyStudyHours} hrs/day</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Warning Banner */}
      {planWarnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Study Load Conflict Warning
          </div>
          {planWarnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      {showRegenNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Study schedule successfully rebalanced across all available days!</span>
        </div>
      )}

      {/* Calendar Days Stream */}
      <div className="space-y-6">
        {uniqueDates.map((dateStr) => {
          const dayTasks = tasksByDate.get(dateStr) || [];
          const dayTotalMinutes = dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
          const dayCompletedMinutes = dayTasks
            .filter((t) => t.status === "completed")
            .reduce((acc, t) => acc + (t.actualDurationMinutes || t.durationMinutes), 0);

          return (
            <div key={dateStr} className="space-y-3">
              {/* Day Header */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-brand-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    {formatDate(dateStr)}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({dayTasks.length} sessions)
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  {dayCompletedMinutes}/{dayTotalMinutes} mins completed
                </div>
              </div>

              {/* Tasks List */}
              <div className="grid grid-cols-1 gap-3">
                {dayTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`border transition-all ${
                      task.status === "completed"
                        ? "bg-emerald-50/30 border-emerald-200"
                        : task.status === "skipped"
                        ? "bg-slate-50/70 border-slate-200 opacity-60"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
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
                          <span className="text-xs text-slate-500 font-medium">
                            {task.subjectName}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                        <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200/60 inline-block">
                          <strong>Why Recommended:</strong> {task.reasonWhyRecommended}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="shrink-0 flex items-center gap-2">
                        {task.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : task.status === "skipped" ? (
                          <span className="text-xs text-slate-400 italic">
                            Skipped: {task.skipReason}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => markTaskCompleted(task.id)}
                              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => setSelectedTaskForReschedule(task)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                              title="Reschedule session"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => setSkipModalTask(task)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 text-xs font-medium transition-colors"
                              title="Skip task with reason"
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reschedule Modal */}
      {selectedTaskForReschedule && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTaskForReschedule(null)}
          title="Reschedule Study Session"
          description={`Move "${selectedTaskForReschedule.title}" to a different date`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select New Scheduled Date:
              </label>
              <input
                type="date"
                defaultValue={selectedTaskForReschedule.scheduledDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTaskForReschedule(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-500"
              >
                Save New Date
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Skip Task Modal */}
      {skipModalTask && (
        <Modal
          isOpen={true}
          onClose={() => setSkipModalTask(null)}
          title="Skip Study Session"
          description="Record a reason so the adaptive planner can adjust future workloads"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for skipping:
              </label>
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Lack of time today">Lack of time today</option>
                <option value="Already mastered this topic">Already mastered this topic</option>
                <option value="Focusing on urgent coursework">Focusing on urgent coursework</option>
                <option value="Need more lecture materials first">Need more lecture materials first</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSkipModalTask(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSkip}
                className="px-4 py-1.5 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-500"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
