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
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);