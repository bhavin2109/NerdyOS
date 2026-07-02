/**
 * Tracks dock icon positions for macOS-style minimize animations.
 */
import { create } from 'zustand';

const useDockStore = create((set, get) => ({
  iconRects: {},

  setIconRect: (appId, rect) =>
    set((state) => ({
      iconRects: { ...state.iconRects, [appId]: rect },
    })),

  getIconRect: (appId) => get().iconRects[appId] || null,
}));

export default useDockStore;
