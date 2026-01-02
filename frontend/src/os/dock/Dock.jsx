import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import useWindowStore from "../../store/windowStore";
import useSystemStore from "../../store/systemStore";
import { APP_REGISTRY } from "../appRegistry";

// Define Dock Items (IDs must match registry)
const DOCK_ITEMS = [
  { id: "finder", color: "bg-blue-500" },
  { id: "store", color: "bg-blue-600" },
  { id: "safari", color: "bg-blue-400" },
  { id: "messages", color: "bg-green-500" },
  { id: "mail", color: "bg-blue-600" },
  { id: "maps", color: "bg-green-400" },
  { id: "photos", color: "bg-purple-500" },
  { id: "calendar", color: "bg-red-500" },
  { id: "notes", color: "bg-yellow-400" },
  { id: "settings", color: "bg-gray-600" },
  { id: "ai", color: "bg-gradient-to-r from-violet-500 to-fuchsia-500" },
];

const Dock = () => {
  const [hoveredApp, setHoveredApp] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { appId, x, y }
  const [gestureState, setGestureState] = useState(null); // { appId, startY, currentY, status: 'holding'|'dragging' }
  const [bouncingAppId, setBouncingAppId] = useState(null); // ID of app currently bouncing

  const { windows, openWindow, activeWindowId, toggleMinimize, closeWindow } =
    useWindowStore();
  const { disabledApps, dockMode } = useSystemStore();

  const [isHovered, setIsHovered] = useState(false);

  // Check if any window is fullscreen
  const isAnyFullscreen = windows.some((w) => w.isFullscreen);

  // Determine visibility
  // Rule 1: Fullscreen -> Always Hidden
  // Rule 2: 'hidden' mode -> Always Hidden
  // Rule 3: 'auto' mode -> Hidden unless hovered
  // Rule 4: 'always' mode -> Visible
  let isVisible = false;

  if (isAnyFullscreen) {
    isVisible = false;
  } else if (dockMode === "hidden") {
    isVisible = false;
  } else if (dockMode === "auto") {
    isVisible = isHovered;
  } else {
    // 'always'
    isVisible = true;
  }

  // Close context menu on global click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // --- Gesture Handling ---
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (gestureState) {
        setGestureState((prev) => ({
          ...prev,
          currentY: e.clientY,
          status: prev.startY - e.clientY > 30 ? "dragging" : "holding",
        }));
      }
    };

    const handlePointerUp = (e) => {
      if (gestureState) {
        // Check triggers
        const dragDist = gestureState.startY - e.clientY;
        if (dragDist > 100) {
          // Trigger Quit
          closeWindow(gestureState.appId);
        } else if (dragDist < 10 && gestureState.status !== "dragging") {
          // Treat as Click if minimal movement
          const rect = document
            .getElementById(`dock-icon-${gestureState.appId}`)
            ?.getBoundingClientRect();
          handleAppClick(gestureState.appId, rect);
        }

        setGestureState(null);
      }
    };

    if (gestureState) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [gestureState, closeWindow]);

  const handleAppClick = (appId, rect) => {
    // 1. Trigger Bounce
    setBouncingAppId(appId);
    setTimeout(() => setBouncingAppId(null), 1500); // Bounce for a bit

    const isOpen = windows.find((w) => w.id === appId);
    const isActive = activeWindowId === appId;

    if (isOpen && isActive && !isOpen.isMinimized) {
      // Minimize if already active and open
      toggleMinimize(appId);
    } else {
      // Open / Restore
      const safeRect = rect
        ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
        : null;
      openWindow(appId, safeRect);
    }
  };

  const handlePointerDown = (e, appId) => {
    // Start Gesture tracking only with left click (or touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;

    e.preventDefault();
    setGestureState({
      appId,
      startY: e.clientY,
      currentY: e.clientY,
      status: "holding",
    });
  };

  const handleContextMenu = (e, appId) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      appId,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleQuit = (appId) => {
    closeWindow(appId);
    setContextMenu(null);
  };

  // Helper to check if app is disabled
  const isAppDisabled = (id) => disabledApps.includes(id);

  return (
    <>
      {/* Hover Detection Zone (Bottom Edge) - Only active if needed */}
      {!isAnyFullscreen && dockMode === "auto" && (
        <div
          className="fixed bottom-0 left-0 right-0 h-5 z-[40]" // 20px height, behind Dock (z-50) but above windows
          onMouseEnter={() => setIsHovered(true)}
        />
      )}

      {/* Gesture Overlay (Visual Hint) */}
      <AnimatePresence>
        {gestureState && gestureState.status === "dragging" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 flex flex-col items-center justify-end pb-32 pointer-events-none"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-full text-red-500 font-bold shadow-2xl border border-red-200"
            >
              Release to Close App
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-0 left-1/2 z-50 pb-4" // Use padding instead of bottom offset to capture mouse in gap
        initial={{ x: "-50%", y: 150 }}
        animate={{
          x: "-50%",
          y: isVisible ? 0 : 200,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        onMouseLeave={() => {
          if (dockMode === "auto") setIsHovered(false);
        }}
        onMouseEnter={() => {
          if (dockMode === "auto") setIsHovered(true);
        }}
        // Removed style={{ transform: "translateX(-50%)" }} as it conflicts with Framer Motion 'x' prop
      >
        <div className="flex items-end gap-3 px-4 py-3 bg-slate-900/40 backdrop-blur-3xl border border-cyan-400/20 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-200 min-h-[68px]">
          {/* Glossy Reflection overlay */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-50" />

          {DOCK_ITEMS.map((dockItem) => {
            if (isAppDisabled(dockItem.id)) return null;

            const registryItem = APP_REGISTRY[dockItem.id];
            if (!registryItem) return null;

            // Merge config
            const app = {
              ...registryItem,
              color: dockItem.color || registryItem.color || "bg-gray-500",
            };

            const isGestureActive = gestureState?.appId === app.id;
            const dragOffset = isGestureActive
              ? Math.min(0, gestureState.currentY - gestureState.startY)
              : 0;
            const isBouncing = bouncingAppId === app.id;

            return (
              <DockItem
                key={app.id}
                app={app}
                isHovered={hoveredApp === app.id}
                setHoveredApp={setHoveredApp}
                onPointerDown={(e) => handlePointerDown(e, app.id)}
                onContextMenu={(e) => handleContextMenu(e, app.id)}
                isOpen={windows.some((w) => w.id === app.id)}
                dragOffset={dragOffset}
                isBouncing={isBouncing}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Dock Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-lg py-1 w-32 text-sm text-gray-800 z-[60] origin-bottom -translate-x-1/2 -translate-y-full"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {windows.some((w) => w.id === contextMenu.appId) ? (
            <div
              className="px-4 py-1.5 hover:bg-blue-500 hover:text-white cursor-pointer font-medium"
              onClick={() => handleQuit(contextMenu.appId)}
            >
              Quit
            </div>
          ) : (
            <div
              className="px-4 py-1.5 hover:bg-blue-500 hover:text-white cursor-pointer font-medium"
              onClick={() => {
                const rect = document
                  .getElementById(`dock-icon-${contextMenu.appId}`)
                  ?.getBoundingClientRect();
                openWindow(contextMenu.appId, rect);
                setContextMenu(null);
              }}
            >
              Open
            </div>
          )}
        </div>
      )}
    </>
  );
};

const DockItem = ({
  app,
  isHovered,
  setHoveredApp,
  onPointerDown,
  onContextMenu,
  isOpen,
  dragOffset,
  isBouncing,
}) => {
  return (
    <div
      className="relative flex flex-col items-center gap-1 group"
      onContextMenu={onContextMenu}
    >
      {/* Tooltip */}
      {isHovered && dragOffset === 0 && (
        <div className="absolute -top-10 px-3 py-1 bg-gray-800/80 backdrop-blur-md text-white text-xs rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in duration-200">
          {app.name}
        </div>
      )}

      {/* Icon Container with Bounce Animation */}
      <motion.div
        animate={
          isBouncing ? { y: [0, -20, 0, -10, 0] } : { y: dragOffset || 0 }
        }
        transition={
          isBouncing
            ? { duration: 1.5, ease: "easeInOut", repeat: Infinity }
            : { type: "spring" }
        }
      >
        <motion.div
          id={`dock-icon-${app.id}`}
          className={`w-12 h-12 rounded-xl shadow-lg cursor-pointer ${app.color} flex items-center justify-center text-white font-bold text-lg select-none relative overflow-hidden`}
          whileHover={{ scale: 1.2, y: -5 }} // Subtle pop on hover
          whileTap={{ scale: 0.9 }}
          onHoverStart={() => setHoveredApp(app.id)}
          onHoverEnd={() => setHoveredApp(null)}
          onPointerDown={onPointerDown}
        >
          {/* Gloss Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

          {/* Icon Content */}
          <span className="relative z-10 drop-shadow-md">
            {/* Fallback symbols if image icons aren't available */}
            {app.icon === "folder" && "📂"}
            {app.icon === "bag" && "🛍️"}
            {app.icon === "globe" && "🌐"}
            {app.icon === "message" && "💬"}
            {app.icon === "mail" && "✉️"}
            {app.icon === "map" && "🗺️"}
            {app.icon === "photo" && "🖼️"}
            {app.icon === "calendar" && "📅"}
            {app.icon === "note" && "📝"}
            {app.icon === "settings" && "⚙️"}
            {app.icon === "sparkles" && "✨"}
            {![
              "folder",
              "bag",
              "globe",
              "message",
              "mail",
              "map",
              "photo",
              "calendar",
              "note",
              "settings",
              "sparkles",
            ].includes(app.icon) && app.name[0]}
          </span>
        </motion.div>
      </motion.div>

      {/* Active Dot */}
      <div
        className={`w-1 h-1 bg-black/80 rounded-full transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      ></div>
    </div>
  );
};

export default Dock;
