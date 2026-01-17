/**
 * NerdyOS Workspace Store
 * Smart workspace management with lazy-loading
 * 
 * Features:
 * - Only ONE workspace exists by default
 * - Workspaces created only on explicit user action
 * - Anti-spam protection with cooldown
 * - Window-to-workspace tracking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_WORKSPACES = 10;
const WORKSPACE_CREATION_COOLDOWN = 500; // ms

/**
 * Workspace Store
 */
const useWorkspaceStore = create(
    persist(
        (set, get) => ({
            // Active workspace ID
            activeWorkspace: 1,

            // Previous workspace (for quick switching back)
            previousWorkspace: 1,

            // Maximum allowed workspaces
            maxWorkspaces: MAX_WORKSPACES,

            // Existing workspaces (lazy-loaded)
            // Only created workspaces exist in this array
            workspaces: [
                { id: 1, created: true, hasWindows: false }
            ],

            // Last workspace creation timestamp (anti-spam)
            _lastWorkspaceCreation: null,

            // Animation state for workspace transitions
            transitionDirection: null, // 'left', 'right', or null
            isTransitioning: false,

            // Per-workspace settings (wallpaper, layout, etc.)
            workspaceSettings: {},

            // Special workspaces (scratchpads)
            specialWorkspaces: {
                scratchpad: { visible: false, windows: [] },
                terminal: { visible: false, windows: [] },
            },

            /**
             * Check if a workspace exists
             */
            workspaceExists: (id) => {
                return get().workspaces.some(w => w.id === id);
            },

            /**
             * Get the next available workspace ID
             */
            getNextAvailableId: () => {
                const state = get();
                const existingIds = state.workspaces.map(w => w.id);
                const maxExisting = Math.max(...existingIds, 0);
                return maxExisting < MAX_WORKSPACES ? maxExisting + 1 : null;
            },

            /**
             * Check if workspace creation is allowed (anti-spam)
             */
            canCreateWorkspace: () => {
                const state = get();
                const now = Date.now();

                // Check cooldown
                if (state._lastWorkspaceCreation &&
                    now - state._lastWorkspaceCreation < WORKSPACE_CREATION_COOLDOWN) {
                    console.warn('[Workspace] Creation cooldown active');
                    return false;
                }

                // Check max limit
                if (state.workspaces.length >= MAX_WORKSPACES) {
                    console.warn('[Workspace] Maximum workspace limit reached');
                    return false;
                }

                return true;
            },

            /**
             * Create a new workspace
             * @param {number} id - Workspace ID to create (1-10)
             * @returns {boolean} True if created, false otherwise
             */
            createWorkspace: (id) => {
                const state = get();

                // Validate ID
                if (id < 1 || id > MAX_WORKSPACES) {
                    console.warn(`[Workspace] Invalid workspace ID: ${id}`);
                    return false;
                }

                // Check if already exists
                if (state.workspaceExists(id)) {
                    console.warn(`[Workspace] Workspace ${id} already exists`);
                    return false;
                }

                // Check if creation is allowed
                if (!state.canCreateWorkspace()) {
                    return false;
                }

                console.log(`[Workspace] Creating workspace ${id}`);

                set({
                    workspaces: [
                        ...state.workspaces,
                        { id, created: true, hasWindows: false }
                    ].sort((a, b) => a.id - b.id),
                    _lastWorkspaceCreation: Date.now(),
                });

                // Dispatch event for notifications
                window.dispatchEvent(new CustomEvent('nerdyos:workspace:created', {
                    detail: { id }
                }));

                return true;
            },

            /**
             * Switch to a workspace
             * @param {number} id - Workspace ID to switch to
             * @param {Object} options - Options for switching
             * @param {boolean} options.explicit - Whether this is an explicit user action
             * @param {boolean} options.createIfMissing - Create workspace if it doesn't exist
             */
            switchTo: (id, options = {}) => {
                const state = get();
                const { explicit = false, createIfMissing = false } = options;

                // Validate
                if (id < 1 || id > MAX_WORKSPACES) {
                    console.warn(`[Workspace] Invalid workspace number: ${id}`);
                    return;
                }

                // Check if workspace exists
                if (!state.workspaceExists(id)) {
                    if (createIfMissing && explicit) {
                        // Only create if explicitly requested and it's the next available
                        const nextId = state.getNextAvailableId();
                        if (id === nextId) {
                            const created = state.createWorkspace(id);
                            if (!created) return;
                        } else {
                            console.warn(`[Workspace] Cannot create workspace ${id} - must create sequentially`);
                            return;
                        }
                    } else {
                        console.warn(`[Workspace] Workspace ${id} does not exist`);
                        return;
                    }
                }

                // Already on this workspace
                if (id === state.activeWorkspace) {
                    return;
                }

                // Determine transition direction
                const direction = id > state.activeWorkspace ? 'right' : 'left';

                set({
                    previousWorkspace: state.activeWorkspace,
                    activeWorkspace: id,
                    transitionDirection: direction,
                    isTransitioning: true,
                });

                // Clear transition state after animation
                setTimeout(() => {
                    set({ isTransitioning: false, transitionDirection: null });
                }, 300);

                // Dispatch event
                window.dispatchEvent(new CustomEvent('nerdyos:workspace:switched', {
                    detail: { from: state.activeWorkspace, to: id }
                }));
            },

            /**
             * Switch to relative workspace (e+1, e-1)
             * Only switches between existing workspaces
             */
            switchRelative: (delta) => {
                const state = get();
                const existingIds = state.workspaces.map(w => w.id).sort((a, b) => a - b);

                if (existingIds.length === 0) return;

                const currentIndex = existingIds.indexOf(state.activeWorkspace);
                if (currentIndex === -1) {
                    // Current workspace doesn't exist, go to first
                    state.switchTo(existingIds[0], { explicit: false });
                    return;
                }

                let nextIndex = currentIndex + delta;

                // Wrap around within existing workspaces
                if (nextIndex < 0) nextIndex = existingIds.length - 1;
                if (nextIndex >= existingIds.length) nextIndex = 0;

                state.switchTo(existingIds[nextIndex], { explicit: false });
            },

            /**
             * Switch to previous workspace
             */
            switchToPrevious: () => {
                const state = get();
                if (state.workspaceExists(state.previousWorkspace)) {
                    state.switchTo(state.previousWorkspace, { explicit: false });
                }
            },

            /**
             * Update window count for a workspace
             */
            updateWorkspaceWindows: (id, hasWindows) => {
                set((state) => ({
                    workspaces: state.workspaces.map(w =>
                        w.id === id ? { ...w, hasWindows } : w
                    ),
                }));
            },

            /**
             * Remove empty workspace (garbage collection)
             * Note: Never removes workspace 1
             */
            removeEmptyWorkspace: (id) => {
                if (id === 1) return; // Never remove workspace 1

                const state = get();
                const workspace = state.workspaces.find(w => w.id === id);

                if (!workspace || workspace.hasWindows) {
                    return; // Don't remove if has windows
                }

                // Don't remove active workspace
                if (state.activeWorkspace === id) {
                    return;
                }

                console.log(`[Workspace] Removing empty workspace ${id}`);

                set({
                    workspaces: state.workspaces.filter(w => w.id !== id),
                });
            },

            /**
             * Toggle special workspace visibility
             */
            toggleSpecialWorkspace: (name) => {
                set((state) => {
                    const special = state.specialWorkspaces[name];
                    if (!special) return {};

                    return {
                        specialWorkspaces: {
                            ...state.specialWorkspaces,
                            [name]: { ...special, visible: !special.visible },
                        },
                    };
                });
            },

            /**
             * Get special workspace state
             */
            getSpecialWorkspace: (name) => {
                return get().specialWorkspaces[name];
            },

            /**
             * Set workspace-specific setting
             */
            setWorkspaceSetting: (workspaceNumber, key, value) => {
                set((state) => ({
                    workspaceSettings: {
                        ...state.workspaceSettings,
                        [workspaceNumber]: {
                            ...(state.workspaceSettings[workspaceNumber] || {}),
                            [key]: value,
                        },
                    },
                }));
            },

            /**
             * Get workspace-specific setting
             */
            getWorkspaceSetting: (workspaceNumber, key, defaultValue) => {
                const settings = get().workspaceSettings[workspaceNumber];
                return settings?.[key] ?? defaultValue;
            },

            /**
             * Get workspace wallpaper
             */
            getWorkspaceWallpaper: (workspaceNumber) => {
                return get().getWorkspaceSetting(workspaceNumber, 'wallpaper', null);
            },

            /**
             * Set workspace wallpaper
             */
            setWorkspaceWallpaper: (workspaceNumber, wallpaper) => {
                get().setWorkspaceSetting(workspaceNumber, 'wallpaper', wallpaper);
            },

            /**
             * Get list of workspace IDs with windows
             */
            getOccupiedWorkspaces: () => {
                return get().workspaces.filter(w => w.hasWindows).map(w => w.id);
            },

            /**
             * Get total workspace count (for display)
             */
            getWorkspaceCount: () => {
                return get().workspaces.length;
            },

            /**
             * Legacy compatibility - get workspaceCount
             */
            get workspaceCount() {
                return get().workspaces.length;
            },
        }),
        {
            name: 'nerdyos-workspaces',
            version: 3,
            partialize: (state) => ({
                activeWorkspace: state.activeWorkspace,
                workspaces: state.workspaces,
                workspaceSettings: state.workspaceSettings,
            }),
            migrate: (persistedState, version) => {
                if (version < 3) {
                    // Migrate from old format (10 pre-created workspaces) to new format
                    console.log('[Workspace] Migrating to lazy workspace format');
                    return {
                        ...persistedState,
                        activeWorkspace: persistedState.activeWorkspace || 1,
                        workspaces: [
                            { id: 1, created: true, hasWindows: false }
                        ],
                        workspaceSettings: persistedState.workspaceSettings || {},
                    };
                }
                return persistedState;
            },
        }
    )
);

export default useWorkspaceStore;
