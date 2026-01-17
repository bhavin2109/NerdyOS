/**
 * NerdyOS Animation Configuration
 * Hyprland-inspired Bezier curves and animation presets
 * 
 * Based on real compositor animation curves for fluid, natural motion
 */

/**
 * Bezier curve definitions (Hyprland-style)
 * Format: [x1, y1, x2, y2] for cubic-bezier
 */
export const BEZIER_CURVES = {
    // Default smooth curve - balanced ease
    default: [0.25, 0.1, 0.25, 1.0],

    // Workspace transitions - smooth slide with slight overshoot
    workspaceSlide: [0.4, 0.0, 0.2, 1.0],

    // Window open/close - quick start, smooth end
    windowOpen: [0.16, 1, 0.3, 1],
    windowClose: [0.33, 1, 0.68, 1],

    // Snappy interactions - responsive feel
    snappy: [0.05, 0.9, 0.1, 1.0],

    // Gentle motion - subtle, non-distracting
    gentle: [0.4, 0.0, 0.6, 1.0],

    // Elastic bounce - playful feedback
    elastic: [0.68, -0.55, 0.265, 1.55],

    // Sharp decel - quick stop
    decel: [0.0, 0.0, 0.2, 1.0],

    // Accelerate - quick start
    accel: [0.4, 0.0, 1.0, 1.0],

    // Natural spring approximation
    spring: [0.175, 0.885, 0.32, 1.275],
};

/**
 * Duration presets (in milliseconds)
 */
export const DURATIONS = {
    instant: 0,
    fast: 150,
    normal: 250,
    smooth: 350,
    slow: 500,
    extraSlow: 750,
};

/**
 * Framer Motion spring configurations
 */
export const SPRING_CONFIGS = {
    // Workspace transitions
    workspace: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 1,
    },

    // Window animations
    window: {
        type: 'spring',
        stiffness: 350,
        damping: 30,
        mass: 0.8,
    },

    // Quick, snappy UI elements
    snappy: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.5,
    },

    // Gentle, subtle animations
    gentle: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 1,
    },

    // Bouncy, playful
    bouncy: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
        mass: 0.8,
    },

    // Critically damped (no bounce)
    critical: {
        type: 'spring',
        stiffness: 300,
        damping: 35,
        mass: 1,
    },
};

/**
 * Tween configurations using Bezier curves
 */
export const TWEEN_CONFIGS = {
    workspaceSlide: {
        type: 'tween',
        duration: DURATIONS.smooth / 1000,
        ease: BEZIER_CURVES.workspaceSlide,
    },

    windowOpen: {
        type: 'tween',
        duration: DURATIONS.normal / 1000,
        ease: BEZIER_CURVES.windowOpen,
    },

    windowClose: {
        type: 'tween',
        duration: DURATIONS.fast / 1000,
        ease: BEZIER_CURVES.windowClose,
    },

    fade: {
        type: 'tween',
        duration: DURATIONS.fast / 1000,
        ease: BEZIER_CURVES.gentle,
    },

    hudSlide: {
        type: 'tween',
        duration: DURATIONS.normal / 1000,
        ease: BEZIER_CURVES.decel,
    },
};

/**
 * Animation variants for common patterns
 */
export const ANIMATION_VARIANTS = {
    // Fade in/out
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },

    // Scale with fade
    scaleFade: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    },

    // Slide from right
    slideRight: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 },
    },

    // Slide from left
    slideLeft: {
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 },
    },

    // Slide from bottom
    slideUp: {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
    },

    // Slide from top
    slideDown: {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 },
    },

    // Pop in (scale up)
    popIn: {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
    },

    // Window spawn animation
    windowSpawn: {
        initial: { opacity: 0, scale: 0.85, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: -10 },
    },

    // Workspace HUD
    workspaceHUD: {
        initial: { opacity: 0, scale: 0.8, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: -20 },
    },
};

/**
 * Get workspace transition animation based on direction
 */
export function getWorkspaceTransition(direction) {
    const offset = direction === 'right' ? 1 : -1;

    return {
        initial: { x: `${offset * 100}%`, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: `${-offset * 100}%`, opacity: 0 },
        transition: SPRING_CONFIGS.workspace,
    };
}

/**
 * Stagger children animation helper
 */
export function getStaggerConfig(staggerDelay = 0.05) {
    return {
        animate: {
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };
}

export default {
    BEZIER_CURVES,
    DURATIONS,
    SPRING_CONFIGS,
    TWEEN_CONFIGS,
    ANIMATION_VARIANTS,
    getWorkspaceTransition,
    getStaggerConfig,
};
