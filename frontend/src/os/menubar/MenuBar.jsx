import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import { getAppById, APP_REGISTRY } from "../appRegistry";
import ControlPanel from "./ControlPanel";
import CalendarWidget from "./CalendarWidget";

const MenuBar = () => {
  const [date, setDate] = useState(new Date());
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [appContextMenu, setAppContextMenu] = useState(null);

  const {
    pinnedApps,
    toggleAppPinned,
    disabledApps,
    wifi,
    battery,
    notificationsEnabled,
  } = useSystemStore();
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
      setShowControlPanel(false);
      setShowCalendar(false);
      setAppContextMenu(null);
    };
    if (showAppLauncher || appContextMenu || showControlPanel || showCalendar) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [showAppLauncher, appContextMenu, showControlPanel, showCalendar]);

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
    setShowControlPanel(false);
    setShowCalendar(false);
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

  // Helper to check if app is disabled
  const isAppDisabled = (id) => disabledApps.includes(id);

  // Compute displayed apps for Taskbar: Pinned + Running
  const runningAppIds = windows.map((w) => w.id);
  const validPinnedApps = pinnedApps.filter((id) => !isAppDisabled(id));
  const runningUnpinnedApps = runningAppIds.filter(
    (id) => !pinnedApps.includes(id) && !isAppDisabled(id)
  );
  const taskbarAppIds = [...validPinnedApps, ...runningUnpinnedApps];

  return (
    <div className="fixed top-0 w-full h-10 bg-slate-900/80 backdrop-blur-md flex items-center justify-between text-cyan-50 text-sm select-none z-50 shadow-md border-b border-white/5 pr-2">
      {/* Left Side: App Launcher + Taskbar Apps */}
      <div className="flex items-center gap-0">
        {/* App Launcher Icon */}
        <div
          className="relative w-10 h-10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all group"
          onClick={(e) => {
            e.stopPropagation();
            setShowAppLauncher(!showAppLauncher);
          }}
        >
          {/* Custom OS Icon: Smiling Ghost Emoji */}
          <span className="text-2xl transition-transform group-hover:scale-110 leading-none pb-1">
            👻
          </span>
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
                        onContextMenu={(e) => handleAppContextMenu(e, app.id)}
                      >
                        {/* App Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl ${app.color} flex items-center justify-center text-white font-bold text-lg shadow-lg relative overflow-hidden`}
                        >
                          {/* Gloss Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

                          {/* Icon Content */}
                          <span className="relative z-10 drop-shadow-md text-2xl">
                            {app.icon && app.icon.length < 3 ? (
                              app.icon
                            ) : (
                              <>
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
                              </>
                            )}
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

          {/* App Launcher Context Menu */}
          {appContextMenu && (
            <div
              className="fixed bg-slate-900/95 backdrop-blur-xl border border-cyan-400/30 shadow-2xl rounded-xl py-1 w-40 text-sm text-cyan-50 z-[150]"
              style={{ top: appContextMenu.y, left: appContextMenu.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-2"
                onClick={() => handleTogglePin(appContextMenu.appId)}
              >
                {pinnedApps.includes(appContextMenu.appId) ? (
                  <>
                    <svg
                      className="w-4 h-4 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Unpin</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <span>Pin to Top Bar</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Taskbar Icons (Now next to launcher) */}
        <div className="flex items-center gap-2">
          {taskbarAppIds.map((appId) => {
            const registryItem = APP_REGISTRY[appId];
            if (!registryItem) return null;

            const app = {
              ...registryItem,
              color: registryItem.color || "bg-gray-500",
            };
            const isOpen = windows.some((w) => w.id === appId);
            const isActive = activeWindowId === appId;

            return (
              <div
                key={appId}
                className={`relative flex flex-col items-center group cursor-pointer p-1 rounded-lg transition-all ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onClick={() => {
                  if (isOpen) {
                    if (
                      isActive &&
                      !windows.find((w) => w.id === appId)?.isMinimized
                    ) {
                      toggleMinimize(appId);
                    } else {
                      openWindow(appId); // Brings to front if already open
                    }
                  } else {
                    openWindow(appId);
                  }
                }}
                onContextMenu={(e) => handleAppContextMenu(e, appId)}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center text-white text-sm shadow-md overflow-hidden relative`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
                  <span className="relative z-10">
                    {app.icon && app.icon.length < 3 ? (
                      app.icon
                    ) : (
                      <>
                        {app.icon === "folder" && "📂"}
                        {app.icon === "settings" && "⚙️"}
                        {app.icon === "globe" && "🌐"}
                        {app.icon === "message" && "💬"}
                        {!["folder", "settings", "globe", "message"].includes(
                          app.icon
                        ) && app.name[0]}
                      </>
                    )}
                  </span>
                </div>

                {/* Active/Open Dot Indicator */}
                {isOpen && (
                  <div
                    className={`absolute -bottom-1 w-1 h-1 rounded-full ${
                      isActive ? "bg-cyan-400" : "bg-white/50"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Right Side: Time, WiFi, Control Center, Battery, Notifications */}
      <div className="flex items-center gap-2 pr-2">
        {/* Date & Time */}
        <div
          className={`hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer font-medium transition-colors relative ${
            showCalendar ? "bg-white/10" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setShowCalendar(!showCalendar);
            setShowControlPanel(false);
            setShowAppLauncher(false);
          }}
        >
          {formattedDate}
          <AnimatePresence>
            {showCalendar && <CalendarWidget />}
          </AnimatePresence>
        </div>

        {/* WiFi Icon */}
        <div
          className={`hover:bg-white/10 p-1.5 rounded cursor-default transition-opacity ${
            wifi ? "opacity-100" : "opacity-50"
          }`}
          title={
            wifi ? "Wi-Fi: Connected (Online)" : "Wi-Fi: Disconnected (Offline)"
          }
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {wifi ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3l18 18M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                className="opacity-50"
              />
            )}
          </svg>
        </div>

        {/* Control Center Toggle */}
        <div
          className={`hover:bg-white/10 p-1.5 rounded cursor-pointer transition-colors ${
            showControlPanel ? "bg-white/10" : ""
          } relative`}
          onClick={(e) => {
            e.stopPropagation();
            setShowControlPanel(!showControlPanel);
            setShowAppLauncher(false);
            setShowCalendar(false);
          }}
        >
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
          <AnimatePresence>
            {showControlPanel && <ControlPanel />}
          </AnimatePresence>
        </div>

        {/* Battery Icon */}
        <div
          className="hover:bg-white/10 px-2 py-0.5 rounded cursor-default flex items-center gap-2"
          title={`Battery: ${battery.level}% ${
            battery.charging ? "(Charging)" : ""
          }`}
        >
          <span className="text-xs font-medium tabular-nums">
            {battery.level}%
          </span>
          <div className="relative w-6 h-3 border border-current rounded-[2px] p-[1px] flex items-center">
            <div className="absolute -right-1 top-1 w-0.5 h-1.5 bg-current rounded-sm" />
            <div
              className={`h-full rounded-[1px] ${
                battery.level <= 20 && !battery.charging
                  ? "bg-red-500"
                  : "bg-current"
              } ${battery.charging ? "animate-pulse" : ""}`}
              style={{ width: `${battery.level}%` }}
            />
            {battery.charging && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-2 h-2 text-black fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 2L3 14H11V22L21 10H13V2Z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Notification Icon */}
        <div
          className={`hover:bg-white/10 p-1.5 rounded cursor-pointer ${
            !notificationsEnabled ? "opacity-50" : ""
          }`}
          title="Notifications"
        >
          <svg
            className="w-4 h-4"
            fill={notificationsEnabled ? "currentColor" : "none"} // Filled if enabled
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
