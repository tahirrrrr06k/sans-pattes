-- =================================================================
-- MIGRATION 02: ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_private_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. HELPER SETTINGS POLICIES
CREATE POLICY "Helper settings are viewable by everyone" 
  ON public.helper_settings FOR SELECT USING (true);

CREATE POLICY "Helpers can insert own settings" 
  ON public.helper_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Helpers can update own settings" 
  ON public.helper_settings FOR UPDATE USING (auth.uid() = user_id);

-- 3. ALERTS POLICIES
CREATE POLICY "Searching or assigned alerts viewable" 
  ON public.alerts FOR SELECT USING (
    status = 'searching' OR auth.uid() = requester_id OR auth.uid() = helper_id
  );

CREATE POLICY "Requesters can create alerts" 
  ON public.alerts FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Assigned helper or requester can update alert" 
  ON public.alerts FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = helper_id OR helper_id IS NULL
  );

-- 4. PRIVATE LOCATION POLICIES (Phase 5 & 6)
-- Exact address is ONLY readable by the requester OR the assigned helper after acceptance
CREATE POLICY "Private location readable only by requester or assigned helper"
  ON public.alert_private_locations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.alerts a
      WHERE a.id = alert_private_locations.alert_id
      AND (
        a.requester_id = auth.uid() OR
        (a.helper_id = auth.uid() AND a.status IN ('accepted', 'helper_on_way', 'helper_arrived', 'completed'))
      )
    )
  );

CREATE POLICY "Requester can insert private location"
  ON public.alert_private_locations FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.alerts a
      WHERE a.id = alert_private_locations.alert_id
      AND a.requester_id = auth.uid()
    )
  );

-- 5. MESSAGES POLICIES
CREATE POLICY "Messages viewable only by alert participants" 
  ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Participants can insert messages" 
  ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 6. REVIEWS POLICIES
CREATE POLICY "Reviews viewable by everyone" 
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Requesters can leave review for completed alerts" 
  ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = requester_id AND
    EXISTS (
      SELECT 1 FROM public.alerts a
      WHERE a.id = reviews.alert_id AND a.status = 'completed'
    )
  );

-- 7. REPORTS POLICIES
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters can view own reports"
  ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- 8. BLOCKED USERS POLICIES
CREATE POLICY "Users can manage own blocked users"
  ON public.blocked_users FOR ALL USING (auth.uid() = blocker_id);
