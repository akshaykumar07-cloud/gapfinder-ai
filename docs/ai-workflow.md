# GapFinder AI — AI Workflows & Evaluation Logic

## 1. Overview
GapFinder AI treats LLM outputs and rubric scoring as structured, validated operations rather than arbitrary chat completions. All structured generations are validated against strict Zod schemas.

## 2. Assessment Generation Workflow
1. **Curriculum Topic Selection**: Selects unassessed topics or topics due for spaced revision.
2. **Context Assembly**: Retrieves the top 3–4 chunks matching the topic.
3. **Structured Question Synthesis**:
   - Generates Multiple Choice Questions (MCQ) with 4 plausible distractors, expected answer, and explanation.
   - Generates Numerical and Free-Text Questions with marking rubrics, partial-credit criteria, and citations.
4. **Zod Validation**: Validates the output format before storing in the `assessments` table.

## 3. Rubric-Grounded Free-Text Answer Evaluation
Unlike naive LLM grading that treats free-form judgments as absolute truth, GapFinder AI uses an evidence-based multi-tier evaluation process:
1. **Objective Matching**: Checks exact answer keys for MCQs and numerical tolerances for quantitative questions.
2. **Criterion Breakdown**: For open-ended answers, matches student responses against the explicit criteria in the rubric.
3. **Feedback Delivery**:
   - What the student answered correctly (matched criteria).
   - What was missing or incomplete.
   - Why the expected syllabus answer is superior.
   - Follow-up practice recommendation.

## 4. Multi-Factor Topic Mastery Formula
Topic mastery is calculated mathematically using:
- **Weighted Assessment Performance**: Accuracy across all recorded attempts.
- **Difficulty Multiplier**: Easy ($0.8\times$), Medium ($1.0\times$), Hard ($1.2\times$).
- **Recency Decay**: Recent test attempts are weighted up to $1.5\times$ more heavily than older attempts.
- **Sample Size Threshold**: If a topic has fewer than 2 verified attempts, it is classified as `insufficient_evidence` to prevent labeling a topic "strong" based on one easy question.
- **Mastery Categories**:
  - **Weak**: $<50\%$
  - **Medium**: $50\% - 79\%$
  - **Strong**: $80\%+$
  - **Insufficient Evidence**: $<2$ attempts

## 5. Strict-Capacity Adaptive Scheduler
The scheduler respects student time constraints:
- **Hard Daily Limit**: Daily tasks never exceed the student's configured `dailyStudyHours` (e.g. 2.5 hours).
- **Urgency Formula**:
  - Weak topics: High priority ($150 + (100 - \text{mastery})$).
  - Unassessed topics: Medium priority ($80$).
  - Medium topics: Medium priority ($50 - (\text{mastery} - 50)$).
  - Strong topics: Low priority spaced recall based on days since last assessed.
- **Capacity Conflict Warning**: If high-priority topics exceed available hours, the system alerts the student with a workload conflict warning.
