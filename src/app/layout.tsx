import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GapFinder AI — Targeted Student Knowledge Gap Learning System",
  description: "Identify what you don't understand, study from grounded course materials, complete weekly tests, and track evidence-based mastery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
