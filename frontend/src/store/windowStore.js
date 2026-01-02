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

            openWindow: (appId, originRect = null) => {
                const state = get();
                const existingWindow = state.windows.find((w) => w.id === appId);

                if (existingWindow) {
                    // Restore if minimized
                    if (existingWindow.isMinimized) {
                        set({
                            windows: state.windows.map(w => w.id === appId ? { ...w, isMinimized: false } : w),
                            activeWindowId: appId
                        });
                    } else {
                        // Just focus
                        set({ activeWindowId: appId });
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
                        id: appId,
                        appId: appId,
                        title: appConfig.name,
                        isMinimized: false,
                        isFullscreen: window.innerWidth < 768,
                        snapState: null,
                        preSnapState: null,
                        launchOrigin: originRect // { x, y, width, height }
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
