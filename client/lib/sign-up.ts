import { supabase } from '@/lib/supabase';
import {
  formatAuthError,
  normalizeEmail,
  validateAuthCredentials,
  validateProfileForm,
} from '@/lib/validation';

export type SignUpProfileInput = {
  email: string;
  password: string;
  name: string;
  age: number;
  heightInches: number;
  gender: string;
};

export type SignUpResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; message: string };

export async function signUpWithProfile(input: SignUpProfileInput): Promise<SignUpResult> {
  // Check email and password are valid
  const credentialsError = validateAuthCredentials(input.email, input.password);
  if (credentialsError) {
    return { ok: false, message: credentialsError };
  }

  // Check name and age are valid
  const profileValidationError = validateProfileForm({
    fullName: input.name,
    age: String(input.age),
  });
  if (profileValidationError) {
    return { ok: false, message: profileValidationError };
  }

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
  });
  if (authError) {
    return { ok: false, message: formatAuthError(authError.message) };
  }
  const authUser = authData.user;
  if (!authUser) {
    return { ok: false, message: 'Account could not be created. Please try again.' };
  }

  // Add onboarding profile data to users table
  const { error: insertError } = await supabase.from('users').insert({
    id: authUser.id,
    name: input.name.trim(),
    age: input.age,
    height: input.heightInches,
    gender: input.gender,
  });
  if (insertError) {
    return {
      ok: false,
      message: formatAuthError(insertError.message),
    };
  }

  const needsEmailConfirmation = !authData.session;

  return { ok: true, needsEmailConfirmation };
}
