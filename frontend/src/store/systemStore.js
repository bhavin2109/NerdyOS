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

            // System Controls
            brightness: 100, // 0-100
            volume: 50, // 0-100

            // App Management
            disabledApps: [], // List of app IDs that are disabled
            pinnedApps: ['finder', 'browser', 'settings'], // Default pinned apps

            // Connectivity & Hardware
            wifi: true,
            bluetooth: true,
            airdrop: true,
            battery: { level: 100, charging: false },

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
            setBrightness: (val) => set({ brightness: val }),
            setVolume: (val) => set({ volume: val }),
            toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

            toggleWifi: (status) => set((state) => ({ wifi: typeof status === 'boolean' ? status : !state.wifi })), // Allow explicit set or toggle
            toggleBluetooth: () => set((state) => ({ bluetooth: !state.bluetooth })),
            toggleAirdrop: () => set((state) => ({ airdrop: !state.airdrop })),
            setBattery: (battery) => set({ battery }),

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
                wifi: state.wifi,
                bluetooth: state.bluetooth,
                airdrop: state.airdrop,
                dockMode: state.dockMode,
                disabledApps: state.disabledApps,
                disabledApps: state.disabledApps,
                pinnedApps: state.pinnedApps,
                brightness: state.brightness,
                volume: state.volume
            }),
        }
    )
);

// Initialize listeners outside the hook to avoid multiple subscriptions if called in components
if (typeof window !== 'undefined') {
    // Battery
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            useSystemStore.getState().setBattery({
                level: Math.round(battery.level * 100),
                charging: battery.charging
            });

            battery.addEventListener('levelchange', () => {
                useSystemStore.getState().setBattery({
                    level: Math.round(battery.level * 100),
                    charging: battery.charging
                });
            });

            battery.addEventListener('chargingchange', () => {
                useSystemStore.getState().setBattery({
                    level: Math.round(battery.level * 100),
                    charging: battery.charging
                });
            });
        });
    }

    // Network
    window.addEventListener('online', () => useSystemStore.getState().toggleWifi(true));
    window.addEventListener('offline', () => useSystemStore.getState().toggleWifi(false));

    // Initial Network State
    // We defer this slightly to ensure store is ready or just set it directly
    setTimeout(() => {
        useSystemStore.getState().toggleWifi(navigator.onLine);
    }, 100);
}

export default useSystemStore;
