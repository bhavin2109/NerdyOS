import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import { APP_REGISTRY } from "../appRegistry";

const Dock = ({ autoHide = false }) => {
  const { pinnedApps, installedApps, accentColor } = useSystemStore();
  const { windows, activeWindowId, openWindow, toggleMinimize } = useWindowStore();
  
  const [bouncingAppId, setBouncingAppId] = useState(null);
  const [hoveredAppId, setHoveredAppId] = useState(null);
  const [isDockHovered, setIsDockHovered] = useState(false);

  // Filter apps
  const runningAppIds = windows.map((w) => w.id);
  const validPinnedApps = pinnedApps.filter((id) => installedApps.includes(id));
  const runningUnpinnedApps = runningAppIds.filter((id) => !pinnedApps.includes(id));

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
          whileHover={{
            scale: 1.25,
            y: -10,
            transition: { type: "spring", stiffness: 450, damping: 12 },
          }}
          animate={
            isBouncing
              ? {
                  y: [0, -18, 0, -10, 0],
                  transition: { duration: 0.8, ease: "easeInOut", repeat: 1 },
                }
              : { y: 0 }
          }
          className={`w-12 h-12 rounded-[14px] ${
            app.color || "bg-blue-600"
          } flex items-center justify-center text-white shadow-lg cursor-pointer relative overflow-hidden group select-none`}
        >
          {/* Gloss overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          
          <span className="relative z-10 text-2xl drop-shadow-md select-none">
            {app.icon && app.icon.length < 3 ? (
              app.icon
            ) : (
              <>
                {app.icon === "folder" && "📂"}
                {app.icon === "settings" && "⚙️"}
                {app.icon === "globe" && "🌐"}
                {app.icon === "message" && "💬"}
                {app.icon === "mail" && "✉️"}
                {app.icon === "map" && "🗺️"}
                {app.icon === "photo" && "🖼️"}
                {app.icon === "calendar" && "📅"}
                {app.icon === "note" && "📝"}
                {app.icon === "sparkles" && "✨"}
                {app.icon === "picture_as_pdf" && "📄"}
                {app.icon === "edit_note" && "✍️"}
                {app.icon === "check_circle" && "✅"}
                {app.icon === "code" && "💻"}
                {app.icon === "bag" && "🛍️"}
                {app.icon === "monitoring" && "📊"}
                {app.icon === "play_circle" && "▶️"}
                {app.icon === "article" && "📄"}
                {app.icon === "forum" && "💬"}
                {![
                  "folder", "settings", "globe", "message", "mail", "map", "photo",
                  "calendar", "note", "sparkles", "picture_as_pdf", "edit_note",
                  "check_circle", "code", "bag", "monitoring", "play_circle", "article", "forum"
                ].includes(app.icon) && app.name[0]}
              </>
            )}
          </span>

          {/* Border shine on hover */}
          <div className="absolute inset-0 border border-white/20 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => setIsDockHovered(false)}
      >
        <div className="bg-slate-900/35 backdrop-blur-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] px-4 py-2.5 rounded-[22px] flex items-end gap-3.5 pointer-events-auto transition-all duration-300">
          
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

