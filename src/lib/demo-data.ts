import { 
  UserProfile, 
  Subject, 
  Topic, 
  StudyDocument, 
  DocumentChunk, 
  Question, 
  AssessmentAttempt, 
  StudyTask, 
  StudyPlan, 
  PracticalExercise,
  TutorChatMessage,
  NotificationItem,
  AnalyticsSummary
} from "./types";

export const DEMO_USER_ID = "demo-user-student-01";

export const initialDemoProfile: UserProfile = {
  id: DEMO_USER_ID,
  email: "alex.student@gapfinder.ai",
  name: "Alex Morgan",
  educationLevel: "undergraduate",
  examGoals: ["Score 90%+ in CS301 Finals", "Master Distributed Storage", "Ace System Design Quiz"],
  syllabusName: "CS301: Database Management & Distributed Systems (Spring 2026)",
  targetExamDate: "2026-11-20",
  availableDays: ["mon", "tue", "wed", "thu", "sat", "sun"],
  dailyStudyHours: 2.5,
  sessionDurationMinutes: 45,
  preferredLanguage: "en",
  reminderTimes: ["08:30", "18:00"],
  browserNotificationsEnabled: true,
  emailRemindersEnabled: true,
  onboardingCompleted: true,
  isDemoUser: true,
  createdAt: "2026-10-01T09:00:00Z",
};

export const initialDemoSubjects: Subject[] = [
  {
    id: "sub-cs301",
    userId: DEMO_USER_ID,
    name: "CS301: Distributed Systems & DBs",
    code: "CS301",
    description: "Core concepts of transactions, replication, consistency models, and crash recovery.",
    color: "#4F46E5",
    icon: "Database",
    targetExamDate: "2026-11-20",
    createdAt: "2026-10-01T09:10:00Z",
  },
  {
    id: "sub-cs302",
    userId: DEMO_USER_ID,
    name: "CS302: Operating Systems Architecture",
    code: "CS302",
    description: "Virtual memory, CPU scheduling, concurrent synchronization primitives.",
    color: "#0D9488",
    icon: "Cpu",
    targetExamDate: "2026-11-28",
    createdAt: "2026-10-02T10:00:00Z",
  }
];

export const initialDemoDocuments: StudyDocument[] = [
  {
    id: "doc-syllabus",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    filename: "CS301_Official_Syllabus_2026.pdf",
    originalName: "CS301_Official_Syllabus_2026.pdf",
    fileSizeBytes: 428000,
    fileType: "application/pdf",
    processingStatus: "indexed",
    totalChunks: 8,
    totalCharacters: 14200,
    extractedTextSnippet: "Course Syllabus: CS301 Database Systems and Distributed Infrastructure. Prerequisites: Data Structures...",
    createdAt: "2026-10-02T11:00:00Z",
    processedAt: "2026-10-02T11:00:45Z",
  },
  {
    id: "doc-transactions",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    filename: "Module2_ACID_Transactions_Concurrency.pdf",
    originalName: "Module2_ACID_Transactions_Concurrency.pdf",
    fileSizeBytes: 1250000,
    fileType: "application/pdf",
    processingStatus: "indexed",
    totalChunks: 24,
    totalCharacters: 46200,
    extractedTextSnippet: "Chapter 2: Concurrency Control and Transaction Isolation. Section 2.1 Write-Ahead Logging (WAL) ensures Atomicity and Durability...",
    createdAt: "2026-10-03T14:20:00Z",
    processedAt: "2026-10-03T14:21:10Z",
  },
  {
    id: "doc-consensus",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    filename: "Module4_Raft_Consensus_and_CAP.pdf",
    originalName: "Module4_Raft_Consensus_and_CAP.pdf",
    fileSizeBytes: 1890000,
    fileType: "application/pdf",
    processingStatus: "indexed",
    totalChunks: 32,
    totalCharacters: 58900,
    extractedTextSnippet: "Chapter 4: Distributed State Machine Replication. Section 4.2 Leader Election & Safety Invariants in the Raft Consensus Protocol...",
    createdAt: "2026-10-05T16:00:00Z",
    processedAt: "2026-10-05T16:01:25Z",
  }
];

