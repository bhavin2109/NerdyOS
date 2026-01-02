import React, { useState, useEffect } from "react";
import clsx from "clsx";
import AppTemplate from "../AppTemplate";
import useSystemStore from "../../store/systemStore";
import { APP_REGISTRY } from "../../os/appRegistry";
import { getFiles } from "../../services/indexedDb";

// --- Constants ---
const CATEGORIES = [
  { id: "appearance", icon: "🎨", label: "Appearance" },
  { id: "dock", icon: "⚓", label: "Dock" },
  { id: "wallpaper", icon: "🖼️", label: "Wallpaper" },
  { id: "connectivity", icon: "wifi", label: "Connectivity" },
  { id: "storage", icon: "💾", label: "Storage" },
  { id: "apps", icon: "grid", label: "Installed Apps" },
  { id: "notifications", icon: "bell", label: "Notifications" },
  { id: "profile", icon: "user", label: "Profile" },
  { id: "about", icon: "info", label: "About" },
];

const WALLPAPERS = [
  {
    id: "sierra",
    name: "Sierra",
    url: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "ventura",
    name: "Ventura",
    url: "https://images.unsplash.com/photo-1621360841013-c768371e93cf?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "sonoma",
    name: "Sonoma",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "midnight",
    name: "Midnight",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
  },
];

// --- Sub-components ---

