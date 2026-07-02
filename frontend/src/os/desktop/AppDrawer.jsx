import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import { APP_REGISTRY } from "../appRegistry";
import AppIcon from "../../components/AppIcon";

const AppDrawer = () => {
  const { isLaunchpadOpen, setLaunchpadOpen, installedApps } = useSystemStore();
  const { openWindow } = useWindowStore();

  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  // Filter apps by installed state and search query
  const allApps = useMemo(() => {
    return Object.values(APP_REGISTRY).filter((app) => installedApps.includes(app.id));
  }, [installedApps]);

  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) return allApps;
    return allApps.filter((app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allApps]);

  // Focus search input when launchpad is opened
  useEffect(() => {
    if (isLaunchpadOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearchTerm("");
    }
  }, [isLaunchpadOpen]);

  // Escape key closes launchpad
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isLaunchpadOpen) {
        setLaunchpadOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLaunchpadOpen, setLaunchpadOpen]);

  const handleAppLaunch = (appId, e) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    const originRect = rect
      ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
      : null;

    openWindow(appId, {}, originRect);
    setLaunchpadOpen(false);
  };

  // Stagger configurations for entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } },
  };

  return (
    <AnimatePresence>
      {isLaunchpadOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-xl z-[999] flex flex-col items-center justify-start pt-12 sm:pt-16 px-4 sm:px-12 overflow-y-auto select-none"
          onClick={() => setLaunchpadOpen(false)}
        >
          {/* Search Box - centered like macOS */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="mb-12 relative w-80 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 focus:border-cyan-400/40 text-cyan-50 placeholder-white/45 text-center text-sm rounded-full py-2.5 px-10 outline-none transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            />
            {/* Search Icon */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              <svg
                className="w-4 h-4"
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
            </div>
            {/* Clear Button */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </motion.div>

          {/* Apps Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-8 gap-y-10 max-w-6xl w-full pointer-events-auto pb-16"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                variants={itemVariants}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleAppLaunch(app.id, e)}
                className="flex flex-col items-center gap-2.5 p-2 rounded-2xl hover:bg-white/10 cursor-pointer transition-colors group relative"
              >
                {/* Glossy Icon Container */}
                <div
                  className={`w-16 h-16 rounded-[18px] ${
                    app.color || "bg-blue-600"
                  } flex items-center justify-center text-white text-3xl shadow-xl relative overflow-hidden`}
                >
                  {/* Glass Gloss */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

                  {/* Icon Render */}
                  <AppIcon app={app} className="relative z-10 text-3xl drop-shadow-md" />
                  
                  {/* Subtle border */}
                  <div className="absolute inset-0 border border-white/20 rounded-[18px] pointer-events-none" />
                </div>

                {/* App Name */}
                <span className="text-[12px] text-cyan-50/90 font-medium text-center leading-snug drop-shadow-md truncate max-w-full group-hover:text-white">
                  {app.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppDrawer;
