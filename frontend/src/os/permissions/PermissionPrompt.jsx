import React from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const PermissionPrompt = ({
  isOpen,
  appName,
  permissionType,
  icon,
  onAllow,
  onDeny,
}) => {
  if (!isOpen) return null;

  // Format permission type for display (e.g., "filesystem" -> "File System")
  const formatPermission = (type) => {
    switch (type) {
      case "filesystem":
        return "Files and Folders";
      case "notifications":
        return "Notifications";
      case "network":
        return "Network";
      case "camera":
        return "Camera";
      case "microphone":
        return "Microphone";
      default:
        return type;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-80 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-4xl overflow-hidden">
                {icon || "🔒"}
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  "{appName}" Would Like to Access Your{" "}
                  {formatPermission(permissionType)}
                </h3>
                <p className="text-xs text-gray-500">
                  This allows the app to store data and user settings on your{" "}
                  {permissionType === "filesystem" ? "virtual drive" : "system"}
                  .
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button
                  onClick={onDeny}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Don't Allow
                </button>
                <button
                  onClick={onAllow}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  Allow
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PermissionPrompt;
