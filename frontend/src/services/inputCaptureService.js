/**
 * NerdyOS Input Capture Service
 * Handles deep keyboard and mouse capture for browser-based OS
 * 
 * Features:
 * - Windows key isolation
 * - Browser shortcut suppression
 * - Fail-safe escape mechanism (Win+R)
 * - Pointer Lock integration
 */

import useInputCaptureStore from '../store/inputCaptureStore';

/**
 * Priority levels for event handling
 * Lower number = higher priority
 */
const PRIORITY = {
    ESCAPE: 0,      // Win+R - ALWAYS top priority
    OS_SHORTCUT: 1, // Super+Q, Super+Enter, etc.
    APP_KEYBIND: 2, // App-specific keybinds
    NORMAL: 3,      // Regular typing
};

/**
 * Keys that should be suppressed when OS mode is active
 */
const SUPPRESSED_KEYS = new Set([
    'Tab',        // Prevent Alt+Tab leak
    'Escape',     // Capture Escape
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
]);

/**
 * Browser shortcuts to suppress (with modifiers)
 */
const BROWSER_SHORTCUTS = [
    { ctrl: true, key: 't' },      // New tab
    { ctrl: true, key: 'w' },      // Close tab
    { ctrl: true, key: 'n' },      // New window
    { ctrl: true, key: 'r' },      // Reload (but not Win+R)
    { ctrl: true, key: 'l' },      // Focus address bar
    { ctrl: true, key: 'd' },      // Bookmark
    { ctrl: true, key: 'h' },      // History
    { ctrl: true, key: 'j' },      // Downloads
    { ctrl: true, key: 'p' },      // Print
    { ctrl: true, key: 's' },      // Save
    { ctrl: true, key: 'f' },      // Find
    { ctrl: true, key: 'g' },      // Find next
    { ctrl: true, shift: true, key: 'i' }, // DevTools
    { ctrl: true, shift: true, key: 'j' }, // DevTools console
    { alt: true, key: 'ArrowLeft' },  // Back
    { alt: true, key: 'ArrowRight' }, // Forward
    { key: 'F5' },                 // Reload
    { ctrl: true, key: 'F5' },     // Hard reload
];

/**
 * Check if event matches the escape combo (Win+R)
 */
function isEscapeCombo(event) {
    return event.metaKey && event.key.toLowerCase() === 'r';
}

/**
 * Check if event is a browser shortcut that should be suppressed
 */
function isBrowserShortcut(event) {
    for (const shortcut of BROWSER_SHORTCUTS) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
            return true;
        }
    }
    return false;
}

/**
 * Check if event should be suppressed (captured by NerdyOS)
 */
function shouldSuppress(event) {
    // Always suppress when Meta (Windows) key is involved
    if (event.metaKey) return true;

    // Suppress specific keys
    if (SUPPRESSED_KEYS.has(event.key)) return true;

    // Suppress browser shortcuts
    if (isBrowserShortcut(event)) return true;

    return false;
}

// Store reference for the main desktop element
let desktopElement = null;

// Keybind handler reference (set by integration)
let keybindHandler = null;

/**
 * Handle keydown events
 */
function handleKeyDown(event) {
    const store = useInputCaptureStore.getState();

    // ESCAPE CHECK - Always first, regardless of OS mode
    if (isEscapeCombo(event)) {
        event.preventDefault();
        event.stopPropagation();
        store.recordEscapeAttempt();
        store.deactivateOSMode('escape_combo');

        console.log('[InputCapture] Escape combo triggered (Win+R)');

        // Show notification
        window.dispatchEvent(new CustomEvent('nerdyos:inputreleased', {
            detail: { reason: 'escape_combo' }
        }));

        return;
    }

    // If OS mode is inactive, don't capture
    if (!store.isActive()) {
        // Check if this might activate OS mode (Meta key alone)
        if (event.key === 'Meta') {
            // We'll let the click handler activate, not the key
        }
        return;
    }

    // Track suppressed keys
    store.addSuppressedKey(event.code);

    // Suppress browser shortcuts and special keys
    if (shouldSuppress(event)) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Route to keybind handler if available
    if (keybindHandler) {
        keybindHandler(event);
    }
}

