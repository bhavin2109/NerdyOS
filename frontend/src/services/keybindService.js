/**
 * NerdyOS Keybind Manager
 * Handles keyboard shortcut detection and action dispatching
 */

import useConfigStore from '../store/configStore';
import useWindowStore from '../store/windowStore';
import useWorkspaceStore from '../store/workspaceStore';

/**
 * Key code to name mapping for special keys
 */
const KEY_MAP = {
    ' ': 'Space',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'Escape': 'Escape',
    'Enter': 'Return',
    'Tab': 'Tab',
    'Backspace': 'Backspace',
    'Delete': 'Delete',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'PageUp',
    'PageDown': 'PageDown',
    '[': 'BracketLeft',
    ']': 'BracketRight',
    '`': 'Grave',
    '-': 'Minus',
    '=': 'Equal',
    'PrintScreen': 'Print',
};

/**
 * Modifier key detection
 */
const MODIFIERS = {
    SUPER: (e) => e.metaKey || (e.key === 'Meta'),
    SHIFT: (e) => e.shiftKey,
    CTRL: (e) => e.ctrlKey,
    ALT: (e) => e.altKey,
};

/**
 * Current submap (for multi-key sequences)
 */
let currentSubmap = 'reset';

/**
 * Registered action handlers
 */
const actionHandlers = {};

/**
 * Register an action handler
 * @param {string} action - Action name (e.g., 'killactive', 'movefocus')
 * @param {Function} handler - Handler function (receives args string)
 */
export function registerAction(action, handler) {
    actionHandlers[action] = handler;
}

/**
 * Convert a keyboard event to a chord string
 * @param {KeyboardEvent} event - The keyboard event
 * @returns {string} Chord string (e.g., "SUPER+SHIFT+H")
 */
export function eventToChord(event) {
    const parts = [];

    // Add modifiers in order
    if (event.metaKey) parts.push('SUPER');
    if (event.ctrlKey) parts.push('CTRL');
    if (event.altKey) parts.push('ALT');
    if (event.shiftKey) parts.push('SHIFT');

    // Get key name
    let key = event.key;

    // Map special keys
    if (KEY_MAP[key]) {
        key = KEY_MAP[key];
    } else if (key.length === 1) {
        // Single character - uppercase
        key = key.toUpperCase();
    } else if (key.startsWith('F') && /^F\d+$/.test(key)) {
        // Function keys - keep as is
    } else if (key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta') {
        // Modifier key pressed alone - don't include
        return null;
    }

    parts.push(key);

    return parts.join('+');
}

/**
 * Check if a chord matches a bind's modifiers and key
 * @param {string} chord - Event chord (e.g., "SUPER+H")
 * @param {Object} bind - Bind object with modifiers and key
 * @returns {boolean} Whether they match
 */
function matchesBind(chord, bind) {
    // Build bind chord
    const bindParts = [...bind.modifiers, bind.key.toUpperCase()];
    const bindChord = bindParts.join('+').replace(/\s+/g, '+').toUpperCase();

    // Normalize chord
    const normalizedChord = chord.toUpperCase();

    return normalizedChord === bindChord;
}

/**
 * Execute an action
 * @param {Object} bind - The matched bind object
 */
