import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAppById } from '../os/appRegistry';
import useNotificationStore from './notificationStore';

const useWindowStore = create(
    persist(
        (set, get) => ({
            windows: [], // Array of { id: appId, appId, title, isMinimized, isFullscreen, zIndex }
            activeWindowId: null,
            _maxWindows: 10, // Performance limit

            openWindow: (appId, props = {}, originRect = null) => {
                const state = get();
                // Check if window exists. If passing props, we might want to update them or open a new instance?
                // For now, let's just focus existing window if ID matches, but maybe we want to allow multiple instances for some apps?
                // The current ID is the appId, so only one instance per app is allowed currently (e.g. only one "finder").
                // If we want multiple "doc" windows, we need unique IDs.
                // For now, let's stick to single instance per app ID for simplicity, OR modify ID generation.
                // If opening 'doc' with a file, we might want to update the existing doc window's props if it's open.

                let existingWindow = state.windows.find((w) => w.appId === appId);

                // If we want to support multiple docs, we need to change how we identify windows.
                // But let's keep it simple: single instance for now, but update props.

                if (existingWindow) {
                    // Update props if provided (e.g. opening a new file in existing editor)
                    if (Object.keys(props).length > 0) {
                        set({
                            windows: state.windows.map(w => w.id === existingWindow.id ? { ...w, props: { ...w.props, ...props }, isMinimized: false } : w),
                            activeWindowId: existingWindow.id
                        });
                    } else {
                        // Just restore
                        if (existingWindow.isMinimized) {
                            set({
                                windows: state.windows.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false } : w),
                                activeWindowId: existingWindow.id
                            });
                        } else {
                            set({ activeWindowId: existingWindow.id });
                        }
                    }
                    return;
                }

                // Memory protection: Limit total windows
                if (state.windows.length >= state._maxWindows) {
                    console.warn("Max windows reached");
                    return;
                }

                const appConfig = getAppById(appId);
                if (!appConfig) {
                    console.error(`App ${appId} not found in registry`);
                    return;
                }

                set({
                    windows: [...state.windows, {
                        id: appId, // Single instance per app for now
                        appId: appId,
                        title: appConfig.name,
                        isMinimized: false,
                        isFullscreen: window.innerWidth < 768,
                        snapState: null,
                        preSnapState: null,
                        launchOrigin: originRect, // { x, y, width, height }
                        props: props // Store custom props
                    }],
                    activeWindowId: appId,
                });

                // Trigger Notification
                useNotificationStore.getState().addNotification({
                    title: "App Launched",
                    message: `Opened ${appConfig.name}`,
                    type: "info"
                });
            },

            closeWindow: (id) => set((state) => ({
                windows: state.windows.filter((w) => w.id !== id),
                activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
            })),

            focusWindow: (id) => set((state) => {
                // To bring to front, we move to the end of the array and set active
                const winIndex = state.windows.findIndex((w) => w.id === id);
                if (winIndex === -1) return {};

                const win = state.windows[winIndex];
                const newWindows = [...state.windows];
                newWindows.splice(winIndex, 1);
                newWindows.push(win);

                return {
                    windows: newWindows,
                    activeWindowId: id
                };
            }),

            toggleMinimize: (id) => set((state) => {
                const windowToToggle = state.windows.find(w => w.id === id);
                if (!windowToToggle) return state;

                const willMinimize = !windowToToggle.isMinimized;
                return {
                    windows: state.windows.map((w) =>
                        w.id === id ? { ...w, isMinimized: willMinimize } : w
                    ),
                    activeWindowId: willMinimize && state.activeWindowId === id ? null : state.activeWindowId
                };
            }),

            setSnap: (id, snapType) => set((state) => {
                return {
                    windows: state.windows.map((w) => {
                        if (w.id !== id) return w;

                        // If snapping (left/right/maximize), save current state if not already snapped
                        if (snapType) {
                            return {
                                ...w,
                                snapState: snapType, // 'left', 'right', 'maximize'
                                // If we were already snapped, keep the original "pre-snap" dimensions
                                // Only save if we are coming from a "normal" state (null snapState)
                                preSnapState: w.snapState ? w.preSnapState : { isMinimized: w.isMinimized, isFullscreen: w.isFullscreen }
                            };
                        } else {
                            // Restore
                            return {
                                ...w,
                                snapState: null,
                                // potential restore logic handled in component or here if we tracked precise rect
                            };
                        }
                    })
                };
            }),

            toggleMaximize: (id) => set((state) => ({
                windows: state.windows.map((w) =>
                    w.id === id ? { ...w, isFullscreen: !w.isFullscreen, snapState: !w.isFullscreen ? 'maximize' : null } : w
                )
            })),
        }),
        {
            name: 'nerdyos-windows', // unique name
            partialize: (state) => ({ windows: state.windows, activeWindowId: state.activeWindowId }),
        }
    )
);

export default useWindowStore;
