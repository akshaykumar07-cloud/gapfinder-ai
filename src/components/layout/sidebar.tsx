"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Network,
  HelpCircle,
  FileCheck2,
  TrendingDown,
  CalendarDays,
  Dumbbell,
  BotMessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  Flame,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { useGapFinderStore } from "@/lib/db/store";
import { createClient, isSupabaseConfigured, logAuthError } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/materials", label: "Study Materials", icon: FileText },
  { href: "/subjects", label: "Subjects & Topics", icon: Network },
  { href: "/diagnostic", label: "Diagnostic Quiz", icon: HelpCircle },
  { href: "/tests", label: "Weekly Tests", icon: FileCheck2 },
  { href: "/gaps", label: "Gap Analysis", icon: TrendingDown },
  { href: "/planner", label: "Study Planner", icon: CalendarDays },
  { href: "/practice", label: "Practical Lab", icon: Dumbbell },
  { href: "/tutor", label: "AI Topic Tutor", icon: BotMessageSquare },
  { href: "/progress", label: "Progress Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings & Alerts", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useGapFinderStore();
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLogoutError("");
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          logAuthError("logout", error);
          setLogoutError(error.message);
          return;
        }
      }
    }
    router.push("/login");
  };

  const weakCount = state.topics.filter((t) => t.masteryLevel === "weak").length;
  const completedTodayTasks = state.currentPlan.tasks.filter((t) => t.status === "completed").length;

  return (
    <aside className="w-64 shrink-0 bg-navy-950 text-slate-300 border-r border-navy-800 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              GapFinder <span className="text-xs px-1.5 py-0.2 rounded bg-brand-500/30 text-brand-300 font-mono">AI</span>
            </div>
            <div className="text-[11px] text-slate-400">Targeted Learning System</div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-navy-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.href === "/gaps" && weakCount > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  isActive ? "bg-white text-brand-700" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                )}>
                  {weakCount} weak
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Student Streak and Exam Status */}
      <div className="p-3 m-3 rounded-xl bg-navy-900 border border-navy-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            6-Day Streak
          </span>
          <span className="text-[11px] text-slate-400">Target: Nov 20</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Today&apos;s Tasks:</span>
          <span className="font-medium text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {completedTodayTasks}/{state.currentPlan.tasks.length} done
          </span>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-navy-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-300">
            {state.profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{state.profile.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{state.profile.email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-2 text-slate-400 hover:bg-navy-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {logoutError && <p role="alert" className="mt-2 text-[10px] text-red-300">{logoutError}</p>}
      </div>
    </aside>
  );
}
