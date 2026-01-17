/**
 * NerdyOS Configuration Store
 * Zustand store for managing configuration state with hot-reload support
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseConfig, mergeConfigs, getConfigValue } from '../config/configParser';

// Import raw config files
import nerdyosConfRaw from '../config/nerdyos.conf?raw';
import keybindsConfRaw from '../config/keybinds.conf?raw';
import rulesConfRaw from '../config/rules.conf?raw';
import themeConfRaw from '../config/theme.conf?raw';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
    general: {
        gaps_in: 5,
        gaps_out: 15,
        border_size: 2,
        layout: 'dwindle',
        resize_on_border: true,
        focus_on_hover: false,
        col: {
            active_border: 'rgba(203, 166, 247, 0.93)',
            inactive_border: 'rgba(49, 50, 68, 0.67)',
        },
    },
    decoration: {
        rounding: 10,
        blur: true,
        blur_size: 8,
        blur_passes: 2,
        blur_opacity: 0.9,
        drop_shadow: true,
        shadow_range: 20,
        shadow_render_power: 3,
        inactive_opacity: 0.9,
        active_opacity: 1.0,
        dim_inactive: true,
        dim_strength: 0.1,
        col: {
            shadow: 'rgba(17, 17, 27, 0.93)',
        },
    },
    animations: {
        enabled: true,
        beziers: {
            overshot: [0.05, 0.9, 0.1, 1.05],
            smooth: [0.25, 0.1, 0.25, 1.0],
            snappy: [0.4, 0.0, 0.2, 1.0],
            bounce: [0.68, -0.55, 0.27, 1.55],
        },
        windows: { speed: 200, curve: 'overshot' },
        workspaces: { speed: 300, curve: 'smooth' },
        fade: { speed: 150, curve: 'smooth' },
    },
    dwindle: {
        pseudotile: true,
        preserve_split: true,
        force_split: 0,
        smart_split: false,
        smart_resizing: true,
        split_ratio: 0.5,
    },
    master: {
        new_is_master: true,
        orientation: 'left',
        mfact: 0.55,
        allow_small_split: false,
        smart_resizing: true,
    },
    input: {
        repeat_rate: 50,
        repeat_delay: 300,
        follow_mouse: 1,
        sensitivity: 0.0,
    },
    misc: {
        disable_splash: true,
        animate_manual_resizes: true,
        focus_on_activate: true,
        new_window_takes_focus: true,
    },
    workspace: {
        count: 10,
        remember_per_app: false,
        default: 1,
    },
    bar: {
        enabled: true,
        position: 'top',
        height: 32,
        background: 'rgba(30, 30, 46, 0.9)',
        modules_left: ['workspaces', 'window_title'],
        modules_center: ['clock'],
        modules_right: ['tray', 'network', 'audio', 'battery', 'power'],
        workspace_style: 'numbers',
    },
};

/**
 * Parse all configuration files and merge them
 */
function loadConfigurations() {
    try {
        // Parse main config
        const mainConfig = parseConfig(nerdyosConfRaw);

        // Parse modular configs
        const keybindsConfig = parseConfig(keybindsConfRaw);
        const rulesConfig = parseConfig(rulesConfRaw);
        const themeConfig = parseConfig(themeConfRaw);

        // Merge all configs
        let merged = mainConfig;
        merged = mergeConfigs(merged, keybindsConfig);
        merged = mergeConfigs(merged, rulesConfig);
        merged = mergeConfigs(merged, themeConfig);

        return merged;
    } catch (error) {
        console.error('Failed to parse configuration files:', error);
        return { sections: {}, binds: [], windowRules: [], variables: {} };
    }
}

/**
 * Configuration store
 */
