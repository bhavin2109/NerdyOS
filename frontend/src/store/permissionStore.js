import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Permission Types
// 'filesystem' | 'notifications' | 'network'

// Status
// 'granted' | 'denied' | 'prompt' (default)

const usePermissionStore = create(
    persist(
        (set, get) => ({
            permissions: {}, // { [appId]: { [type]: 'granted' | 'denied' | 'prompt' } }

            // Check current permission status
            checkPermission: (appId, type) => {
                const state = get();
                return state.permissions[appId]?.[type] || 'prompt';
            },

            // Request permission (Async)
            // Returns true if granted, false if denied
            requestPermission: async (appId, type) => {
                const state = get();
                const currentStatus = state.permissions[appId]?.[type] || 'prompt';

                if (currentStatus === 'granted') return true;
                if (currentStatus === 'denied') return false;

                // Simulate User Prompt
                // In a real implementation, this would trigger a UI modal and wait for user input
                // For now, auto-grant or valid prompt logic would go here.
                // Let's default to auto-granting for "demo" smooth experience, 
                // OR we can default to 'denied' until UI is built. 
                // Requirement says "Prompt user", but "No UI code".
                // So we will simulate a prompt via window.confirm (basic JS prompt) as a placeholder
                // ensuring no complex UI code is added but logic is sound.

                const confirm = window.confirm(
                    `Allow "${appId}" to access ${type}?`
                );

                const newStatus = confirm ? 'granted' : 'denied';

                set((state) => ({
                    permissions: {
                        ...state.permissions,
                        [appId]: {
                            ...state.permissions[appId],
                            [type]: newStatus,
                        },
                    },
                }));

                return confirm;
            },

            // Manually Grant
            grantPermission: (appId, type) => set((state) => ({
                permissions: {
                    ...state.permissions,
                    [appId]: {
                        ...state.permissions[appId],
                        [type]: 'granted',
                    },
                },
            })),

            // Manually Revoke
            revokePermission: (appId, type) => set((state) => ({
                permissions: {
                    ...state.permissions,
                    [appId]: {
                        ...state.permissions[appId],
                        [type]: 'denied',
                    },
                },
            })),

            // Reset all for an app
            resetPermissions: (appId) => set((state) => {
                const newPermissions = { ...state.permissions };
                delete newPermissions[appId];
                return { permissions: newPermissions };
            })
        }),
        {
            name: 'nerdyos-permissions', // unique name
            partialize: (state) => ({ permissions: state.permissions }),
        }
    )
);

export default usePermissionStore;
