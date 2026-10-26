"use client";

import React, { useState } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  Settings,
  Bell,
  User,
  Clock,
  Calendar,
  Shield,
  RotateCcw,
  CheckCircle2,
  Mail,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsAlertsPage() {
  const { state, updateProfile, resetToDemoDefaults } = useGapFinderStore();
  const { profile } = state;

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    dailyStudyHours: profile.dailyStudyHours,
    sessionDurationMinutes: profile.sessionDurationMinutes,
    targetExamDate: profile.targetExamDate,
    browserNotificationsEnabled: profile.browserNotificationsEnabled,
    emailRemindersEnabled: profile.emailRemindersEnabled,
    reminderTime: profile.reminderTimes[0] || "08:30",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [browserPermissionStatus, setBrowserPermissionStatus] = useState<string>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermissionStatus(perm);
      if (perm === "granted") {
        setFormData({ ...formData, browserNotificationsEnabled: true });
        new Notification("GapFinder AI", {
          body: "Browser alerts enabled! You'll receive scheduled study reminders.",
        });
      }
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      dailyStudyHours: formData.dailyStudyHours,
      sessionDurationMinutes: formData.sessionDurationMinutes,
      targetExamDate: formData.targetExamDate,
      browserNotificationsEnabled: formData.browserNotificationsEnabled,
      emailRemindersEnabled: formData.emailRemindersEnabled,
      reminderTimes: [formData.reminderTime],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings & Study Reminders</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure notification alerts, study hour constraints, and target examination dates.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Info */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Student Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Examination Date</label>
              <input
                type="date"
                value={formData.targetExamDate}
                onChange={(e) => setFormData({ ...formData, targetExamDate: e.target.value })}
                className="w-full sm:w-64 px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Study Time Constraints */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Adaptive Study Constraints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Scheduler will strictly cap daily tasks to this duration.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Duration
                </label>
                <select
                  value={formData.sessionDurationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionDurationMinutes: parseInt(e.target.value) || 45,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification & Reminder Settings */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600" />
              Study Reminders & Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-brand-600" />
                  Browser Push Notifications
                </span>
                <p className="text-[11px] text-slate-500">
                  Status: {browserPermissionStatus}
                </p>
              </div>
              {browserPermissionStatus === "granted" ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Enabled
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestBrowserPermission}
                  className="px-3 py-1.5 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
                >
                  Enable Permissions
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-brand-600" />
                  Email Digest & Upcoming Assessment Reminders
                </span>
                <p className="text-[11px] text-slate-500">
                  Sends weekly progress reports and incomplete task alerts to {profile.email}
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.emailRemindersEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, emailRemindersEnabled: e.target.checked })
                }
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preferred Daily Reminder Time
              </label>
              <input
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={resetToDemoDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