export const initialDemoChunks: DocumentChunk[] = [
  {
    id: "chunk-wal-01",
    documentId: "doc-transactions",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chunkIndex: 3,
    content: "Section 2.1: Write-Ahead Logging (WAL) and ARIES Recovery. The fundamental rule of WAL mandates that any change to a data page in the buffer pool must be logged on non-volatile disk storage BEFORE the data page itself is written to disk (Force/No-Steal policy tradeoffs). In ARIES, recovery proceeds in three phases: 1. Analysis Phase (reconstructs dirty pages table and active transactions), 2. Redo Phase (repeats history starting from smallest recLSN), and 3. Undo Phase (rolls back uncommitted transactions in reverse chronological order using prevLSN pointers).",
    tokenCount: 98,
    pageNumber: 4,
    sectionTitle: "Section 2.1: Write-Ahead Logging & ARIES Crash Recovery",
    createdAt: "2026-10-03T14:21:00Z",
  },
  {
    id: "chunk-2pl-02",
    documentId: "doc-transactions",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chunkIndex: 7,
    content: "Section 2.4: Two-Phase Locking (2PL) vs Strict 2PL and Isolation Anomalies. In standard 2PL, a transaction has a growing phase (acquiring locks) and a shrinking phase (releasing locks). Standard 2PL guarantees conflict serializability, but it does NOT prevent cascading aborts. Strict 2PL (S2PL) requires all exclusive (X) write locks to be held until the transaction explicitly commits or aborts. Rigorous 2PL holds both Shared (S) and Exclusive (X) locks until commit. Phantom reads occur when a transaction queries a predicate (e.g. SELECT WHERE age > 30) and another transaction inserts a matching tuple because only existing records, not predicates, were locked.",
    tokenCount: 114,
    pageNumber: 8,
    sectionTitle: "Section 2.4: Two-Phase Locking (2PL) and Phantom Reads",
    createdAt: "2026-10-03T14:21:05Z",
  },
  {
    id: "chunk-raft-03",
    documentId: "doc-consensus",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chunkIndex: 12,
    content: "Section 4.2: Raft Leader Election & Invariants. Raft maintains 5 core safety properties: 1. Election Safety: At most one leader can be elected in a given term. 2. Leader Append-Only: A leader never overwrites or truncates its own log entries. 3. Log Matching Property: If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index. 4. Leader Completeness: If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms. 5. State Machine Safety: If a server applied an entry at index i, no other server will ever apply a different entry for index i.",
    tokenCount: 122,
    pageNumber: 15,
    sectionTitle: "Section 4.2: Raft Safety Invariants & Election Protocol",
    createdAt: "2026-10-05T16:01:10Z",
  },
  {
    id: "chunk-cap-04",
    documentId: "doc-consensus",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chunkIndex: 19,
    content: "Section 4.5: CAP Theorem and PACELC Tradeoffs. Brewer's CAP theorem proves that in an asynchronous network subject to partitions (P), a distributed system must choose between linearizable Consistency (C) and Availability (A). Abadi extended this with the PACELC theorem: If there is a Partition (P), trade off Availability (A) and Consistency (C); Else (E), trade off Latency (L) and Consistency (C). For example, Dynamo-style databases choose PA/EL, whereas Spanner and Raft clusters choose PC/EC.",
    tokenCount: 88,
    pageNumber: 22,
    sectionTitle: "Section 4.5: CAP vs PACELC Distributed Guarantees",
    createdAt: "2026-10-05T16:01:20Z",
  }
];

export const initialDemoTopics: Topic[] = [
  {
    id: "top-2pl",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chapterTitle: "Chapter 2: Concurrency & Isolation",
    title: "Two-Phase Locking & Isolation Levels",
    subtopicTitle: "Strict 2PL, Deadlock Cycles & Phantom Anomalies",
    confidence: 2, // Low self-confidence
    masteryScore: 38, // Weak (< 50%)
    masteryLevel: "weak",
    masteryReason: "Frequent errors on isolation levels (Phantom Reads) and cascading abort conditions across 4 test questions.",
    provenance: "syllabus",
    sourceDocumentIds: ["doc-transactions"],
    questionsAttempted: 5,
    questionsCorrect: 2,
    lastAssessedAt: "2026-10-22T14:00:00Z",
    repeatedErrorPatterns: [
      "Confusing Non-Repeatable Read with Phantom Read",
      "Assuming 2PL prevents cascading aborts without the Strict rule"
    ],
    isLearned: false,
    createdAt: "2026-10-03T15:00:00Z",
    updatedAt: "2026-10-22T14:30:00Z",
  },
  {
    id: "top-wal",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chapterTitle: "Chapter 2: Concurrency & Isolation",
    title: "Write-Ahead Logging & ARIES Recovery",
    subtopicTitle: "Analysis, Redo, Undo phases and recLSN tracking",
    confidence: 3,
    masteryScore: 64, // Medium (50-79%)
    masteryLevel: "medium",
    masteryReason: "Moderate understanding: correct on WAL invariants but missed checkpoint Dirty Page Table questions.",
    provenance: "syllabus",
    sourceDocumentIds: ["doc-transactions"],
    questionsAttempted: 6,
    questionsCorrect: 4,
    lastAssessedAt: "2026-10-23T11:15:00Z",
    repeatedErrorPatterns: ["Miscalculating compensation log records (CLR) during Undo"],
    isLearned: false,
    createdAt: "2026-10-03T15:05:00Z",
    updatedAt: "2026-10-23T11:45:00Z",
  },
  {
    id: "top-acid",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chapterTitle: "Chapter 2: Concurrency & Isolation",
    title: "ACID Fundamentals & Serializability",
    subtopicTitle: "Conflict vs View Serializability & Precedence Graphs",
    confidence: 5,
    masteryScore: 88, // Strong (80%+)
    masteryLevel: "strong",
    masteryReason: "Consistent high performance across 10 recent questions. Clear grasp of cycle detection in precedence graphs.",
    provenance: "syllabus",
    sourceDocumentIds: ["doc-transactions"],
    questionsAttempted: 10,
    questionsCorrect: 9,
    lastAssessedAt: "2026-10-24T16:20:00Z",
    repeatedErrorPatterns: [],
    isLearned: true,
    createdAt: "2026-10-03T15:10:00Z",
    updatedAt: "2026-10-24T16:45:00Z",
  },
  {
    id: "top-raft",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chapterTitle: "Chapter 4: Distributed State Replication",
    title: "Raft Consensus Invariants & Leader Election",
    subtopicTitle: "Election safety, randomized timeouts, and log matching",
    confidence: 3,
    masteryScore: 72, // Medium
    masteryLevel: "medium",
    masteryReason: "Mastered randomized election timeouts; requires revision on log commitment rules for previous terms.",
    provenance: "syllabus",
    sourceDocumentIds: ["doc-consensus"],
    questionsAttempted: 4,
    questionsCorrect: 3,
    lastAssessedAt: "2026-10-25T10:00:00Z",
    repeatedErrorPatterns: ["Counting uncommitted entries from prior terms toward majority rule"],
    isLearned: false,
    createdAt: "2026-10-05T16:30:00Z",
    updatedAt: "2026-10-25T10:30:00Z",
  },
  {
    id: "top-cap",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chapterTitle: "Chapter 4: Distributed State Replication",
    title: "CAP Theorem & PACELC Tradeoffs",
    subtopicTitle: "Latency vs Consistency in partitions and normal operation",
    confidence: 4,
    masteryScore: 82, // Strong
    masteryLevel: "strong",
    masteryReason: "Demonstrated accurate application of PACELC to modern NoSQL and NewSQL engines.",
    provenance: "notes",
    sourceDocumentIds: ["doc-consensus"],
    questionsAttempted: 5,
    questionsCorrect: 4,
    lastAssessedAt: "2026-10-25T15:00:00Z",
    repeatedErrorPatterns: [],
    isLearned: true,
    createdAt: "2026-10-05T16:35:00Z",
    updatedAt: "2026-10-25T15:30:00Z",
  },
  {
    id: "top-snapshots",
    subjectId: "sub-cs301",
    userId: DEMO_USER_ID,
    chapterTitle: "Chapter 4: Distributed State Replication",
    title: "Raft Log Compaction & Snapshotting",
    subtopicTitle: "InstallSnapshot RPC and state machine memory management",
    confidence: 2,
    masteryScore: 0,
    masteryLevel: "insufficient_evidence",
    masteryReason: "No diagnostic or test questions attempted yet for this topic.",
    provenance: "syllabus",
    sourceDocumentIds: ["doc-consensus"],
    questionsAttempted: 0,
    questionsCorrect: 0,
    lastAssessedAt: undefined,
    repeatedErrorPatterns: [],
    isLearned: false,
    createdAt: "2026-10-06T12:00:00Z",
    updatedAt: "2026-10-06T12:00:00Z",
  }
];

