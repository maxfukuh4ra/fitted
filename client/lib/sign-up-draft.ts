// Saves email and password during onboarding process and clears after
type SignUpDraft = {
  email: string;
  password: string;
};

let draft: SignUpDraft | null = null;

export function setSignUpDraft(email: string, password: string) {
  draft = { email, password };
}

export function getSignUpDraft(): SignUpDraft | null {
  return draft;
}

export function clearSignUpDraft() {
  draft = null;
}
