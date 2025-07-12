import { create } from "zustand";

export interface UserInterface {
  id: string;
  name: string;
}

interface AuthState {
  user: UserInterface | null;
  setUser: (user: UserInterface) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