export const sampleDiagnosticQuestions: Question[] = [
  {
    id: "q-diag-01",
    topicId: "top-2pl",
    topicTitle: "Two-Phase Locking & Isolation Levels",
    subjectId: "sub-cs301",
    type: "mcq",
    difficulty: "medium",
    questionText: "Under standard Two-Phase Locking (2PL), what critical problem can still occur that Strict Two-Phase Locking (S2PL) specifically prevents?",
    options: [
      "Deadlock cycles between concurrent transactions",
      "Cascading aborts caused by reading uncommitted dirty data",
      "Non-serializable execution schedules",
      "Starvation of low-priority transactions"
    ],
    correctOptionIndex: 1,
    expectedAnswer: "Cascading aborts caused by reading uncommitted dirty data",
    rubric: [
      { criteria: "Selects cascading aborts prevented by Strict 2PL", points: 20 }
    ],
    explanation: "Standard 2PL guarantees serializability by acquiring all locks before releasing any. However, if Transaction A releases an exclusive lock before committing and Transaction B reads that modified value, an abort of A forces B to abort as well (cascading abort). Strict 2PL prevents this by holding all exclusive locks until transaction commit.",
    citations: [
      {
        documentId: "doc-transactions",
        documentName: "Module2_ACID_Transactions_Concurrency.pdf",
        pageNumber: 8,
        sectionTitle: "Section 2.4: Two-Phase Locking (2PL) vs Strict 2PL",
        relevantExcerpt: "Standard 2PL guarantees conflict serializability, but it does NOT prevent cascading aborts. Strict 2PL (S2PL) requires all exclusive write locks to be held until commit.",
        similarityScore: 0.94
      }
    ],
    maxMarks: 20
  },
  {
    id: "q-diag-02",
    topicId: "top-2pl",
    topicTitle: "Two-Phase Locking & Isolation Levels",
    subjectId: "sub-cs301",
    type: "short_answer",
    difficulty: "hard",
    questionText: "Explain how a 'Phantom Read' anomaly occurs under the SQL REPEATABLE READ isolation level when record-level locking is used instead of predicate locking.",
    expectedAnswer: "A transaction executes a range query (e.g. SELECT * WHERE balance > 1000). While record locks protect existing rows from modification, they do not lock nonexistent rows. A concurrent transaction can insert a brand new row satisfying the predicate and commit. When the first transaction re-runs the range query, a new 'phantom' row appears.",
    rubric: [
      { criteria: "Identifies that range/predicate queries are involved", points: 10 },
      { criteria: "Explains that record locks only protect existing rows, not newly inserted rows", points: 10 },
      { criteria: "Shows how re-executing query returns newly inserted phantom row", points: 10 }
    ],
    explanation: "Under Repeatable Read with row-level locks, existing rows read by Transaction T1 cannot be modified. However, without predicate locks or index range locks (next-key locks), T2 can insert a new tuple that matches the WHERE clause. Re-querying produces phantom tuples.",
    citations: [
      {
        documentId: "doc-transactions",
        documentName: "Module2_ACID_Transactions_Concurrency.pdf",
        pageNumber: 8,
        sectionTitle: "Section 2.4: Two-Phase Locking (2PL) and Phantom Reads",
        relevantExcerpt: "Phantom reads occur when a transaction queries a predicate and another transaction inserts a matching tuple because only existing records, not predicates, were locked.",
        similarityScore: 0.92
      }
    ],
    maxMarks: 30
  },
  {
    id: "q-diag-03",
    topicId: "top-wal",
    topicTitle: "Write-Ahead Logging & ARIES Recovery",
    subjectId: "sub-cs301",
    type: "numerical",
    difficulty: "medium",
    questionText: "In ARIES crash recovery, if the Dirty Page Table recorded page P1 with recLSN = 104, page P2 with recLSN = 98, and the checkpoint began at LSN = 110, at which LSN does the REDO phase begin processing the log?",
    expectedAnswer: "98",
    rubric: [
      { criteria: "Identifies the smallest recLSN among all dirty pages in the Dirty Page Table", points: 25 }
    ],
    explanation: "The REDO phase in ARIES scans forward repeating history starting at the minimum recLSN across all pages in the Dirty Page Table reconstructed by the Analysis phase (which is min(104, 98) = 98).",
    citations: [
      {
        documentId: "doc-transactions",
        documentName: "Module2_ACID_Transactions_Concurrency.pdf",
        pageNumber: 4,
        sectionTitle: "Section 2.1: Write-Ahead Logging & ARIES Crash Recovery",
        relevantExcerpt: "Redo Phase repeats history starting from the smallest recLSN in the dirty pages table up to the end of the log.",
        similarityScore: 0.96
      }
    ],
    maxMarks: 25
  },
  {
    id: "q-diag-04",
    topicId: "top-raft",
    topicTitle: "Raft Consensus Invariants & Leader Election",
    subjectId: "sub-cs301",
    type: "mcq",
    difficulty: "medium",
    questionText: "In the Raft consensus algorithm, how does a candidate prevent split votes from causing an indefinite stalemate during leader election?",
    options: [
      "By electing the node with the lowest IP address",
      "By utilizing randomized election timeouts within a range (e.g., 150ms-300ms)",
      "By asking the previous leader to appoint a successor",
      "By aborting the election after 3 attempts and restarting the cluster"
    ],
    correctOptionIndex: 1,
    expectedAnswer: "By utilizing randomized election timeouts within a range (e.g., 150ms-300ms)",
    rubric: [
      { criteria: "Identifies randomized election timeout mechanism", points: 25 }
    ],
    explanation: "Raft introduces randomized election timeouts (typically chosen randomly between 150ms and 300ms). This ensures that in almost all cases, a single follower's timer expires first, allowing it to start election and gather quorum votes before other nodes timeout.",
    citations: [
      {
        documentId: "doc-consensus",
        documentName: "Module4_Raft_Consensus_and_CAP.pdf",
        pageNumber: 15,
        sectionTitle: "Section 4.2: Raft Safety Invariants & Election Protocol",
        relevantExcerpt: "Raft uses randomized election timeouts to ensure that split-vote deadlocks are resolved quickly without extra coordination.",
        similarityScore: 0.91
      }
    ],
    maxMarks: 25
  }
];

