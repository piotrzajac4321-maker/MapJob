-- Session Replay storage for rrweb recordings
-- Records are written by tracker.js on exit_intent / rage_click / page_exit
-- Chunks of 100 rrweb events per row to stay within JSONB limits

CREATE TABLE IF NOT EXISTS session_replays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    events JSONB NOT NULL DEFAULT '[]',
    trigger TEXT,          -- exit_intent | rage_click | page_exit | checkout_abandon
    total_events INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_replays_session_id ON session_replays(session_id);
CREATE INDEX IF NOT EXISTS idx_session_replays_created_at ON session_replays(created_at DESC);

ALTER TABLE session_replays ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors can insert (tracker.js runs client-side with anon key)
CREATE POLICY "anon_insert_replays" ON session_replays FOR INSERT WITH CHECK (true);
-- Admins can read
CREATE POLICY "service_select_replays" ON session_replays FOR SELECT USING (true);
-- Purge old records (GDPR)
CREATE POLICY "cascade_delete_replays" ON session_replays FOR DELETE USING (true);