function executeAction(bind) {
    const { action, args } = bind;

    console.log(`[Keybind] Executing: ${action}${args ? ' ' + args : ''}`);

    // Check for registered handler
    if (actionHandlers[action]) {
        actionHandlers[action](args);
        return;
    }

    // Built-in actions
    switch (action) {
        // Window actions
        case 'killactive':
            const activeId = useWindowStore.getState().activeWindowId;
            if (activeId) {
                useWindowStore.getState().closeWindow(activeId);
            }
            break;

        case 'fullscreen':
            const fullscreenId = useWindowStore.getState().activeWindowId;
            if (fullscreenId) {
                useWindowStore.getState().toggleMaximize(fullscreenId);
            }
            break;

        case 'togglefloating':
            const floatId = useWindowStore.getState().activeWindowId;
            if (floatId) {
                useWindowStore.getState().toggleFloating(floatId);
            }
            break;

        case 'centerwindow':
            const centerId = useWindowStore.getState().activeWindowId;
            if (centerId) {
                useWindowStore.getState().centerWindow(centerId);
            }
            break;

        case 'pin':
            const pinId = useWindowStore.getState().activeWindowId;
            if (pinId) {
                useWindowStore.getState().togglePin(pinId);
            }
            break;

        // Focus actions
        case 'movefocus':
            useWindowStore.getState().focusInDirection(args);
            break;

        case 'cyclenext':
            useWindowStore.getState().cycleFocus(1);
            break;

        case 'cycleprev':
            useWindowStore.getState().cycleFocus(-1);
            break;

        // Move actions
        case 'movewindow':
            useWindowStore.getState().moveActiveInDirection(args);
            break;

        // Resize actions
        case 'resizeactive':
            if (args) {
                const [dx, dy] = args.split(' ').map(n => parseInt(n, 10));
                useWindowStore.getState().resizeActive(dx, dy);
            }
            break;

        // Workspace actions
        case 'workspace':
            const wsNum = parseInt(args, 10);
            if (!isNaN(wsNum)) {
                // For numbered workspace switches, check if it exists
                const wsStore = useWorkspaceStore.getState();
                if (wsStore.workspaceExists(wsNum)) {
                    wsStore.switchTo(wsNum, { explicit: true });
                } else {
                    console.warn(`[Keybind] Workspace ${wsNum} does not exist`);
                }
            } else if (args === 'e+1') {
                useWorkspaceStore.getState().switchRelative(1);
            } else if (args === 'e-1') {
                useWorkspaceStore.getState().switchRelative(-1);
            }
            break;

        case 'movetoworkspace':
            const moveWsNum = parseInt(args, 10);
            if (!isNaN(moveWsNum)) {
                const wsStore = useWorkspaceStore.getState();
                // Create workspace if it doesn't exist (moving window creates workspace)
                if (!wsStore.workspaceExists(moveWsNum)) {
                    wsStore.createWorkspace(moveWsNum);
                }
                useWindowStore.getState().moveActiveToWorkspace(moveWsNum);
                wsStore.switchTo(moveWsNum, { explicit: true });
            }
            break;

        case 'movetoworkspacesilent':
            const silentWsNum = parseInt(args, 10);
            if (!isNaN(silentWsNum)) {
                const wsStore = useWorkspaceStore.getState();
                // Create workspace if it doesn't exist
                if (!wsStore.workspaceExists(silentWsNum)) {
                    wsStore.createWorkspace(silentWsNum);
                }
                useWindowStore.getState().moveActiveToWorkspace(silentWsNum);
            }
            break;

        case 'createworkspace':
            const createWsStore = useWorkspaceStore.getState();
            const nextId = createWsStore.getNextAvailableId();
            if (nextId) {
                const created = createWsStore.createWorkspace(nextId);
                if (created) {
                    createWsStore.switchTo(nextId, { explicit: true });
                }
            } else {
                console.warn('[Keybind] Max workspaces reached');
            }
            break;

        // Special workspace actions
        case 'togglespecialworkspace':
            useWorkspaceStore.getState().toggleSpecialWorkspace(args || 'scratchpad');
            break;

        // Layout actions
        case 'pseudo':
            const pseudoId = useWindowStore.getState().activeWindowId;
            if (pseudoId) {
                useWindowStore.getState().togglePseudo(pseudoId);
            }
            break;

        case 'togglesplit':
            useWindowStore.getState().toggleSplit();
            break;

        // Submap actions
        case 'submap':
            currentSubmap = args || 'reset';
            console.log(`[Keybind] Switched to submap: ${currentSubmap}`);
            break;

        // Exec actions (app launching)
        case 'exec':
            handleExec(args);
            break;

        default:
            console.warn(`[Keybind] Unknown action: ${action}`);
    }
}

/**
 * Handle exec action (launching apps or system commands)
 * @param {string} command - Command to execute
 */
function handleExec(command) {
    const windowStore = useWindowStore.getState();

    // Map commands to app IDs
    const appMap = {
        'terminal': 'terminal',
        'launcher': '__launcher__',
        'finder': 'finder',
        'browser': 'browser',
        'settings': 'settings',
        'powermenu': '__powermenu__',
        'lock': '__lock__',
        'screenshot': '__screenshot__',
        'togglenotify': '__togglenotify__',
        'reload': '__reload__',
        'devtoggle': '__devtoggle__',
        'keybindinspector': '__keybindinspector__',
    };

    const mappedApp = appMap[command];

    if (mappedApp) {
        if (mappedApp.startsWith('__')) {
            // System command - dispatch event
            window.dispatchEvent(new CustomEvent(`nerdyos:${command}`, { detail: {} }));
        } else {
            // App launch
            windowStore.openWindow(mappedApp);
        }
    } else {
        console.warn(`[Keybind] Unknown exec command: ${command}`);
    }
}

