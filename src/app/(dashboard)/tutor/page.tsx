"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  BotMessageSquare,
  Send,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  User,
  ExternalLink,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CitationBadge } from "@/components/ui/citation-badge";
import { searchDocumentChunks } from "@/lib/rag/vector-store";
import { generateMockTutorResponse } from "@/lib/ai/mock-ai";
import { TutorChatMessage } from "@/lib/types";

export default function AITutorPage() {
  const { state, addTutorMessage } = useGapFinderStore();
  const { tutorMessages, topics, subjects, chunks } = state;

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "sub-cs301");
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || "");
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tutorMessages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isGenerating) return;

    setInputQuery("");

    // 1. Add student message
    const userMsg: TutorChatMessage = {
      id: `msg-user-${Date.now()}`,
      userId: state.profile.id,
      subjectId: selectedSubjectId,
      topicId: selectedTopicId,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
      citations: [],
      isUnsupported: false,
    };
    addTutorMessage(userMsg);
    setIsGenerating(true);

    // 2. Execute RAG Retrieval against authenticated student's indexed chunks
    setTimeout(() => {
      const retrievalResults = searchDocumentChunks(chunks, {
        query,
        userId: state.profile.id,
        subjectId: selectedSubjectId,
        threshold: 0.35,
        maxResults: 3,
      });

      const citations = retrievalResults.map((r) => r.citation);

      // Generate response grounded strictly in retrieved chunks
      const response = generateMockTutorResponse({
        topicTitle: activeTopic?.title || "Core Concepts",
        query,
        citations,
      });

      const botMsg: TutorChatMessage = {
        id: `msg-bot-${Date.now()}`,
        userId: state.profile.id,
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        role: "assistant",
        content: response.content,
        difficultyLevel,
        citations: response.citations,
        isUnsupported: response.isUnsupported,
        timestamp: new Date().toISOString(),
      };

      addTutorMessage(botMsg);
      setIsGenerating(false);
    }, 700);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputQuery(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Explain-This-Topic AI Tutor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Material-grounded conversational tutor. Every statement is strictly linked to uploaded PDF notes and pages.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Topic Selector */}
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 max-w-xs truncate"
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          {/* Difficulty Level */}
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value as any)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="beginner">Beginner (Intuitive)</option>
            <option value="intermediate">Intermediate (Standard)</option>
            <option value="advanced">Advanced (Deep Rigor)</option>
          </select>
        </div>
      </div>

      {/* Main Chat Interface */}
      <Card className="border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {tutorMessages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-brand-600 text-white"
                      : "bg-navy-950 text-brand-300 border border-navy-800"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-2xl">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-brand-600 text-white rounded-tr-none shadow-xs"
                        : msg.isUnsupported
                        ? "bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Grounded Source Citations */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pl-1">
                      <CitationBadge citations={msg.citations} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-navy-950 text-brand-300 flex items-center justify-center shrink-0">
                <BotMessageSquare className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                <span>Searching student notes & verifying source citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Queries */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-600">
          <span className="shrink-0 font-semibold text-slate-400">Quick prompts:</span>
          {[
            "Why does standard 2PL not prevent cascading aborts?",
            "Explain Phantom Reads with a concrete SQL example",
            "What is the min(recLSN) rule during ARIES Redo phase?",
            "What happens if a Raft candidate experiences split votes?",
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shrink-0 truncate max-w-[280px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Ask a question grounded in ${activeTopic?.title || "your study material"}...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors shadow-sm"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
