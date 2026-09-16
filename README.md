# 🐾 Sans Pattes — Application d'Entraide Locale & Respect Animal

> **"Aider la personne tout en respectant l'animal."**

**Sans Pattes** est une plateforme d'entraide locale mobile-first destinée aux personnes qui ont peur ou la phobie des araignées, insectes et petites bêtes. Lorsqu'une personne seule voit une araignée chez elle, elle peut émettre une alerte. Des voisins disponibles (*helpers*) reçoivent l'alerte, se rendent sur place, récupèrent l'animal sans lui faire de mal et le relâchent dehors.

---

## 🌟 Stack Technique & Architecture

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Cartographie**: Cartographie interactive mobile-first (OpenStreetMap / Leaflet) avec rayon d'anonymisation de l'adresse.
- **Backend & Persistence**:
  - **Supabase PostgreSQL** avec Row Level Security (RLS) et Realtime.
  - **Store Local Réactif Hybride**: L'application inclut un moteur d'état réactif autonome (LocalStorage + WebSockets mock) permettant d'utiliser l'application immédiatement à 100% sans aucune configuration externe.
- **Devise**: Francs suisses (CHF) — Gratuit / Entraide, 5 CHF, 10 CHF, 15 CHF, 20 CHF ou personnalisé.

---

## 🚀 Installation et Lancement Rapide

### 1. Prérequis
- Node.js >= 18 (Recommandé Node.js 20 LTS ou 24)
- NPM, PNPM ou Yarn

### 2. Installation des dépendances
```bash
npm install
```

### 3. Lancer en mode développement
```bash
npm run dev
```
L'application est immédiatement accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Connexion Supabase & Migrations SQL

Si vous souhaitez connecter l'application à une vraie instance Supabase PostgreSQL :

1. Renommez `.env.example` en `.env.local` et renseignez vos identifiants Supabase :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
   ```
2. Dans le dashboard SQL Supabase, exécutez dans l'ordre les migrations situées dans `./supabase/migrations/` :
   - `01_schema.sql` : Création des tables (`profiles`, `helper_settings`, `alerts`, `messages`, `reviews`, `reports`).
   - `02_rls.sql` : Configuration des politiques de sécurité Row Level Security.
   - `03_seed.sql` : Ingestion des données de démonstration (Lausanne & environs).

---

## 👥 Comptes de Démonstration Pré-chargés

Pour tester l'ensemble des parcours dans l'application, un sélecteur de comptes est disponible directement dans l'en-tête (Header) :

| Rôle | Nom & Prénom | Ville | Note | Spécificité |
| :--- | :--- | :--- | :--- | :--- |
| **Demandeur** | Emma D. | Lausanne | 5.0 ⭐ | A besoin qu'on retire une araignée dans sa chambre |
| **Helper** | Lucas M. | Lausanne | 4.9 ⭐ | Helper actif (32 interventions) à 1.2 km |
| **Helper** | Sofia B. | Pully | 5.0 ⭐ | Helper disponible à 2.5 km |
| **Helper** | Nicolas V. | Renens | 4.7 ⭐ | Helper expérimenté |

---

## 🧪 Parcours de Démonstration Principal (Vérification Pas-à-Pas)

Pour valider le fonctionnement de bout en bout :

1. **Création d'alerte** :
   - Connectez-vous en tant que **Emma (Demandeur)**.
   - Cliquez sur **"J'AI BESOIN D'AIDE"**.
   - Étape 1 : Choisissez **Araignée** 🕷️.
   - Étape 2 : Ajoutez une photo ou simulez la prise de vue 📸.
   - Étape 3 : Indiquez la pièce (**Chambre**) et un commentaire ("Elle est au plafond").
   - Étape 4 : Choisissez l'urgence (**Rapide souhaité** 🟠).
   - Étape 5 : Proposez une rémunération (**10 CHF** 💰).
   - Étape 6 : Confirmez la zone (**Lausanne Centre**). Remarquez que l'adresse exacte est protégée par un bouclier de confidentialité.
   - Étape 7 : Cliquez sur **Envoyer l'alerte**.

2. **Réception et Acceptation par le Helper** :
   - Basculez le compte sur **Lucas (Helper)** via le sélecteur d'en-tête.
   - Lucas voit l'alerte apparaitre sur sa carte et dans la section "Autour de moi".
   - Cliquez sur l'alerte. Lucas vérifie la récompense (10 CHF) et clique sur **Accepter l'intervention**.
   - L'adresse exacte (`Rue de Bourg 14, 1003 Lausanne`) est déverrouillée uniquement maintenant.

3. **Progression & Messagerie Temps Réel** :
   - Cliquez sur **Suivre l'intervention**.
   - Lucas peut faire progresser les étapes : `Je pars 🚶` ➔ `Je suis arrivé 📍`.
   - Les deux utilisateurs peuvent s'envoyer des messages ou utiliser les puces rapides (*"J'arrive"*, *"Je suis devant"*).

4. **Clôture & Avis 5 Étoiles** :
   - Lucas clique sur **Intervention terminée** et confirme : *"Relâchée à l'extérieur 🌿"*.
   - Emma reçoit la confirmation et laisse une note de **5 étoiles** ⭐ avec les critères *"Gentillesse"* et *"Précaution avec l'animal"*.
   - L'intervention est archivée dans l'onglet **Mes interventions** des deux profils et met à jour la note globale du helper.

---

## 🗺️ Roadmap & Évolutions Futures (P2)

- [ ] Intégration de paiement réel via **Stripe Connect** & **TWINT**.
- [ ] Push Notifications PWA natives (Web Push API).
- [ ] Reconnaissance automatique de l'espèce d'insecte par vision IA.
- [ ] Vérification d'identité automatisée (ID Check).
