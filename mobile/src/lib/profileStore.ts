import { useSyncExternalStore } from 'react';
import { PROFILE } from '@/data/mock';

// Lightweight in-memory store for the editable parts of the profile, seeded
// from the mock. Lets the Edit screen write changes that the Profile tab and
// its derived bits (avatar initial, taste pills) pick up immediately.
export type Me = {
  name: string;
  handle: string;
  cuisine: string;
  spice: string;
  avoid: string;
};

const pref = (kw: string, fallback: string) =>
  PROFILE.preferences.find((p) => p.label.toLowerCase().includes(kw))?.value ?? fallback;

let me: Me = {
  name: PROFILE.name,
  handle: PROFILE.handle,
  cuisine: pref('cuisine', 'Nigerian'),
  spice: pref('spice', 'Medium'),
  avoid: pref('avoid', 'None'),
};

const listeners = new Set<() => void>();
const getSnapshot = () => me;
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export function updateMe(patch: Partial<Me>) {
  me = { ...me, ...patch };
  listeners.forEach((l) => l());
}

export function useMe(): Me {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const initialOf = (name: string) => (name.trim()[0] ?? 'C').toUpperCase();