export const sampleAssessmentHistory: AssessmentAttempt[] = [
  {
    id: "attempt-hist-01",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    assessmentType: "diagnostic",
    title: "Initial Diagnostic: Concurrency & Storage Engines",
    totalMarks: 100,
    earnedMarks: 45,
    percentageScore: 45,
    completedAt: "2026-10-22T14:30:00Z",
    feedbackSummary: "Strong understanding of basic ACID properties, but severe knowledge gap identified in Concurrency Isolation (specifically 2PL cascading aborts and SQL phantom anomalies).",
    questions: sampleDiagnosticQuestions,
    responses: {
      "q-diag-01": {
        questionId: "q-diag-01",
        selectedOptionIndex: 0, // incorrect (selected deadlocks instead of cascading aborts)
        isCorrect: false,
        scoreAwarded: 0,
        maxMarks: 20,
        gradingRationale: "Selected option 0 (deadlocks). Standard 2PL does NOT prevent deadlocks; in fact, 2PL schedules can still produce deadlock wait cycles.",
        conceptFeedback: "Review Section 2.4: Standard 2PL allows cascading aborts when uncommitted read occurs before commit. Strict 2PL holds exclusive locks until commit to resolve this.",
        remedialCitations: [
          {
            documentId: "doc-transactions",
            documentName: "Module2_ACID_Transactions_Concurrency.pdf",
            pageNumber: 8,
            sectionTitle: "Section 2.4: Two-Phase Locking (2PL) vs Strict 2PL",
            relevantExcerpt: "Standard 2PL guarantees conflict serializability, but it does NOT prevent cascading aborts. Strict 2PL (S2PL) requires all exclusive write locks to be held until commit.",
            similarityScore: 0.94
          }
        ],
        suggestedPractice: "Work through practical exercise: 'Strict 2PL Lock Manager Simulation' in the Practice tab."
      },
      "q-diag-02": {
        questionId: "q-diag-02",
        textAnswer: "Phantom reads happen when another transaction deletes a row that was already locked.",
        isCorrect: false,
        scoreAwarded: 10,
        maxMarks: 30,
        gradingRationale: "Partial credit (10/30). Incorrect anomaly definition: deleting an already locked row is a non-repeatable read or prevented by shared locks. Phantoms are NEW matching rows inserted into range queries.",
        conceptFeedback: "Remember: Phantoms involve INSERTION of new records into a query's qualifying predicate, which row locks cannot catch.",
        remedialCitations: [
          {
            documentId: "doc-transactions",
            documentName: "Module2_ACID_Transactions_Concurrency.pdf",
            pageNumber: 8,
            sectionTitle: "Section 2.4: Two-Phase Locking (2PL) and Phantom Reads",
            relevantExcerpt: "Phantom reads occur when a transaction queries a predicate and another transaction inserts a matching tuple because only existing records, not predicates, were locked.",
            similarityScore: 0.92
          }
        ],
        suggestedPractice: "Complete the GapFinder step-by-step problem on Predicate Locking vs Index-Range Locking."
      },
      "q-diag-03": {
        questionId: "q-diag-03",
        textAnswer: "110",
        isCorrect: false,
        scoreAwarded: 10,
        maxMarks: 25,
        gradingRationale: "Partial credit (10/25). Used checkpoint start LSN (110) instead of min(recLSN) in the Dirty Page Table.",
        conceptFeedback: "REDO repeats history from the earliest dirty page LSN (recLSN = 98) to ensure all buffered modifications are re-applied.",
        remedialCitations: [
          {
            documentId: "doc-transactions",
            documentName: "Module2_ACID_Transactions_Concurrency.pdf",
            pageNumber: 4,
            sectionTitle: "Section 2.1: Write-Ahead Logging & ARIES Crash Recovery",
            relevantExcerpt: "Redo Phase repeats history starting from the smallest recLSN in the dirty pages table up to the end of the log.",
            similarityScore: 0.96
          }
        ],
        suggestedPractice: "Review ARIES Redo Phase algorithm summary."
      },
      "q-diag-04": {
        questionId: "q-diag-04",
        selectedOptionIndex: 1, // Correct
        isCorrect: true,
        scoreAwarded: 25,
        maxMarks: 25,
        gradingRationale: "Accurate! Randomized election timeouts prevent split-vote deadlocks.",
        conceptFeedback: "Excellent understanding of Raft leader election invariants.",
        remedialCitations: [],
        suggestedPractice: "Proceed to Log Replication and State Machine Safety."
      }
    },
    identifiedGaps: [
      {
        topicId: "top-2pl",
        topicTitle: "Two-Phase Locking & Isolation Levels",
        scorePercent: 20,
        feedback: "Missed fundamental distinction between Standard 2PL and Strict 2PL regarding cascading aborts and phantom anomalies.",
        suggestedAction: "High-priority revision task scheduled for tomorrow morning."
      },
      {
        topicId: "top-wal",
        topicTitle: "Write-Ahead Logging & ARIES Recovery",
        scorePercent: 40,
        feedback: "Confused Checkpoint LSN with min(recLSN) during ARIES Redo phase initialization.",
        suggestedAction: "Complete 15-minute concept review with worked recovery timeline."
      }
    ]
  }
];

