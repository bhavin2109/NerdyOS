/**
 * NerdyOS Window Store
 * Enhanced Zustand store with tiling support, workspaces, and Hyprland-style features
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAppById } from '../os/appRegistry';
import useNotificationStore from './notificationStore';
import useWorkspaceStore from './workspaceStore';
import { getWindowInDirection, swapWindows } from '../compositor/TilingEngine';

const useWindowStore = create(
    persist(
        (set, get) => ({
            // Windows array with enhanced properties
            windows: [],

            // Currently active window
            activeWindowId: null,

            // Performance limit
            _maxWindows: 20,

            // Last calculated tiled positions (for focus navigation)
            _tiledPositions: {},

            /**
             * Open a new window or focus existing
             */
            openWindow: (appId, props = {}, originRect = null) => {
                const state = get();
                const workspaceStore = useWorkspaceStore.getState();
                const currentWorkspace = workspaceStore.activeWorkspace;

                // Check for existing window
                let existingWindow = state.windows.find((w) => w.appId === appId);

                if (existingWindow) {
                    // Update props if provided
                    if (Object.keys(props).length > 0) {
                        set({
                            windows: state.windows.map((w) =>
                                w.id === existingWindow.id
                                    ? { ...w, props: { ...w.props, ...props }, isMinimized: false }
                                    : w
                            ),
                            activeWindowId: existingWindow.id,
                        });
                    } else {
                        // Restore or focus
                        if (existingWindow.isMinimized) {
                            set({
                                windows: state.windows.map((w) =>
                                    w.id === existingWindow.id ? { ...w, isMinimized: false } : w
                                ),
                                activeWindowId: existingWindow.id,
                            });

                            // Switch to window's workspace if different
                            if (existingWindow.workspace !== currentWorkspace) {
                                workspaceStore.switchTo(existingWindow.workspace);
                            }
                        } else {
                            set({ activeWindowId: existingWindow.id });
                            if (existingWindow.workspace !== currentWorkspace) {
                                workspaceStore.switchTo(existingWindow.workspace);
                            }
                        }
                    }
                    return;
                }

                // Max windows check
                if (state.windows.length >= state._maxWindows) {
                    console.warn('Max windows reached');
                    useNotificationStore.getState().addNotification({
                        title: 'Cannot Open App',
                        message: 'Maximum number of windows reached',
                        urgency: 'normal',
                    });
                    return;
                }

                const appConfig = getAppById(appId);
                if (!appConfig) {
                    console.error(`App ${appId} not found in registry`);
                    return;
                }

                // Check window rules for this app
                const configStore = window.__configStore;
                let floating = false;
                let targetWorkspace = currentWorkspace;
                let initialSize = appConfig.defaultSize || { width: 800, height: 600 };

                if (configStore) {
                    const rules = configStore.getWindowRules(appId);
                    for (const rule of rules) {
                        const ruleName = rule.rule?.name;
                        const ruleArgs = rule.rule?.args;

                        if (ruleName === 'float') floating = true;
                        if (ruleName === 'workspace' && ruleArgs) {
                            const wsNum = parseInt(ruleArgs[0], 10);
                            if (!isNaN(wsNum)) targetWorkspace = wsNum;
                        }
                        if (ruleName === 'size' && ruleArgs?.length >= 2) {
                            initialSize = {
                                width: parseInt(ruleArgs[0], 10),
                                height: parseInt(ruleArgs[1], 10),
                            };
                        }
                    }
                }

                // Create new window
                const newWindow = {
                    id: appId,
                    appId: appId,
                    title: appConfig.name,
                    isMinimized: false,
                    isFullscreen: false,
                    floating: floating,
                    isPseudo: false,
                    isPinned: false,
                    workspace: targetWorkspace,
                    floatingPosition: null,
                    floatingSize: initialSize,
                    launchOrigin: originRect,
                    props: props,
                };

                set({
                    windows: [...state.windows, newWindow],
                    activeWindowId: appId,
                });

                // Switch workspace if needed
                if (targetWorkspace !== currentWorkspace) {
                    workspaceStore.switchTo(targetWorkspace);
                }

                // Notification
                useNotificationStore.getState().addNotification({
                    title: 'App Launched',
                    message: `Opened ${appConfig.name}`,
                    urgency: 'low',
                    timeout: 3000,
                });
            },

            /**
             * Close a window
             */
            closeWindow: (id) =>
                set((state) => ({
                    windows: state.windows.filter((w) => w.id !== id),
                    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
                })),

            /**
             * Focus a window (bring to front)
             */
            focusWindow: (id) =>
                set((state) => {
                    const winIndex = state.windows.findIndex((w) => w.id === id);
                    if (winIndex === -1) return {};

                    const win = state.windows[winIndex];
                    const newWindows = [...state.windows];
                    newWindows.splice(winIndex, 1);
                    newWindows.push(win);

                    return {
                        windows: newWindows,
                        activeWindowId: id,
                    };
                }),

            /**
             * Toggle window minimize state
             */
            toggleMinimize: (id) =>
                set((state) => {
                    const windowToToggle = state.windows.find((w) => w.id === id);
                    if (!windowToToggle) return state;

                    const willMinimize = !windowToToggle.isMinimized;
                    return {
                        windows: state.windows.map((w) =>
                            w.id === id ? { ...w, isMinimized: willMinimize } : w
                        ),
                        activeWindowId:
                            willMinimize && state.activeWindowId === id ? null : state.activeWindowId,
                    };
                }),

            /**
             * Toggle fullscreen/maximize
             */
            toggleMaximize: (id) =>
                set((state) => ({
                    windows: state.windows.map((w) =>
                        w.id === id ? { ...w, isFullscreen: !w.isFullscreen } : w
                    ),
                })),

            /**
             * Toggle floating mode
             */
            toggleFloating: (id) =>
                set((state) => ({
                    windows: state.windows.map((w) =>
                        w.id === id ? { ...w, floating: !w.floating } : w
                    ),
                })),

            /**
             * Toggle pseudo-tiling (floating size in tiled position)
             */
            togglePseudo: (id) =>
                set((state) => ({
                    windows: state.windows.map((w) =>
                        w.id === id ? { ...w, isPseudo: !w.isPseudo } : w
                    ),
                })),

            /**
             * Toggle window pin (always on top)
             */
            togglePin: (id) =>
                set((state) => ({
                    windows: state.windows.map((w) =>
                        w.id === id ? { ...w, isPinned: !w.isPinned } : w
                    ),
                })),

            /**
             * Center a floating window
             */
            centerWindow: (id) =>
                set((state) => {
                    const win = state.windows.find((w) => w.id === id);
                    if (!win || !win.floating) return {};

                    const size = win.floatingSize || { width: 800, height: 600 };
                    const x = (window.innerWidth - size.width) / 2;
                    const y = (window.innerHeight - size.height) / 2;

                    return {
                        windows: state.windows.map((w) =>
                            w.id === id ? { ...w, floatingPosition: { x, y } } : w
                        ),
                    };
                }),

            /**
             * Move active window to a workspace
             */
            moveActiveToWorkspace: (workspaceNumber) =>
                set((state) => {
                    if (!state.activeWindowId) return {};
                    return {
                        windows: state.windows.map((w) =>
                            w.id === state.activeWindowId ? { ...w, workspace: workspaceNumber } : w
                        ),
                    };
                }),

            /**
             * Focus window in direction (vim-style: l/r/u/d)
             */
            focusInDirection: (direction) => {
                const state = get();
                const positions = state._tiledPositions;

                if (!state.activeWindowId || Object.keys(positions).length === 0) {
                    // Fallback to cycling
                    get().cycleFocus(1);
                    return;
                }

                const targetId = getWindowInDirection(direction, state.activeWindowId, positions);
                if (targetId) {
                    get().focusWindow(targetId);
                }
            },

            /**
             * Move active window in direction (swap with neighbor)
             */
            moveActiveInDirection: (direction) =>
                set((state) => {
                    const positions = state._tiledPositions;
                    if (!state.activeWindowId || Object.keys(positions).length === 0) return {};

                    const targetId = getWindowInDirection(direction, state.activeWindowId, positions);
                    if (!targetId) return {};

                    return {
                        windows: swapWindows(state.windows, state.activeWindowId, targetId),
                    };
                }),

            /**
             * Cycle focus through windows
             */
            cycleFocus: (delta = 1) => {
                const state = get();
                const workspaceStore = useWorkspaceStore.getState();
                const currentWorkspace = workspaceStore.activeWorkspace;

                // Get windows on current workspace
                const wsWindows = state.windows.filter(
                    (w) => (w.workspace || 1) === currentWorkspace && !w.isMinimized
                );

                if (wsWindows.length === 0) return;

                const currentIndex = wsWindows.findIndex((w) => w.id === state.activeWindowId);
                let nextIndex = (currentIndex + delta + wsWindows.length) % wsWindows.length;

                set({ activeWindowId: wsWindows[nextIndex].id });
            },

            /**
             * Resize active window (for floating/pseudo)
             */
            resizeActive: (deltaX, deltaY) =>
                set((state) => {
                    if (!state.activeWindowId) return {};

                    return {
                        windows: state.windows.map((w) => {
                            if (w.id !== state.activeWindowId) return w;
                            if (!w.floating && !w.isPseudo) return w;

                            const currentSize = w.floatingSize || { width: 800, height: 600 };
                            return {
                                ...w,
                                floatingSize: {
                                    width: Math.max(200, currentSize.width + deltaX),
                                    height: Math.max(150, currentSize.height + deltaY),
                                },
                            };
                        }),
                    };
                }),

            /**
             * Toggle split direction (for dwindle layout)
             */
            toggleSplit: () => {
                // This would need integration with the tiling engine's split direction tracking
                console.log('[WindowStore] Toggle split - not yet implemented');
            },

            /**
             * Update tiled positions (called by HyprDesktop after layout calculation)
             */
            setTiledPositions: (positions) =>
                set({ _tiledPositions: positions }),

            // Legacy compatibility
            setSnap: (id, snapType) =>
                set((state) => ({
                    windows: state.windows.map((w) => {
                        if (w.id !== id) return w;
                        if (snapType) {
                            return {
                                ...w,
                                isFullscreen: snapType === 'maximize',
                                floating: false,
                            };
                        }
                        return w;
                    }),
                })),
        }),
        {
            name: 'nerdyos-windows',
            version: 2,
            partialize: (state) => ({
                windows: state.windows,
                activeWindowId: state.activeWindowId,
            }),
            migrate: (persistedState, version) => {
                if (version < 2) {
                    // Migrate old windows to include new properties
                    const windows = (persistedState.windows || []).map((w) => ({
                        ...w,
                        floating: w.floating ?? false,
                        isPseudo: w.isPseudo ?? false,
                        isPinned: w.isPinned ?? false,
                        workspace: w.workspace ?? 1,
                        floatingPosition: w.floatingPosition ?? null,
                        floatingSize: w.floatingSize ?? null,
                    }));
                    return { ...persistedState, windows };
                }
                return persistedState;
            },
        }
    )
);

export default useWindowStore;
