/**
 * NerdyOS Input Capture Store
 * Manages OS Mode state for keyboard/mouse capture
 */

import { create } from 'zustand';

/**
 * OS Mode States
 * INACTIVE - Normal browser behavior, input not captured
 * ACTIVE - Full input capture, browser shortcuts suppressed
 */
const OS_MODES = {
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
};

/**
 * Input Capture Store
 */
const useInputCaptureStore = create((set, get) => ({
    // Current OS mode
    osMode: OS_MODES.INACTIVE,

    // Pointer Lock API state
    isPointerLocked: false,

    // When capture began (for metrics/debugging)
    captureStartTime: null,

    // Last escape attempt timestamp (for rate limiting)
    lastEscapeAttempt: null,

    // Currently suppressed key codes
    suppressedKeys: new Set(),

    // Activation source (for debugging)
    activationSource: null,

    /**
     * Activate OS Mode - Enter captured state
     * @param {string} source - What triggered activation (click, focus, etc.)
     */
    activateOSMode: (source = 'unknown') => {
        const state = get();
        if (state.osMode === OS_MODES.ACTIVE) return;

        console.log(`[InputCapture] Activating OS Mode (source: ${source})`);

        set({
            osMode: OS_MODES.ACTIVE,
            captureStartTime: Date.now(),
            activationSource: source,
        });

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('nerdyos:osmode', {
            detail: { active: true, source }
        }));
    },

    /**
     * Deactivate OS Mode - Release all input
     * @param {string} reason - Why deactivation occurred
     */
    deactivateOSMode: (reason = 'unknown') => {
        const state = get();
        if (state.osMode === OS_MODES.INACTIVE) return;

        console.log(`[InputCapture] Deactivating OS Mode (reason: ${reason})`);

        set({
            osMode: OS_MODES.INACTIVE,
            captureStartTime: null,
            isPointerLocked: false,
            suppressedKeys: new Set(),
            activationSource: null,
        });

        // Exit pointer lock if active
        if (document.pointerLockElement) {
            document.exitPointerLock?.();
        }

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('nerdyos:osmode', {
            detail: { active: false, reason }
        }));
    },

    /**
     * Toggle OS Mode
     */
    toggleOSMode: () => {
        const state = get();
        if (state.osMode === OS_MODES.ACTIVE) {
            get().deactivateOSMode('toggle');
        } else {
            get().activateOSMode('toggle');
        }
    },

    /**
     * Set pointer lock state
     */
    setPointerLock: (locked) => {
        set({ isPointerLocked: locked });
    },

    /**
     * Record escape attempt (for rate limiting)
     */
    recordEscapeAttempt: () => {
        set({ lastEscapeAttempt: Date.now() });
    },

    /**
     * Add key to suppressed set
     */
    addSuppressedKey: (keyCode) => {
        set((state) => {
            const newSet = new Set(state.suppressedKeys);
            newSet.add(keyCode);
            return { suppressedKeys: newSet };
        });
    },

    /**
     * Remove key from suppressed set
     */
    removeSuppressedKey: (keyCode) => {
        set((state) => {
            const newSet = new Set(state.suppressedKeys);
            newSet.delete(keyCode);
            return { suppressedKeys: newSet };
        });
    },

    /**
     * Clear all suppressed keys
     */
    clearSuppressedKeys: () => {
        set({ suppressedKeys: new Set() });
    },

    /**
     * Check if OS mode is active
     */
    isActive: () => get().osMode === OS_MODES.ACTIVE,

    /**
     * Get capture duration in milliseconds
     */
    getCaptureDuration: () => {
        const state = get();
        if (!state.captureStartTime) return 0;
        return Date.now() - state.captureStartTime;
    },
}));

export { OS_MODES };
export default useInputCaptureStore;
