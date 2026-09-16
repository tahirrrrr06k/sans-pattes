-- Migration 04: Global Public Chat & Reports Schema
-- Sans Pattes Public Community Chat (Accessible without auth using nickname)

-- 1. Create global_chat_messages table
CREATE TABLE IF NOT EXISTS public.global_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_user_id TEXT NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar_color VARCHAR(30) DEFAULT 'emerald',
    content TEXT NOT NULL CHECK (char_length(content) <= 500),
    reply_to_id UUID REFERENCES public.global_chat_messages(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy chronological pagination & search
CREATE INDEX IF NOT EXISTS idx_global_chat_messages_created_at ON public.global_chat_messages(created_at DESC);

-- 2. Create global_chat_reports table
CREATE TABLE IF NOT EXISTS public.global_chat_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.global_chat_messages(id) ON DELETE CASCADE,
    reporter_nickname VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.global_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_chat_reports ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for global_chat_messages
-- Public SELECT policy (anyone can read messages)
CREATE POLICY "Public global chat view"
    ON public.global_chat_messages
    FOR SELECT
    USING (true);

-- Public INSERT policy (anyone can post messages)
CREATE POLICY "Public global chat insert"
    ON public.global_chat_messages
    FOR INSERT
    WITH CHECK (true);

-- Public UPDATE policy (users can soft-delete messages)
CREATE POLICY "Public global chat soft delete"
    ON public.global_chat_messages
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 5. RLS Policies for global_chat_reports
CREATE POLICY "Public insert reports"
    ON public.global_chat_reports
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public view reports"
    ON public.global_chat_reports
    FOR SELECT
    USING (true);

-- 6. Add global_chat_messages & alerts to Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE global_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
