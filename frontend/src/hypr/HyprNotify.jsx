/**
 * HyprNotify - Dunst-style Notification Daemon
 * Stacked notifications with urgency levels
 */

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import useNotificationStore from "../store/notificationStore";

/**
 * Urgency level styles
 */
const urgencyStyles = {
  low: {
    border: "border-blue",
    icon: "💡",
  },
  normal: {
    border: "border-mauve",
    icon: "🔔",
  },
  critical: {
    border: "border-red",
    icon: "⚠️",
    bg: "bg-red/10",
  },
};

/**
 * Single notification component
 */
const NotificationItem = memo(function NotificationItem({
  id,
  title,
  message,
  icon,
  urgency = "normal",
  timeout = 5000,
  actions,
  onDismiss,
}) {
  const styles = urgencyStyles[urgency] || urgencyStyles.normal;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={clsx(
        "w-80 rounded-lg overflow-hidden pointer-events-auto",
        "bg-base/95 backdrop-blur-lg",
        "border-l-4",
        styles.border,
        styles.bg,
        "shadow-xl shadow-crust/30",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        {/* Icon */}
        <div
          className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            "bg-surface-0 text-xl",
          )}
        >
          {icon || styles.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text text-sm truncate">{title}</h4>
          <p className="text-subtext text-xs mt-0.5 line-clamp-2 break-words">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(id)}
          className={clsx(
            "text-overlay-0 hover:text-text transition-colors",
            "-mt-1 -mr-1 p-1 rounded-md hover:bg-surface-0",
          )}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex gap-2 px-3 pb-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.callback?.();
                onDismiss(id);
              }}
              className={clsx(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                index === 0
                  ? "bg-mauve text-crust hover:brightness-110"
                  : "bg-surface-0 text-text hover:bg-surface-1",
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar for timeout */}
      {timeout > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: timeout / 1000, ease: "linear" }}
          className="h-0.5 bg-mauve/50"
        />
      )}
    </motion.div>
  );
});

/**
 * Main HyprNotify component (notification container)
 */
const HyprNotify = memo(function HyprNotify() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div
      className={clsx(
        "fixed top-12 right-4 z-[9999]",
        "flex flex-col gap-3",
        "pointer-events-none",
      )}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            {...notif}
            onDismiss={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

export default HyprNotify;
