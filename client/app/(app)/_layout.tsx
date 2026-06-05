import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function AppLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  if (!session) return <Redirect href="/(auth)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="upload" />
    </Stack>
  );
}
