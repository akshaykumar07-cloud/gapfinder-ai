"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, UserCheck, AlertCircle } from "lucide-react";
import { useGapFinderStore } from "@/lib/db/store";
import { createClient, isSupabaseConfigured, logAuthError } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { resetToDemoDefaults } = useGapFinderStore();
  const [email, setEmail] = useState("alex.student@gapfinder.ai");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const callbackError = new URLSearchParams(window.location.search).get("auth_error");
    if (callbackError) {
      setErrorMessage(callbackError === "not_configured"
        ? "Live authentication is not configured. Add the Supabase URL and public key to .env.local."
        : "Email confirmation could not be completed. Request a new confirmation email or sign in again.");
    }
  }, []);

  const handleDemoLogin = () => {
    setErrorMessage("");
    setIsLoading(true);
    resetToDemoDefaults();
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!isSupabaseConfigured) {
      setErrorMessage("Live authentication is not configured. Add the Supabase URL and public key to .env.local, or use the demo account.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase client is unavailable.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        logAuthError("login", error);
        setErrorMessage(error.message);
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      const authError = error instanceof Error ? error : new Error("Unable to sign in.");
      logAuthError("login", authError);
      setErrorMessage(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 selection:bg-brand-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">GapFinder AI</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-white">Sign in to your learning account</h2>
        <p className="text-xs text-slate-400">
          Access your syllabus materials, diagnostic tests, and adaptive study calendar.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10 space-y-6">
          {/* Quick Demo Access Box */}
          <div className="p-4 rounded-xl bg-brand-950/60 border border-brand-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-brand-400" />
                Judges & Evaluators 1-Click Access
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                Pre-Seeded
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly log in as <strong>Alex Morgan</strong> (CS301 Distributed Systems student) with loaded syllabus, weak topics, and quiz history.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-brand-600/20"
            >
              <span>Launch Demo Student Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or standard credentials</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            {errorMessage && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <span className="text-[11px] text-brand-400 hover:underline cursor-pointer">Forgot?</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <span>{isLoading ? "Signing in…" : "Sign In with Password"}</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="font-semibold text-brand-400 hover:underline">
              Register with onboarding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