export const sampleWeeklyTest: Question[] = [
  {
    id: "q-week-01",
    topicId: "top-2pl",
    topicTitle: "Two-Phase Locking & Isolation Levels",
    subjectId: "sub-cs301",
    type: "mcq",
    difficulty: "medium",
    questionText: "Which SQL isolation level prevents both Dirty Reads and Non-Repeatable Reads, but might still permit Phantom Reads under ANSI SQL definitions?",
    options: [
      "READ UNCOMMITTED",
      "READ COMMITTED",
      "REPEATABLE READ",
      "SERIALIZABLE"
    ],
    correctOptionIndex: 2,
    expectedAnswer: "REPEATABLE READ",
    rubric: [{ criteria: "Correctly identifies REPEATABLE READ level", points: 25 }],
    explanation: "Under ANSI SQL-92: Read Committed prevents Dirty Reads. Repeatable Read prevents both Dirty Reads and Non-Repeatable Reads. Serializable prevents all three including Phantoms.",
    citations: [
      {
        documentId: "doc-transactions",
        documentName: "Module2_ACID_Transactions_Concurrency.pdf",
        pageNumber: 8,
        sectionTitle: "Section 2.4: Two-Phase Locking and Isolation Anomalies",
        relevantExcerpt: "Repeatable Read guarantees that data read within a transaction is unchanged by other transactions, but does not block inserts that match search predicates.",
        similarityScore: 0.95
      }
    ],
    maxMarks: 25
  },
  {
    id: "q-week-02",
    topicId: "top-wal",
    topicTitle: "Write-Ahead Logging & ARIES Recovery",
    subjectId: "sub-cs301",
    type: "mcq",
    difficulty: "easy",
    questionText: "What is the primary purpose of a Compensation Log Record (CLR) written during the ARIES Undo phase?",
    options: [
      "To increase transaction priority during lock contention",
      "To log that an undo action occurred so it is never repeated if another crash happens during recovery",
      "To verify cryptographic signatures of database blocks",
      "To release shared locks in the buffer pool"
    ],
    correctOptionIndex: 1,
    expectedAnswer: "To log that an undo action occurred so it is never repeated if another crash happens during recovery",
    rubric: [{ criteria: "Explains CLR idempotency and crash-during-recovery safety", points: 25 }],
    explanation: "CLRs prevent repeated undo actions if the system crashes repeatedly during recovery. A CLR points to the UndoNextLSN, allowing Undo to resume immediately.",
    citations: [
      {
        documentId: "doc-transactions",
        documentName: "Module2_ACID_Transactions_Concurrency.pdf",
        pageNumber: 4,
        sectionTitle: "Section 2.1: Write-Ahead Logging & ARIES Crash Recovery",
        relevantExcerpt: "CLRs are written during undo to guarantee idempotence if recovery is interrupted by a subsequent crash.",
        similarityScore: 0.93
      }
    ],
    maxMarks: 25
  },
  {
    id: "q-week-03",
    topicId: "top-raft",
    topicTitle: "Raft Consensus Invariants & Leader Election",
    subjectId: "sub-cs301",
    type: "short_answer",
    difficulty: "medium",
    questionText: "State the Raft 'Leader Append-Only' property and explain why a leader is never allowed to truncate its own log entries.",
    expectedAnswer: "The Leader Append-Only invariant dictates that a leader never overwrites or truncates its own log entries; it only appends new entries. This guarantees monotonic progress and simplifies state machine replication.",
    rubric: [
      { criteria: "States the Leader Append-Only property accurately", points: 15 },
      { criteria: "Explains why log monotonicity guarantees cluster safety", points: 10 }
    ],
    explanation: "Because a leader is elected only if its log is at least as up-to-date as any majority follower, its log contains all committed entries. Forcing append-only preserves history without rollbacks on the leader.",
    citations: [
      {
        documentId: "doc-consensus",
        documentName: "Module4_Raft_Consensus_and_CAP.pdf",
        pageNumber: 15,
        sectionTitle: "Section 4.2: Raft Safety Invariants",
        relevantExcerpt: "2. Leader Append-Only: A leader never overwrites or truncates its own log entries; it only appends new entries.",
        similarityScore: 0.97
      }
    ],
    maxMarks: 25
  },
  {
    id: "q-week-04",
    topicId: "top-cap",
    topicTitle: "CAP Theorem & PACELC Tradeoffs",
    subjectId: "sub-cs301",
    type: "mcq",
    difficulty: "medium",
    questionText: "According to the PACELC theorem, what tradeoff must a distributed system make when there is NO network partition?",
    options: [
      "Availability vs Partition Tolerance",
      "Latency vs Consistency",
      "Durability vs Throughput",
      "Atomicity vs Isolation"
    ],
    correctOptionIndex: 1,
    expectedAnswer: "Latency vs Consistency",
    rubric: [{ criteria: "Identifies Latency vs Consistency tradeoff in Else branch", points: 25 }],
    explanation: "In PACELC: If Partition (P), trade off Availability (A) vs Consistency (C); Else (E), trade off Latency (L) vs Consistency (C). Even in normal non-partitioned operation, stronger consistency requires cross-node roundtrips, adding latency.",
    citations: [
      {
        documentId: "doc-consensus",
        documentName: "Module4_Raft_Consensus_and_CAP.pdf",
        pageNumber: 22,
        sectionTitle: "Section 4.5: CAP vs PACELC Distributed Guarantees",
        relevantExcerpt: "Else (E), trade off Latency (L) and Consistency (C). Replicating data synchronously ensures strong consistency but increases client read/write latency.",
        similarityScore: 0.94
      }
    ],
    maxMarks: 25
  }
];

