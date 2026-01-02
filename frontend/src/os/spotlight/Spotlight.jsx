import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import APP_REGISTRY from "../appRegistry";
import useWindowStore from "../../store/windowStore";
import clsx from "clsx";

const Spotlight = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { openWindow, activeWindowId, toggleMinimize, windows } =
    useWindowStore();

  const allApps = useMemo(() => Object.values(APP_REGISTRY), []);

  const filteredApps = useMemo(() => {
    if (!searchTerm) return [];
    return allApps.filter((app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allApps]);

  // Reset selection when search changes or opens
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm(""); // Clear on close
    }
  }, [isOpen]);

  const handleLaunchApp = (app) => {
    if (!app) return;

    // Check if app is supported (has component)
    if (!app.component) return;

    // Use window store logic (similar to Dock)
    const isOpenWindow = windows.find((w) => w.id === app.id);
    const isActive = activeWindowId === app.id;

    if (isOpenWindow && isActive && !isOpenWindow.isMinimized) {
      // If already active, maybe just do nothing or close spotlight
    } else if (isOpenWindow) {
      // If open but not focused or minimized, focus/restore it
      // We use openWindow which handles restore/focus
      openWindow(app.id, app.name, app.component);
    } else {
      openWindow(app.id, app.name, app.component);
    }

    onClose();
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev + 1) % Math.max(1, filteredApps.length)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + Math.max(1, filteredApps.length)) %
            Math.max(1, filteredApps.length)
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredApps.length > 0) {
          handleLaunchApp(filteredApps[selectedIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredApps, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          onMouseDown={onClose}
        >
          {/* Main Container */}
          <motion.div
            className="w-[600px] bg-white/60 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-gray-400/20 shrink-0">
              <svg
                className="w-6 h-6 text-gray-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Spotlight Search"
                className="flex-1 bg-transparent text-2xl text-gray-800 placeholder-gray-500 outline-none font-light"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Results Area */}
            {searchTerm && (
              <div className="p-2 bg-white/40 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {filteredApps.length > 0 ? (
                  <>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-1 mb-1">
                      Top Hit
                    </div>
                    {filteredApps.map((app, index) => (
                      <div
                        key={app.id}
                        onClick={() => handleLaunchApp(app)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={clsx(
                          "flex items-center px-3 py-2 rounded-lg cursor-default transition-colors",
                          index === selectedIndex
                            ? "bg-blue-500 text-white shadow-sm"
                            : "text-gray-800 hover:bg-gray-200/50"
                        )}
                      >
                        {/* App Icon / Color Block */}
                        <div
                          className={clsx(
                            "w-7 h-7 rounded-md mr-3 flex items-center justify-center text-xs font-bold text-white shadow-sm",
                            app.color || "bg-gray-400"
                          )}
                        >
                          {app.icon === "file"
                            ? "📁"
                            : app.icon === "settings"
                            ? "⚙️"
                            : app.icon === "compass"
                            ? "🧭"
                            : app.name[0]}
                        </div>

                        <div className="flex flex-col">
                          <span
                            className={clsx(
                              "font-medium text-sm",
                              index === selectedIndex
                                ? "text-white"
                                : "text-gray-900"
                            )}
                          >
                            {app.name}
                          </span>
                          <span
                            className={clsx(
                              "text-xs",
                              index === selectedIndex
                                ? "text-blue-100"
                                : "text-gray-500"
                            )}
                          >
                            Application
                          </span>
                        </div>

                        {index === selectedIndex && (
                          <span className="ml-auto text-xs text-blue-100 opacity-80 font-medium">
                            Open
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No results found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}

            {!searchTerm && (
              <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-400/10 bg-white/30">
                Pro Tip: Navigate with arrow keys, press Enter to open
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Spotlight;
