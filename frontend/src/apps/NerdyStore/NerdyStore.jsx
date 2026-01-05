import React from "react";
import useSystemStore from "../../store/systemStore";
import { APP_REGISTRY } from "../../os/appRegistry";

const NerdyStore = () => {
  const { installedApps, installApp, uninstallApp } = useSystemStore();

  // Convert registry object to array
  const allApps = Object.values(APP_REGISTRY).filter(
    (app) => app.id !== "store"
  ); // Don't show store in store? Or do show it?

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-6 bg-white shadow-sm mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          App Store
        </h1>
        <p className="text-gray-500">Discover and manage your apps</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allApps.map((app) => {
            const isInstalled = installedApps.includes(app.id);
            return (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl ${
                      app.color || "bg-gray-500"
                    }`}
                  >
                    {/* Simple Icon Placeholder if no image */}
                    {app.icon && (
                      <span className="material-symbols-outlined">
                        {app.icon}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{app.name}</h3>
                    <p className="text-xs text-gray-500">Productivity</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() =>
                      isInstalled ? uninstallApp(app.id) : installApp(app.id)
                    }
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      isInstalled
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isInstalled ? "Uninstall" : "Get"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NerdyStore;
