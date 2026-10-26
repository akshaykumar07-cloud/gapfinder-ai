import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MasteryLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getMasteryBadgeDetails(level: MasteryLevel, score?: number) {
  switch (level) {
    case "weak":
      return {
        label: "Weak",
        bgColor: "bg-rose-50 text-rose-700 border-rose-200",
        badgeColor: "bg-rose-500",
        barColor: "bg-rose-500",
        textColor: "text-rose-600",
        description: score !== undefined ? `${score}% mastery (Below 50%)` : "Below 50%",
      };
    case "medium":
      return {
        label: "Medium",
        bgColor: "bg-amber-50 text-amber-700 border-amber-200",
        badgeColor: "bg-amber-500",
        barColor: "bg-amber-500",
        textColor: "text-amber-600",
        description: score !== undefined ? `${score}% mastery (50–79%)` : "50–79%",
      };
    case "strong":
      return {
        label: "Strong",
        bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        badgeColor: "bg-emerald-500",
        barColor: "bg-emerald-500",
        textColor: "text-emerald-600",
        description: score !== undefined ? `${score}% mastery (80%+)` : "80% or above",
      };
    case "insufficient_evidence":
    default:
      return {
        label: "Insufficient Data",
        bgColor: "bg-slate-100 text-slate-700 border-slate-200",
        badgeColor: "bg-slate-400",
        barColor: "bg-slate-400",
        textColor: "text-slate-500",
        description: "Not assessed or low sample size",
      };
  }
}
