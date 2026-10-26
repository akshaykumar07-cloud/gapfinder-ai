import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "info" | "success" | "warning" | "destructive";
  title?: string;
}

export function Alert({ variant = "default", title, children, className, ...props }: AlertProps) {
  const icons = {
    default: <Info className="h-4 w-4 text-slate-600 mt-0.5" />,
    info: <Info className="h-4 w-4 text-brand-600 mt-0.5" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />,
    destructive: <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5" />,
  };

  const styles = {
    default: "bg-slate-50 border-slate-200 text-slate-800",
    info: "bg-brand-50/60 border-brand-200 text-brand-900",
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50/70 border-amber-200 text-amber-900",
    destructive: "bg-rose-50/70 border-rose-200 text-rose-900",
  };

  return (
    <div
      role="alert"
      className={cn("relative flex gap-3 rounded-lg border p-4 text-sm", styles[variant], className)}
      {...props}
    >
      <div className="shrink-0">{icons[variant]}</div>
      <div className="flex-1">
        {title && <h5 className="mb-1 font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
