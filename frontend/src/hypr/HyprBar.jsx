/**
 * HyprBar - Waybar-inspired Status Bar
 * Modular status bar for NerdyOS
 */

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import useWorkspaceStore from "../store/workspaceStore";
import useWindowStore from "../store/windowStore";
import useSystemStore from "../store/systemStore";
import useConfigStore from "../store/configStore";

// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACE MODULE (Smart Lazy-Loaded Workspaces)
// ═══════════════════════════════════════════════════════════════════════════════

const WorkspaceModule = memo(function WorkspaceModule() {
  const {
    activeWorkspace,
    workspaces,
    maxWorkspaces,
    switchTo,
    createWorkspace,
    getNextAvailableId,
  } = useWorkspaceStore();
  const windows = useWindowStore((state) => state.windows);

  // Get workspaces that have windows
  const occupiedWorkspaces = new Set(windows.map((w) => w.workspace || 1));

  // Calculate if we can add more workspaces
  const canAddWorkspace = workspaces.length < maxWorkspaces;
  const nextId = getNextAvailableId();

  // Handle creating and switching to new workspace
  const handleAddWorkspace = () => {
    if (!canAddWorkspace || !nextId) return;

    const created = createWorkspace(nextId);
    if (created) {
      switchTo(nextId, { explicit: true });
    }
  };

  return (
    <div className="flex items-center gap-1 px-2">
      {/* Existing workspaces */}
      {workspaces.map((workspace) => {
        const num = workspace.id;
        const isActive = activeWorkspace === num;
        const hasWindows = occupiedWorkspaces.has(num);

        return (
          <motion.button
            key={num}
            onClick={() => switchTo(num, { explicit: true })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "w-6 h-6 rounded-md text-xs font-medium transition-all duration-150",
              "flex items-center justify-center",
              isActive
                ? "bg-mauve text-crust"
                : hasWindows
                  ? "bg-surface-1 text-text hover:bg-surface-2"
                  : "text-overlay-0 hover:text-subtext hover:bg-surface-0",
            )}
          >
            {num === 10 ? "0" : num}
          </motion.button>
        );
      })}

      {/* Add workspace button */}
      {canAddWorkspace && (
        <motion.button
          onClick={handleAddWorkspace}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            "w-6 h-6 rounded-md text-xs font-medium transition-all duration-150",
            "flex items-center justify-center",
            "text-overlay-0 hover:text-mauve hover:bg-surface-0",
            "border border-dashed border-surface-1 hover:border-mauve/50",
          )}
          title={`Add Workspace ${nextId}`}
        >
          +
        </motion.button>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// WINDOW TITLE MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const WindowTitleModule = memo(function WindowTitleModule() {
  const { activeWindowId, windows } = useWindowStore();

  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const title = activeWindow?.title || "";

  return (
    <div className="px-3 text-sm text-subtext truncate max-w-[300px]">
      {title}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// CLOCK MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const ClockModule = memo(function ClockModule() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 px-3 text-sm">
      <span className="text-text font-medium">{formattedTime}</span>
      <span className="text-subtext">{formattedDate}</span>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const NetworkModule = memo(function NetworkModule() {
  const { wifi } = useSystemStore();

  return (
    <div
      className={clsx(
        "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
        "hover:bg-surface-1 cursor-pointer",
        wifi ? "text-green" : "text-overlay-0",
      )}
      title={wifi ? "Connected" : "Disconnected"}
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
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const AudioModule = memo(function AudioModule() {
  const { volume, setVolume } = useSystemStore();
  const [showSlider, setShowSlider] = useState(false);

  const isMuted = volume === 0;

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setVolume(Math.max(0, Math.min(100, volume + delta)));
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <div
        className={clsx(
          "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
          "hover:bg-surface-1 cursor-pointer",
          isMuted ? "text-overlay-0" : "text-text",
        )}
        onWheel={handleWheel}
        onClick={() => setVolume(isMuted ? 50 : 0)}
        title={`Volume: ${volume}%`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMuted ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          ) : volume < 50 ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-4.586-3H4a1 1 0 01-1-1v-4a1 1 0 011-1h3.414l4-4a1 1 0 011.707.707v11.586a1 1 0 01-1.707.707l-4-4z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          )}
        </svg>
      </div>

      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 80 }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden"
          >
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-surface-1 rounded-full appearance-none cursor-pointer accent-mauve"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// BATTERY MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const BatteryModule = memo(function BatteryModule() {
  const { battery } = useSystemStore();

  const level = battery?.level ?? 100;
  const charging = battery?.charging ?? false;

  const getColor = () => {
    if (charging) return "text-green";
    if (level <= 20) return "text-red";
    if (level <= 40) return "text-yellow";
    return "text-text";
  };

  return (
    <div
      className={clsx("flex items-center gap-1 px-2 text-sm", getColor())}
      title={`Battery: ${level}%${charging ? " (Charging)" : ""}`}
    >
      <div className="relative w-6 h-3 border border-current rounded-sm">
        <div
          className="absolute inset-0.5 bg-current rounded-sm transition-all"
          style={{ width: `${level}%` }}
        />
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-current rounded-r-sm" />
      </div>
      <span className="text-xs font-medium">{level}%</span>
      {charging && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// POWER BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

const PowerButton = memo(function PowerButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("nerdyos:powermenu"));
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={clsx(
        "flex items-center justify-center w-8 h-8 rounded-md",
        "text-red hover:bg-red/20 transition-colors",
      )}
      title="Power Menu"
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
          d="M12 4v4m0 0a8 8 0 100 16 8 8 0 000-16z"
        />
      </svg>
    </motion.button>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// CPU MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const CpuModule = memo(function CpuModule() {
  const [cpuUsage, setCpuUsage] = useState(0);

  // Simulated CPU usage (in real world, would use performance APIs)
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 10);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center gap-1 px-2 text-sm text-subtext"
      title={`CPU: ${cpuUsage}%`}
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
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
      <span className="text-xs">{cpuUsage}%</span>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const MemoryModule = memo(function MemoryModule() {
  const [memUsage, setMemUsage] = useState(0);

  useEffect(() => {
    // Try to use performance.memory if available (Chrome only)
    const updateMemory = () => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.jsHeapSizeLimit;
        setMemUsage(Math.floor((used / total) * 100));
      } else {
        // Simulated
        setMemUsage(Math.floor(Math.random() * 40) + 30);
      }
    };

    updateMemory();
    const timer = setInterval(updateMemory, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center gap-1 px-2 text-sm text-subtext"
      title={`Memory: ${memUsage}%`}
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
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
        />
      </svg>
      <span className="text-xs">{memUsage}%</span>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRAY MODULE (Placeholder)
// ═══════════════════════════════════════════════════════════════════════════════

const TrayModule = memo(function TrayModule() {
  return (
    <div className="flex items-center gap-1 px-1">
      {/* Placeholder tray icons */}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HYPRBAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const HyprBar = memo(function HyprBar() {
  const bar = useConfigStore((state) => state.bar);

  if (!bar?.enabled) return null;

  const height = bar?.height || 32;

  return (
    <div
      className={clsx(
        "fixed left-0 right-0 z-50",
        "flex items-center justify-between",
        "bg-base/90 backdrop-blur-md",
        "border-b border-surface-0",
        "select-none",
        bar?.position === "bottom" ? "bottom-0" : "top-0",
      )}
      style={{ height: `${height}px` }}
    >
      {/* Left Section */}
      <div className="flex items-center h-full">
        <WorkspaceModule />
        <div className="w-px h-4 bg-surface-1 mx-2" />
        <WindowTitleModule />
      </div>

      {/* Center Section */}
      <div className="flex items-center h-full absolute left-1/2 -translate-x-1/2">
        <ClockModule />
      </div>

      {/* Right Section */}
      <div className="flex items-center h-full gap-1 pr-2">
        <TrayModule />
        <CpuModule />
        <MemoryModule />
        <div className="w-px h-4 bg-surface-1 mx-1" />
        <NetworkModule />
        <AudioModule />
        <BatteryModule />
        <div className="w-px h-4 bg-surface-1 mx-1" />
        <PowerButton />
      </div>
    </div>
  );
});

export default HyprBar;
