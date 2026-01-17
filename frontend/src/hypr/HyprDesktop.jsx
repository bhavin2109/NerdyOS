/**
 * HyprDesktop - Main Desktop Container
 * Manages workspace rendering and compositor integration
 * Includes input capture for deep keyboard/mouse integration
 */

import {
  memo,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

// Stores
import useWindowStore from "../store/windowStore";
import useWorkspaceStore from "../store/workspaceStore";
import useSystemStore from "../store/systemStore";
import useConfigStore from "../store/configStore";
import useInputCaptureStore from "../store/inputCaptureStore";

// Components
import HyprBar from "./HyprBar";
import HyprLauncher from "./HyprLauncher";
import HyprNotify from "./HyprNotify";
import HyprPowerMenu from "./HyprPowerMenu";
import HyprWindow from "../compositor/HyprWindow";
import InputCaptureIndicator from "../components/InputCaptureIndicator";
import WorkspaceHUD from "../components/WorkspaceHUD";

// Animation Config
import { getWorkspaceTransition } from "../config/animationConfig";

// Services
import {
  initializeKeybindManager,
  handleKeyDown as keybindHandleKeyDown,
} from "../services/keybindService";
import {
  initializeInputCapture,
  setKeybindHandler,
} from "../services/inputCaptureService";
import { getAppById } from "../os/appRegistry";
import { calculateLayout, LAYOUTS } from "../compositor/TilingEngine";

/**
 * Loading fallback for lazy apps
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full bg-base/50">
    <div className="flex items-center gap-2 text-subtext">
      <svg
        className="w-5 h-5 animate-spin"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Loading...
    </div>
  </div>
);

/**
 * Main HyprDesktop component
 */
const HyprDesktop = memo(function HyprDesktop() {
  // Ref for desktop container (for input capture)
  const desktopRef = useRef(null);

  // UI state
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);

  // Stores
  const {
    windows,
    activeWindowId,
    focusWindow,
    closeWindow,
    toggleMinimize,
    toggleMaximize,
  } = useWindowStore();
  const {
    activeWorkspace,
    transitionDirection,
    isTransitioning,
    specialWorkspaces,
  } = useWorkspaceStore();
  const { wallpaper } = useSystemStore();
  const { general, bar, decoration, dwindle, master } = useConfigStore();
  const osMode = useInputCaptureStore((state) => state.osMode);

  // Initialize keybind manager, config, and input capture
  useEffect(() => {
    // Initialize config store
    useConfigStore.getState().initialize();

    // Initialize keybind manager
    const cleanupKeybinds = initializeKeybindManager();

    // Initialize input capture service with desktop element and keybind handler
    const cleanupInputCapture = initializeInputCapture(
      desktopRef.current,
      keybindHandleKeyDown,
    );

    // Set keybind handler for input capture
    setKeybindHandler(keybindHandleKeyDown);

    return () => {
      cleanupKeybinds();
      cleanupInputCapture();
    };
  }, []);

  // Listen for system events (launcher, power menu)
  useEffect(() => {
    const handleLauncher = () => setIsLauncherOpen((prev) => !prev);
    const handlePowerMenu = () => setIsPowerMenuOpen((prev) => !prev);

    window.addEventListener("nerdyos:launcher", handleLauncher);
    window.addEventListener("nerdyos:powermenu", handlePowerMenu);

    return () => {
      window.removeEventListener("nerdyos:launcher", handleLauncher);
      window.removeEventListener("nerdyos:powermenu", handlePowerMenu);
    };
  }, []);

  // Filter windows for current workspace
  const workspaceWindows = useMemo(() => {
    return windows.filter(
      (w) => (w.workspace || 1) === activeWorkspace && !w.isMinimized,
    );
  }, [windows, activeWorkspace]);

  // Calculate tiled positions
  const tiledPositions = useMemo(() => {
    const barHeight = bar?.height || 32;
    const container = {
      x: 0,
      y: barHeight,
      width: typeof window !== "undefined" ? window.innerWidth : 1920,
      height:
        typeof window !== "undefined"
          ? window.innerHeight - barHeight
          : 1080 - barHeight,
    };

    const layout = general?.layout || LAYOUTS.DWINDLE;
    const options = {
      gaps_in: general?.gaps_in || 5,
      gaps_out: general?.gaps_out || 15,
      split_ratio: dwindle?.split_ratio || 0.5,
      mfact: master?.mfact || 0.55,
      orientation: master?.orientation || "left",
    };

    return calculateLayout(layout, workspaceWindows, container, options);
  }, [workspaceWindows, general, bar, dwindle, master]);

  // Workspace transition animation
  const workspaceVariants = {
    enter: (direction) => ({
      x: direction === "right" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === "right" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div
      ref={desktopRef}
      tabIndex={0}
      className="fixed inset-0 overflow-hidden bg-base outline-none"
      style={{
        backgroundImage: wallpaper ? `url('${wallpaper}')` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Wallpaper blur overlay */}
      {decoration?.blur && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            backdropFilter: `blur(${(decoration?.blur_size || 8) / 4}px)`,
            backgroundColor: "rgba(30, 30, 46, 0.3)",
          }}
        />
      )}

      {/* Status Bar */}
      <HyprBar />

      {/* Workspace Container */}
      <div
        className="absolute left-0 right-0 bottom-0 overflow-hidden"
        style={{
          top: `${bar?.height || 32}px`,
        }}
      >
        <AnimatePresence
          initial={false}
          custom={transitionDirection}
          mode="wait"
        >
          <motion.div
            key={activeWorkspace}
            custom={transitionDirection}
            {...getWorkspaceTransition(transitionDirection)}
            className="absolute inset-0"
          >
            {/* Windows */}
            <AnimatePresence>
              {workspaceWindows.map((win) => {
                const appConfig = getAppById(win.appId);
                if (!appConfig) return null;

                const AppComponent = appConfig.component;
                const tiledPos = tiledPositions[win.id];
                const isFloating = win.floating || false;

                return (
                  <HyprWindow
                    key={win.id}
                    id={win.id}
                    title={win.title || appConfig.name}
                    isActive={activeWindowId === win.id}
                    isTiled={!isFloating}
                    isFloating={isFloating}
                    isFullscreen={win.isFullscreen}
                    isMinimized={win.isMinimized}
                    isPseudo={win.isPseudo}
                    isPinned={win.isPinned}
                    tiledPosition={tiledPos}
                    floatingPosition={win.floatingPosition}
                    floatingSize={win.floatingSize}
                    onFocus={() => focusWindow(win.id)}
                    onClose={() => closeWindow(win.id)}
                    onMinimize={() => toggleMinimize(win.id)}
                    onMaximize={() => toggleMaximize(win.id)}
                    onFloat={() => {
                      // Toggle floating state
                      useWindowStore.getState().toggleFloating?.(win.id);
                    }}
                  >
                    <Suspense fallback={<LoadingFallback />}>
                      <AppComponent {...win.props} />
                    </Suspense>
                  </HyprWindow>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Special Workspace (Scratchpad) Overlay */}
      <AnimatePresence>
        {specialWorkspaces?.scratchpad?.visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="w-[80%] h-[80%] relative pointer-events-auto">
              {/* Placeholder for special workspace windows - typically 
                         we'd filter windows where workspace === 'special:scratchpad' */}
              <div className="absolute inset-0 border-2 border-mauve rounded-xl bg-base/90 overflow-hidden flex items-center justify-center">
                <span className="text-mauve/50 font-bold text-xl">
                  Special Workspace (Scratchpad)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace HUD */}
      <WorkspaceHUD />

      {/* App Launcher */}
      <HyprLauncher
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
      />

      {/* Power Menu */}
      <HyprPowerMenu
        isOpen={isPowerMenuOpen}
        onClose={() => setIsPowerMenuOpen(false)}
      />

      {/* Notifications */}
      <HyprNotify />

      {/* Input Capture Indicator */}
      <InputCaptureIndicator />
    </div>
  );
});

export default HyprDesktop;
