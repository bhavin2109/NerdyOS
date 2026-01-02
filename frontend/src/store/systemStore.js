import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSystemStore = create(
    persist(
        (set, get) => ({
            // Appearance
            theme: 'dark',
            wallpaper: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', // Neon Blue/Pink Cyberpunk Water style

            // Preferences
            notificationsEnabled: true,
            dockMode: 'auto', // 'always', 'auto', 'hidden'

            // App Management
            disabledApps: [], // List of app IDs that are disabled
            pinnedApps: ['finder', 'browser', 'settings'], // Default pinned apps

            // User Profile (Mock for now, normally from Auth)
            userProfile: {
                name: "Nerdy User",
                email: "user@nerdyos.com",
                avatar: "https://ui-avatars.com/api/?name=Nerdy+User&background=0D8ABC&color=fff"
            },

            // Actions
            setTheme: (theme) => set({ theme }),
            setWallpaper: (wallpaper) => set({ wallpaper }),
            setDockMode: (mode) => set({ dockMode: mode }),
            toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

            toggleAppDisabled: (appId) => set((state) => {
                const isDisabled = state.disabledApps.includes(appId);
                return {
                    disabledApps: isDisabled
                        ? state.disabledApps.filter(id => id !== appId)
                        : [...state.disabledApps, appId]
                };
            }),

            toggleAppPinned: (appId) => set((state) => {
                const isPinned = state.pinnedApps.includes(appId);
                return {
                    pinnedApps: isPinned
                        ? state.pinnedApps.filter(id => id !== appId)
                        : [...state.pinnedApps, appId]
                };
            }),

            updateUserProfile: (profile) => set((state) => ({
                userProfile: { ...state.userProfile, ...profile }
            })),

            logout: () => {
                // Clear Auth Token
                localStorage.removeItem("token");
                // Clear local state if needed (optional)
                // We might want to reload to force login screen
                window.location.reload();
            }
        }),
        {
            name: 'nerdyos-settings', // unique name for localStorage key
            partialize: (state) => ({
                theme: state.theme,
                wallpaper: state.wallpaper,
                notificationsEnabled: state.notificationsEnabled,
                dockMode: state.dockMode,
                disabledApps: state.disabledApps,
                pinnedApps: state.pinnedApps
            }),
        }
    )
);

export default useSystemStore;
