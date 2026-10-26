"use client";

import React, { useState } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  Dumbbell,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  FileText,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CitationBadge } from "@/components/ui/citation-badge";

export default function PracticalLearningPage() {
  const { state, updatePracticalExercise } = useGapFinderStore();
  const { practicalExercise } = state;

  const [activeTab, setActiveTab] = useState<"worked" | "challenge" | "solution" | "reflection">("worked");
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});
  const [reflectionText, setReflectionText] = useState(practicalExercise.studentReflection || "");
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    updatePracticalExercise({
      studentReflection: reflectionText,
      isCompleted: true,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Practical Application Lab</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Learn through simulation and problem-solving rather than passive reading alone.
          </p>
        </div>

        {practicalExercise.isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Practical Lab Completed
          </span>
        )}
      </div>

      {/* Main Problem Scenario Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {practicalExercise.topicTitle}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
              {practicalExercise.difficulty} Scenario
            </span>
          </div>

          <CardTitle className="text-lg font-bold text-slate-900">
            {practicalExercise.title}
          </CardTitle>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            {practicalExercise.problemStatement}
          </p>

          <CitationBadge citations={practicalExercise.citations} />
        </CardHeader>

        {/* Tab Controls */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("worked")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "worked"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            1. Worked Simulation Steps
          </button>
          <button
            onClick={() => setActiveTab("challenge")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "challenge"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            2. Challenge Questions
          </button>
          <button
            onClick={() => setActiveTab("solution")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "solution"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            3. Model Architectural Solution
          </button>
          <button
            onClick={() => setActiveTab("reflection")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "reflection"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            4. Mistake Reflection & Analysis
          </button>
        </div>

        <CardContent className="p-6">
          {/* TAB 1: Worked Steps */}
          {activeTab === "worked" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step-by-Step Execution Trace
              </h4>
              <div className="space-y-3">
                {practicalExercise.workedExample.map((step) => (
                  <div
                    key={step.step}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-700 font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">
                          {step.step}
                        </span>
                        {step.title}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-mono bg-white p-2.5 rounded border border-slate-200">
                      {step.content}
                    </p>
                    {step.notes && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{step.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Challenge Questions */}
          {activeTab === "challenge" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Guided Challenge Tasks
              </h4>
              <div className="space-y-4">
                {practicalExercise.challengeSteps.map((ch, idx) => (
                  <div key={ch.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="font-bold text-slate-900">
                      Step {idx + 1}: {ch.instruction}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] italic bg-white p-2 rounded border border-slate-200">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>Hint: {ch.hint}</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Type your response..."
                        value={stepNotes[ch.id] || ""}
                        onChange={(e) =>
                          setStepNotes({ ...stepNotes, [ch.id]: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    {stepNotes[ch.id] && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                        <strong>Expected Outcome:</strong> {ch.expectedOutcome}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Model Architectural Solution */}
          {activeTab === "solution" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Validated Syllabus Solution & Explanation
              </h4>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3 text-xs leading-relaxed font-mono">
                <p>{practicalExercise.sampleSolution}</p>
              </div>
            </div>
          )}

          {/* TAB 4: Mistake Reflection */}
          {activeTab === "reflection" && (
            <form onSubmit={handleSaveReflection} className="space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Self-Reflection on Previous Mistakes
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  {practicalExercise.reflectionPrompt}
                </p>
              </div>

              <textarea
                rows={5}
                required
                placeholder="Reflect on why phantom reads occur and how locking the gap differs from standard record locking..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Submitting marks this practical module complete.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Reflection & Mark Lab Complete</span>
                </button>
              </div>

              {isSaved && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Practical exercise reflection persisted successfully!</span>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
