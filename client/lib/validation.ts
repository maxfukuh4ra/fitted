// Validation functions for basic error handling of form inputs 
// [GenAI Use] Prompt: "Create a regex for email validation please".
// [GenAI Use] LLM Response Start
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// The regex was created according to the given prompt. I also ensured that the regex
// was not too restrictive and allowed for a variety of email addresses.


const MIN_PASSWORD_LENGTH = 6;
const MIN_AGE = 10;
const MAX_AGE = 100;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > 254) {
    return false;
  }
  return EMAIL_REGEX.test(normalized);
}

export function validateEmail(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return 'Please enter your email address.';
  }
  if (!isValidEmail(normalized)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Please enter your password.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validateAuthCredentials(
  email: string,
  password: string,
): string | null {
  return validateEmail(email) ?? validatePassword(password);
}

export type ProfileFormInput = {
  fullName: string;
  age: string;
};

export function validateProfileForm(input: ProfileFormInput): string | null {
  const trimmedName = input.fullName.trim();
  if (!trimmedName) {
    return 'Please enter your full name.';
  }

  if (!input.age.trim()) {
    return 'Please enter your age.';
  }

  const parsedAge = Number.parseInt(input.age, 10);
  if (Number.isNaN(parsedAge) || parsedAge < MIN_AGE || parsedAge > MAX_AGE) {
    return `Please enter a valid age (${MIN_AGE}–${MAX_AGE}).`;
  }

  return null;
}

// Error formatting function for authentication errors
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('rate limit')) {
    return 'Too many sign-up attempts. Please wait a while and try again.';
  }

  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (lower.includes('invalid') && lower.includes('email')) {
    return 'This email address is not accepted. Try a longer Gmail address (e.g. name@gmail.com) or another provider.';
  }

  if (lower.includes('password')) {
    return message;
  }

  return message;
}
