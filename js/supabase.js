// js/supabase.js
// Shared Supabase client — imported on every page

const SUPABASE_URL     = 'https://ffsvtxbqxpgojwymjrmm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc3Z0eGJxeHBnb2p3eW1qcm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDQwNDEsImV4cCI6MjA5MTk4MDA0MX0.raRwQmaWSJUePLtAlV02bhUXzOpXM7OqhSwdKIO35ic';

// Initialize the Supabase client using the CDN global
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
