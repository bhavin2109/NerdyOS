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
            accentColor: '#3b82f6', // Default Blue-500
            accentMode: 'auto', // 'auto', 'manual'

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
            airplaneMode: false,
            battery: { level: 100, charging: false },
            connectedDevices: [
                { id: 1, name: "Nerdy Buds Pro", type: "audio", connected: true, battery: 85 },
                { id: 2, name: "MX Master 3", type: "mouse", connected: false },
            ],

            // OS State
            nightLight: false,
            gameMode: false,
            lastUpdateCheck: new Date(),
            isFirstBoot: true,
            installedApps: [
                'finder', 'settings', 'browser', 'notes', 'calculator', 'terminal', 'store',
                'media', 'doc', 'calendar', 'monitor', 'messages', 'mail', 'maps',
                'photos', 'ide', 'code_editor', 'tasks', 'pdf_reader'
            ], // Default installed apps

            // User Profile (Mock for now, normally from Auth)
            userProfile: {
                name: "Nerdy User",
                email: "user@nerdyos.com",
                avatar: "https://ui-avatars.com/api/?name=Nerdy+User&background=0D8ABC&color=fff"
            },

            // Actions
            setTheme: (theme) => set({ theme }),
            setWallpaper: (wallpaper) => set((state) => {
                let newAccent = state.accentColor;
                if (state.accentMode === 'auto') {
                    // Mock logic: Map specific wallpaper URLs to colors
                    if (wallpaper.includes('1550684848')) newAccent = '#06b6d4'; // Cyan
                    else if (wallpaper.includes('1579546929518')) newAccent = '#a855f7'; // Purple
                    else if (wallpaper.includes('1618005182384')) newAccent = '#3b82f6'; // Blue
                    else if (wallpaper.includes('1477346611705')) newAccent = '#f97316'; // Orange
                    else if (wallpaper.includes('1511497584788')) newAccent = '#ec4899'; // Pink
                    else if (wallpaper.includes('1533130061792')) newAccent = '#eab308'; // Yellow
                }
                return { wallpaper, accentColor: newAccent };
            }),
            setDockMode: (mode) => set({ dockMode: mode }),
            setAccentColor: (color) => set({ accentColor: color, accentMode: 'manual' }),
            setAccentMode: (mode) => set((state) => {
                // If switching to auto, re-evaluate color based on current wallpaper
                let newAccent = state.accentColor;
                if (mode === 'auto') {
                    const wp = state.wallpaper;
                    if (wp.includes('1550684848')) newAccent = '#06b6d4';
                    else if (wp.includes('1579546929518')) newAccent = '#a855f7';
                    else if (wp.includes('1618005182384')) newAccent = '#3b82f6';
                    else if (wp.includes('1477346611705')) newAccent = '#f97316';
                    else if (wp.includes('1511497584788')) newAccent = '#ec4899';
                    else if (wp.includes('1533130061792')) newAccent = '#eab308';
                }
                return { accentMode: mode, accentColor: newAccent };
            }),
            setBrightness: (val) => set({ brightness: val }),
            setVolume: (val) => set({ volume: val }),
            toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

            toggleWifi: (status) => set((state) => ({ wifi: typeof status === 'boolean' ? status : !state.wifi })), // Allow explicit set or toggle
            toggleBluetooth: () => set((state) => ({ bluetooth: !state.bluetooth })),
            toggleAirdrop: () => set((state) => ({ airdrop: !state.airdrop })),
            toggleAirplaneMode: () => set((state) => ({ airplaneMode: !state.airplaneMode, wifi: state.airplaneMode, bluetooth: state.airplaneMode })), // Toggle off means turn others on? No, usually toggle ON turns others OFF.
            toggleNightLight: () => set((state) => ({ nightLight: !state.nightLight })),
            toggleGameMode: () => set((state) => ({ gameMode: !state.gameMode })),
            setBattery: (battery) => set({ battery }),

            completeFirstBoot: () => set({ isFirstBoot: false }),

            installApp: (appId) => set((state) => ({
                installedApps: state.installedApps.includes(appId)
                    ? state.installedApps
                    : [...state.installedApps, appId]
            })),

            uninstallApp: (appId) => set((state) => ({
                installedApps: state.installedApps.filter(id => id !== appId)
            })),

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
            version: 1, // Add version for migration
            migrate: (persistedState, version) => {
                if (version === undefined || version < 1) {
                    // Migration: Ensure installedApps contains all default apps if missing or empty
                    // Only merge if the user has NO installed apps (which might imply a fresh or broken state)
                    // Or we can just ensure the new apps are added.
                    // For safety, let's reset installedApps to the full default list to fix the user's "no apps" issue.
                    return {
                        ...persistedState,
                        installedApps: [
                            'finder', 'settings', 'browser', 'notes', 'calculator', 'terminal', 'store',
                            'media', 'doc', 'calendar', 'monitor', 'messages', 'mail', 'maps',
                            'photos', 'ide', 'code_editor', 'tasks', 'pdf_reader'
                        ],
                    };
                }
                return persistedState;
            },
            partialize: (state) => ({
                theme: state.theme,
                wallpaper: state.wallpaper,
                notificationsEnabled: state.notificationsEnabled,
                wifi: state.wifi,
                bluetooth: state.bluetooth,
                airdrop: state.airdrop,
                airplaneMode: state.airplaneMode,
                nightLight: state.nightLight,
                gameMode: state.gameMode,
                dockMode: state.dockMode,
                accentColor: state.accentColor,
                accentMode: state.accentMode,
                disabledApps: state.disabledApps,
                disabledApps: state.disabledApps,
                pinnedApps: state.pinnedApps,
                brightness: state.brightness,
                volume: state.volume,
                isFirstBoot: state.isFirstBoot,
                installedApps: state.installedApps
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