export const initialDemoTasks: StudyTask[] = [
  {
    id: "task-01",
    planId: "plan-current",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    subjectName: "CS301: Distributed Systems & DBs",
    subjectColor: "#4F46E5",
    topicId: "top-2pl",
    topicTitle: "Two-Phase Locking & Isolation Levels",
    activityType: "concept_review",
    title: "Review Strict 2PL & Cascading Aborts",
    description: "Read Section 2.4 of Module 2 notes. Focus on why releasing write locks early triggers cascading aborts.",
    durationMinutes: 45,
    priority: "high",
    scheduledDate: "2026-10-26",
    status: "completed",
    completedAt: "2026-10-26T10:15:00Z",
    actualDurationMinutes: 40,
    reasonWhyRecommended: "Weak topic (38% mastery). Diagnostic quiz revealed confusion between 2PL and S2PL guarantees.",
    citationReferences: [
      {
        documentId: "doc-transactions",
        documentName: "Module2_ACID_Transactions_Concurrency.pdf",
        pageNumber: 8,
        sectionTitle: "Section 2.4: Two-Phase Locking (2PL)",
        relevantExcerpt: "Strict 2PL requires all exclusive write locks to be held until commit.",
        similarityScore: 0.95
      }
    ]
  },
  {
    id: "task-02",
    planId: "plan-current",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    subjectName: "CS301: Distributed Systems & DBs",
    subjectColor: "#4F46E5",
    topicId: "top-2pl",
    topicTitle: "Two-Phase Locking & Isolation Levels",
    activityType: "practice_problems",
    title: "SQL Isolation Anomalies & Phantoms Drill",
    description: "Solve 4 practical scenarios simulating concurrent transactions with Read Committed vs Repeatable Read.",
    durationMinutes: 45,
    priority: "high",
    scheduledDate: "2026-10-26",
    status: "scheduled",
    reasonWhyRecommended: "High error frequency on SQL phantom anomalies. Targeted practical problem solving required.",
  },
  {
    id: "task-03",
    planId: "plan-current",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    subjectName: "CS301: Distributed Systems & DBs",
    subjectColor: "#4F46E5",
    topicId: "top-wal",
    topicTitle: "Write-Ahead Logging & ARIES Recovery",
    activityType: "practice_problems",
    title: "Calculate ARIES Redo recLSN Bounds",
    description: "Step through Dirty Page Table and log buffer state to determine Redo start LSN and Undo order.",
    durationMinutes: 30,
    priority: "medium",
    scheduledDate: "2026-10-27",
    status: "scheduled",
    reasonWhyRecommended: "Medium topic (64%). Reinforce recLSN minimum search before next weekly test.",
  },
  {
    id: "task-04",
    planId: "plan-current",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    subjectName: "CS301: Distributed Systems & DBs",
    subjectColor: "#4F46E5",
    topicId: "top-raft",
    topicTitle: "Raft Consensus Invariants & Leader Election",
    activityType: "concept_review",
    title: "Spaced Revision: Raft Log Matching Invariant",
    description: "Verify induction proof of Log Matching Property (Section 4.2).",
    durationMinutes: 30,
    priority: "medium",
    scheduledDate: "2026-10-28",
    status: "scheduled",
    reasonWhyRecommended: "Spaced repetition: Mastered 4 days ago. Revision due to prevent decay.",
  },
  {
    id: "task-05",
    planId: "plan-current",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    subjectName: "CS301: Distributed Systems & DBs",
    subjectColor: "#4F46E5",
    topicId: "top-snapshots",
    topicTitle: "Raft Log Compaction & Snapshotting",
    activityType: "deep_dive",
    title: "Initial Diagnostic: InstallSnapshot RPC",
    description: "Read Chapter 4 section on compacting logs and answer 3 self-check questions.",
    durationMinutes: 45,
    priority: "medium",
    scheduledDate: "2026-10-29",
    status: "scheduled",
    reasonWhyRecommended: "Unassessed topic. Syllabus indicates this topic is on the midterm exam.",
  }
];

