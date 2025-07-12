import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProgressContextType {
  breathingStreak: number;
  unlockedLevels: number[];
  breathingBadge: boolean;
  meditationMonkBadge: boolean;
  therapyBadge: boolean;
  updateProgress: (updates: Partial<Omit<ProgressContextType, 'updateProgress' | 'increment'>>) => Promise<void>;
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
        breathingStreak: data.breathing_streak || 0,
        unlockedLevels: data.unlocked_levels || [],
        breathingBadge: data.breathing_badge || false,
        meditationMonkBadge: data.meditation_monk_badge || false,
        therapyBadge: data.therapy_badge || false
      });
    } else {
      await supabase.from('user_progress').insert({ user_id: session.user.id });
    }
  };

  const updateProgress = async (updates: Partial<Omit<ProgressContextType, 'updateProgress' | 'increment' | 'saveTherapySession'>>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setProgress(prev => ({ ...prev, ...updates }));
    
    await supabase
      .from('user_progress')
      .upsert({ 
        user_id: session.user.id, 
        ...updates 
      });
  };

  const saveTherapySession = async (userMessage: string, aiResponse: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('therapy_sessions').insert({
      user_id: session.user.id,
      user_message: userMessage,
      ai_response: aiResponse
    });
  };

  const increment = async (section: 'breathing' | 'meditation' | 'sleep' | 'therapy', data?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const updates: any = {};
    let newProgress = { ...progress };

    if (section === 'breathing') {
      // ... existing breathing logic
    }

    if (section === 'meditation') {
      // ... existing meditation logic
    }

    if (section === 'sleep') {
      // ... existing sleep logic
    }

    if (section === 'therapy') {
      if (data?.therapyBadge) {
        updates.therapy_badge = true;
        newProgress.therapyBadge = true;
      }
    }

    setProgress(newProgress);
    await supabase.from('user_progress').upsert({ 
      user_id: session.user.id, 
      ...updates 
    });
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