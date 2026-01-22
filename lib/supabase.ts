// Supabase configuration
// Set environment variables to connect to a real Supabase instance
// or leave unset to run in demo mode with mock data

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Demo mode is enabled when no Supabase credentials are provided
export const IS_DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY

export const supabaseHeaders = SUPABASE_ANON_KEY
  ? {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    }
  : {
      "Content-Type": "application/json",
    }

// Log mode on startup (server-side only)
if (typeof window === "undefined") {
  if (IS_DEMO_MODE) {
    console.log("🎭 Running in DEMO MODE - using mock data")
  } else {
    console.log("🔌 Connected to Supabase")
  }
}
