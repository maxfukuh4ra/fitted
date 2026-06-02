import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  age: number;
  height: number;
  gender: string;
};

export type ProfileUpdate = {
  name?: string;
  age?: number;
  height?: number;
  gender?: string;
};

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function getProfile(): Promise<UserProfile> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);

  const session = sessionData.session;
  if (!session) throw new Error('No active session.');

  const userId = session.user.id;
  const email = session.user.email ?? '';

  const { data, error } = await supabase
    .from('users')
    .select('name, age, height, gender')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: userId,
    email,
    name: data.name,
    age: data.age,
    height: data.height,
    gender: data.gender,
  };
}
