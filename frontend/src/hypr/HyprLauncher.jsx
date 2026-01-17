/**
 * HyprLauncher - Rofi/Wofi-inspired Application Launcher
 * Keyboard-driven fuzzy search launcher
 */

import { memo, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { APP_REGISTRY } from "../os/appRegistry";
import useWindowStore from "../store/windowStore";

/**
 * Fuzzy search scoring
 */
function fuzzyMatch(query, text) {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match gets highest score
  if (textLower === queryLower) return 1000;

  // Starts with query
  if (textLower.startsWith(queryLower)) return 500 + (100 - text.length);

  // Contains query
  if (textLower.includes(queryLower)) return 200 + (100 - text.length);

  // Fuzzy character match
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 10 + consecutiveMatches * 5;
      consecutiveMatches++;
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
  }

  // Only return score if all query characters were matched
  return queryIndex === queryLower.length ? score : 0;
}

/**
 * App icon component
 */
const AppIcon = memo(function AppIcon({ app }) {
  const iconMap = {
    folder: "📂",
    bag: "🛍️",
    globe: "🌐",
    message: "💬",
    mail: "✉️",
    map: "🗺️",
    photo: "🖼️",
    calendar: "📅",
    note: "📝",
    settings: "⚙️",
    sparkles: "✨",
    computer: "💻",
    play_circle: "▶️",
    article: "📄",
    forum: "💬",
    monitoring: "📊",
    calendar_month: "📅",
    code: "👨‍💻",
    edit_note: "✏️",
    check_circle: "✅",
    picture_as_pdf: "📑",
  };

  const emoji = iconMap[app.icon] || app.name[0];

  return (
    <div
      className={clsx(
        "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
        "shadow-md relative overflow-hidden",
        app.color || "bg-surface-1",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      <span className="relative z-10">{emoji}</span>
    </div>
  );
});

/**
 * Result item component
 */
const ResultItem = memo(function ResultItem({
  app,
  isSelected,
  onClick,
  onMouseEnter,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all",
        "rounded-lg mx-2",
        isSelected ? "bg-mauve text-crust" : "text-text hover:bg-surface-1",
      )}
    >
      <AppIcon app={app} />
      <div className="flex-1 min-w-0">
        <div className={clsx("font-medium", isSelected && "text-crust")}>
          {app.name}
        </div>
        <div
          className={clsx(
            "text-xs truncate",
            isSelected ? "text-crust/70" : "text-subtext",
          )}
        >
          Application
        </div>
      </div>
      {isSelected && (
        <div className="text-xs opacity-70">Press Enter to open</div>
      )}
    </motion.div>
  );
});

/**
 * Main HyprLauncher component
 */
const HyprLauncher = memo(function HyprLauncher({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { openWindow } = useWindowStore();

  // Get all apps
  const allApps = useMemo(() => Object.values(APP_REGISTRY), []);

  // Filter and sort apps by fuzzy match score
  const filteredApps = useMemo(() => {
    if (!query.trim()) {
      // Show all apps when no query, sorted alphabetically
      return [...allApps].sort((a, b) => a.name.localeCompare(b.name));
    }

    return allApps
      .map((app) => ({
        app,
        score: fuzzyMatch(query, app.name),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ app }) => app);
  }, [query, allApps]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
    }
  }, [isOpen]);

  // Launch selected app
  const launchApp = useCallback(
    (app) => {
      if (!app) return;
      openWindow(app.id);
      onClose();
    },
    [openWindow, onClose],
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredApps.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredApps[selectedIndex]) {
            launchApp(filteredApps[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
          } else {
            setSelectedIndex((prev) =>
              Math.min(prev + 1, filteredApps.length - 1),
            );
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredApps, selectedIndex, launchApp, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-crust/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Launcher Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={clsx(
              "fixed z-[201] left-1/2 -translate-x-1/2 top-[20vh]",
              "w-[600px] max-w-[90vw]",
              "bg-base/95 backdrop-blur-xl",
              "border border-surface-1 rounded-xl",
              "shadow-2xl shadow-crust/50",
              "overflow-hidden",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-0">
              <svg
                className="w-6 h-6 text-overlay-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search applications..."
                className={clsx(
                  "flex-1 bg-transparent text-lg text-text",
                  "placeholder-overlay-0 outline-none",
                  "font-light",
                )}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-overlay-0 hover:text-text p-1"
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
              )}
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto py-2">
              {filteredApps.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-overlay-0 uppercase tracking-wider">
                    Applications
                  </div>
                  <AnimatePresence mode="popLayout">
                    {filteredApps.slice(0, 10).map((app, index) => (
                      <ResultItem
                        key={app.id}
                        app={app}
                        isSelected={index === selectedIndex}
                        onClick={() => launchApp(app)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      />
                    ))}
                  </AnimatePresence>
                  {filteredApps.length > 10 && (
                    <div className="px-4 py-2 text-xs text-overlay-0 text-center">
                      +{filteredApps.length - 10} more results
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-overlay-0">
                  No applications found for "{query}"
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-surface-0 text-xs text-overlay-0">
              <span>
                <kbd className="px-1.5 py-0.5 bg-surface-0 rounded text-subtext">
                  ↑↓
                </kbd>{" "}
                Navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-surface-0 rounded text-subtext">
                  Enter
                </kbd>{" "}
                Open
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-surface-0 rounded text-subtext">
                  Esc
                </kbd>{" "}
                Close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default HyprLauncher;
