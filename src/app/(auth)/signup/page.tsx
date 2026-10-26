"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Star,
  AlertCircle,
} from "lucide-react";
import { useGapFinderStore } from "@/lib/db/store";
import { EducationLevel, UserProfile } from "@/lib/types";
import { createClient, isSupabaseConfigured, logAuthError } from "@/lib/supabase/client";

export default function SignUpOnboardingPage() {
  const router = useRouter();
  const { updateProfile, regeneratePlan } = useGapFinderStore();

  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    educationLevel: "undergraduate" as EducationLevel,
    examGoals: "Score 90%+ in CS301 Finals, Master Distributed Storage",
    targetExamDate: "2026-11-20",
    availableDays: ["mon", "tue", "wed", "thu", "sat", "sun"] as string[],
    dailyStudyHours: 2.5,
    sessionDurationMinutes: 45,
    preferredLanguage: "en",
    reminderTimes: ["08:30", "18:00"],
    weakTopics: "Two-Phase Locking, Phantom Reads, ARIES Recovery",
    initialConfidence: 2,
  });

  const toggleDay = (day: string) => {
    if (formData.availableDays.includes(day)) {
      setFormData({
        ...formData,
        availableDays: formData.availableDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        availableDays: [...formData.availableDays, day],
      });
    }
  };

  const handleFinishOnboarding = async () => {
    setErrorMessage("");
    setConfirmationMessage("");
    if (!isSupabaseConfigured) {
      setErrorMessage("Live authentication is not configured. Add the Supabase URL and public key to .env.local before creating an account.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase client is unavailable.");
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: formData.name,
            education_level: formData.educationLevel,
          },
        },
      });

      if (error) {
        logAuthError("signup", error);
        setErrorMessage(error.message);
        return;
      }

      if (!data.session) {
        setConfirmationMessage("Account created. Check your email for the confirmation link, then sign in to continue.");
        return;
      }
    } catch (error) {
      const authError = error instanceof Error ? error : new Error("Unable to create your account.");
      logAuthError("signup", authError);
      setErrorMessage(authError.message);
      return;
    } finally {
      setIsSubmitting(false);
    }

    updateProfile({
      name: formData.name,
      email: formData.email,
      educationLevel: formData.educationLevel,
      examGoals: formData.examGoals.split(",").map((s) => s.trim()),
      targetExamDate: formData.targetExamDate,
      availableDays: formData.availableDays as UserProfile["availableDays"],
      dailyStudyHours: formData.dailyStudyHours,
      sessionDurationMinutes: formData.sessionDurationMinutes,
      preferredLanguage: formData.preferredLanguage,
      reminderTimes: formData.reminderTimes,
      onboardingCompleted: true,
    });

    regeneratePlan();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-brand-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3 mb-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">GapFinder AI</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Personalized Learning Onboarding
        </h2>
        <p className="text-xs text-slate-400">
          Step {step} of 3 — Tailor your diagnostic baseline, study constraints, and target milestones.
        </p>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-1.5 rounded-full transition-all ${
                step === num ? "w-8 bg-brand-500" : step > num ? "w-4 bg-emerald-500" : "w-4 bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {/* STEP 1: Student Profile & Education Level */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                  Student Identity & Academic Program
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your goals guide our diagnostic calibration and topic map difficulty.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {(errorMessage || confirmationMessage) && (
                <div role={errorMessage ? "alert" : "status"} className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${errorMessage ? "border-red-500/30 bg-red-950/40 text-red-200" : "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"}`}>
                  {errorMessage && <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{errorMessage || confirmationMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Education Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "high_school", label: "High School" },
                    { id: "undergraduate", label: "Undergraduate" },
                    { id: "postgraduate", label: "Postgraduate" },
                    { id: "professional", label: "Professional" },
                  ].map((level) => (
                    <button
                      type="button"
                      key={level.id}
                      onClick={() =>
                        setFormData({ ...formData, educationLevel: level.id as EducationLevel })
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                        formData.educationLevel === level.id
                          ? "bg-brand-600/30 border-brand-500 text-brand-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Primary Exam Target & Goals</label>
                <input
                  type="text"
                  placeholder="e.g. CS301 Finals, Distributed Systems Core"
                  value={formData.examGoals}
                  onChange={(e) => setFormData({ ...formData, examGoals: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  Target Examination Date
                </label>
                <input
                  type="date"
                  value={formData.targetExamDate}
                  onChange={(e) => setFormData({ ...formData, targetExamDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Link href="/login" className="text-xs text-slate-400 hover:underline">
                  Already have an account? Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Study Constraints</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Time Constraints & Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Daily Study Capacity & Availability
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  GapFinder AI strictly respects your available hours and will never over-schedule tasks.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Available Study Days
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {[
                    { id: "mon", label: "Mon" },
                    { id: "tue", label: "Tue" },
                    { id: "wed", label: "Wed" },
                    { id: "thu", label: "Thu" },
                    { id: "fri", label: "Fri" },
                    { id: "sat", label: "Sat" },
                    { id: "sun", label: "Sun" },
                  ].map((day) => {
                    const isSelected = formData.availableDays.includes(day.id);
                    return (
                      <button
                        type="button"
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? "bg-brand-600 text-white border-brand-500"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Daily Study Limit (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="8"
                    value={formData.dailyStudyHours}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyStudyHours: parseFloat(e.target.value) || 2 })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Recommended: 2.0 to 3.5 hours</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Session Duration (Minutes)
                  </label>
                  <select
                    value={formData.sessionDurationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sessionDurationMinutes: parseInt(e.target.value) || 45,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value={30}>30 Minutes (Sprint)</option>
                    <option value={45}>45 Minutes (Optimal Focus)</option>
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes (Deep Dive)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-2 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Self-Reported Gaps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Self-Reported Weak Topics & Baseline */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Self-Reported Weak Topics & Initial Confidence
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tell us what you find difficult. We will verify your self-report against empirical diagnostic tests.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Topics You Struggle With
                </label>
                <textarea
                  rows={3}
                  value={formData.weakTopics}
                  onChange={(e) => setFormData({ ...formData, weakTopics: e.target.value })}
                  placeholder="e.g. Two-Phase Locking, Phantom Reads, Raft Log Compaction"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Initial Self-Confidence Level: {formData.initialConfidence} / 5
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, initialConfidence: star })}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.initialConfidence ? "fill-amber-400" : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">
                    {formData.initialConfidence <= 2
                      ? "Low confidence (needs high priority)"
                      : formData.initialConfidence === 3
                      ? "Moderate confidence"
                      : "Confident"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/20 text-xs text-slate-300">
                <p className="leading-relaxed">
                  💡 <strong>Smart Initialization:</strong> Submitting will create your profile and immediately assemble your personalized 7-day adaptive schedule with verifiable CS301 syllabus material.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-brand-600/30"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{isSubmitting ? "Creating account…" : "Generate My Personalized Schedule"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
