"use client";

import React, { useState } from "react";
import { useGapFinderStore } from "@/lib/db/store";
import {
  Network,
  Plus,
  Edit2,
  CheckCircle2,
  FileText,
  Star,
  Layers,
  ChevronDown,
  ChevronRight,
  BookMarked,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { getMasteryBadgeDetails } from "@/lib/utils";
import { Topic, ProvenanceType } from "@/lib/types";

export default function SubjectsTopicMapPage() {
  const { state, updateTopic, addTopic, markTopicLearned } = useGapFinderStore();
  const { subjects, topics, documents } = state;

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "sub-cs301");
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  const [newTopicData, setNewTopicData] = useState({
    chapterTitle: "Chapter 2: Concurrency & Isolation",
    title: "",
    subtopicTitle: "",
    confidence: 3,
    provenance: "manual" as ProvenanceType,
  });

  const subjectTopics = topics.filter((t) => t.subjectId === selectedSubjectId);

  // Group topics by chapter
  const chaptersMap = new Map<string, Topic[]>();
  subjectTopics.forEach((t) => {
    const list = chaptersMap.get(t.chapterTitle) || [];
    list.push(t);
    chaptersMap.set(t.chapterTitle, list);
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicData.title.trim()) return;

    const newTopic: Topic = {
      id: `top-custom-${Date.now()}`,
      subjectId: selectedSubjectId,
      userId: state.profile.id,
      chapterTitle: newTopicData.chapterTitle,
      title: newTopicData.title,
      subtopicTitle: newTopicData.subtopicTitle,
      confidence: newTopicData.confidence,
      masteryScore: 0,
      masteryLevel: "insufficient_evidence",
      masteryReason: "Manually added topic; requires diagnostic verification.",
      provenance: newTopicData.provenance,
      sourceDocumentIds: [],
      questionsAttempted: 0,
      questionsCorrect: 0,
      repeatedErrorPatterns: [],
      isLearned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTopic(newTopic);
    setIsAddingTopic(false);
    setNewTopicData({
      chapterTitle: "Chapter 2: Concurrency & Isolation",
      title: "",
      subtopicTitle: "",
      confidence: 3,
      provenance: "manual",
    });
  };

  const handleUpdateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    updateTopic(editingTopic.id, {
      title: editingTopic.title,
      subtopicTitle: editingTopic.subtopicTitle,
      chapterTitle: editingTopic.chapterTitle,
      confidence: editingTopic.confidence,
    });
    setEditingTopic(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Curriculum Topic Hierarchy</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchical mapping of subjects, units, topics, and subtopics with source provenance and confidence ratings.
          </p>
        </div>

        <button
          onClick={() => setIsAddingTopic(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Topic</span>
        </button>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubjectId(sub.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedSubjectId === sub.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Chapters & Topics Tree */}
      <div className="space-y-6">
        {Array.from(chaptersMap.entries()).map(([chapterTitle, chapterTopics]) => (
          <Card key={chapterTitle} className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-200 py-3 px-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-brand-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  {chapterTitle}
                </CardTitle>
                <span className="text-[11px] text-slate-500">
                  ({chapterTopics.length} topics)
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {chapterTopics.map((topic) => {
                const badge = getMasteryBadgeDetails(topic.masteryLevel, topic.masteryScore);
                return (
                  <div
                    key={topic.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{topic.title}</span>
                        {/* Provenance Tag */}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border ${
                            topic.provenance === "syllabus"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : topic.provenance === "notes"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          Source: {topic.provenance}
                        </span>

                        {topic.isLearned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Learned
                          </span>
                        )}
                      </div>

                      {topic.subtopicTitle && (
                        <p className="text-xs text-slate-500">{topic.subtopicTitle}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        {/* Self-Confidence */}
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-slate-400">Self-Confidence:</span>
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= topic.confidence ? "fill-amber-400" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Questions Attempted */}
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400">Tested: </span>
                          <span className="font-medium text-slate-700">{topic.questionsAttempted} attempts</span>
                        </div>
                      </div>
                    </div>

                    {/* Mastery Level & Score */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right w-36">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${badge.bgColor}`}>
                          {badge.label}: {topic.masteryScore}%
                        </span>
                        <div className="mt-1.5">
                          <Progress value={topic.masteryScore} barColor={badge.barColor} />
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => markTopicLearned(topic.id, !topic.isLearned)}
                          className={`p-1.5 rounded transition-colors ${
                            topic.isLearned
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={topic.isLearned ? "Mark as unlearned" : "Mark as learned"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTopic(topic)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Topic"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Topic Modal */}
      {editingTopic && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTopic(null)}
          title="Edit Topic Details"
          description="Update topic title, chapter, or self-reported confidence"
        >
          <form onSubmit={handleUpdateTopic} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chapter / Unit</label>
              <input
                type="text"
                value={editingTopic.chapterTitle}
                onChange={(e) =>
                  setEditingTopic({ ...editingTopic, chapterTitle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topic Name</label>
              <input
                type="text"
                value={editingTopic.title}
                onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subtopics / Concepts</label>
              <input
                type="text"
                value={editingTopic.subtopicTitle || ""}
                onChange={(e) =>
                  setEditingTopic({ ...editingTopic, subtopicTitle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Self-Reported Confidence ({editingTopic.confidence}/5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={editingTopic.confidence}
                onChange={(e) =>
                  setEditingTopic({ ...editingTopic, confidence: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-brand-600 text-white font-semibold hover:bg-brand-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Custom Topic Modal */}
      {isAddingTopic && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddingTopic(false)}
          title="Add Missing Syllabus Topic"
          description="Create a curriculum topic to track and test"
        >
          <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chapter / Unit</label>
              <input
                type="text"
                required
                value={newTopicData.chapterTitle}
                onChange={(e) =>
                  setNewTopicData({ ...newTopicData, chapterTitle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topic Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed 2PC (Two-Phase Commit)"
                value={newTopicData.title}
                onChange={(e) => setNewTopicData({ ...newTopicData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subtopics / Keywords</label>
              <input
                type="text"
                placeholder="e.g. Prepare phase, Commit phase, Coordinator crash"
                value={newTopicData.subtopicTitle}
                onChange={(e) =>
                  setNewTopicData({ ...newTopicData, subtopicTitle: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTopic(false)}
                className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-brand-600 text-white font-semibold hover:bg-brand-500"
              >
                Create Topic
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
