import { GlobalChatMessage } from '@/types';

export const INITIAL_GLOBAL_CHAT: GlobalChatMessage[] = [
  {
    id: 'gmsg_1',
    anonymous_user_id: 'anon_system',
    nickname: 'Marc_Modo',
    avatar_color: 'emerald',
    content: 'Bienvenue sur le Chat Public de Sans Pattes ! 🕷️ Communauté d\'entraide locale en Suisse romande.',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'gmsg_2',
    anonymous_user_id: 'anon_sophie',
    nickname: 'Sophie_Lsn',
    avatar_color: 'sky',
    content: 'Super initiative cette app ! Ça me rassure tellement de savoir qu\'un helper peut venir m\'aider quand je panique.',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'gmsg_3',
    anonymous_user_id: 'anon_sacha',
    nickname: 'Sacha_Helper',
    avatar_color: 'amber',
    content: 'Je suis dispo vers Lausanne Gare & Flon ce soir si besoin d\'une capture douce avec le bocal ! 🏺',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'gmsg_4',
    anonymous_user_id: 'anon_anissa',
    nickname: 'Anissa_VD',
    avatar_color: 'purple',
    content: 'Merci à tous les helpers, vous faites vraiment la différence ! 🙌',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];