/**
 * Handle keyup events
 */
function handleKeyUp(event) {
    const store = useInputCaptureStore.getState();

    // Remove from suppressed keys
    store.removeSuppressedKey(event.code);

    // If OS mode is inactive, don't process
    if (!store.isActive()) return;

    // Suppress if needed
    if (shouldSuppress(event)) {
        event.preventDefault();
        event.stopPropagation();
    }
}

/**
 * Handle mouse events for capture
 */
function handleMouseDown(event) {
    const store = useInputCaptureStore.getState();

    // Check if click is inside the desktop element
    if (desktopElement && desktopElement.contains(event.target)) {
        if (!store.isActive()) {
            store.activateOSMode('click');
        }
    } else {
        // Click outside NerdyOS - deactivate
        if (store.isActive()) {
            store.deactivateOSMode('click_outside');
        }
    }
}

/**
 * Handle focus/blur events
 */
function handleWindowBlur() {
    const store = useInputCaptureStore.getState();
    if (store.isActive()) {
        store.deactivateOSMode('window_blur');
    }
}

function handleWindowFocus() {
    // Don't auto-activate on focus, require explicit click
}

/**
 * Handle visibility change (tab switch)
 */
function handleVisibilityChange() {
    if (document.hidden) {
        const store = useInputCaptureStore.getState();
        if (store.isActive()) {
            store.deactivateOSMode('tab_hidden');
        }
    }
}

/**
 * Handle pointer lock change
 */
function handlePointerLockChange() {
    const store = useInputCaptureStore.getState();
    const isLocked = document.pointerLockElement !== null;
    store.setPointerLock(isLocked);

    if (!isLocked && store.isActive()) {
        // Pointer lock was exited externally
        console.log('[InputCapture] Pointer lock released externally');
    }
}

/**
 * Handle pointer lock error
 */
function handlePointerLockError() {
    console.warn('[InputCapture] Pointer lock request failed');
    const store = useInputCaptureStore.getState();
    store.setPointerLock(false);
}

/**
 * Request pointer lock on the desktop element
 */
async function requestPointerLock() {
    if (!desktopElement) {
        console.warn('[InputCapture] No desktop element set for pointer lock');
        return false;
    }

    try {
        await desktopElement.requestPointerLock();
        return true;
    } catch (err) {
        console.warn('[InputCapture] Pointer lock failed:', err);
        return false;
    }
}

/**
 * Release pointer lock
 */
function releasePointerLock() {
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
}

/**
 * Initialize input capture service
 * @param {HTMLElement} element - The main desktop container element
 * @param {Function} onKeybind - Handler for keybind events
 * @returns {Function} Cleanup function
 */
export function initializeInputCapture(element, onKeybind = null) {
    console.log('[InputCapture] Initializing input capture service');

    desktopElement = element;
    keybindHandler = onKeybind;

    // Add event listeners with capture phase for priority
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);

    // Return cleanup function
    return () => {
        console.log('[InputCapture] Cleaning up input capture service');

        window.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('keyup', handleKeyUp, true);
        window.removeEventListener('mousedown', handleMouseDown, true);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('pointerlockchange', handlePointerLockChange);
        document.removeEventListener('pointerlockerror', handlePointerLockError);

        // Release any locks
        releasePointerLock();

        // Deactivate OS mode
        const store = useInputCaptureStore.getState();
        if (store.isActive()) {
            store.deactivateOSMode('cleanup');
        }

        desktopElement = null;
        keybindHandler = null;
    };
}

/**
 * Set the keybind handler
 */
export function setKeybindHandler(handler) {
    keybindHandler = handler;
}

/**
 * Get current capture state
 */
export function getCaptureState() {
    return useInputCaptureStore.getState();
}

/**
 * Force release all input (emergency escape)
 */
export function forceReleaseInput() {
    const store = useInputCaptureStore.getState();
    store.deactivateOSMode('force_release');
    releasePointerLock();
}

export default {
    initializeInputCapture,
    setKeybindHandler,
    getCaptureState,
    forceReleaseInput,
    requestPointerLock,
    releasePointerLock,
};
