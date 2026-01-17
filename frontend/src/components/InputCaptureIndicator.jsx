/**
 * InputCaptureIndicator - Visual indicator for OS mode state
 * Shows when NerdyOS is capturing input with escape hint
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import useInputCaptureStore from "../store/inputCaptureStore";

const InputCaptureIndicator = memo(function InputCaptureIndicator() {
  const osMode = useInputCaptureStore((state) => state.osMode);
  const isActive = osMode === "ACTIVE";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className={clsx(
            "fixed bottom-4 right-4 z-[9999]",
            "flex items-center gap-3 px-4 py-2.5 rounded-full",
            "bg-base/80 backdrop-blur-lg",
            "border border-mauve/40",
            "shadow-lg shadow-mauve/10",
            "select-none pointer-events-auto",
            "group",
          )}
        >
          {/* Pulse indicator */}
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green animate-ping opacity-75" />
          </div>

          {/* Status text */}
          <span className="text-sm font-medium text-text/90">
            OS Mode Active
          </span>

          {/* Escape hint - visible on hover */}
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 0.7, width: "auto" }}
            className="text-xs text-subtext overflow-hidden whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-0/50">
              <kbd className="text-[10px] px-1 py-0.5 rounded bg-surface-1 text-text font-mono">
                Win
              </kbd>
              <span>+</span>
              <kbd className="text-[10px] px-1 py-0.5 rounded bg-surface-1 text-text font-mono">
                R
              </kbd>
              <span className="ml-1">to exit</span>
            </span>
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default InputCaptureIndicator;
