import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import { getAppById, APP_REGISTRY } from "../appRegistry";

const MenuBar = () => {
  const [date, setDate] = useState(new Date());
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [appContextMenu, setAppContextMenu] = useState(null);

  const { pinnedApps, toggleAppPinned } = useSystemStore();
  const { activeWindowId, openWindow, windows, toggleMinimize, focusWindow } =
    useWindowStore();

  // Resolve active app
  let activeApp = null;
  if (activeWindowId) {
    activeApp = getAppById(activeWindowId);
  } else if (!activeWindowId && windows.length > 0) {
    // If no window is active (e.g. all minimized), show the last one opened/focused
    activeApp = getAppById(windows[windows.length - 1].id);
  }

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close app launcher when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setShowAppLauncher(false);
      setAppContextMenu(null);
    };
    if (showAppLauncher || appContextMenu) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [showAppLauncher, appContextMenu]);

  // Format: "Mon 2 Jan 3:20 PM"
  const formattedDate =
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) +
    " " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  const handleAppLaunch = (appId) => {
    const iconElement = document.getElementById(`app-launcher-${appId}`);
    const rect = iconElement?.getBoundingClientRect();
    const safeRect = rect
      ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
      : null;
    openWindow(appId, safeRect);
    setShowAppLauncher(false);
    setAppContextMenu(null);
  };

  const handleAppContextMenu = (e, appId) => {
    e.preventDefault();
    e.stopPropagation();
    setAppContextMenu({
      x: e.clientX,
      y: e.clientY,
      appId: appId,
    });
  };

  const handleTogglePin = (appId) => {
    toggleAppPinned(appId);
    setAppContextMenu(null);
  };

  // Get all apps from registry
  const allApps = Object.values(APP_REGISTRY);

  const handlePinnedIconClick = (appId) => {
    const isRunning = windows.some((w) => w.id === appId);
    if (isRunning) {
      const window = windows.find((w) => w.id === appId);
      if (activeWindowId === appId) {
        toggleMinimize(appId);
      } else {
        if (window.isMinimized) {
          toggleMinimize(appId);
        } else {
          focusWindow(appId);
        }
      }
    } else {
      openWindow(appId);
    }
  };

  return (
    <div className="fixed top-0 w-full h-8 bg-slate-900/10 backdrop-blur-md flex items-center justify-between text-cyan-50 text-sm select-none z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-white/5">
      {/* Left Side: App Launcher Icon + Active App Name */}
      <div className="flex items-center gap-3 pl-2">
        {/* App Launcher Icon */}
        <div
          className="relative hover:bg-white/10 p-1.5 rounded cursor-pointer transition-all"
          onClick={(e) => {
            e.stopPropagation();
            setShowAppLauncher(!showAppLauncher);
          }}
        >
          {/* Grid Icon for App Launcher */}
          <svg
            className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
          </svg>
          {/* App Launcher Dropdown */}
          <AnimatePresence>
            {showAppLauncher && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-2xl border border-cyan-400/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs text-cyan-400/70 mb-3 font-semibold tracking-wider uppercase">
                  Applications
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {allApps.map((app) => {
                    const isRunning = windows.some((w) => w.id === app.id);
                    return (
                      <motion.div
                        key={app.id}
                        id={`app-launcher-${app.id}`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors relative group"
                        onClick={() => handleAppLaunch(app.id)}
                      >
                        {/* App Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl ${app.color} flex items-center justify-center text-white font-bold text-lg shadow-lg relative overflow-hidden`}
                        >
                          {/* Gloss Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

                          {/* Icon Content */}
                          <span className="relative z-10 drop-shadow-md text-2xl">
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
                            {[
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
                            ].includes(app.icon) || app.name[0]}
                          </span>
                        </div>

                        {/* App Name */}
                        <span className="text-[10px] text-cyan-50/80 text-center leading-tight max-w-full truncate">
                          {app.name}
                        </span>

                        {/* Running Indicator */}
                        {isRunning && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active App Icon */}
        {activeApp && (
          <div
            className="flex items-center gap-2 px-1 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer group"
            onClick={() => toggleMinimize(activeApp.id)}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs ${activeApp.color} shadow-sm relative overflow-hidden`}
            >
              {/* Gloss Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
              <span className="relative z-10 text-base">
                {activeApp.icon === "folder" && "📂"}
                {activeApp.icon === "bag" && "🛍️"}
                {activeApp.icon === "globe" && "🌐"}
                {activeApp.icon === "message" && "💬"}
                {activeApp.icon === "mail" && "✉️"}
                {activeApp.icon === "map" && "🗺️"}
                {activeApp.icon === "photo" && "🖼️"}
                {activeApp.icon === "calendar" && "📅"}
                {activeApp.icon === "note" && "📝"}
                {activeApp.icon === "settings" && "⚙️"}
                {activeApp.icon === "sparkles" && "✨"}
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
                ].includes(activeApp.icon) && activeApp.name[0]}
              </span>
            </div>
            {/* Window Preview Tooltip on hover */}
            <div className="absolute left-0 top-full mt-2 w-48 h-32 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[70] transform scale-0 group-hover:scale-100 origin-top-left">
              {/* Preview Container */}
              <div className="w-full h-full bg-slate-900/90 backdrop-blur-xl border border-cyan-400/30 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {/* Miniature Title Bar */}
                <div className="h-6 bg-slate-800/80 border-b border-cyan-400/10 flex items-center px-2 gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full ${activeApp.color} flex items-center justify-center text-[6px] text-white`}
                  >
                    {activeApp.icon === "folder" && "📂"}
                    {activeApp.icon === "settings" && "⚙️"}
                    {activeApp.icon === "globe" && "🌐"}
                    {activeApp.icon === "message" && "💬"}
                    {!["folder", "settings", "globe", "message"].includes(
                      activeApp.icon
                    ) && activeApp.name[0]}
                  </div>
                  <div className="text-[10px] text-cyan-50/70 font-medium truncate">
                    {activeApp.name}
                  </div>
                </div>

                {/* Preview Content Area */}
                <div className="flex-1 p-3 flex flex-col items-center justify-center gap-2 relative">
                  {/* Abstract preview content - matching app color */}
                  <div
                    className={`w-16 h-12 rounded-lg ${activeApp.color} opacity-20 blur-xl absolute`}
                  />
                  <div className="text-3xl drop-shadow-lg z-10">
                    {activeApp.icon === "folder" && "📂"}
                    {activeApp.icon === "bag" && "🛍️"}
                    {activeApp.icon === "globe" && "🌐"}
                    {activeApp.icon === "message" && "💬"}
                    {activeApp.icon === "mail" && "✉️"}
                    {activeApp.icon === "map" && "🗺️"}
                    {activeApp.icon === "photo" && "🖼️"}
                    {activeApp.icon === "calendar" && "📅"}
                    {activeApp.icon === "note" && "📝"}
                    {activeApp.icon === "settings" && "⚙️"}
                    {activeApp.icon === "sparkles" && "✨"}
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
                    ].includes(activeApp.icon) && activeApp.name[0]}
                  </div>
                  <div className="w-12 h-1 bg-cyan-400/20 rounded-full" />
                </div>

                {/* Bottom Accent */}
                <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Time, WiFi, Control Center, Battery, Notifications */}
      <div className="flex items-center gap-2 pr-2">
        {/* Date & Time */}
        <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-default font-medium">
          {formattedDate}
        </div>

        {/* WiFi Icon */}
        <div className="hover:bg-white/10 p-1.5 rounded cursor-default">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        </div>

        {/* Control Center Toggle */}
        <div className="hover:bg-white/10 p-1.5 rounded cursor-default">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </div>

        {/* Battery Icon */}
        <div className="hover:bg-white/10 p-1.5 rounded cursor-default">
          <svg
            className="w-5 h-3"
            viewBox="0 0 25 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.5"
              y="0.5"
              width="22"
              height="11"
              rx="2.5"
              stroke="currentColor"
            />
            <rect
              x="23"
              y="4"
              width="2"
              height="4"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="2"
              y="2"
              width="16"
              height="8"
              rx="1"
              fill="currentColor"
              className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
            />
          </svg>
        </div>

        {/* Notification Icon */}
        <div className="hover:bg-white/10 p-1.5 rounded cursor-default">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