const DockSettings = () => {
  const { dockMode, setDockMode } = useSystemStore();

  const options = [
    {
      id: "always",
      label: "Always Visible",
      desc: "Dock is always shown at the bottom",
    },
    {
      id: "auto",
      label: "Auto Hide",
      desc: "Dock hides automatically and shows on hover",
    },
    {
      id: "hidden",
      label: "Always Hidden",
      desc: "Dock is hidden until changed",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dock Behavior</h2>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setDockMode(opt.id)}
            className={clsx(
              "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
              dockMode === opt.id
                ? "border-blue-500 bg-blue-50/50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div>
              <div className="font-medium text-gray-800">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.desc}</div>
            </div>
            <div
              className={clsx(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                dockMode === opt.id ? "border-blue-500" : "border-gray-300"
              )}
            >
              {dockMode === opt.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-500 mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
        Note: Dock is always hidden when an app is in Fullscreen mode.
      </div>
    </div>
  );
};

const AppearanceSettings = () => {
  const { theme, setTheme } = useSystemStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Appearance</h2>
      <div className="flex gap-4">
        {/* Light */}
        <button
          onClick={() => setTheme("light")}
          className={clsx(
            "flex-1 p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all",
            theme === "light"
              ? "border-blue-500 bg-blue-50/50"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <div className="w-full h-24 bg-gray-100 rounded border border-gray-200 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 w-full h-6 bg-white border-b"></div>
          </div>
          <span className="font-medium">Light</span>
        </button>
        {/* Dark */}
        <button
          onClick={() => setTheme("dark")}
          className={clsx(
            "flex-1 p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all",
            theme === "dark"
              ? "border-blue-500 bg-blue-50/50"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <div className="w-full h-24 bg-gray-800 rounded border border-gray-700 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 w-full h-6 bg-gray-900 border-b border-gray-700"></div>
          </div>
          <span className="font-medium">Dark</span>
        </button>
      </div>
    </div>
  );
};

const WallpaperSettings = () => {
  const { wallpaper, setWallpaper } = useSystemStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Wallpaper</h2>
      <div className="grid grid-cols-2 gap-4">
        {WALLPAPERS.map((wp) => (
          <button
            key={wp.id}
            onClick={() => setWallpaper(wp.url)}
            className={clsx(
              "relative aspect-video rounded-lg overflow-hidden border-2 transition-all group",
              wallpaper === wp.url
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-transparent hover:scale-[1.02]"
            )}
          >
            <img
              src={wp.url}
              alt={wp.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs p-1 text-center backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform">
              {wp.name}
            </div>
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Display: {window.screen.width}x{window.screen.height} •{" "}
        {window.innerWidth < 768 ? "Mobile" : "Desktop"}
      </div>
    </div>
  );
};

const ConnectivitySettings = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Connectivity</h2>

      <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center text-xl",
              isOnline
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            )}
          >
            {isOnline ? "wifi" : "off"}
          </div>
          <div>
            <div className="font-medium">Wi-Fi</div>
            <div className="text-sm text-gray-500">
              {isOnline ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
        <div
          className={clsx(
            "w-3 h-3 rounded-full",
            isOnline ? "bg-green-500" : "bg-red-500"
          )}
        ></div>
      </div>

      <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
            B
          </div>
          <div>
            <div className="font-medium">Bluetooth</div>
            <div className="text-sm text-gray-500">On</div>
          </div>
        </div>
        <div className="text-sm text-gray-400">Discoverable as "NerdyOS"</div>
      </div>
    </div>
  );
};

const StorageSettings = () => {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    quota: 0,
    fileCount: 0,
  });

  useEffect(() => {
    const checkStorage = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        // Count files from IDB
        let count = 0;
        try {
          const files = await getFiles("root"); // rough check, recursive is better but simple for now
          // actually better to just fetch all if possible or simulate
          count = 12; // simulated for speed if recursive expensive
        } catch (e) {}

        setStorageInfo({
          used: estimate.usage || 0,
          quota: estimate.quota || 1024 * 1024 * 1024,
          fileCount: count,
        });
      }
    };
    checkStorage();
  }, []);

  const usedMB = (storageInfo.used / (1024 * 1024)).toFixed(2);
  const quotaMB = (storageInfo.quota / (1024 * 1024)).toFixed(0);
  const percent = Math.min(100, (storageInfo.used / storageInfo.quota) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Storage</h2>
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-3xl font-bold text-gray-800">{usedMB} MB</div>
            <div className="text-sm text-gray-500">used of {quotaMB} MB</div>
          </div>
          <div className="text-right">
            <div className="font-medium">Macintosh HD</div>
            <div className="text-xs text-gray-400">IndexedDB Storage</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${percent}%` }}
            className="bg-blue-500 h-full"
          ></div>
        </div>

        <div className="flex gap-4 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> System Data
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div> Available
          </div>
        </div>
      </div>
    </div>
  );
};

const AppSettings = () => {
  const { disabledApps, toggleAppDisabled } = useSystemStore();
  const apps = Object.values(APP_REGISTRY);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Installed Apps</h2>
      <div className="space-y-2">
        {apps.map((app) => {
          const isDisabled = disabledApps.includes(app.id);
          return (
            <div
              key={app.id}
              className="flex items-center justify-between p-3 bg-white border rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                    app.color
                  )}
                >
                  {app.icon && app.icon.length < 3 ? app.icon : app.name[0]}
                </div>
                <div>
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-gray-500">
                    {app.id === "settings" || app.id === "finder"
                      ? "System App"
                      : "User App"}
                  </div>
                </div>
              </div>

              {/* Toggle - Don't allow disabling critical apps */}
              {app.id !== "settings" && app.id !== "finder" && (
                <button
                  onClick={() => toggleAppDisabled(app.id)}
                  className={clsx(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    isDisabled
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-600"
                  )}
                >
                  {isDisabled ? "Disabled" : "Enabled"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  const { notificationsEnabled, toggleNotifications } = useSystemStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notifications</h2>
      <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
        <div>
          <div className="font-medium">Allow Notifications</div>
          <div className="text-sm text-gray-500">
            Show banners from apps and system
          </div>
        </div>
        <button
          onClick={toggleNotifications}
          className={clsx(
            "w-12 h-6 rounded-full p-1 transition-colors relative",
            notificationsEnabled ? "bg-blue-500" : "bg-gray-300"
          )}
        >
          <div
            className={clsx(
              "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
              notificationsEnabled ? "translate-x-6" : "translate-x-0"
            )}
          ></div>
        </button>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const { userProfile, logout } = useSystemStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Profile</h2>
      <div className="flex flex-col items-center p-6 bg-white border rounded-xl text-center">
        <img
          src={userProfile.avatar}
          alt="Avatar"
          className="w-20 h-20 rounded-full mb-4 shadow-sm"
        />
        <h3 className="text-lg font-bold">{userProfile.name}</h3>
        <p className="text-gray-500 text-sm mb-6">{userProfile.email}</p>

        <div className="w-full border-t pt-4 flex flex-col gap-2">
          <button className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
            Edit Profile
          </button>
          <button
            onClick={logout}
            className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

const AboutSettings = () => {
  return (
    <div className="space-y-6 text-center pt-8">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl shadow-xl text-white">
        
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">NerdyOS</h2>
        <p className="text-gray-500">Version 1.0.0 (Beta)</p>
      </div>

      <div className="max-w-xs mx-auto text-sm text-gray-600 space-y-2">
        <p>
          A web-based operating system built with React, Tailwind, and Love.
        </p>
        <div className="pt-4 text-xs text-gray-400">
          &copy; 2024 NerdyOS Inc. <br />
          All rights reserved.
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const NerdySettings = () => {
  const [activeCategory, setActiveCategory] = useState("appearance");

  const renderContent = () => {
    switch (activeCategory) {
      case "appearance":
        return <AppearanceSettings />;
      case "dock":
        return <DockSettings />;
      case "wallpaper":
        return <WallpaperSettings />;
      case "connectivity":
        return <ConnectivitySettings />;
      case "storage":
        return <StorageSettings />;
      case "apps":
        return <AppSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "profile":
        return <ProfileSettings />;
      case "about":
        return <AboutSettings />;
      default:
        return <AppearanceSettings />;
    }
  };

  return (
    <AppTemplate
      title="System Settings"
      contentClassName="bg-slate-900/30 p-0 flex"
      sidebar={false}
    >
      {/* Sidebar */}
      <div className="w-48 sm:w-60 bg-slate-900/60 border-r border-cyan-400/20 h-full flex flex-col pt-4 overflow-y-auto shrink-0 backdrop-blur-xl">
        <div className="px-4 mb-2 text-xs font-semibold text-cyan-400/70 uppercase tracking-wider">
          System
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                activeCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-400/30"
                  : "text-cyan-50/70 hover:bg-white/5"
              )}
            >
              <span
                className={clsx(
                  "text-lg",
                  activeCategory === cat.id
                    ? "text-cyan-400"
                    : "text-cyan-50/50"
                )}
              >
                {cat.icon === "wifi" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  </svg>
                ) : cat.icon === "grid" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                ) : cat.icon === "bell" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                ) : cat.icon === "user" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ) : cat.icon === "info" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  cat.icon
                )}
              </span>
              <span>{cat.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 min-h-0 bg-slate-900/20">
        <div className="max-w-2xl mx-auto text-cyan-50">{renderContent()}</div>
      </div>
    </AppTemplate>
  );
};

export default NerdySettings;
