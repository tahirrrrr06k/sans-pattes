'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  HelperSettings, 
  Alert, 
  Message, 
  Review, 
  AlertStatus, 
  OutcomeType,
  CategoryType,
  RoomType,
  UrgencyLevel,
  WeeklySchedule
} from '@/types';
import { DEMO_PROFILES, DEFAULT_HELPER_SETTINGS, INITIAL_ALERTS, INITIAL_MESSAGES, INITIAL_REVIEWS } from '@/lib/mock/initial-data';
import { alertRepository, isProductionBackend } from '@/lib/repositories';


interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (profile: UserProfile) => void;
  setCurrentUserKey: (key: string) => void;
  userRoleMode: 'requester' | 'helper';
  setUserRoleMode: (mode: 'requester' | 'helper') => void;
  
  alerts: Alert[];
  helperSettings: HelperSettings;
  messages: Message[];
  reviews: Review[];

  // Actions
  createAlert: (data: {
    category: CategoryType;
    description: string;
    room: RoomType;
    photo_url?: string | null;
    urgency: UrgencyLevel;
    reward_amount: number;
    exact_address: string;
    approximate_location: string;
    latitude: number;
    longitude: number;
  }) => Promise<Alert> | Alert;

  acceptAlert: (alertId: string) => boolean;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  completeIntervention: (alertId: string, outcome: OutcomeType, outcomeNote?: string) => void;
  cancelAlert: (alertId: string) => void;
  
  sendMessage: (alertId: string, content: string, recipientId: string) => Message;
  submitReview: (alertId: string, rating: number, criteria: string[], comment?: string) => void;
  
  updateHelperSettings: (settings: Partial<HelperSettings>) => void;
  registerUser: (userData: Partial<UserProfile>) => UserProfile;
  
  resetDemoData: () => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserKey, setCurrentUserKey] = useState<string>('emma');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_PROFILES['emma']);
  const [userRoleMode, setUserRoleMode] = useState<'requester' | 'helper'>('requester');
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);

  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [helperSettings, setHelperSettings] = useState<HelperSettings>(
    DEFAULT_HELPER_SETTINGS['22222222-2222-4222-a222-222222222222']
  );

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuthUser = localStorage.getItem('sp_auth_user');
      if (savedAuthUser) {
        try {
          const parsed = JSON.parse(savedAuthUser);
          if (parsed && parsed.id) {
            setCurrentUser(parsed);
            setUserRoleMode(parsed.is_helper ? 'helper' : 'requester');
          }
        } catch (e) {}
      } else {
        const savedUserKey = localStorage.getItem('sp_user_key');
        if (savedUserKey && DEMO_PROFILES[savedUserKey]) {
          setCurrentUserKey(savedUserKey);
          setCurrentUser(DEMO_PROFILES[savedUserKey]);
          setUserRoleMode(DEMO_PROFILES[savedUserKey].is_helper ? 'helper' : 'requester');
        }
      }

      const savedAlerts = localStorage.getItem('sp_alerts');
      if (savedAlerts) {
        try { setAlerts(JSON.parse(savedAlerts)); } catch (e) {}
      }

      const savedMessages = localStorage.getItem('sp_messages');
      if (savedMessages) {
        try { setMessages(JSON.parse(savedMessages)); } catch (e) {}
      }

      const savedReviews = localStorage.getItem('sp_reviews');
      if (savedReviews) {
        try { setReviews(JSON.parse(savedReviews)); } catch (e) {}
      }

      const savedOnboarding = localStorage.getItem('sp_onboarding_done');
      if (savedOnboarding !== null) {
        setOnboardingCompleted(savedOnboarding === 'true');
      }
    }

    if (isProductionBackend) {
      alertRepository.getAlerts().then(remoteAlerts => {
        if (remoteAlerts && remoteAlerts.length > 0) {
          setAlerts(remoteAlerts);
        }
      }).catch(err => console.warn('Failed to load remote alerts:', err));

      if (alertRepository.subscribeToAlerts) {
        const unsub = alertRepository.subscribeToAlerts((incomingAlert) => {
          setAlerts(prev => {
            const idx = prev.findIndex(a => a.id === incomingAlert.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...incomingAlert };
              return updated;
            }
            return [incomingAlert, ...prev];
          });
        });
        return () => unsub();
      }
    }
  }, []);

  const handleSetCurrentUser = (profile: UserProfile) => {
    setCurrentUser(profile);
    setUserRoleMode(profile.is_helper ? 'helper' : 'requester');
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_auth_user', JSON.stringify(profile));
    }
  };

  // Save changes to localstorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_reviews', JSON.stringify(reviews));
    }
  }, [reviews]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sp_onboarding_done', String(onboardingCompleted));
    }
  }, [onboardingCompleted]);

  // Switch demo profile
  const handleSetCurrentUserKey = (key: string) => {
    if (DEMO_PROFILES[key]) {
      setCurrentUserKey(key);
      const profile = DEMO_PROFILES[key];
      setCurrentUser(profile);
      setUserRoleMode(profile.is_helper ? 'helper' : 'requester');
      if (typeof window !== 'undefined') {
        localStorage.setItem('sp_user_key', key);
      }
    }
  };

  // Create new Alert
  const createAlert = async (data: {
    category: CategoryType;
    description: string;
    room: RoomType;
    photo_url?: string | null;
    urgency: UrgencyLevel;
    reward_amount: number;
    exact_address: string;
    approximate_location: string;
    latitude: number;
    longitude: number;
  }): Promise<Alert> => {
    let created: Alert;
    if (isProductionBackend) {
      try {
        created = await alertRepository.createAlert(data, currentUser.id);
        created = { ...created, requester: currentUser };
      } catch (err) {
        console.warn('Backend alert creation failed, using fallback:', err);
        created = {
          id: 'alert_' + Date.now(),
          requester_id: currentUser.id,
          requester: currentUser,
          category: data.category,
          description: data.description,
          room: data.room,
          photo_url: data.photo_url || null,
          urgency: data.urgency,
          reward_amount: data.reward_amount,
          currency: 'CHF',
          status: 'searching',
          approximate_location: data.approximate_location,
          exact_address: data.exact_address,
          latitude: data.latitude,
          longitude: data.longitude,
          created_at: new Date().toISOString(),
        };
      }
    } else {
      created = {
        id: 'alert_' + Date.now(),
        requester_id: currentUser.id,
        requester: currentUser,
        category: data.category,
        description: data.description,
        room: data.room,
        photo_url: data.photo_url || null,
        urgency: data.urgency,
        reward_amount: data.reward_amount,
        currency: 'CHF',
        status: 'searching',
        approximate_location: data.approximate_location,
        exact_address: data.exact_address,
        latitude: data.latitude,
        longitude: data.longitude,
        created_at: new Date().toISOString(),
      };
    }

    setAlerts(prev => [created, ...prev.filter(a => a.id !== created.id)]);
    return created;
  };

  // Atomic Accept Alert (prevents race conditions)
  const acceptAlert = (alertId: string): boolean => {
    let success = false;
    setAlerts(prev => {
      const target = prev.find(a => a.id === alertId);
      if (!target || target.status !== 'searching') {
        return prev; // Already taken or cancelled
      }
      success = true;
      return prev.map(a => {
        if (a.id === alertId) {
          return {
            ...a,
            status: 'accepted',
            helper_id: currentUser.id,
            helper: currentUser,
            accepted_at: new Date().toISOString()
          };
        }
        return a;
      });
    });
    return success;
  };

  // Update Status Progression (helper_on_way -> helper_arrived -> completed)
  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status,
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
        };
      }
      return a;
    }));
  };

  // Complete Intervention with Outcome
  const completeIntervention = (alertId: string, outcome: OutcomeType, outcomeNote?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'completed',
          outcome,
          outcome_note: outcomeNote || null,
          completed_at: new Date().toISOString()
        };
      }
      return a;
    }));
  };

  // Cancel Alert
  const cancelAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'cancelled' };
      }
      return a;
    }));
  };

  // Send Chat Message
  const sendMessage = (alertId: string, content: string, recipientId: string): Message => {
    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      alert_id: alertId,
      sender_id: currentUser.id,
      recipient_id: recipientId,
      content,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  // Submit Review & Update Helper Rating
  const submitReview = (alertId: string, rating: number, criteria: string[], comment?: string) => {
    const targetAlert = alerts.find(a => a.id === alertId);
    if (!targetAlert || !targetAlert.helper_id) return;

    const newReview: Review = {
      id: 'rev_' + Date.now(),
      alert_id: alertId,
      requester_id: currentUser.id,
      helper_id: targetAlert.helper_id,
      rating,
      criteria,
      comment,
      created_at: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);

    // Update Helper Profile Rating & Stats
    if (targetAlert.helper_id && DEMO_PROFILES) {
      Object.keys(DEMO_PROFILES).forEach(k => {
        if (DEMO_PROFILES[k].id === targetAlert.helper_id) {
          const helper = DEMO_PROFILES[k];
          const newTotal = helper.total_interventions + 1;
          const newRating = Number(((helper.rating * helper.total_interventions + rating) / newTotal).toFixed(1));
          DEMO_PROFILES[k] = {
            ...helper,
            total_interventions: newTotal,
            animals_saved: helper.animals_saved + 1,
            rating: newRating
          };
        }
      });
    }
  };

  // Update Helper Settings
  const updateHelperSettings = (newSettings: Partial<HelperSettings>) => {
    setHelperSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Register User
  const registerUser = (userData: Partial<UserProfile>): UserProfile => {
    const newId = 'usr_' + Date.now();
    const newUser: UserProfile = {
      id: newId,
      email: userData.email || 'user@example.ch',
      first_name: userData.first_name || 'Utilisateur',
      last_name: userData.last_name || '',
      avatar_url: userData.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      city: userData.city || 'Lausanne',
      date_of_birth: userData.date_of_birth,
      is_helper: userData.is_helper || false,
      rating: 5.0,
      total_interventions: 0,
      animals_saved: 0,
      created_at: new Date().toISOString(),
      role_preference: userData.role_preference || 'requester'
    };

    DEMO_PROFILES[newId] = newUser;
    setCurrentUserKey(newId);
    setCurrentUser(newUser);
    setUserRoleMode(newUser.is_helper ? 'helper' : 'requester');
    return newUser;
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setAlerts(INITIAL_ALERTS);
    setMessages(INITIAL_MESSAGES);
    setReviews(INITIAL_REVIEWS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sp_alerts');
      localStorage.removeItem('sp_messages');
      localStorage.removeItem('sp_reviews');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        setCurrentUserKey: handleSetCurrentUserKey,
        userRoleMode,
        setUserRoleMode,
        alerts,
        helperSettings,
        messages,
        reviews,
        createAlert,
        acceptAlert,
        updateAlertStatus,
        completeIntervention,
        cancelAlert,
        sendMessage,
        submitReview,
        updateHelperSettings,
        registerUser,
        resetDemoData,
        onboardingCompleted,
        setOnboardingCompleted
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
