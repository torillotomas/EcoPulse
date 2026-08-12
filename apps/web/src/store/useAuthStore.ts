import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    hasHydrated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            hasHydrated: false,
            
            login: (token: string) =>
                set({
                    token,
                }),
            logout: () =>
                set({
                    token: null,
                }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state: AuthState | undefined) => {
                if (state) {
                    useAuthStore.setState({ hasHydrated: true });
                }
            },
        }
    )
);