const useConfigStore = create(
    persist(
        (set, get) => ({
            // Parsed configuration
            config: null,

            // Flattened settings for quick access
            general: DEFAULT_CONFIG.general,
            decoration: DEFAULT_CONFIG.decoration,
            animations: DEFAULT_CONFIG.animations,
            dwindle: DEFAULT_CONFIG.dwindle,
            master: DEFAULT_CONFIG.master,
            input: DEFAULT_CONFIG.input,
            misc: DEFAULT_CONFIG.misc,
            workspace: DEFAULT_CONFIG.workspace,
            bar: DEFAULT_CONFIG.bar,

            // Keybindings
            binds: [],

            // Window rules
            windowRules: [],

            // Layer rules
            layerRules: [],

            // Theme variables
            themeVariables: {},

            // Loading state
            isLoaded: false,

            // Last reload timestamp
            lastReload: null,

            /**
             * Initialize configuration from files
             */
            initialize: () => {
                const parsed = loadConfigurations();

                const sections = parsed.sections || {};

                set({
                    config: parsed,
                    general: { ...DEFAULT_CONFIG.general, ...sections.general },
                    decoration: { ...DEFAULT_CONFIG.decoration, ...sections.decoration },
                    animations: { ...DEFAULT_CONFIG.animations, ...sections.animations },
                    dwindle: { ...DEFAULT_CONFIG.dwindle, ...sections.dwindle },
                    master: { ...DEFAULT_CONFIG.master, ...sections.master },
                    input: { ...DEFAULT_CONFIG.input, ...sections.input },
                    misc: { ...DEFAULT_CONFIG.misc, ...sections.misc },
                    workspace: { ...DEFAULT_CONFIG.workspace, ...sections.workspace },
                    bar: { ...DEFAULT_CONFIG.bar, ...sections.bar },
                    binds: parsed.binds || [],
                    windowRules: parsed.windowRules || [],
                    layerRules: parsed.layerRules || [],
                    themeVariables: parsed.variables || {},
                    isLoaded: true,
                    lastReload: Date.now(),
                });
            },

            /**
             * Reload configuration (hot-reload)
             */
            reload: () => {
                get().initialize();
                console.log('[NerdyOS] Configuration reloaded');
            },

            /**
             * Get a config value using dot notation
             */
            getValue: (path, defaultValue) => {
                const state = get();
                const parts = path.split('.');

                // Try to get from flattened state first
                if (parts.length >= 1 && state[parts[0]]) {
                    let current = state[parts[0]];
                    for (let i = 1; i < parts.length; i++) {
                        if (current && current[parts[i]] !== undefined) {
                            current = current[parts[i]];
                        } else {
                            return defaultValue;
                        }
                    }
                    return current;
                }

                // Fall back to raw config
                if (state.config) {
                    return getConfigValue(state.config, path, defaultValue);
                }

                return defaultValue;
            },

            /**
             * Update a config value (for runtime changes)
             */
            setValue: (path, value) => {
                const parts = path.split('.');
                if (parts.length < 2) return;

                const section = parts[0];
                const key = parts.slice(1).join('.');

                set((state) => {
                    if (state[section]) {
                        // Deep update
                        const updated = { ...state[section] };
                        let current = updated;
                        for (let i = 1; i < parts.length - 1; i++) {
                            current[parts[i]] = { ...current[parts[i]] };
                            current = current[parts[i]];
                        }
                        current[parts[parts.length - 1]] = value;

                        return { [section]: updated };
                    }
                    return {};
                });
            },

            /**
             * Get keybind for a specific chord
             */
            getKeybind: (chord) => {
                const { binds } = get();
                // Normalize chord format
                const normalizedChord = chord.toUpperCase().replace(/\s+/g, '+');

                return binds.find((bind) => {
                    const bindChord = [...bind.modifiers, bind.key].join('+').toUpperCase();
                    return bindChord === normalizedChord;
                });
            },

            /**
             * Get all keybinds for a specific action type
             */
            getKeybindsByAction: (action) => {
                const { binds } = get();
                return binds.filter((bind) => bind.action === action);
            },

            /**
             * Get window rule for a window
             */
            getWindowRules: (windowClass, windowTitle = '') => {
                const { windowRules } = get();

                return windowRules.filter((rule) => {
                    if (rule.type === 'windowrule') {
                        // Simple match
                        const match = rule.match;
                        if (match.startsWith('class:')) {
                            const pattern = match.substring(6);
                            const regex = new RegExp(pattern);
                            return regex.test(windowClass);
                        }
                        if (match.startsWith('title:')) {
                            const pattern = match.substring(6);
                            const regex = new RegExp(pattern);
                            return regex.test(windowTitle);
                        }
                        // Direct class match
                        const regex = new RegExp(match);
                        return regex.test(windowClass);
                    } else if (rule.type === 'windowrulev2') {
                        // All conditions must match
                        return rule.conditions.every((cond) => {
                            if (cond.type === 'class') {
                                const regex = new RegExp(cond.value);
                                return regex.test(windowClass);
                            }
                            if (cond.type === 'title') {
                                const regex = new RegExp(cond.value);
                                return regex.test(windowTitle);
                            }
                            return true;
                        });
                    }
                    return false;
                });
            },

            /**
             * Get theme variable value
             */
            getThemeVar: (name) => {
                const { themeVariables } = get();
                return themeVariables[name];
            },

            /**
             * Convert theme variables to CSS custom properties
             */
            getCSSVariables: () => {
                const { themeVariables, decoration, general } = get();

                const cssVars = {};

                // Theme color variables
                for (const [name, value] of Object.entries(themeVariables)) {
                    cssVars[`--${name}`] = value;
                }

                // Decoration variables
                cssVars['--window-rounding'] = `${decoration.rounding}px`;
                cssVars['--window-border-width'] = `${general.border_size}px`;
                cssVars['--window-gap-in'] = `${general.gaps_in}px`;
                cssVars['--window-gap-out'] = `${general.gaps_out}px`;
                cssVars['--window-opacity-inactive'] = decoration.inactive_opacity;
                cssVars['--window-opacity-active'] = decoration.active_opacity;
                cssVars['--blur-size'] = `${decoration.blur_size}px`;
                cssVars['--shadow-range'] = `${decoration.shadow_range}px`;

                // Border colors
                if (general.col) {
                    cssVars['--border-active'] = general.col.active_border;
                    cssVars['--border-inactive'] = general.col.inactive_border;
                }

                if (decoration.col) {
                    cssVars['--shadow-color'] = decoration.col.shadow;
                }

                return cssVars;
            },
        }),
        {
            name: 'nerdyos-config',
            partialize: (state) => ({
                // Only persist runtime overrides, not parsed configs
                general: state.general,
                decoration: state.decoration,
                bar: state.bar,
            }),
        }
    )
);

// Auto-initialize on first import
if (typeof window !== 'undefined') {
    // Delay to ensure module is fully loaded
    setTimeout(() => {
        if (!useConfigStore.getState().isLoaded) {
            useConfigStore.getState().initialize();
        }
    }, 0);
}

export default useConfigStore;
