-- =============================================================================
-- 0008_analytics_views — agregaty pod dashboard
-- =============================================================================

-- Posty per dzień (organizacja)
create or replace view public.v_posts_per_day as
select
  org_id,
  date_trunc('day', posted_at) as day,
  count(*) filter (where status = 'posted') as posted_count,
  count(*) filter (where status = 'skipped') as skipped_count,
  count(*) filter (where status = 'failed') as failed_count
from public.campaign_targets
where posted_at is not null or status in ('skipped','failed')
group by org_id, date_trunc('day', posted_at);

-- Success rate per grupa
create or replace view public.v_group_success_rate as
select
  g.org_id,
  g.id as group_id,
  g.name as group_name,
  g.url as group_url,
  count(t.*) filter (where t.status = 'posted') as posted_count,
  count(t.*) filter (where t.status in ('failed','skipped')) as failed_count,
  count(t.*) as total_attempts,
  case
    when count(t.*) > 0
    then round(100.0 * count(t.*) filter (where t.status = 'posted') / count(t.*), 1)
    else null
  end as success_rate_pct,
  max(t.posted_at) as last_posted_at
from public.groups g
left join public.campaign_targets t on t.group_id = g.id
group by g.org_id, g.id, g.name, g.url;

-- Wydajność kampanii
create or replace view public.v_campaign_summary as
select
  c.org_id,
  c.id as campaign_id,
  c.name as campaign_name,
  c.status as campaign_status,
  c.created_at,
  count(t.*) as targets_total,
  count(t.*) filter (where t.status = 'pending') as pending,
  count(t.*) filter (where t.status = 'posted') as posted,
  count(t.*) filter (where t.status = 'skipped') as skipped,
  count(t.*) filter (where t.status = 'failed') as failed,
  case
    when count(t.*) > 0
    then round(100.0 * count(t.*) filter (where t.status = 'posted') / count(t.*), 1)
    else 0
  end as posted_pct
from public.campaigns c
left join public.campaign_targets t on t.campaign_id = c.id
group by c.org_id, c.id, c.name, c.status, c.created_at;

-- Best posting hours (kiedy najlepiej publikować, godzinach 0-23)
create or replace view public.v_best_hours as
select
  org_id,
  extract(hour from posted_at)::int as hour_of_day,
  count(*) filter (where status = 'posted') as posted_count
from public.campaign_targets
where posted_at is not null
group by org_id, extract(hour from posted_at)::int;

-- Top problemy (telemetria błędów)
create or replace view public.v_error_codes as
select
  org_id,
  error_code,
  count(*) as occurrences,
  max(created_at) as last_seen
from public.campaign_targets
where status in ('failed','skipped') and error_code is not null
group by org_id, error_code;

-- Selector health (z audit_log: events 'selector_miss')
create or replace view public.v_selector_health as
select
  org_id,
  (meta->>'selector_name') as selector_name,
  count(*) as misses,
  max(created_at) as last_miss
from public.audit_log
where action = 'extension.selector_miss'
  and created_at >= now() - interval '7 days'
group by org_id, (meta->>'selector_name');

comment on view public.v_posts_per_day is 'Dashboard: ile postów dziennie / status breakdown.';
comment on view public.v_group_success_rate is 'Dashboard: która grupa najlepiej działa.';
comment on view public.v_campaign_summary is 'Dashboard: status pasków kampanii (X/Y posted).';
comment on view public.v_best_hours is 'Dashboard: heatmapa godzinowa skutecznych publikacji.';
comment on view public.v_error_codes is 'Telemetria: najczęstsze błędy postowania (cooldown, daily_cap, no_publish_detected, login_required).';
comment on view public.v_selector_health is 'Admin: które selektory DOM Facebooka się sypią (sygnał do update extension).';
