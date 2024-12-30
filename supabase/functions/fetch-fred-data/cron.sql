-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run at midnight every day
SELECT cron.schedule(
  'fetch-fred-data-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url:='https://zdqoxjyicrczlzazgyae.supabase.co/functions/v1/fetch-fred-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcW94anlpY3Jjemx6YXpneWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Mjk2NDgsImV4cCI6MjA1MDEwNTY0OH0.Uol8ABN6Lwi0MfIKT1M0le-OedVY74Z8HOuqiFer8zg"}'::jsonb
  ) AS request_id;
  $$
);