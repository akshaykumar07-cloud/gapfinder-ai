# GapFinder AI — Judge & Evaluator Demonstration Guide

## Welcome Evaluators!
GapFinder AI comes out-of-the-box with a pre-seeded curriculum: **CS301 Distributed Systems & Database Architecture**. All 13 routes and workflows are active and functional with deterministic fallback data even before setting external API keys.

---

## 5-Minute Evaluation Walkthrough

### Step 1: 1-Click Evaluator Sign-In
1. Navigate to `/login` or click **"Try Interactive Demo"** on the landing page `/`.
2. Click **"Launch Demo Student Account"**.
3. You will be authenticated as **Alex Morgan**, with CS301 syllabus, weak topics, and assessment history loaded.

### Step 2: Dashboard Overview (`/dashboard`)
1. Review the top KPI cards:
   - **Today's Remaining Study**: Notice the strict daily limit cap (2.5h).
   - **Critical Weak Topics**: Displays the 1 weak topic (`Two-Phase Locking & Isolation Levels` at 38%).
   - **6-Day Study Streak**: Active revision indicator.
2. In **Today's Recommended Tasks**, observe the **"Why Recommended"** rationale badges showing the algorithm's explanation.
3. Click **"Mark Done"** on task #1 to watch completion progress advance in real-time.

### Step 3: Study Materials & Chunk Inspector (`/materials`)
1. View the 3 indexed course documents:
   - `CS301_Official_Syllabus_2026.pdf`
   - `Module2_ACID_Transactions_Concurrency.pdf`
   - `Module4_Raft_Consensus_and_CAP.pdf`
2. Click the **Eye icon** on any document to launch the **Chunk & Vector Inspector Modal**.
3. Observe how each text chunk has:
   - Exact character and token counts
   - Associated section title (e.g. `Section 2.4: Two-Phase Locking`)
   - Approximate page number reference
   - 768-dimensional pgvector metadata.

### Step 4: Diagnostic Assessment (`/diagnostic`)
1. Take the diagnostic quiz:
   - MCQ Question 1 on Two-Phase Locking vs Strict 2PL.
   - Short Answer Question 2 on Phantom Reads.
   - Numerical Question 3 on ARIES Crash Recovery recLSN bounds.
2. Click **"Submit Diagnostic for Grading"**.
3. Inspect the post-submission feedback:
   - View grading rationale and rubric criteria.
   - Click the **Source Citation Pill** (`Module2_ACID_Transactions_Concurrency.pdf p.8`) to verify the exact textbook passage!

### Step 5: Topic Gap Analysis (`/gaps`)
1. Inspect the 4 mastery categories:
   - **Weak (<50%)**: `Two-Phase Locking & Isolation Levels` (38% mastery, 4 attempts, repeated mistake on Phantom Reads).
   - **Medium (50–79%)**: `Write-Ahead Logging & ARIES Recovery` (64% mastery).
   - **Strong (80%+)**: `ACID Fundamentals & Serializability` (88% mastery, 10 attempts).
   - **Insufficient Evidence**: `Raft Log Compaction & Snapshotting` (0 attempts, explicitly flagged to prevent false-positive mastery).
2. Notice the mathematical justification provided for every single classification.

### Step 6: Adaptive Study Planner (`/planner`)
1. Review the daily and weekly calendar views.
2. Notice that the total scheduled minutes per day never exceeds Alex's available capacity.
3. Click **"Reschedule"** on any task to change its date.
4. Click **"Re-Optimize Plan"** to watch the adaptive engine regenerate the schedule.

### Step 7: Explain-This-Topic AI Tutor (`/tutor`)
1. Select topic: `Two-Phase Locking & Isolation Levels`.
2. Choose difficulty: `Beginner`, `Intermediate`, or `Advanced`.
3. Click one of the quick prompts or type:
   > *"Why does standard Two-Phase Locking not prevent cascading aborts?"*
4. Read the response and click on the verified citation pill to see the linked source passage and page number.

### Step 8: Progress Analytics & CSV Export (`/progress`)
1. View the Recharts visual analytics:
   - **Accuracy Over Time** line graph.
   - **Weekly Test Scores vs Cohort Averages** bar graph.
   - **Measurably Improving Topics** vs **Persistent Gaps**.
2. Click **"Export CSV Report"** to download the student telemetry report.

### Step 9: Reset Demo State (`/settings`)
1. In `/settings` or on the top navigation bar, click **"Reset Demo State"** at any time to return the database to the verified baseline.
