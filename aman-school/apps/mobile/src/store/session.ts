import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { Role, User } from "@aman-school/types";

const STORAGE_KEY = "aman-school-session";

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (session: { accessToken: string; refreshToken: string; user: User }) => Promise<void>;
  clear: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { accessToken: string; refreshToken: string; user: User };
        set({ ...parsed, hydrated: true });
        return;
      }
    } catch {
      /* corrupt/missing session — fall through to signed-out state */
    }
    set({ hydrated: true });
  },

  setSession: async (session) => {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
    set({ ...session });
  },

  clear: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

export function useRole(): Role | null {
  return useSessionStore((s) => s.user?.role ?? null);
}
