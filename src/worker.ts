export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface Env {
  SANS_PATTES_KV: KVNamespace;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Route API requests to KV Persistent Backend
    if (url.pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      try {
        // --- AUTH API ---
        if (url.pathname === '/api/auth/register' && request.method === 'POST') {
          const body: any = await request.json();
          const firstName = (body.first_name || '').trim();
          const lastName = (body.last_name || '').trim();
          const password = (body.password || '').trim();

          if (!firstName || !lastName || !password) {
            return new Response(
              JSON.stringify({ error: 'Prénom, nom et mot de passe requis.' }),
              { status: 400, headers: corsHeaders }
            );
          }

          const userKey = `user:${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
          const existing = await env.SANS_PATTES_KV.get(userKey);

          if (existing) {
            // User exists -> auto-login if password matches
            const parsedExisting = JSON.parse(existing);
            if (parsedExisting.password === password) {
              return new Response(JSON.stringify({ user: parsedExisting.profile }), {
                headers: corsHeaders,
              });
            }
            return new Response(
              JSON.stringify({ error: 'Un compte existe déjà avec ce prénom et nom. Mot de passe incorrect.' }),
              { status: 400, headers: corsHeaders }
            );
          }

          const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          const profile = {
            id: userId,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sanspattes.app`,
            first_name: firstName,
            last_name: lastName,
            avatar_url: body.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`,
            city: body.city || 'Lausanne',
            is_helper: !!body.is_helper,
            rating: 5.0,
            total_interventions: 0,
            animals_saved: 0,
            created_at: new Date().toISOString(),
            role_preference: body.is_helper ? 'helper' : 'requester',
          };

          await env.SANS_PATTES_KV.put(
            userKey,
            JSON.stringify({ profile, password })
          );

          return new Response(JSON.stringify({ user: profile }), {
            headers: corsHeaders,
          });
        }

        if (url.pathname === '/api/auth/login' && request.method === 'POST') {
          const body: any = await request.json();
          const firstName = (body.first_name || '').trim();
          const lastName = (body.last_name || '').trim();
          const password = (body.password || '').trim();

          const userKey = `user:${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
          const recordStr = await env.SANS_PATTES_KV.get(userKey);

          if (!recordStr) {
            return new Response(
              JSON.stringify({ error: 'Compte introuvable. Veuillez créer un compte.' }),
              { status: 404, headers: corsHeaders }
            );
          }

          const record = JSON.parse(recordStr);
          if (record.password !== password) {
            return new Response(
              JSON.stringify({ error: 'Mot de passe incorrect.' }),
              { status: 401, headers: corsHeaders }
            );
          }

          return new Response(JSON.stringify({ user: record.profile }), {
            headers: corsHeaders,
          });
        }

        // --- ALERTS API ---
        if (url.pathname === '/api/alerts' && request.method === 'GET') {
          const alertsStr = await env.SANS_PATTES_KV.get('alerts:all');
          const alerts = alertsStr ? JSON.parse(alertsStr) : [];
          return new Response(JSON.stringify({ alerts }), { headers: corsHeaders });
        }

        if (url.pathname === '/api/alerts' && request.method === 'POST') {
          const body: any = await request.json();
          const newAlert = {
            id: 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            requester_id: body.requester_id,
            requester: body.requester,
            category: body.category,
            description: body.description,
            room: body.room,
            photo_url: body.photo_url || null,
            urgency: body.urgency,
            reward_amount: body.reward_amount || 0,
            currency: 'CHF',
            status: 'searching',
            approximate_location: body.approximate_location,
            exact_address: body.exact_address,
            latitude: body.latitude || 46.5197,
            longitude: body.longitude || 6.6323,
            created_at: new Date().toISOString(),
          };

          const alertsStr = await env.SANS_PATTES_KV.get('alerts:all');
          const alerts = alertsStr ? JSON.parse(alertsStr) : [];
          const updatedAlerts = [newAlert, ...alerts];

          await env.SANS_PATTES_KV.put('alerts:all', JSON.stringify(updatedAlerts));
          await env.SANS_PATTES_KV.put(`alert:${newAlert.id}`, JSON.stringify(newAlert));

          return new Response(JSON.stringify({ alert: newAlert }), { headers: corsHeaders });
        }

        if (url.pathname === '/api/alerts/accept' && request.method === 'POST') {
          const body: any = await request.json();
          const alertId = body.alert_id;
          const helperId = body.helper_id;
          const helperProfile = body.helper;

          const alertsStr = await env.SANS_PATTES_KV.get('alerts:all');
          const alerts = alertsStr ? JSON.parse(alertsStr) : [];

          const index = alerts.findIndex((a: any) => a.id === alertId);
          if (index < 0) {
            return new Response(JSON.stringify({ success: false, message: 'Alerte introuvable.' }), { headers: corsHeaders });
          }

          if (alerts[index].status !== 'searching') {
            return new Response(JSON.stringify({ success: false, message: 'Déjà acceptée par quelqu\'un d\'autre.' }), { headers: corsHeaders });
          }

          alerts[index].status = 'accepted';
          alerts[index].helper_id = helperId;
          alerts[index].helper = helperProfile;
          alerts[index].accepted_at = new Date().toISOString();

          await env.SANS_PATTES_KV.put('alerts:all', JSON.stringify(alerts));
          await env.SANS_PATTES_KV.put(`alert:${alertId}`, JSON.stringify(alerts[index]));

          return new Response(JSON.stringify({ success: true, alert: alerts[index] }), { headers: corsHeaders });
        }

        if (url.pathname === '/api/alerts/status' && request.method === 'POST') {
          const body: any = await request.json();
          const alertId = body.alert_id;
          const newStatus = body.status;

          const alertsStr = await env.SANS_PATTES_KV.get('alerts:all');
          const alerts = alertsStr ? JSON.parse(alertsStr) : [];

          const index = alerts.findIndex((a: any) => a.id === alertId);
          if (index >= 0) {
            alerts[index].status = newStatus;
            if (body.outcome) alerts[index].outcome = body.outcome;
            if (body.outcome_note) alerts[index].outcome_note = body.outcome_note;
            if (newStatus === 'completed') alerts[index].completed_at = new Date().toISOString();

            await env.SANS_PATTES_KV.put('alerts:all', JSON.stringify(alerts));
            await env.SANS_PATTES_KV.put(`alert:${alertId}`, JSON.stringify(alerts[index]));
          }

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // --- GLOBAL CHAT API ---
        if (url.pathname === '/api/chat' && request.method === 'GET') {
          const msgsStr = await env.SANS_PATTES_KV.get('chat:global');
          const messages = msgsStr ? JSON.parse(msgsStr) : [];
          return new Response(JSON.stringify({ messages }), { headers: corsHeaders });
        }

        if (url.pathname === '/api/chat' && request.method === 'POST') {
          const body: any = await request.json();
          const newMsg = {
            id: 'gmsg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            anonymous_user_id: body.anonymous_user_id,
            nickname: body.nickname,
            avatar_color: body.avatar_color || 'emerald',
            content: body.content,
            reply_to_id: body.reply_to_id || null,
            is_deleted: false,
            created_at: new Date().toISOString(),
          };

          const msgsStr = await env.SANS_PATTES_KV.get('chat:global');
          const messages = msgsStr ? JSON.parse(msgsStr) : [];
          const updated = [...messages, newMsg].slice(-200); // Keep last 200

          await env.SANS_PATTES_KV.put('chat:global', JSON.stringify(updated));

          return new Response(JSON.stringify({ message: newMsg }), { headers: corsHeaders });
        }

        if (url.pathname === '/api/chat/delete' && request.method === 'POST') {
          const body: any = await request.json();
          const messageId = body.message_id;

          const msgsStr = await env.SANS_PATTES_KV.get('chat:global');
          const messages = msgsStr ? JSON.parse(msgsStr) : [];

          const updated = messages.map((m: any) =>
            m.id === messageId
              ? { ...m, is_deleted: true, content: 'Message supprimé' }
              : m
          );

          await env.SANS_PATTES_KV.put('chat:global', JSON.stringify(updated));
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ error: 'Endpoint non trouvé' }), {
          status: 404,
          headers: corsHeaders,
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // 2. Route all static asset requests to Next.js ./out directory
    return env.ASSETS.fetch(request);
  },
};
