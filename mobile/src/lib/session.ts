import { useSyncExternalStore } from 'react';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

let session: AuthSession | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return session;
}

export function setSession(next: AuthSession | null) {
  session = next;
  emit();
}

export function clearSession() {
  setSession(null);
}

export function getAccessToken() {
  return session?.access_token ?? null;
}

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
