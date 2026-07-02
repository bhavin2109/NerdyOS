import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import useDockStore from "../../store/dockStore";
import { APP_REGISTRY } from "../appRegistry";
import AppIcon from "../../components/AppIcon";

const Dock = ({ autoHide = false }) => {
  const { pinnedApps, installedApps } = useSystemStore();
  const { windows, activeWindowId, openWindow, toggleMinimize } = useWindowStore();
  const setIconRect = useDockStore((s) => s.setIconRect);
  
  const iconRefs = useRef({});
  const [bouncingAppId, setBouncingAppId] = useState(null);
  const [hoveredAppId, setHoveredAppId] = useState(null);
  const [isDockHovered, setIsDockHovered] = useState(false);

  const runningAppIds = windows.map((w) => w.id);
  const validPinnedApps = pinnedApps.filter((id) => installedApps.includes(id));
  const runningUnpinnedApps = runningAppIds.filter((id) => !pinnedApps.includes(id));

  const updateIconRects = useCallback(() => {
    Object.entries(iconRefs.current).forEach(([appId, el]) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setIconRect(appId, { x: rect.left, y: rect.top, width: rect.width, height: rect.height });
    });
  }, [setIconRect]);

  useEffect(() => {
    updateIconRects();
    window.addEventListener("resize", updateIconRects);
    return () => window.removeEventListener("resize", updateIconRects);
  }, [updateIconRects, validPinnedApps.length, runningUnpinnedApps.length]);

  // Dock should be visible when: not autoHide, or when hovered
  const isDockVisible = !autoHide || isDockHovered;

  const handleLaunch = (appId, e) => {
    // Trigger bounce
    setBouncingAppId(appId);
    setTimeout(() => setBouncingAppId(null), 1200);

    const rect = e?.currentTarget?.getBoundingClientRect();
    const originRect = rect
      ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
      : null;

    const isOpen = windows.some((w) => w.id === appId);
    const windowItem = windows.find((w) => w.id === appId);

    if (isOpen) {
      if (activeWindowId === appId && !windowItem?.isMinimized) {
        toggleMinimize(appId);
      } else {
        openWindow(appId, {}, originRect); // Bring to front / restore
      }
    } else {
      openWindow(appId, {}, originRect);
    }
  };

  const renderDockItem = (appId) => {
    const app = APP_REGISTRY[appId];
    if (!app) return null;

    const isOpen = runningAppIds.includes(appId);
    const isActive = activeWindowId === appId;
    const isBouncing = bouncingAppId === appId;
    const isHovered = hoveredAppId === appId;

    return (
      <div
        key={appId}
        className="relative flex flex-col items-center justify-end pb-1"
        onMouseEnter={() => setHoveredAppId(appId)}
        onMouseLeave={() => setHoveredAppId(null)}
        onClick={(e) => handleLaunch(appId, e)}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute bg-slate-900/90 text-cyan-50 text-xs px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-lg pointer-events-none whitespace-nowrap z-[100]"
            >
              {app.name}
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Icon Container */}
        <motion.div
          ref={(el) => { iconRefs.current[appId] = el; }}
          whileHover={{ scale: 1.2, y: -8, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
          animate={
            isBouncing
              ? { y: [0, -16, 0, -8, 0], transition: { duration: 0.7, ease: "easeInOut" } }
              : { y: 0 }
          }
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] ${app.color || "bg-blue-600"} flex items-center justify-center text-white shadow-lg cursor-pointer relative overflow-hidden group select-none touch-manipulation`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
          <AppIcon app={app} className="relative z-10 text-xl sm:text-2xl drop-shadow-md select-none" />
          <div className="absolute inset-0 border border-white/15 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>

        {/* Active Dot Indicator */}
        {isOpen && (
          <div
            className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${
              isActive
                ? "bg-cyan-400 scale-110 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                : "bg-white/40"
            }`}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {/* Invisible hover trigger zone at bottom of screen — always present */}
      {autoHide && !isDockHovered && (
        <div
          className="fixed bottom-0 left-0 right-0 h-4 z-[89]"
          onMouseEnter={() => setIsDockHovered(true)}
        />
      )}

      {/* Dock container */}
      <motion.div
        className="fixed bottom-3 left-0 right-0 flex justify-center z-[90] pointer-events-none"
        initial={false}
        animate={{
          y: isDockVisible ? 0 : 100,
          opacity: isDockVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => setIsDockHovered(false)}
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.45)] px-3 sm:px-4 py-2 rounded-[20px] flex items-end gap-2.5 sm:gap-3.5 pointer-events-auto max-w-[95vw] overflow-x-auto">
          
          {/* Pinned apps group */}
          {validPinnedApps.map((id) => renderDockItem(id))}

          {/* Divider if running unpinned apps exist */}
          {runningUnpinnedApps.length > 0 && (
            <div className="w-[1px] h-10 bg-white/20 mx-1 mb-2 self-end shrink-0" />
          )}

          {/* Running unpinned apps group */}
          {runningUnpinnedApps.map((id) => renderDockItem(id))}
          
        </div>
      </motion.div>
    </>
  );
};

export default Dock;