export const initialDemoPlan: StudyPlan = {
  id: "plan-current",
  userId: DEMO_USER_ID,
  startDate: "2026-10-26",
  endDate: "2026-11-01",
  totalAllocatedHours: 12.5,
  totalTasks: 5,
  completedTasks: 1,
  isAdaptiveRevision: true,
  generatedReason: "Auto-rebalanced after Diagnostic Attempt #1. Shifted 60% of available hours to Two-Phase Locking and ARIES recovery.",
  tasks: initialDemoTasks
};

export const samplePracticalExercise: PracticalExercise = {
  id: "prac-2pl-01",
  subjectId: "sub-cs301",
  topicId: "top-2pl",
  topicTitle: "Two-Phase Locking & Isolation Levels",
  title: "Simulating a Phantom Read Under Repeatable Read",
  problemStatement: "You are given a banking transactions table `accounts (id INT PRIMARY KEY, branch TEXT, balance DECIMAL)`. Transaction T1 runs `SELECT SUM(balance) FROM accounts WHERE branch = 'North';`. Concurrently, Transaction T2 runs `INSERT INTO accounts VALUES (99, 'North', 5000); COMMIT;`. Demonstrate step-by-step why record locks allow a Phantom Read under Repeatable Read, and explain how Next-Key Index Locking prevents it.",
  scenario: "Bank Audit System: Ensuring concurrent audit aggregations and deposit transactions do not report inconsistent balances.",
  difficulty: "medium",
  workedExample: [
    {
      step: 1,
      title: "T1 Executes Range Query",
      content: "T1 executes `SELECT SUM(balance) WHERE branch = 'North'`. Under standard Repeatable Read with row locks, the database scans existing accounts (e.g. IDs 1, 4, 7) and acquires Shared (S) locks on those 3 rows.",
      notes: "Crucial observation: No lock is held on rows that do not exist yet."
    },
    {
      step: 2,
      title: "T2 Inserts New Row and Commits",
      content: "T2 inserts account `(99, 'North', 5000)`. Because ID 99 did not exist when T1 scanned, T2's INSERT does not conflict with any existing row lock on IDs 1, 4, or 7. T2 commits successfully.",
      notes: "The lock manager had no lock entry for the non-existent key."
    },
    {
      step: 3,
      title: "T1 Re-Executes Range Query",
      content: "T1 runs `SELECT SUM(balance) WHERE branch = 'North'` again within the same transaction. Now ID 99 is included. The sum is $5,000 higher! This is a Phantom Read.",
      notes: "Under ANSI SQL definition, Repeatable Read only protects rows that were previously read."
    },
    {
      step: 4,
      title: "Prevention via Next-Key Locking",
      content: "Next-Key Locking (used in InnoDB) locks the index record AND the 'gap' before it. When T1 queries `branch = 'North'`, it locks the index gap where ID 99 would fall. T2's INSERT must wait for T1 to commit.",
      notes: "Next-Key Lock = Record Lock + Gap Lock."
    }
  ],
  challengeSteps: [
    {
      id: "step-1",
      instruction: "Identify the exact lock type acquired by T1 on existing accounts under Strict 2PL.",
      hint: "Is it a Shared (S) or Exclusive (X) lock for a SELECT query?",
      expectedOutcome: "Shared (S) lock on existing record keys."
    },
    {
      id: "step-2",
      instruction: "Explain why T2 is able to proceed without waiting on T1's locks.",
      hint: "Think about where the lock is placed in the database memory table.",
      expectedOutcome: "Row locks are keyed to specific row IDs; nonexistent row 99 has no lock."
    },
    {
      id: "step-3",
      instruction: "Write the SQL isolation level command required to prevent this anomaly entirely in standard PostgreSQL or MySQL.",
      hint: "It is the strictest ANSI isolation level.",
      expectedOutcome: "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;"
    }
  ],
  sampleSolution: "Under REPEATABLE READ with record locking, locks are only placed on existing tuples matching the predicate. When T2 inserts a new tuple with branch = 'North', it acquires an exclusive lock on the new tuple ID 99, which has no conflict with T1's existing locks. T2 commits. When T1 re-queries the predicate, tuple 99 appears, causing a Phantom Read. Next-Key Locking solves this by placing a lock on both the existing index records and the index intervals ('gaps') between them, blocking T2 from inserting into the gap until T1 releases its gap locks at commit.",
  reflectionPrompt: "Why do high-throughput transactional databases default to READ COMMITTED or REPEATABLE READ rather than SERIALIZABLE despite the risk of phantoms?",
  citations: [
    {
      documentId: "doc-transactions",
      documentName: "Module2_ACID_Transactions_Concurrency.pdf",
      pageNumber: 8,
      sectionTitle: "Section 2.4: Two-Phase Locking and Isolation Anomalies",
      relevantExcerpt: "Phantom reads occur when a transaction queries a predicate and another transaction inserts a matching tuple because only existing records, not predicates, were locked.",
      similarityScore: 0.95
    }
  ],
  isCompleted: false
};

