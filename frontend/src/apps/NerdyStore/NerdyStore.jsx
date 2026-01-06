import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import { APP_REGISTRY } from "../../os/appRegistry";
import { CATEGORIES, STORE_dATA } from "./storeData";

const NerdyStore = () => {
  const { installedApps, installApp, uninstallApp } = useSystemStore();
  const { openWindow, windows, toggleMinimize } = useWindowStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppId, setSelectedAppId] = useState(null); // For detailed view (future enhancement)

  // Filter apps based on category and search
  const filteredApps = useMemo(() => {
    return STORE_dATA.filter((appData) => {
      // 1. Category Filter
      if (activeCategory !== "all" && appData.category !== activeCategory) {
        return false;
      }

      // 2. Search Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          appData.name.toLowerCase().includes(query) ||
          appData.description.toLowerCase().includes(query) ||
          appData.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  const handleOpenApp = (appId) => {
    const isOpen = windows.some((w) => w.id === appId);
    if (!isOpen) {
      openWindow(appId);
    } else {
      // Ideally bring to front, but openWindow handles logic to focus usually
      // or we just do nothing if already open, maybe shake window?
      // For now, openWindow is safe.
      openWindow(appId);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#FAFAFA] text-slate-800 font-sans select-none overflow-hidden rounded-b-lg">
      {/* Sidebar - Categories */}
      <div className="w-[200px] bg-[#F0F0F0] border-r border-[#DEDEDE] flex flex-col pt-4 pb-2 shrink-0">
        <div className="px-4 mb-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Explore
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#D6D6D6] text-slate-900"
                  : "text-slate-600 hover:bg-[#E6E6E6]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {cat.icon}
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bottom Status */}
        <div className="p-4 border-t border-[#DEDEDE] text-xs text-slate-400 text-center">
          NerdyOS Software
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header / Search */}
        <div className="h-16 border-b border-[#F0F0F0] flex items-center justify-between px-6 bg-white z-10 sticky top-0">
          <h1 className="text-xl font-bold text-slate-800 hidden md:block">
            {activeCategory === "all"
              ? "All Software"
              : CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h1>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 material-symbols-outlined text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search software..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F5F5] border border-transparent focus:border-blue-500 focus:bg-white rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder-slate-400"
            />
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Featured Banner (Only on All + No Search) */}
          {activeCategory === "all" && searchQuery === "" && (
            <div
              className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveCategory("development")}
            >
              <div className="relative z-10 max-w-lg">
                <h2 className="text-3xl font-bold mb-2">Build the Future</h2>
                <p className="text-blue-100 text-lg mb-6">
                  Discover powerful development tools like Nerdy Studio,
                  Terminal, and more to kickstart your coding journey.
                </p>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors">
                  Browse Developer Tools
                </button>
              </div>
              <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-white/10 group-hover:scale-110 transition-transform duration-500">
                code
              </span>
            </div>
          )}

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((appData) => {
                const registryItem = APP_REGISTRY[appData.id];
                // If app not in registry but in data, fallback (shouldn't happen with our plan)
                const icon = registryItem?.icon || "apps";
                const color = registryItem?.color || "bg-slate-500";
                const isInstalled = installedApps.includes(appData.id);

                return (
                  <motion.div
                    layout
                    key={appData.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-white shadow-sm ${color}`}
                    >
                      <span className="material-symbols-outlined text-[32px]">
                        {icon}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3
                          className="font-bold text-slate-800 truncate pr-2"
                          title={appData.name}
                        >
                          {appData.name}
                        </h3>
                        <div className="flex items-center text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                          <span className="material-symbols-outlined text-[12px] mr-0.5 text-yellow-500">
                            star
                          </span>
                          {appData.rating}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 mb-3 leading-relaxed">
                        {appData.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {appData.size}
                        </span>

                        {/* Action Button */}
                        <div className="flex gap-2">
                          {isInstalled ? (
                            <>
                              <button
                                onClick={() => uninstallApp(appData.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                Uninstall
                              </button>
                              <button
                                onClick={() => handleOpenApp(appData.id)}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm"
                              >
                                Open
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => installApp(appData.id)}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-blue-500/20 shadow-md"
                            >
                              Install
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4">
                search_off
              </span>
              <p className="text-lg font-medium">
                No results found for "{searchQuery}"
              </p>
              <p className="text-sm">
                Try checking your spelling or using different keywords.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NerdyStore;
