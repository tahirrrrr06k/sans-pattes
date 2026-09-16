-- =================================================================
-- MIGRATION 03: DEMO SEED DATA (LAUSANNE REGION)
-- =================================================================

-- Demo Users UUIDs
-- Emma: 11111111-1111-4111-a111-111111111111
-- Lucas: 22222222-2222-4222-a222-222222222222
-- Sofia: 33333333-3333-4333-a333-333333333333
-- Nicolas: 44444444-4444-4444-a444-444444444444

INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url, city, is_helper, rating, total_interventions, animals_saved)
VALUES
  ('11111111-1111-4111-a111-111111111111', 'emma@example.ch', 'Emma', 'D.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Lausanne', false, 5.0, 2, 2),
  ('22222222-2222-4222-a222-222222222222', 'lucas@example.ch', 'Lucas', 'M.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Lausanne', true, 4.9, 32, 35),
  ('33333333-3333-4333-a333-333333333333', 'sofia@example.ch', 'Sofia', 'B.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Pully', true, 5.0, 18, 20),
  ('44444444-4444-4444-a444-444444444444', 'nicolas@example.ch', 'Nicolas', 'V.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Renens', true, 4.7, 51, 58)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.helper_settings (user_id, available_now, max_distance_km)
VALUES
  ('22222222-2222-4222-a222-222222222222', true, 5),
  ('33333333-3333-4333-a333-333333333333', true, 10),
  ('44444444-4444-4444-a444-444444444444', true, 8)
ON CONFLICT (user_id) DO NOTHING;

-- Active Demo Alerts
INSERT INTO public.alerts (id, requester_id, category, description, room, photo_url, urgency, reward_amount, status, approximate_location, exact_address, latitude, longitude, created_at)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-4111-a111-111111111111',
    'Araignée',
    'Elle est au plafond au-dessus de mon lit dans la chambre. Assez grosse et noire, je n''ose plus rentrer.',
    'Chambre',
    'https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=600',
    'medium',
    10,
    'searching',
    'Lausanne – approx. 1.2 km',
    'Rue de Bourg 14, 1003 Lausanne',
    46.5197,
    6.6323,
    NOW() - INTERVAL '5 minutes'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-4111-a111-111111111111',
    'Insecte',
    'Un gros scarabée est coincé derrière les rideaux de la cuisine.',
    'Cuisine',
    NULL,
    'low',
    0,
    'searching',
    'Pully – approx. 2.5 km',
    'Avenue de la Gare 8, 1009 Pully',
    46.5090,
    6.6620,
    NOW() - INTERVAL '20 minutes'
  );
