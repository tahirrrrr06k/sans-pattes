-- =================================================================
-- MIGRATION 01: SANS PATTES DATABASE SCHEMA (COMPLETE MVP)
-- =================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  city TEXT DEFAULT 'Lausanne',
  date_of_birth DATE,
  is_helper BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  total_interventions INTEGER DEFAULT 0,
  animals_saved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HELPER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.helper_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_now BOOLEAN DEFAULT TRUE,
  max_distance_km INTEGER DEFAULT 5,
  accept_spiders BOOLEAN DEFAULT TRUE,
  accept_insects BOOLEAN DEFAULT TRUE,
  accept_wasps BOOLEAN DEFAULT TRUE,
  accept_other BOOLEAN DEFAULT TRUE,
  humane_commitment_accepted BOOLEAN DEFAULT TRUE,
  weekly_schedule JSONB DEFAULT '{
    "monday": {"enabled": true, "start": "18:00", "end": "23:00"},
    "tuesday": {"enabled": false, "start": "18:00", "end": "23:00"},
    "wednesday": {"enabled": true, "start": "17:00", "end": "22:30"},
    "thursday": {"enabled": true, "start": "18:00", "end": "23:00"},
    "friday": {"enabled": true, "start": "18:00", "end": "00:00"},
    "saturday": {"enabled": true, "start": "08:00", "end": "23:59"},
    "sunday": {"enabled": true, "start": "08:00", "end": "23:59"}
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ALERTS TABLE (Public / Semi-public data only)
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('Araignée', 'Insecte', 'Guêpe / abeille', 'Papillon / mite', 'Coléoptère', 'Autre petite bête', 'Je ne sais pas')),
  description TEXT,
  room TEXT NOT NULL,
  photo_url TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
  reward_amount INTEGER DEFAULT 10,
  currency TEXT DEFAULT 'CHF',
  status TEXT NOT NULL DEFAULT 'searching' CHECK (status IN ('draft', 'searching', 'accepted', 'helper_on_way', 'helper_arrived', 'completed', 'cancelled', 'expired')),
  approximate_location TEXT NOT NULL,
  exact_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  outcome TEXT CHECK (outcome IN ('released_outside', 'already_gone', 'not_found', 'pro_needed', 'other')),
  outcome_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 4. PRIVATE LOCATION TABLE (Phase 5: Exact Address Privacy Shield)
CREATE TABLE IF NOT EXISTS public.alert_private_locations (
  alert_id UUID PRIMARY KEY REFERENCES public.alerts(id) ON DELETE CASCADE,
  exact_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID UNIQUE NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  criteria JSONB DEFAULT '[]'::jsonb,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES public.alerts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BLOCKED USERS TABLE
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- ATOMIC ACCEPTANCE RPC FUNCTION (Phase 7)
CREATE OR REPLACE FUNCTION public.accept_alert(p_alert_id UUID, p_helper_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alert public.alerts%ROWTYPE;
BEGIN
  -- Perform row-level lock on target alert row to prevent race conditions
  SELECT * INTO v_alert
  FROM public.alerts
  WHERE id = p_alert_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Alerte non trouvée.');
  END IF;

  IF v_alert.status != 'searching' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cette alerte a déjà été acceptée ou n''est plus active.');
  END IF;

  IF v_alert.requester_id = p_helper_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Vous ne pouvez pas accepter votre propre demande.');
  END IF;

  -- Update alert atomically
  UPDATE public.alerts
  SET status = 'accepted',
      helper_id = p_helper_id,
      accepted_at = NOW()
  WHERE id = p_alert_id;

  RETURN jsonb_build_object('success', true, 'message', 'Intervention acceptée avec succès !');
END;
$$;
