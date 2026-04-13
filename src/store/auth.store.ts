import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  ready: boolean;
  setUser: (user: UserProfile | null) => void;
  setReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ ready }),
}));
