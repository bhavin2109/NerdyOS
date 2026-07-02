import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";
import useWindowStore from "../../store/windowStore";
import { APP_REGISTRY } from "../../os/appRegistry";
import { CATEGORIES, STORE_dATA } from "./storeData";
import AppIcon from "../../components/AppIcon";
import clsx from "clsx";

const NerdyStore = () => {
  const { installedApps, installApp, uninstallApp } = useSystemStore();
  const { openWindow, windows } = useWindowStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadProgress, setDownloadProgress] = useState({});

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
      openWindow(appId);
    }
  };

  const handleInstall = (appId) => {
    if (downloadProgress[appId] !== undefined) return;

    // Simulate downloading & installing progress
    setDownloadProgress((prev) => ({ ...prev, [appId]: 0 }));

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      if (current >= 100) {
        clearInterval(interval);
        installApp(appId);
        setDownloadProgress((prev) => {
          const next = { ...prev };
          delete next[appId];
          return next;
        });
      } else {
        setDownloadProgress((prev) => ({ ...prev, [appId]: current }));
      }
    }, 150);
  };

  const renderAppGrid = (appsList) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {appsList.map((appData) => {
        const registryItem = APP_REGISTRY[appData.id];
        const isInstalled = installedApps.includes(appData.id);
        const progress = downloadProgress[appData.id];
        const isDownloading = progress !== undefined;

        return (
          <motion.div
            layout
            key={appData.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!isDownloading) {
                if (isInstalled) {
                  handleOpenApp(appData.id);
                } else {
                  handleInstall(appData.id);
                }
              }
            }}
            className="bg-[#FAF9F8]/60 border border-[#EDEBE9] rounded-2xl p-5 flex gap-4 hover:border-blue-500/30 hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-200 group cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            {/* Icon container */}
            <div className="w-16 h-16 rounded-[18px] bg-white border border-[#EDEBE9] shadow-sm flex items-center justify-center relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
              <AppIcon app={registryItem} className="w-11 h-11 object-contain relative z-10" />
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3
                  className="font-bold text-slate-800 truncate pr-2 text-sm tracking-tight"
                  title={appData.name}
                >
                  {appData.name}
                </h3>
                <div className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  <span className="material-symbols-outlined text-[10px] mr-0.5 text-yellow-500 fill-current">
                    star
                  </span>
                  {appData.rating}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 mb-4 leading-relaxed font-medium">
                {appData.description}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  {appData.size}
                </span>

                {/* Action Button */}
                <div className="flex gap-2 items-center">
                  {isInstalled ? (
                    <>
                      {!['finder', 'settings', 'browser', 'terminal', 'store'].includes(appData.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            uninstallApp(appData.id);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 active:scale-95 transition-all"
                        >
                          Uninstall
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenApp(appData.id);
                        }}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
                      >
                        Open
                      </button>
                    </>
                  ) : isDownloading ? (
                    <div className="flex flex-col items-end gap-1 select-none" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[9px] text-blue-600 font-bold animate-pulse tracking-wide">Installing...</span>
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="bg-blue-600 h-full transition-all duration-150"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstall(appData.id);
                      }}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
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
    </div>
  );

  const renderContent = () => {
    // If a search query is entered, just show matching apps in a single grid
    if (searchQuery.trim() !== "") {
      return renderAppGrid(filteredApps);
    }

    // If activeCategory is not "all", show the filtered grid for that category
    if (activeCategory !== "all") {
      return renderAppGrid(filteredApps);
    }

    // Retrieve featured app details
    const featuredAppId = "vscode";
    const featuredAppData = STORE_dATA.find((app) => app.id === featuredAppId);
    const featuredRegistryItem = APP_REGISTRY[featuredAppId];
    const isFeaturedInstalled = installedApps.includes(featuredAppId);
    const featuredProgress = downloadProgress[featuredAppId];
    const isFeaturedDownloading = featuredProgress !== undefined;

    // Otherwise, render category-wise sections (Explore view)
    return (
      <div className="space-y-10">
        {/* Explore Banner */}
        <div
          className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-blue-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-extrabold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase mb-4 inline-block select-none">
                Featured App of the Day
              </span>
              <h2 className="text-2xl font-black mb-2 tracking-tight text-white flex items-center gap-3">
                {featuredAppData?.name}
              </h2>
              <p className="text-slate-300 text-xs font-semibold mb-6 leading-relaxed">
                {featuredAppData?.description}
              </p>
              
              <div className="flex gap-3 items-center">
                {isFeaturedInstalled ? (
                  <>
                    <button
                      onClick={() => handleOpenApp(featuredAppId)}
                      className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all shadow-md"
                    >
                      Open Application
                    </button>
                    <button
                      onClick={() => uninstallApp(featuredAppId)}
                      className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-full font-bold text-xs hover:bg-red-500/30 active:scale-95 transition-all"
                    >
                      Uninstall
                    </button>
                  </>
                ) : isFeaturedDownloading ? (
                  <div className="flex items-center gap-3 select-none">
                    <span className="text-xs text-blue-400 font-bold animate-pulse">Installing VS Code ({featuredProgress}%)</span>
                    <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-blue-500 h-full transition-all duration-150"
                        style={{ width: `${featuredProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleInstall(featuredAppId)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20 border border-blue-500/30"
                  >
                    Get VS Code Web
                  </button>
                )}
              </div>
            </div>

            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center relative overflow-hidden shrink-0 shadow-2xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 mx-auto md:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <AppIcon app={featuredRegistryItem} className="w-16 h-16 object-contain relative z-10" />
            </div>
          </div>
        </div>

        {/* Section 1: Development */}
        <div>
          <div className="flex flex-col mb-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Developer Tools</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Coding, compilers & shells</p>
          </div>
          {renderAppGrid(STORE_dATA.filter(app => app.category === "development"))}
        </div>

        {/* Section 2: Productivity */}
        <div>
          <div className="flex flex-col mb-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Productivity</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Work smarter, stay connected</p>
          </div>
          {renderAppGrid(STORE_dATA.filter(app => app.category === "productivity"))}
        </div>

        {/* Section 3: Gaming */}
        <div>
          <div className="flex flex-col mb-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Gaming & Media</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Interactive games, videos & audio</p>
          </div>
          {renderAppGrid(STORE_dATA.filter(app => app.category === "gaming"))}
        </div>

        {/* Section 4: Default Apps */}
        <div>
          <div className="flex flex-col mb-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Default Apps</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Core system utilities</p>
          </div>
          {renderAppGrid(STORE_dATA.filter(app => app.category === "system"))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-[#FAF9F8] text-slate-800 font-sans select-none overflow-hidden rounded-b-lg">
      {/* Sidebar - Categories */}
      <div className="w-[200px] bg-[#F3F2F1] border-r border-[#EDEBE9] flex flex-col pt-6 pb-4 shrink-0">
        {/* App Store Emblem & Header */}
        <div className="flex items-center gap-3 px-5 mb-6 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base shadow-md shadow-blue-500/10 select-none">
            🛍️
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            App Store
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150",
                activeCategory === cat.id
                  ? "bg-[#EDEBE9] text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-[#EAEAEA] hover:text-slate-900"
              )}
            >
              <span className="material-symbols-outlined text-[18px] opacity-85">
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom Status */}
        <div className="px-5 pt-4 border-t border-[#EDEBE9] text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          v1.0 • NerdyOS
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header / Search */}
        <div className="h-16 border-b border-[#F3F2F1] flex items-center justify-between px-8 bg-white z-10 sticky top-0">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {activeCategory === "all"
              ? "Explore"
              : CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h1>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 material-symbols-outlined text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search software..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F2F1] border border-transparent focus:border-blue-500/30 focus:bg-white focus:shadow-sm rounded-full py-2 pl-10 pr-4 text-xs font-semibold outline-none transition-all placeholder-slate-400 text-slate-700"
            />
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default NerdyStore;
