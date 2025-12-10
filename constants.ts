
// In a production environment, these should be environment variables.
// Provided for the specific functionality requested.

export const SUPABASE_URL = "https://xxnsvylzzkgcnubaegyv.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bnN2eWx6emtnY251YmFlZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDE0MjcsImV4cCI6MjA3OTk3NzQyN30.x0wz0v_qqvg6riMipKMr3IM30YnGaGs1b9uMvJRGG5M";

// Gemini API Configuration
export const GEMINI_API_KEY = "AIzaSyCiFz9-FHmM62ZlWGOOapx3b7ZRHFTzBE4";
export const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";
export const GEMINI_TTS_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Maximum number of results to fetch to prevent lag
export const SEARCH_LIMIT = 50;
