"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGapFinderStore } from "@/lib/db/store";
import {
  Bell,
  CheckCheck,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

export function TopNav() {
  const pathname = usePathname();
  const { state, resetToDemoDefaults, markNotificationRead, markAllNotificationsRead } = useGapFinderStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const unreadCount = state.notifications.filter((n) => !n.isRead).length;

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return { title: "Personalized Learning Overview", subtitle: "Real-time mastery status and daily goals" };
      case "/materials":
        return { title: "Study Materials & Notes", subtitle: "Upload, chunk, and index syllabus documents with pgvector" };
      case "/subjects":
        return { title: "Topic Knowledge Map", subtitle: "Curriculum hierarchy, provenance, and chapter coverage" };
      case "/diagnostic":
        return { title: "Diagnostic Assessment", subtitle: "Identify precise knowledge gaps grounded in uploaded materials" };
      case "/tests":
        return { title: "Weekly Tests & History", subtitle: "Adaptive evaluation, spaced recall, and performance benchmarks" };
      case "/gaps":
        return { title: "Topic Gap Analysis", subtitle: "Multi-factor mastery formula, sample size thresholds, and error trends" };
      case "/planner":
        return { title: "Adaptive Study Planner", subtitle: "Time-constrained daily schedule prioritizing weak concepts" };
      case "/practice":
        return { title: "Practical Problem Lab", subtitle: "Step-by-step worked examples, scenarios, and reflective learning" };
      case "/tutor":
        return { title: "Explain-This-Topic AI Tutor", subtitle: "Grounded conversational tutor with strict citation enforcement" };
      case "/progress":
        return { title: "Progress & Analytics", subtitle: "Empirical score trends, mastery evolution, and exportable reports" };
      case "/settings":
        return { title: "Settings & Study Reminders", subtitle: "Exam schedules, notification alerts, and account preferences" };
      default:
        return { title: "GapFinder AI", subtitle: "Adaptive Student Learning System" };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold text-slate-900 leading-none">{title}</h1>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset database to verified demo curriculum"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo State</span>
        </button>

        {/* Quick Diagnostic Link */}
        <Link
          href="/diagnostic"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Take Diagnostic</span>
        </Link>

        {/* Quick Material Upload Link */}
        <Link
          href="/materials"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Materials</span>
        </Link>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount} new)</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {state.notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                ) : (
                  state.notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        n.isRead ? "bg-slate-50 text-slate-600" : "bg-brand-50/60 text-slate-900 font-medium border border-brand-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-brand-600 rounded-full" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-0">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset Demo Data?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This will restore the complete CS301 syllabus, notes, topic mastery scores, diagnostic quiz attempts, and adaptive study plan to verified baseline state.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDemoDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 rounded-md"
              >
                Reset to Seed Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
