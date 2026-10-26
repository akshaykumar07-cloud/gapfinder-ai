import { Question, CitationReference, PracticalExercise } from "../types";

export interface MockRAGContext {
  topicTitle: string;
  query: string;
  citations: CitationReference[];
}

export function generateMockTutorResponse(context: MockRAGContext): {
  content: string;
  citations: CitationReference[];
  isUnsupported: boolean;
} {
  const { topicTitle, query, citations } = context;

  if (!citations || citations.length === 0) {
    return {
      content: `[Demo Mode / Mock RAG Response] ⚠️ **Insufficient Grounding Material Found**: The uploaded documents do not contain enough relevant text to ground an answer for "${query}".\n\nTo ensure academic accuracy and prevent AI hallucinations, please upload supplementary lecture notes or textbooks covering this concept in the **Study Materials** section.`,
      citations: [],
      isUnsupported: true,
    };
  }

  const primaryCit = citations[0];
  const response = `[Demo Mode / Mock RAG Response]\n\nBased on **${primaryCit.documentName}** (${primaryCit.sectionTitle}, Page ${primaryCit.pageNumber}):\n\nWhen exploring **${topicTitle}**, the source material emphasizes the following critical principles:\n\n1. **Core Mechanism**: "${primaryCit.relevantExcerpt}"\n2. **Academic Implication**: In distributed and concurrent environments, this rule ensures serializability and crash recovery guarantees without requiring full lock stalls.\n3. **Practical Application**: When designing transactional workflows, always verify whether your isolation level protects against anomalies such as dirty reads or phantoms.\n\n*Would you like to solve a targeted practice problem or explore a worked example on this topic?*`;

  return {
    content: response,
    citations,
    isUnsupported: false,
  };
}

export function generateMockAssessmentQuestions(
  topicTitle: string,
  citations: CitationReference[],
  type: "diagnostic" | "weekly_test"
): Question[] {
  const cit = citations[0] || {
    documentId: "doc-sample",
    documentName: "Syllabus Notes",
    pageNumber: 1,
    sectionTitle: "Module Core",
    relevantExcerpt: "Key concepts and properties for " + topicTitle,
    similarityScore: 0.9,
  };

  return [
    {
      id: `q-${type}-${Date.now()}-1`,
      topicId: "topic-active",
      topicTitle,
      subjectId: "sub-cs301",
      type: "mcq",
      difficulty: "medium",
      questionText: `Under the principles outlined in ${cit.sectionTitle}, which statement accurately describes the primary guarantee of ${topicTitle}?`,
      options: [
        `It guarantees strict serializability and prevents uncommitted dirty reads.`,
        `It permits arbitrary interleaving of transactions without isolation locks.`,
        `It relaxes consistency to achieve zero network latency.`,
        `It automatically rolls back all active transactions every 5 minutes.`
      ],
      correctOptionIndex: 0,
      expectedAnswer: `It guarantees strict serializability and prevents uncommitted dirty reads.`,
      rubric: [
        { criteria: "Selects the verified syllabus isolation guarantee", points: 25 }
      ],
      explanation: `As detailed in ${cit.documentName} (Page ${cit.pageNumber}), this principle enforces strict transaction isolation and prevents data anomalies.`,
      citations: [cit],
      maxMarks: 25,
    },
    {
      id: `q-${type}-${Date.now()}-2`,
      topicId: "topic-active",
      topicTitle,
      subjectId: "sub-cs301",
      type: "short_answer",
      difficulty: "hard",
      questionText: `Explain why the mechanism described in ${cit.sectionTitle} is necessary to prevent state inconsistencies during unexpected node or system failure.`,
      expectedAnswer: `The mechanism ensures that all operations are recorded in persistent storage before memory buffers are updated, allowing crash recovery to reconstruct consistent state.`,
      rubric: [
        { criteria: "Mentions persistent storage logging before memory modification", points: 15 },
        { criteria: "Explains crash recovery reconstruction", points: 10 }
      ],
      explanation: `Without persistent pre-logging, dirty pages could be lost during abrupt power failures, violating durability.`,
      citations: [cit],
      maxMarks: 25,
    }
  ];
}
