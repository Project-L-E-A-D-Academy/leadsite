import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProgressContextType {
  // Tracker Metrics
  meditation: number;
  breathing: number;
  sleep: number;
  streak: number;
  longestStreak: number;
  badges: string[];
  
  // Original Properties
  breathingStreak: number;
  unlockedLevels: number[];
  breathingBadge: boolean;
  meditationMonkBadge: boolean;
  therapyBadge: boolean;
  
  // Methods
  updateProgress: (updates: Partial<Omit<ProgressContextType, 'updateProgress' | 'increment' | 'saveTherapySession'>>) => Promise<void>;
  increment: (section: 'breathing' | 'meditation' | 'sleep' | 'therapy', data?: any) => Promise<void>;
  saveTherapySession: (userMessage: string, aiResponse: string) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
};

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState<Omit<ProgressContextType, 'updateProgress' | 'increment' | 'saveTherapySession'>>({
    meditation: 0,
    breathing: 0,
    sleep: 0,
    streak: 0,
    longestStreak: 0,
    badges: [],
    breathingStreak: 0,
    unlockedLevels: [],
    breathingBadge: false,
    meditationMonkBadge: false,
    therapyBadge: false
  });

  const loadProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading progress:', error);
      return;
    }

    if (data) {
      setProgress({
        meditation: data.meditation_count || 0,
        breathing: data.breathing_count || 0,
        sleep: data.sleep_count || 0,
        streak: data.current_streak || 0,
        longestStreak: data.longest_streak || 0,
        badges: data.badges || [],
        breathingStreak: data.breathing_streak || 0,
        unlockedLevels: data.unlocked_levels || [],
        breathingBadge: data.breathing_badge || false,
        meditationMonkBadge: data.meditation_monk_badge || false,
        therapyBadge: data.therapy_badge || false
      });
    } else {
      // Initialize new user progress
      await supabase.from('user_progress').insert({ 
        user_id: session.user.id,
        meditation_count: 0,
        breathing_count: 0,
        sleep_count: 0,
        current_streak: 0,
        longest_streak: 0,
        badges: []
      });
    }
  };

  const updateProgress = async (updates: Partial<Omit<ProgressContextType, 'updateProgress' | 'increment' | 'saveTherapySession'>>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setProgress(prev => ({ ...prev, ...updates }));
    
    const dbUpdates = {
      meditation_count: updates.meditation,
      breathing_count: updates.breathing,
      sleep_count: updates.sleep,
      current_streak: updates.streak,
      longest_streak: updates.longestStreak,
      badges: updates.badges,
      breathing_streak: updates.breathingStreak,
      unlocked_levels: updates.unlockedLevels,
      breathing_badge: updates.breathingBadge,
      meditation_monk_badge: updates.meditationMonkBadge,
      therapy_badge: updates.therapyBadge,
      updated_at: new Date().toISOString()
    };
    
    await supabase
      .from('user_progress')
      .upsert({ 
        user_id: session.user.id,
        ...dbUpdates
      });
  };

  const saveTherapySession = async (userMessage: string, aiResponse: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('therapy_sessions').insert({
      user_id: session.user.id,
      user_message: userMessage,
      ai_response: aiResponse,
      created_at: new Date().toISOString()
    });
  };

  const increment = async (section: 'breathing' | 'meditation' | 'sleep' | 'therapy', data?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const updates: Partial<ProgressContextType> = {};
    const newProgress = { ...progress };

    switch (section) {
      case 'meditation':
        updates.meditation = (newProgress.meditation || 0) + 1;
        if (updates.meditation >= 10) {
          updates.meditationMonkBadge = true;
          updates.badges = [...new Set([...newProgress.badges, 'Meditation Monk'])];
        }
        break;
        
      case 'breathing':
        updates.breathing = (newProgress.breathing || 0) + 1;
        updates.streak = (newProgress.streak || 0) + 1;
        updates.breathingStreak = (newProgress.breathingStreak || 0) + 1;
        if (updates.breathing >= 5) {
          updates.breathingBadge = true;
          updates.badges = [...new Set([...newProgress.badges, 'Breathing Master'])];
        }
        break;
        
      case 'sleep':
        updates.sleep = (newProgress.sleep || 0) + 1;
        break;
        
      case 'therapy':
        if (data?.therapyBadge) {
          updates.therapyBadge = true;
          updates.badges = [...new Set([...newProgress.badges, 'Therapy Pro'])];
        }
        break;
    }

    // Update longest streak if current is higher
    if (updates.streak && updates.streak > (newProgress.longestStreak || 0)) {
      updates.longestStreak = updates.streak;
    }

    await updateProgress(updates);
  };

  useEffect(() => {
    loadProgress();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await loadProgress();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        ...progress,
        updateProgress,
        increment,
        saveTherapySession
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};