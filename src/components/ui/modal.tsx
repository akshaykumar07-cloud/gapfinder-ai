import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 duration-200 animate-in zoom-in-95",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>

        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
