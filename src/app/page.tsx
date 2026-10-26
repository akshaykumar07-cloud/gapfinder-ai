import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Target,
  FileCheck2,
  Calendar,
  ShieldCheck,
  BrainCircuit,
  BarChart2,
  CheckCircle,
  HelpCircle,
  Flame,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              GapFinder <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/30 text-brand-300 font-mono">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">RAG Pipeline</a>
            <a href="#demo" className="hover:text-white transition-colors">Demonstration</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-600/30 transition-all hover:scale-102"
            >
              <span>Try Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Evidence-Based Adaptive Learning
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stop revising what you know. <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-400 bg-clip-text text-transparent">
              Target the exact concepts you don&apos;t.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your syllabus and study materials. GapFinder AI indexes your course content, conducts diagnostic assessments, diagnoses topic-level weaknesses, and builds a time-constrained study schedule with cited evidence.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <span>Open Pre-Seeded CS301 Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-sm transition-all"
            >
              Student Registration & Onboarding
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Grounded in Uploaded Notes</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-brand-400">pgvector</div>
              <div className="text-xs text-slate-400 mt-0.5">Semantic Vector Retrieval</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-amber-400">Multi-Factor</div>
              <div className="text-xs text-slate-400 mt-0.5">Mastery Formula with Recency</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">Strict Cap</div>
              <div className="text-xs text-slate-400 mt-0.5">Never Exceeds Available Hours</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Feature Section */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Traditional Revision Fails Students
            </h2>
            <p className="text-slate-400 text-sm">
              Most students spend 70% of study time re-reading easy notes they already understand. GapFinder AI reverses this dynamic through empirical assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-rose-900/30 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Conventional Passive Studying
              </div>
              <h3 className="text-lg font-bold text-white">Passive Highlighting & Rote Re-reading</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Spends hours reviewing comfortable, mastered chapters.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Unaware of specific exam anomalies (e.g., phantom reads vs cascading aborts).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Schedules unrealistic 10-hour study marathons that cause burnout.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>AI chat hallucination: generic answers with zero textbook citations.</span>
                </li>
              </ul>
            </div>

            {/* GapFinder AI */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-brand-950/60 to-slate-950 border border-brand-500/30 space-y-4 relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                The GapFinder AI Approach
              </div>
              <h3 className="text-lg font-bold text-white">Diagnostic Gap Isolation & Cited Practice</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Extracts syllabus hierarchy and verifies coverage from your uploaded PDFs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Computes mastery with sample-size thresholds and difficulty weighting.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Schedules daily sessions strictly within your available study hours.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Every quiz question, feedback item, and AI tutor response is backed by citations.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Key Modules Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Learning Architecture
          </h2>
          <p className="text-slate-400 text-sm">
            Engineered as a production-grade system with 13 dedicated routes and real data persistence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Syllabus RAG Ingestion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              PDF/TXT text normalization, sliding-window chunking with overlap, vector embedding storage, and page/section metadata extraction.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Diagnostic Assessments</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              MCQ, numerical, and rubric-graded short answers. Diagnoses concept gaps, isolates error patterns, and calculates verifiable marks.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Topic Gap Analysis</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Weak (&lt;50%), Medium (50-79%), Strong (80%+), and Insufficient Evidence categories. Transparent mathematical justification for each score.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Time-Capped Study Planner</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distributes revision tasks across available days. Prioritizes weak topics while protecting spaced retention, strictly capping daily hours.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Weekly Adaptive Tests</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates weekly learning milestones, detects persistent mistakes, updates topic mastery, and dynamically rebalances future study schedules.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Material-Grounded AI Tutor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scope-restricted conversational assistant. Directly cites page and section references, refusing to hallucinate when source text is insufficient.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <span className="text-slate-400 font-semibold">GapFinder AI</span>
            <span>— Production-Grade Adaptive Educational Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              Live Demo
            </Link>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
