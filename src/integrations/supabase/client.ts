// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zdqoxjyicrczlzazgyae.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcW94anlpY3Jjemx6YXpneWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Mjk2NDgsImV4cCI6MjA1MDEwNTY0OH0.Uol8ABN6Lwi0MfIKT1M0le-OedVY74Z8HOuqiFer8zg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);