export const sampleTutorMessages: TutorChatMessage[] = [
  {
    id: "msg-01",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    topicId: "top-2pl",
    role: "user",
    content: "Why does standard Two-Phase Locking not prevent cascading aborts?",
    timestamp: "2026-10-25T14:10:00Z",
    citations: [],
    isUnsupported: false
  },
  {
    id: "msg-02",
    userId: DEMO_USER_ID,
    subjectId: "sub-cs301",
    topicId: "top-2pl",
    role: "assistant",
    content: "In standard **Two-Phase Locking (2PL)**, a transaction acquires locks during its growing phase and can begin releasing locks as soon as it enters its shrinking phase—*even before the transaction has officially committed*.\n\nHere is how cascading aborts happen:\n1. Transaction **T1** modifies a record `X` and releases its Exclusive (X) lock on `X` in its shrinking phase.\n2. Transaction **T2** immediately acquires a Shared (S) lock on `X` and reads the uncommitted value.\n3. If **T1** subsequently encounters an error or aborts, `X` must be rolled back to its previous state.\n4. Because **T2** has already based calculations on this rolled-back, invalid value, **T2 must also be aborted**!\n5. Any transaction that read from T2 must also abort, triggering a **cascading abort domino effect**.\n\nTo prevent this, **Strict 2PL (S2PL)** enforces that all Exclusive (write) locks must be retained until the transaction explicitly commits or aborts.",
    difficultyLevel: "intermediate",
    timestamp: "2026-10-25T14:10:08Z",
    citations: [
      {
        documentId: "doc-transactions",
        documentName: "Module2_ACID_Transactions_Concurrency.pdf",
        pageNumber: 8,
        sectionTitle: "Section 2.4: Two-Phase Locking (2PL) vs Strict 2PL",
        relevantExcerpt: "Standard 2PL guarantees conflict serializability, but it does NOT prevent cascading aborts. Strict 2PL requires all exclusive write locks to be held until commit.",
        similarityScore: 0.96
      }
    ],
    isUnsupported: false
  }
];

export const sampleNotifications: NotificationItem[] = [
  {
    id: "notif-01",
    userId: DEMO_USER_ID,
    title: "Study Session Ready: Strict 2PL",
    message: "Today's personalized session on 'Two-Phase Locking & Isolation Levels' is scheduled for 45 minutes.",
    type: "study_reminder",
    createdAt: "2026-10-26T08:30:00Z",
    isRead: false,
    targetRoute: "/planner"
  },
  {
    id: "notif-02",
    userId: DEMO_USER_ID,
    title: "Weekly Assessment Available",
    message: "Your weekly adaptive test for CS301 has been generated based on recent gap analysis.",
    type: "weekly_test",
    createdAt: "2026-10-25T18:00:00Z",
    isRead: false,
    targetRoute: "/tests"
  },
  {
    id: "notif-03",
    userId: DEMO_USER_ID,
    title: "Milestone: ACID Fundamentals Mastered",
    message: "Topic 'ACID Fundamentals & Serializability' reached 88% mastery (Strong category)!",
    type: "milestone",
    createdAt: "2026-10-24T16:50:00Z",
    isRead: true,
    targetRoute: "/gaps"
  }
];

export const sampleAnalyticsSummary: AnalyticsSummary = {
  overallMasteryPercent: 69,
  dailyStudyStreakDays: 6,
  plannedStudyHours: 15.0,
  completedStudyHours: 11.5,
  planCompletionRatePercent: 77,
  totalQuestionsAttempted: 30,
  overallAccuracyPercent: 73,
  masteryDistribution: {
    weakCount: 1,
    mediumCount: 2,
    strongCount: 2,
    unassessedCount: 1
  },
  weeklyScores: [
    { weekLabel: "Week 1", score: 52, averageScore: 60 },
    { weekLabel: "Week 2", score: 61, averageScore: 62 },
    { weekLabel: "Week 3", score: 70, averageScore: 65 },
    { weekLabel: "Week 4", score: 78, averageScore: 68 },
  ],
  accuracyTrend: [
    { date: "Oct 18", accuracy: 50 },
    { date: "Oct 20", accuracy: 58 },
    { date: "Oct 22", accuracy: 65 },
    { date: "Oct 24", accuracy: 74 },
    { date: "Oct 26", accuracy: 80 }
  ],
  improvingTopics: [
    {
      topicId: "top-wal",
      title: "Write-Ahead Logging & ARIES Recovery",
      subjectName: "CS301",
      previousScore: 40,
      currentScore: 64,
      delta: 24
    },
    {
      topicId: "top-raft",
      title: "Raft Consensus Invariants",
      subjectName: "CS301",
      previousScore: 55,
      currentScore: 72,
      delta: 17
    }
  ],
  difficultTopics: [
    {
      topicId: "top-2pl",
      title: "Two-Phase Locking & Isolation Levels",
      subjectName: "CS301",
      currentScore: 38,
      errorCount: 3,
      primaryStruggle: "SQL Phantom reads and cascading aborts in standard 2PL"
    }
  ]
};
