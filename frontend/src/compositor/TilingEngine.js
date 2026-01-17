/**
 * NerdyOS Tiling Engine
 * Calculates window positions for tiling layouts
 */

/**
 * Layout types
 */
export const LAYOUTS = {
    DWINDLE: 'dwindle',
    MASTER: 'master',
    FLOATING: 'floating',
};

/**
 * Split direction for dwindle layout
 */
export const SPLIT_DIRECTION = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
};

/**
 * Calculate dwindle layout positions
 * Binary space partitioning - each new window splits the smallest space
 * 
 * @param {Array} windows - Array of window objects
 * @param {Object} container - Container bounds { x, y, width, height }
 * @param {Object} options - Layout options { gaps_in, gaps_out, split_ratio }
 * @returns {Object} Map of windowId to position { x, y, width, height }
 */
export function calculateDwindleLayout(windows, container, options = {}) {
    const {
        gaps_in = 5,
        gaps_out = 15,
        split_ratio = 0.5,
    } = options;

    if (windows.length === 0) {
        return {};
    }

    const positions = {};

    // Usable area after outer gaps
    const usableArea = {
        x: container.x + gaps_out,
        y: container.y + gaps_out,
        width: container.width - (gaps_out * 2),
        height: container.height - (gaps_out * 2),
    };

    // Single window - full usable area
    if (windows.length === 1) {
        positions[windows[0].id] = { ...usableArea };
        return positions;
    }

    // Build binary tree of splits
    const regions = [{ ...usableArea, splitDir: SPLIT_DIRECTION.HORIZONTAL }];

    for (let i = 0; i < windows.length; i++) {
        const window = windows[i];

        if (i === 0) {
            // First window gets current region
            positions[window.id] = { ...regions[0] };
        } else {
            // Find the region to split (last one added)
            const regionIndex = Math.min(i - 1, regions.length - 1);
            const region = regions[regionIndex];

            // Split the region
            const isHorizontal = region.splitDir === SPLIT_DIRECTION.HORIZONTAL;
            const halfGap = gaps_in / 2;

            let region1, region2;

            if (isHorizontal) {
                // Split horizontally (left-right)
                const splitX = region.x + (region.width * split_ratio);
                region1 = {
                    x: region.x,
                    y: region.y,
                    width: (region.width * split_ratio) - halfGap,
                    height: region.height,
                    splitDir: SPLIT_DIRECTION.VERTICAL,
                };
                region2 = {
                    x: splitX + halfGap,
                    y: region.y,
                    width: (region.width * (1 - split_ratio)) - halfGap,
                    height: region.height,
                    splitDir: SPLIT_DIRECTION.VERTICAL,
                };
            } else {
                // Split vertically (top-bottom)
                const splitY = region.y + (region.height * split_ratio);
                region1 = {
                    x: region.x,
                    y: region.y,
                    width: region.width,
                    height: (region.height * split_ratio) - halfGap,
                    splitDir: SPLIT_DIRECTION.HORIZONTAL,
                };
                region2 = {
                    x: region.x,
                    y: splitY + halfGap,
                    width: region.width,
                    height: (region.height * (1 - split_ratio)) - halfGap,
                    splitDir: SPLIT_DIRECTION.HORIZONTAL,
                };
            }

            // Update existing window position to region1
            const prevWindow = windows[i - 1];
            positions[prevWindow.id] = {
                x: region1.x,
                y: region1.y,
                width: region1.width,
                height: region1.height,
            };

            // New window gets region2
            positions[window.id] = {
                x: region2.x,
                y: region2.y,
                width: region2.width,
                height: region2.height,
            };

            // Update regions for next iteration
            regions[regionIndex] = region1;
            regions.push(region2);
        }
    }

    return positions;
}

/**
 * Calculate master-stack layout positions
 * One master window takes majority of space, rest stack on the side
 * 
 * @param {Array} windows - Array of window objects
 * @param {Object} container - Container bounds
 * @param {Object} options - Layout options
 * @returns {Object} Map of windowId to position
 */