/**
 * Handle keydown event
 * @param {KeyboardEvent} event - The keyboard event
 * @returns {boolean} Whether the event was handled
 */
export function handleKeyDown(event) {
    // Convert event to chord
    const chord = eventToChord(event);
    if (!chord) return false;

    // Get binds from config
    const { binds } = useConfigStore.getState();

    // Filter by current submap (if not reset)
    let relevantBinds = binds;
    if (currentSubmap !== 'reset') {
        // In a submap - only use submap binds
        // This would need submap tracking in the bind definitions
        // For now, use all binds
    }

    // Find matching bind
    const matchedBind = relevantBinds.find(bind => matchesBind(chord, bind));

    if (matchedBind) {
        event.preventDefault();
        event.stopPropagation();
        executeAction(matchedBind);
        return true;
    }

    return false;
}

/**
 * Initialize the keybind manager
 * Attaches global keyboard listener
 */
export function initializeKeybindManager() {
    console.log('[Keybind] Initializing keybind manager');

    // Attach global listener
    window.addEventListener('keydown', handleKeyDown, true);

    // Return cleanup function
    return () => {
        window.removeEventListener('keydown', handleKeyDown, true);
    };
}

/**
 * Get human-readable keybind string
 * @param {Object} bind - Bind object
 * @returns {string} Human-readable string (e.g., "Super + Shift + H")
 */
export function formatKeybind(bind) {
    const parts = [];

    for (const mod of bind.modifiers) {
        switch (mod.toUpperCase()) {
            case 'SUPER':
            case '$MOD':
                parts.push('Super');
                break;
            case 'SHIFT':
                parts.push('Shift');
                break;
            case 'CTRL':
                parts.push('Ctrl');
                break;
            case 'ALT':
                parts.push('Alt');
                break;
            default:
                parts.push(mod);
        }
    }

    parts.push(bind.key);

    return parts.join(' + ');
}

/**
 * Get all keybinds grouped by category
 * @returns {Object} Keybinds grouped by category
 */
export function getKeybindsByCategory() {
    const { binds } = useConfigStore.getState();

    const categories = {
        'Window Management': [],
        'Focus': [],
        'Move': [],
        'Resize': [],
        'Workspaces': [],
        'Layout': [],
        'Applications': [],
        'System': [],
        'Other': [],
    };

    for (const bind of binds) {
        const action = bind.action;

        if (['killactive', 'fullscreen', 'togglefloating', 'centerwindow', 'pin'].includes(action)) {
            categories['Window Management'].push(bind);
        } else if (['movefocus', 'cyclenext', 'cycleprev', 'focusurgentorlast'].includes(action)) {
            categories['Focus'].push(bind);
        } else if (['movewindow', 'swapwithmaster'].includes(action)) {
            categories['Move'].push(bind);
        } else if (['resizeactive'].includes(action)) {
            categories['Resize'].push(bind);
        } else if (['workspace', 'movetoworkspace', 'movetoworkspacesilent', 'togglespecialworkspace'].includes(action)) {
            categories['Workspaces'].push(bind);
        } else if (['pseudo', 'togglesplit', 'layoutmsg'].includes(action)) {
            categories['Layout'].push(bind);
        } else if (action === 'exec' && ['terminal', 'launcher', 'finder', 'browser', 'settings'].includes(bind.args)) {
            categories['Applications'].push(bind);
        } else if (action === 'exec') {
            categories['System'].push(bind);
        } else {
            categories['Other'].push(bind);
        }
    }

    // Filter out empty categories
    return Object.fromEntries(
        Object.entries(categories).filter(([_, binds]) => binds.length > 0)
    );
}

export default {
    initializeKeybindManager,
    registerAction,
    handleKeyDown,
    eventToChord,
    formatKeybind,
    getKeybindsByCategory,
};
