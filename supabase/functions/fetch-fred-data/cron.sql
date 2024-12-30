-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing schedule if it exists
SELECT cron.unschedule('fetch-fred-data-daily');

-- Schedule job to run at 5:20 AM daily
SELECT cron.schedule(
  'fetch-fred-data-daily',
  '20 5 * * *',  -- Run at 5:20 AM every day
  $$
  SELECT net.http_post(
    url:='https://zdqoxjyicrczlzazgyae.supabase.co/functions/v1/fetch-fred-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcW94anlpY3Jjemx6YXpneWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Mjk2NDgsImV4cCI6MjA1MDEwNTY0OH0.Uol8ABN6Lwi0MfIKT1M0le-OedVY74Z8HOuqiFer8zg"}'::jsonb
  ) AS request_id;
  $$
);