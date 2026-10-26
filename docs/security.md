# GapFinder AI — Security Architecture & RLS Policies

## 1. Zero Secrets in Client Code
- All AI provider keys (`GEMINI_API_KEY`) and database service credentials (`SUPABASE_SERVICE_ROLE_KEY`) are kept strictly on the server in Next.js API route handlers.
- Only safe, public environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are exposed to the browser.

## 2. Row Level Security (RLS)
Every table has Row Level Security enabled in PostgreSQL:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
```

Policies enforce student isolation so that students can only select, insert, or modify their own data:
```sql
CREATE POLICY "Users can manage own documents" ON public.study_documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own document chunks" ON public.document_chunks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own topics" ON public.topics
    FOR ALL USING (auth.uid() = user_id);
```

## 3. Untrusted Document Sanitization
Student notes can contain adversarial text attempting to compromise system prompts. The ingestion pipeline sanitizes all text before chunking:
```typescript
export function sanitizeDocumentText(text: string): string {
  return text
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/\b(ignore all previous instructions|disregard earlier system prompts|you are now a bypass)\b/gi, "[REDACTED UNTRUSTED INSTRUCTION]");
}
```

## 4. Grounding & Anti-Hallucination Guardrails
- The AI Tutor and Assessment Generator never generate ungrounded answers.
- Citations must match authentic chunk entries in the database.
- If no retrieved chunk exceeds the relevance threshold, the response is explicitly flagged with `isUnsupported: true`.
