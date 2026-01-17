/**
 * HyprPowerMenu - Wlogout-style Power Menu
 * Full-screen power options overlay
 */

import { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

/**
 * Power menu options
 */
const powerOptions = [
  {
    id: "lock",
    label: "Lock",
    icon: "🔒",
    color: "blue",
    action: "lock",
    description: "Lock the screen",
  },
  {
    id: "logout",
    label: "Logout",
    icon: "🚪",
    color: "yellow",
    action: "logout",
    description: "End session",
  },
  {
    id: "suspend",
    label: "Suspend",
    icon: "💤",
    color: "teal",
    action: "suspend",
    description: "Sleep mode",
  },
  {
    id: "reboot",
    label: "Reboot",
    icon: "🔄",
    color: "peach",
    action: "reboot",
    description: "Restart system",
  },
  {
    id: "shutdown",
    label: "Shutdown",
    icon: "⏻",
    color: "red",
    action: "shutdown",
    description: "Power off",
  },
];

/**
 * Color to Tailwind class mapping
 */
const colorClasses = {
  blue: "bg-blue/20 text-blue border-blue hover:bg-blue/30",
  yellow: "bg-yellow/20 text-yellow border-yellow hover:bg-yellow/30",
  teal: "bg-teal/20 text-teal border-teal hover:bg-teal/30",
  peach: "bg-peach/20 text-peach border-peach hover:bg-peach/30",
  red: "bg-red/20 text-red border-red hover:bg-red/30",
};

/**
 * Power button component
 */
const PowerButton = memo(function PowerButton({ option, onClick, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(option)}
      className={clsx(
        "flex flex-col items-center justify-center gap-3 p-6",
        "w-32 h-32 rounded-2xl border-2 transition-all",
        colorClasses[option.color],
      )}
    >
      <span className="text-4xl">{option.icon}</span>
      <span className="font-medium">{option.label}</span>
    </motion.button>
  );
});

/**
 * Main HyprPowerMenu component
 */
const HyprPowerMenu = memo(function HyprPowerMenu({ isOpen, onClose }) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle power action
  const handleAction = (option) => {
    console.log(`[PowerMenu] Action: ${option.action}`);

    switch (option.action) {
      case "lock":
        // TODO: Implement lock screen
        alert("Lock screen would activate here");
        break;
      case "logout":
        // Clear session
        if (confirm("Are you sure you want to logout?")) {
          localStorage.clear();
          window.location.reload();
        }
        break;
      case "suspend":
        alert("Suspend is not available in browser environment");
        break;
      case "reboot":
        if (confirm("Are you sure you want to reboot?")) {
          localStorage.clear();
          window.location.reload();
        }
        break;
      case "shutdown":
        if (confirm("Are you sure you want to shutdown?")) {
          document.body.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #11111b;
              color: #cdd6f4;
              font-family: sans-serif;
              font-size: 24px;
            ">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⏻</div>
                <div>System has been shut down.</div>
                <div style="font-size: 14px; color: #6c7086; margin-top: 10px;">
                  Refresh the page to restart NerdyOS
                </div>
              </div>
            </div>
          `;
        }
        break;
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-crust/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Menu Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              "fixed inset-0 z-[301]",
              "flex flex-col items-center justify-center gap-8",
              "pointer-events-none",
            )}
          >
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-light text-text"
            >
              Power Menu
            </motion.h1>

            {/* Options Grid */}
            <div className="flex gap-4 pointer-events-auto">
              {powerOptions.map((option, index) => (
                <PowerButton
                  key={option.id}
                  option={option}
                  onClick={handleAction}
                  index={index}
                />
              ))}
            </div>

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-overlay-0"
            >
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-surface-0 rounded text-subtext">
                Esc
              </kbd>{" "}
              to cancel
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default HyprPowerMenu;
