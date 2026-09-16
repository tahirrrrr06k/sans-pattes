# 🐾 Sans Pattes — Application d'Entraide Locale & Respect Animal

> **"Aider la personne tout en respectant l'animal."**

**Sans Pattes** est une plateforme d'entraide locale mobile-first destinée aux personnes qui ont peur ou la phobie des araignées, insectes et petites bêtes.

---

## 🌐 Déploiement Public & Liens

- **URL Publique HTTPS (Live Production)** : [https://sans-pattes-app.sans-pattes.workers.dev](https://sans-pattes-app.sans-pattes.workers.dev)
- **Dépôt GitHub** : [https://github.com/tahirrrrr06k/sans-pattes](https://github.com/tahirrrrr06k/sans-pattes)
- **Hébergement Frontend** : Cloudflare Pages / Workers
- **Backend & Base de Données** : Supabase PostgreSQL (Auth, RLS, Storage, Realtime, RPC)

---

## 🌟 Stack Technique & Architecture

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Cartographie**: Cartographie interactive mobile-first (OpenStreetMap / Leaflet) avec rayon d'anonymisation de l'adresse.
- **Architecture de la vie privée (Phase 5)** : Table `alert_private_locations` isolée. Seule la zone approximative (`Lausanne – ~1.2 km`) est visible avant l'acceptation par le helper. L'adresse exacte n'est déverrouillée qu'après acceptation.
- **Acceptation Atomique (Phase 7)** : Fonction RPC PostgreSQL `accept_alert(p_alert_id, p_helper_id)` avec verrouillage `FOR UPDATE` empêchant les race conditions.
- **Couche d'abstraction Repositories (Phase 3)** : Pattern Repository avec basculement automatique (`isSupabaseConfigured()`) entre `SupabaseAlertRepository` et `MockAlertRepository`.
- **Devise**: Francs suisses (CHF) — Gratuit / Entraide, 5 CHF, 10 CHF, 15 CHF, 20 CHF ou personnalisé.

---

## 🚀 Installation et Lancement Local

```bash
# 1. Cloner le projet
git clone https://github.com/tahirrrrr06k/sans-pattes.git
cd sans-pattes

# 2. Installer les dépendances
npm install

# 3. Lancer en mode dev
npm run dev
```

---

## 🗄️ Structure Supabase & Migrations SQL

Les scripts de migration PostgreSQL sont situés dans `./supabase/migrations/` :
1. `01_schema.sql` : Tables `profiles`, `helper_settings`, `alerts`, `alert_private_locations`, `messages`, `reviews`, `reports`, `blocked_users` + fonction RPC `accept_alert`.
2. `02_rls.sql` : Politiques de sécurité Row Level Security (RLS).
3. `03_seed.sql` : Données de démonstration de Lausanne.

---

## 👥 Personas de Démonstration

Un sélecteur de compte dans l'en-tête permet de basculer instantanément :
- 👩 **Emma** (*Demandeur à Lausanne*)
- 👨 **Lucas** (*Helper 4.9⭐ à 1.2 km*)
- 👩 **Sofia** (*Helper 5.0⭐ à 2.5 km*)
- 👨 **Nicolas** (*Helper 4.7⭐ à 3.4 km*)

---

## 📋 Résumé du Workflow Testé de Bout en Bout

1. **Emma** crée une alerte pour une araignée dans sa chambre (10 CHF).
2. **Lucas** aperçoit la demande sur la carte sans voir l'adresse exacte.
3. **Lucas** accepte la mission via le verrouillage atomique RPC `accept_alert`.
4. L'adresse exacte (`Rue de Bourg 14, Lausanne`) est déverrouillée uniquement pour Lucas.
5. Progression en direct (`Je pars 🚶` ➔ `Je suis arrivé 📍` ➔ `Intervention terminée ✅`).
6. **Emma** laisse un avis 5 étoiles ⭐ qui met à jour le profil de Lucas.
