import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("placeholder")
);

export function createClient() {
  if (!isSupabaseConfigured) {
    // Return null or dummy client for demo mode
    return null;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

export function logAuthError(operation: string, error: {
  message?: string;
  code?: string;
  status?: number;
}) {
  console.error("[Supabase Auth]", {
    operation,
    message: error.message ?? "Unknown authentication error",
    code: error.code ?? null,
    status: error.status ?? null,
  });
}
