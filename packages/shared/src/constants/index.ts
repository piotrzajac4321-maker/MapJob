export const DEFAULT_COOLDOWN_MINUTES = 240; // 4h between posts to same group
export const DEFAULT_DAILY_CAP_PER_GROUP = 2;
export const DEFAULT_DAILY_CAP_PER_ACCOUNT = 25;
export const DEFAULT_MIN_DELAY_SECONDS = 90;
export const DEFAULT_MAX_DELAY_SECONDS = 240;
export const DELAY_JITTER_PCT = 0.2;

export const POST_TYPES = ['job', 'sales', 'other'] as const;
export const POST_STATUSES = ['draft', 'ready', 'archived'] as const;
export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'running', 'paused', 'done'] as const;
export const TARGET_STATUSES = [
  'pending',
  'queued',
  'in_progress',
  'posted',
  'skipped',
  'failed',
] as const;
export const ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;
export const FRAMEWORKS = ['AIDA', 'PAS', 'BAB', 'FAB', '4U', 'PASTOR'] as const;

export const AI_QUOTA_PER_HOUR_USER = 20;
export const AI_QUOTA_PER_DAY_ORG = 200;

export const PUBLISH_DETECT_TIMEOUT_MS = 90_000;
export const WATCHDOG_FAILED_THRESHOLD = 3;

export const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
export const MEDIA_MAX_PER_POST = 4;
export const MEDIA_ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export const HUMAN_SCORE_WARN_THRESHOLD = 60;
export const ANTI_AI_MAX_REGENERATIONS = 2;
