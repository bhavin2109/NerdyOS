import { useState, useEffect } from "react";
import clsx from "clsx";
import pluginManager from "../../os/plugins/pluginManager";

const Plugins = () => {
  const [plugins, setPlugins] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    setPlugins(pluginManager.getAllPlugins());
  }, [updateTrigger]);

  const togglePlugin = (id) => {
    if (pluginManager.isEnabled(id)) {
      pluginManager.disable(id);
    } else {
      pluginManager.enable(id);
    }
    // Refresh list state
    setUpdateTrigger((prev) => prev + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Plugins</h2>
      <div className="flex flex-col divide-y divide-gray-100">
        {plugins.length === 0 ? (
          <div className="py-4 text-center text-gray-500 text-sm">
            No plugins installed. Register plugins to see them here.
          </div>
        ) : (
          plugins.map((plugin) => {
            const isEnabled = pluginManager.isEnabled(plugin.id);
            return (
              <div
                key={plugin.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {plugin.name}
                  </h3>
                  {plugin.description && (
                    <p className="text-xs text-gray-500">
                      {plugin.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => togglePlugin(plugin.id)}
                  className={clsx(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    isEnabled ? "bg-blue-500" : "bg-gray-200"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Plugins;