export function calculateMasterLayout(windows, container, options = {}) {
    const {
        gaps_in = 5,
        gaps_out = 15,
        mfact = 0.55,
        orientation = 'left',
        master_count = 1,
    } = options;

    if (windows.length === 0) {
        return {};
    }

    const positions = {};

    // Usable area after outer gaps
    const usableArea = {
        x: container.x + gaps_out,
        y: container.y + gaps_out,
        width: container.width - (gaps_out * 2),
        height: container.height - (gaps_out * 2),
    };

    // Single window - full usable area
    if (windows.length === 1) {
        positions[windows[0].id] = { ...usableArea };
        return positions;
    }

    const masterWindows = windows.slice(0, master_count);
    const stackWindows = windows.slice(master_count);

    const halfGap = gaps_in / 2;
    const isHorizontal = orientation === 'left' || orientation === 'right';

    // Calculate master and stack areas
    let masterArea, stackArea;

    if (isHorizontal) {
        const masterWidth = usableArea.width * mfact - halfGap;
        const stackWidth = usableArea.width * (1 - mfact) - halfGap;

        if (orientation === 'left') {
            masterArea = {
                x: usableArea.x,
                y: usableArea.y,
                width: masterWidth,
                height: usableArea.height,
            };
            stackArea = {
                x: usableArea.x + masterWidth + gaps_in,
                y: usableArea.y,
                width: stackWidth,
                height: usableArea.height,
            };
        } else {
            stackArea = {
                x: usableArea.x,
                y: usableArea.y,
                width: stackWidth,
                height: usableArea.height,
            };
            masterArea = {
                x: usableArea.x + stackWidth + gaps_in,
                y: usableArea.y,
                width: masterWidth,
                height: usableArea.height,
            };
        }
    } else {
        const masterHeight = usableArea.height * mfact - halfGap;
        const stackHeight = usableArea.height * (1 - mfact) - halfGap;

        if (orientation === 'top') {
            masterArea = {
                x: usableArea.x,
                y: usableArea.y,
                width: usableArea.width,
                height: masterHeight,
            };
            stackArea = {
                x: usableArea.x,
                y: usableArea.y + masterHeight + gaps_in,
                width: usableArea.width,
                height: stackHeight,
            };
        } else {
            stackArea = {
                x: usableArea.x,
                y: usableArea.y,
                width: usableArea.width,
                height: stackHeight,
            };
            masterArea = {
                x: usableArea.x,
                y: usableArea.y + stackHeight + gaps_in,
                width: usableArea.width,
                height: masterHeight,
            };
        }
    }

    // Position master windows
    const masterSlotHeight = masterArea.height / masterWindows.length;
    masterWindows.forEach((win, index) => {
        positions[win.id] = {
            x: masterArea.x,
            y: masterArea.y + (masterSlotHeight * index) + (index > 0 ? halfGap : 0),
            width: masterArea.width,
            height: masterSlotHeight - (masterWindows.length > 1 ? halfGap : 0),
        };
    });

    // Position stack windows
    if (stackWindows.length > 0) {
        const stackSlotHeight = stackArea.height / stackWindows.length;
        stackWindows.forEach((win, index) => {
            positions[win.id] = {
                x: stackArea.x,
                y: stackArea.y + (stackSlotHeight * index) + (index > 0 ? halfGap : 0),
                width: stackArea.width,
                height: stackSlotHeight - (stackWindows.length > 1 ? halfGap : 0),
            };
        });
    }

    return positions;
}

/**
 * Calculate layout based on layout type
 * 
 * @param {string} layout - Layout type ('dwindle', 'master', 'floating')
 * @param {Array} windows - Array of tiled windows
 * @param {Object} container - Container bounds
 * @param {Object} options - Layout options
 * @returns {Object} Map of windowId to position
 */
export function calculateLayout(layout, windows, container, options = {}) {
    // Filter out floating windows
    const tiledWindows = windows.filter(w => !w.floating && !w.isMinimized);

    switch (layout) {
        case LAYOUTS.DWINDLE:
            return calculateDwindleLayout(tiledWindows, container, options);
        case LAYOUTS.MASTER:
            return calculateMasterLayout(tiledWindows, container, options);
        case LAYOUTS.FLOATING:
            // Floating layout - no automatic positioning
            return {};
        default:
            return calculateDwindleLayout(tiledWindows, container, options);
    }
}

/**
 * Get the window in a specific direction from current window
 * 
 * @param {string} direction - 'l', 'r', 'u', 'd' (left, right, up, down)
 * @param {string} currentId - Current window ID
 * @param {Object} positions - Window positions from calculateLayout
 * @returns {string|null} Window ID in that direction, or null
 */
export function getWindowInDirection(direction, currentId, positions) {
    const current = positions[currentId];
    if (!current) return null;

    const currentCenter = {
        x: current.x + current.width / 2,
        y: current.y + current.height / 2,
    };

    let best = null;
    let bestDistance = Infinity;

    for (const [id, pos] of Object.entries(positions)) {
        if (id === currentId) continue;

        const center = {
            x: pos.x + pos.width / 2,
            y: pos.y + pos.height / 2,
        };

        const dx = center.x - currentCenter.x;
        const dy = center.y - currentCenter.y;

        let isValid = false;
        let distance = 0;

        switch (direction) {
            case 'l':
                isValid = dx < 0 && Math.abs(dx) > Math.abs(dy);
                distance = Math.abs(dx);
                break;
            case 'r':
                isValid = dx > 0 && Math.abs(dx) > Math.abs(dy);
                distance = Math.abs(dx);
                break;
            case 'u':
                isValid = dy < 0 && Math.abs(dy) > Math.abs(dx);
                distance = Math.abs(dy);
                break;
            case 'd':
                isValid = dy > 0 && Math.abs(dy) > Math.abs(dx);
                distance = Math.abs(dy);
                break;
        }

        if (isValid && distance < bestDistance) {
            best = id;
            bestDistance = distance;
        }
    }

    return best;
}

/**
 * Swap two windows in the layout
 * 
 * @param {Array} windows - Window array
 * @param {string} id1 - First window ID
 * @param {string} id2 - Second window ID
 * @returns {Array} New window array with swapped order
 */
export function swapWindows(windows, id1, id2) {
    const index1 = windows.findIndex(w => w.id === id1);
    const index2 = windows.findIndex(w => w.id === id2);

    if (index1 === -1 || index2 === -1) return windows;

    const newWindows = [...windows];
    [newWindows[index1], newWindows[index2]] = [newWindows[index2], newWindows[index1]];

    return newWindows;
}

/**
 * Move window in direction within the layout
 * 
 * @param {Array} windows - Window array
 * @param {string} windowId - Window to move
 * @param {string} direction - Direction to move
 * @param {Object} positions - Current positions
 * @returns {Array} New window array with moved window
 */
export function moveWindowInDirection(windows, windowId, direction, positions) {
    const targetId = getWindowInDirection(direction, windowId, positions);
    if (!targetId) return windows;

    return swapWindows(windows, windowId, targetId);
}

export default {
    LAYOUTS,
    SPLIT_DIRECTION,
    calculateLayout,
    calculateDwindleLayout,
    calculateMasterLayout,
    getWindowInDirection,
    swapWindows,
    moveWindowInDirection,
};
