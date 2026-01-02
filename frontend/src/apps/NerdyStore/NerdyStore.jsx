import { useState, useEffect } from "react";
import clsx from "clsx";
import AppTemplate from "../AppTemplate";

const NerdyStore = () => {
  const [apps, setApps] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [appsRes, myAppsRes] = await Promise.all([
        fetch("/api/apps", { headers }),
        fetch("/api/apps/my", { headers }),
      ]);

      if (!appsRes.ok || !myAppsRes.ok) throw new Error("Failed to fetch apps");

      const appsData = await appsRes.json();
      const myAppsData = await myAppsRes.json();

      setApps(appsData);
      setMyApps(
        myAppsData.map((app) => (typeof app === "string" ? app : app._id))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (appId) => {
    setInstalling(appId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/apps/install/${appId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Installation failed");

      // Refresh my apps
      const myAppsRes = await fetch("/api/apps/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myAppsData = await myAppsRes.json();
      setMyApps(
        myAppsData.map((app) => (typeof app === "string" ? app : app._id))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setInstalling(null);
    }
  };

  const isInstalled = (appId) => myApps.includes(appId);

  return (
    <AppTemplate title="NerdyStore" sidebar={false}>
      <div className="p-6 h-full overflow-y-auto bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">App Store</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    {/* Placeholder icon logic */}
                    <span className="text-2xl">📦</span>
                  </div>
                  {isInstalled(app._id) ? (
                    <button
                      disabled
                      className="px-4 py-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-full cursor-default"
                    >
                      Installed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(app._id)}
                      disabled={installing === app._id}
                      className={clsx(
                        "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                        installing === app._id
                          ? "bg-blue-100 text-blue-500 cursor-wait"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      )}
                    >
                      {installing === app._id ? "Installing..." : "Get"}
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {app.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{app.publisher}</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {app.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppTemplate>
  );
};

export default NerdyStore;
