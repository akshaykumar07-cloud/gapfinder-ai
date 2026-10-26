import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 select-none";
    
    const variants = {
      default: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm active:bg-brand-800",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
      outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
      ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      link: "text-brand-600 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes = {
      default: "h-9 px-4 py-2 text-sm rounded-md",
      sm: "h-8 px-3 text-xs rounded-md",
      lg: "h-11 px-6 text-base rounded-lg",
      icon: "h-9 w-9 rounded-md",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
