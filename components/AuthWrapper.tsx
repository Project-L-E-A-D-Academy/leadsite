// components/AuthWrapper.tsx
import { useEffect, useState } from 'react'; // Add this import
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import LoadingScreen from './LoadingScreen';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push(`/auth?redirect=${router.asPath}`);
      } else {
        setAuthenticated(true);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push(`/auth?redirect=${router.asPath}`);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return authenticated ? <>{children}</> : null;
}