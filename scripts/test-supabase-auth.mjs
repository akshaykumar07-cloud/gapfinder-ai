// Safe diagnostic script to test Supabase connection independently of application UI
// Does NOT print secrets, passwords, or tokens.

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Check for .env.local or .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

const hasEnvLocal = fs.existsSync(envLocalPath);
const hasEnv = fs.existsSync(envPath);

console.log("[DIAGNOSTIC] Environment files check:");
console.log(` - .env.local exists: ${hasEnvLocal}`);
console.log(` - .env exists: ${hasEnv}`);

// Parse .env.local if present
let envVars = {};
const targetEnvFile = hasEnvLocal ? envLocalPath : (hasEnv ? envPath : null);

if (targetEnvFile) {
  const content = fs.readFileSync(targetEnvFile, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        envVars[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

console.log("\n[DIAGNOSTIC] Supabase Configuration Check:");
console.log(` - NEXT_PUBLIC_SUPABASE_URL present: ${Boolean(supabaseUrl)}`);
console.log(` - Valid URL format: ${Boolean(supabaseUrl && supabaseUrl.startsWith("http"))}`);
console.log(` - NEXT_PUBLIC_SUPABASE_ANON_KEY present: ${Boolean(supabaseAnonKey)}`);
console.log(` - Key length: ${supabaseAnonKey ? supabaseAnonKey.length : 0}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("\n[RESULT] Configuration failure: Supabase URL or anon key is missing from environment.");
  process.exit(0);
}

// 2. Test Connection
async function testConnection() {
  console.log("\n[DIAGNOSTIC] Testing connection to Supabase Auth endpoint...");
  const client = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const startTime = Date.now();
    const { data, error } = await client.auth.getSession();
    const durationMs = Date.now() - startTime;

    if (error) {
      console.log(`[RESULT] Auth check returned error:`);
      console.log(` - Operation: auth.getSession()`);
      console.log(` - Error Message: ${error.message}`);
      console.log(` - Status: ${error.status || "N/A"}`);
      console.log(` - Duration: ${durationMs}ms`);
    } else {
      console.log(`[RESULT] Successfully reached Supabase Auth endpoint in ${durationMs}ms.`);
      console.log(` - Active Session: ${data.session ? "Active" : "None (Expected for clean test)"}`);
    }
  } catch (err) {
    console.log(`[RESULT] Network / Connectivity Failure:`);
    console.log(` - Operation: client.auth.getSession()`);
    console.log(` - Message: ${err.message}`);
  }
}

testConnection();
