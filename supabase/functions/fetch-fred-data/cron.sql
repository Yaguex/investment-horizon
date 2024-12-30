-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing schedule if it exists (using the correct job name)
SELECT cron.unschedule(job_name) 
FROM cron.job 
WHERE jobname LIKE 'fetch-fred-data%';

-- Schedule job to run at 7:10 AM daily
SELECT cron.schedule(
  'fetch-fred-data-daily',
  '10 7 * * *',  -- Run at 7:10 AM every day
  $$
  SELECT net.http_post(
    url:='https://zdqoxjyicrczlzazgyae.supabase.co/functions/v1/fetch-fred-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcW94anlpY3Jjemx6YXpneWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Mjk2NDgsImV4cCI6MjA1MDEwNTY0OH0.Uol8ABN6Lwi0MfIKT1M0le-OedVY74Z8HOuqiFer8zg"}'::jsonb
  ) AS request_id;
  $$
);