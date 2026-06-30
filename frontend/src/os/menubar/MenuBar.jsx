import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import { getAppById, APP_REGISTRY } from "../appRegistry";
import ControlPanel from "./ControlPanel";
import NotificationCenter from "./NotificationCenter";

const MenuBar = () => {
  const [date, setDate] = useState(new Date());
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [appContextMenu, setAppContextMenu] = useState(null);

  const {
    pinnedApps,
    toggleAppPinned,
    disabledApps,
    wifi,
    battery,
    notificationsEnabled,
    installedApps,
    isLaunchpadOpen,
    setLaunchpadOpen,
  } = useSystemStore();
  const { activeWindowId, openWindow, windows, toggleMinimize } =
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
      setActivePanel(null);
      setAppContextMenu(null);
    };
    if (showAppLauncher || appContextMenu || activePanel) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [showAppLauncher, appContextMenu, activePanel]);

  // Format: "Mon 2 Jan 3:20 PM"
  const formattedDate =
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) +
    " " +
    date.toLocaleTimeString("en-US", {
      minute: "2-digit",
    });

  const handleAppLaunch = (e, appId) => {
    e?.stopPropagation(); // Stop click from reaching parent togglers

    // Get button element for animation origin (optional but good for zoom effect)
    const iconElement = document.getElementById(`app-launcher-${appId}`);
    const rect = iconElement?.getBoundingClientRect();
    const safeRect = rect
      ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
      : null;

    openWindow(appId, {}, safeRect);

    // Explicitly close all menus
    setShowAppLauncher(false);
    setActivePanel(null);
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

  const togglePanel = (e, panelName) => {
    e.stopPropagation();
    if (activePanel === panelName) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName);
      setShowAppLauncher(false);
    }
  };

  // Get all apps from registry and filter by installedApps
  const allApps = Object.values(APP_REGISTRY).filter((app) =>
    installedApps.includes(app.id)
  );

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
    <div className="fixed top-0 w-full h-8 bg-slate-950/20 backdrop-blur-xl flex items-center justify-between text-cyan-50/90 text-xs select-none z-50 border-b border-white/5 pr-3 pl-3 shadow-[0_1px_10px_rgba(0,0,0,0.15)]">
      {/* Left Side: Logo + Launchpad + App Menu */}
      <div className="flex items-center gap-4">
        {/* Apple/Ghost Menu */}
        <div
          className="relative flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowAppLauncher(!showAppLauncher);
            setActivePanel(null);
          }}
        >
          <span className="text-base select-none leading-none pb-0.5">
            👻
          </span>

          {/* Logo Menu Dropdown */}
          <AnimatePresence>
            {showAppLauncher && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-[-8px] mt-2 w-52 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-2 z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => openWindow("settings")}>
                  About This Mac
                </div>
                <div className="border-t border-white/10 my-1"></div>
                <div className="px-3 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => openWindow("settings")}>
                  System Settings...
                </div>
                <div className="px-3 py-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => openWindow("store")}>
                  App Store...
                </div>
                <div className="border-t border-white/10 my-1"></div>
                <div className="px-3 py-1.5 hover:bg-[#ff453a]/20 hover:text-[#ff453a] rounded-lg cursor-pointer transition-colors font-medium" onClick={() => {
                  if (confirm("Restart NerdyOS?")) window.location.reload();
                }}>
                  Restart...
                </div>
                <div className="px-3 py-1.5 hover:bg-[#ff453a]/25 hover:text-[#ff453a] rounded-lg cursor-pointer transition-colors font-medium" onClick={() => {
                  if (confirm("Shut down NerdyOS?")) window.close();
                }}>
                  Shut Down...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Launchpad Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLaunchpadOpen(!isLaunchpadOpen);
          }}
          className={`flex items-center justify-center p-1 rounded hover:bg-white/15 text-white/80 hover:text-white transition-all ${
            isLaunchpadOpen ? "bg-white/15 text-white" : ""
          }`}
          title="Launchpad"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>

        {/* Active App Title + Standard menus */}
        <div className="flex items-center gap-3.5">
          <span className="font-semibold text-white tracking-wide">
            {activeApp ? activeApp.name : "Finder"}
          </span>
          <span className="opacity-30 select-none">|</span>
          <span className="hover:text-white cursor-pointer transition-colors opacity-75 hover:opacity-100">File</span>
          <span className="hover:text-white cursor-pointer transition-colors opacity-75 hover:opacity-100">Edit</span>
          <span className="hover:text-white cursor-pointer transition-colors opacity-75 hover:opacity-100">View</span>
          <span className="hover:text-white cursor-pointer transition-colors opacity-75 hover:opacity-100">Window</span>
          <span className="hover:text-white cursor-pointer transition-colors opacity-75 hover:opacity-100">Help</span>
        </div>
      </div>
      {/* Right Side: Separate Triggers */}
      <div className="flex items-center gap-2 pr-2">
        {/* Date: Opens Calendar */}
        <div
          className={`flex items-center hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors relative ${
            activePanel === "calendar" ? "bg-white/10" : ""
          }`}
          onClick={(e) => togglePanel(e, "calendar")}
        >
          <span className="font-medium text-[13px]">{formattedDate}</span>
          <AnimatePresence>
            {activePanel === "calendar" && (
              <NotificationCenter mode="calendar" />
            )}
          </AnimatePresence>
        </div>

        {/* Notifications: Opens Notifications Only */}
        <div
          className={`flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded cursor-pointer transition-colors relative ${
            activePanel === "notifications" ? "bg-white/10" : ""
          }`}
          onClick={(e) => togglePanel(e, "notifications")}
          title="Notifications"
        >
          <div
            className={`transition-opacity ${
              !notificationsEnabled ? "opacity-50" : ""
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={notificationsEnabled ? "currentColor" : "none"}
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
          <AnimatePresence>
            {activePanel === "notifications" && (
              <NotificationCenter mode="notifications" />
            )}
          </AnimatePresence>
        </div>

        {/* WiFi: Opens WiFi Detail Panel */}
        <div
          className={`flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded cursor-pointer transition-colors relative ${
            activePanel === "wifi" ? "bg-white/10" : ""
          }`}
          onClick={(e) => togglePanel(e, "wifi")}
          title="Network"
        >
          <div
            className={`transition-opacity ${
              wifi ? "opacity-100" : "opacity-50"
            }`}
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
          <AnimatePresence>
            {activePanel === "wifi" && <ControlPanel initialView="wifi" />}
          </AnimatePresence>
        </div>

        {/* Battery: Opens Main Control Panel */}
        <div
          className={`flex items-center justify-center hover:bg-white/10 px-1 py-1 rounded cursor-pointer transition-colors relative ${
            activePanel === "battery" ? "bg-white/10" : ""
          }`}
          onClick={(e) => togglePanel(e, "battery")}
          title={`Battery: ${battery.level}%`}
        >
          {/* Battery Body (Slightly smaller: w-7 h-3.5) */}
          <div className="relative w-[28px] h-[14px] border border-white/40 rounded-[3px] flex items-center bg-black/30 overflow-hidden">
            {/* Terminal Nub */}
            <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[6px] bg-white/40 rounded-r-[1px]" />

            {/* Fill Level */}
            <div
              className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                battery.charging
                  ? "bg-green-400 animate-[pulse_2s_ease-in-out_infinite]"
                  : battery.level <= 20
                  ? "bg-red-500"
                  : battery.level <= 40
                  ? "bg-yellow-400"
                  : "bg-white"
              }`}
              style={{ width: `${battery.level}%` }}
            />

            {/* Percentage Text (Inside, Centered, Blend Mode for contrast) */}
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold leading-none mix-blend-exclusion text-white z-10 pr-[1px]">
              {battery.level}
            </span>

            {/* Charging Bolt Overlay (Optional, enhances 'Charging' clarity if blink is subtle) */}
            {battery.charging && (
              <div className="absolute inset-0 flex items-center justify-center z-20 mix-blend-normal">
                {/* Using the blink as primary indicator as requested, text remains visible */}
              </div>
            )}
          </div>
          <AnimatePresence>
            {activePanel === "battery" && <ControlPanel />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
