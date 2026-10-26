-- GapFinder AI - Supabase PostgreSQL Schema with pgvector
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    education_level TEXT NOT NULL DEFAULT 'undergraduate',
    exam_goals TEXT[] DEFAULT '{}',
    syllabus_name TEXT,
    target_exam_date DATE,
    available_days TEXT[] DEFAULT '{"mon","tue","wed","thu","fri","sat","sun"}',
    daily_study_hours NUMERIC(4,2) DEFAULT 2.5,
    session_duration_minutes INT DEFAULT 45,
    preferred_language TEXT DEFAULT 'en',
    reminder_times TEXT[] DEFAULT '{"09:00","18:00"}',
    browser_notifications_enabled BOOLEAN DEFAULT true,
    email_reminders_enabled BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    is_demo_user BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the minimum profile row when a Supabase Auth user is registered.
-- SECURITY DEFINER lets this trusted trigger insert without weakening client RLS.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, education_level)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Student'),
        COALESCE(NEW.raw_user_meta_data ->> 'education_level', 'undergraduate')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    color TEXT DEFAULT '#4F46E5',
    icon TEXT DEFAULT 'BookOpen',
    target_exam_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDY DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.study_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT,
    processing_status TEXT NOT NULL DEFAULT 'pending', -- pending, extracting, chunking, embedding, indexed, failed
    error_message TEXT,
    total_chunks INT DEFAULT 0,
    total_characters INT DEFAULT 0,
    extracted_text_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 4. DOCUMENT CHUNKS TABLE (With pgvector embedding)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.study_documents(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    token_count INT DEFAULT 0,
    page_number INT,
    section_title TEXT,
    embedding VECTOR(768), -- Compatible with Google Gemini text-embedding-004
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Vector Cosine Similarity
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. TOPICS TABLE (Hierarchical Topic Map)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_title TEXT NOT NULL,
    title TEXT NOT NULL,
    subtopic_title TEXT,
    confidence INT NOT NULL DEFAULT 3, -- 1 to 5 scale
    mastery_score NUMERIC(5,2) DEFAULT 0.00, -- 0 to 100
    mastery_level TEXT NOT NULL DEFAULT 'insufficient_evidence', -- weak, medium, strong, insufficient_evidence
    mastery_reason TEXT DEFAULT 'Not enough recent assessment data.',
    provenance TEXT NOT NULL DEFAULT 'syllabus', -- syllabus, notes, manual
    source_document_ids UUID[] DEFAULT '{}',
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    last_assessed_at TIMESTAMPTZ,
    repeated_error_patterns TEXT[] DEFAULT '{}',
    is_learned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ASSESSMENTS TABLE (Diagnostic & Weekly Tests)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- diagnostic, weekly_test
    title TEXT NOT NULL,
    description TEXT,
    time_limit_minutes INT DEFAULT 20,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_marks INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ASSESSMENT ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    title TEXT NOT NULL,
    total_marks INT NOT NULL,
    earned_marks NUMERIC(5,2) NOT NULL,
    percentage_score NUMERIC(5,2) NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    identified_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
    feedback_summary TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STUDY PLANS & TASKS
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_allocated_hours NUMERIC(5,2) NOT NULL,
    is_adaptive_revision BOOLEAN DEFAULT false,
    generated_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL, -- concept_review, practice_problems, quiz_revision, flashcards, deep_dive
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 30,
    priority TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, skipped
    completed_at TIMESTAMPTZ,
    actual_duration_minutes INT,
    skip_reason TEXT,
    reason_why_recommended TEXT,
    citation_references JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRACTICAL EXERCISES
CREATE TABLE IF NOT EXISTS public.practical_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    scenario TEXT,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    worked_example JSONB DEFAULT '[]'::jsonb,
    challenge_steps JSONB DEFAULT '[]'::jsonb,
    sample_solution TEXT NOT NULL,
    reflection_prompt TEXT,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TUTOR CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.tutor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    role TEXT NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    difficulty_level TEXT DEFAULT 'intermediate',
    citations JSONB DEFAULT '[]'::jsonb,
    is_unsupported BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- study_reminder, weekly_test, incomplete_task, milestone, revision
    is_read BOOLEAN DEFAULT false,
    target_route TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users read & update their own record
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Subjects: isolated per user
CREATE POLICY "Users can manage own subjects" ON public.subjects
    FOR ALL USING (auth.uid() = user_id);

-- Documents: isolated per user
CREATE POLICY "Users can manage own documents" ON public.study_documents
    FOR ALL USING (auth.uid() = user_id);

-- Document Chunks: isolated per user
CREATE POLICY "Users can access own document chunks" ON public.document_chunks
    FOR ALL USING (auth.uid() = user_id);

-- Topics: isolated per user
CREATE POLICY "Users can manage own topics" ON public.topics
    FOR ALL USING (auth.uid() = user_id);

-- Assessments: isolated per user
CREATE POLICY "Users can manage own assessments" ON public.assessments
    FOR ALL USING (auth.uid() = user_id);

-- Assessment Attempts: isolated per user
CREATE POLICY "Users can manage own attempts" ON public.assessment_attempts
    FOR ALL USING (auth.uid() = user_id);

-- Study Plans & Tasks: isolated per user
CREATE POLICY "Users can manage own study plans" ON public.study_plans
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study tasks" ON public.study_tasks
    FOR ALL USING (auth.uid() = user_id);

-- Tutor Messages: isolated per user
CREATE POLICY "Users can manage own tutor messages" ON public.tutor_messages
    FOR ALL USING (auth.uid() = user_id);

-- Notifications: isolated per user
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- VECTOR SIMILARITY SEARCH FUNCTION
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT,
  filter_user_id UUID,
  filter_subject_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INT,
  content TEXT,
  page_number INT,
  section_title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    dc.page_number,
    dc.section_title,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.user_id = filter_user_id
    AND (filter_subject_id IS NULL OR dc.subject_id = filter_subject_id)
    AND 1 - (dc.embedding <=> query_embedding) >= match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
