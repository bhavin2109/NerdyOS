/**
 * WorkspaceHUD - Workspace transition indicator
 * Shows visual feedback during workspace switches with spatial awareness
 */

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import useWorkspaceStore from "../store/workspaceStore";
import { SPRING_CONFIGS, ANIMATION_VARIANTS } from "../config/animationConfig";

/**
 * Mini workspace preview component
 */
const WorkspacePreview = memo(function WorkspacePreview({
  workspace,
  isActive,
  isCurrent,
  hasWindows,
}) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isCurrent ? 1.2 : 1,
        opacity: isCurrent ? 1 : 0.6,
      }}
      transition={SPRING_CONFIGS.snappy}
      className={clsx(
        "relative flex items-center justify-center",
        "rounded-lg transition-colors duration-200",
        isCurrent
          ? "bg-mauve/30 border-2 border-mauve shadow-lg shadow-mauve/20"
          : "bg-surface-0/50 border border-surface-1",
        isActive ? "w-16 h-12" : "w-12 h-9",
      )}
    >
      {/* Workspace number */}
      <span
        className={clsx(
          "font-bold transition-all",
          isCurrent ? "text-mauve text-lg" : "text-subtext text-sm",
        )}
      >
        {workspace.id === 10 ? "0" : workspace.id}
      </span>

      {/* Window indicator dots */}
      {hasWindows && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div
            className={clsx(
              "w-1 h-1 rounded-full",
              isCurrent ? "bg-mauve" : "bg-overlay-0",
            )}
          />
        </div>
      )}
    </motion.div>
  );
});

/**
 * Direction indicator arrow
 */
const DirectionArrow = memo(function DirectionArrow({ direction }) {
  if (!direction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "right" ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="text-mauve/50"
    >
      <svg
        className={clsx("w-6 h-6", direction === "left" && "rotate-180")}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </motion.div>
  );
});

/**
 * Main WorkspaceHUD component
 */
const WorkspaceHUD = memo(function WorkspaceHUD() {
  const {
    activeWorkspace,
    previousWorkspace,
    workspaces,
    isTransitioning,
    transitionDirection,
  } = useWorkspaceStore();

  const [showHUD, setShowHUD] = useState(false);
  const [hudTimeout, setHudTimeout] = useState(null);

  // Show HUD on workspace transition
  useEffect(() => {
    if (isTransitioning) {
      setShowHUD(true);

      // Clear existing timeout
      if (hudTimeout) {
        clearTimeout(hudTimeout);
      }

      // Hide after delay
      const timeout = setTimeout(() => {
        setShowHUD(false);
      }, 1200);

      setHudTimeout(timeout);
    }

    return () => {
      if (hudTimeout) {
        clearTimeout(hudTimeout);
      }
    };
  }, [isTransitioning, activeWorkspace]);

  return (
    <AnimatePresence>
      {showHUD && (
        <motion.div
          key="workspace-hud"
          variants={ANIMATION_VARIANTS.workspaceHUD}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={SPRING_CONFIGS.bouncy}
          className={clsx(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "z-[200] pointer-events-none",
            "flex items-center gap-4 px-6 py-4",
            "bg-base/90 backdrop-blur-xl",
            "rounded-2xl border border-surface-1",
            "shadow-2xl shadow-black/30",
          )}
        >
          {/* Previous workspace indicator */}
          {previousWorkspace !== activeWorkspace && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.5, x: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xs text-overlay-0">From</span>
              <div className="w-10 h-8 rounded-md bg-surface-0 flex items-center justify-center">
                <span className="text-sm text-subtext">
                  {previousWorkspace === 10 ? "0" : previousWorkspace}
                </span>
              </div>
            </motion.div>
          )}

          {/* Direction arrow */}
          <DirectionArrow direction={transitionDirection} />

          {/* Current workspace (large) */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={SPRING_CONFIGS.bouncy}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-mauve uppercase tracking-wider">
              Workspace
            </span>
            <div
              className={clsx(
                "w-20 h-16 rounded-xl",
                "bg-mauve/20 border-2 border-mauve",
                "flex items-center justify-center",
                "shadow-lg shadow-mauve/20",
              )}
            >
              <span className="text-4xl font-bold text-mauve">
                {activeWorkspace === 10 ? "0" : activeWorkspace}
              </span>
            </div>
          </motion.div>

          {/* Workspace row preview */}
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-surface-1">
            {workspaces.slice(0, 5).map((ws) => (
              <WorkspacePreview
                key={ws.id}
                workspace={ws}
                isActive={ws.id === activeWorkspace}
                isCurrent={ws.id === activeWorkspace}
                hasWindows={ws.hasWindows}
              />
            ))}
            {workspaces.length > 5 && (
              <span className="text-xs text-overlay-0">
                +{workspaces.length - 5}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default WorkspaceHUD;
