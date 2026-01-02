class PluginManager {
    constructor() {
        this.plugins = new Map(); // id -> plugin metadata
        this.enabledPluginIds = new Set();
        this.loadState();
    }

    loadState() {
        try {
            const saved = localStorage.getItem("nerdyos_enabled_plugins");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.enabledPluginIds = new Set(parsed);
                }
            }
        } catch (e) {
            console.warn("Failed to load plugin state", e);
        }
    }

    saveState() {
        try {
            localStorage.setItem(
                "nerdyos_enabled_plugins",
                JSON.stringify(Array.from(this.enabledPluginIds))
            );
        } catch (e) {
            console.warn("Failed to save plugin state", e);
        }
    }

    /**
     * Register a new plugin
     * @param {Object} plugin
     * @param {string} plugin.id - Unique ID
     * @param {string} plugin.name - Display Name
     * @param {Function} [plugin.getMenuItems] - Returns array of menu items
     * @param {Function} [plugin.getDockApps] - Returns array of dock apps
     */
    register(plugin) {
        if (!plugin.id || !plugin.name) {
            console.error("Plugin must have id and name");
            return;
        }
        this.plugins.set(plugin.id, plugin);
        console.log(`Plugin registered: ${plugin.name}`);
    }

    enable(id) {
        if (this.plugins.has(id)) {
            this.enabledPluginIds.add(id);
            this.saveState();
            console.log(`Plugin enabled: ${id}`);
        } else {
            console.warn(`Plugin ${id} not found`);
        }
    }

    disable(id) {
        this.enabledPluginIds.delete(id);
        this.saveState();
        console.log(`Plugin disabled: ${id}`);
    }

    isEnabled(id) {
        return this.enabledPluginIds.has(id);
    }

    getEnabledPlugins() {
        const enabled = [];
        for (const id of this.enabledPluginIds) {
            const plugin = this.plugins.get(id);
            if (plugin) enabled.push(plugin);
        }
        return enabled;
    }

    getAllPlugins() {
        return Array.from(this.plugins.values());
    }

    // Aggregate capabilities
    getMenuItems() {
        let items = [];
        for (const plugin of this.getEnabledPlugins()) {
            if (typeof plugin.getMenuItems === "function") {
                try {
                    items = [...items, ...plugin.getMenuItems()];
                } catch (e) {
                    console.error(`Error getting menu items from ${plugin.id}`, e);
                }
            }
        }
        return items;
    }

    getDockApps() {
        let apps = [];
        for (const plugin of this.getEnabledPlugins()) {
            if (typeof plugin.getDockApps === "function") {
                try {
                    apps = [...apps, ...plugin.getDockApps()];
                } catch (e) {
                    console.error(`Error getting dock apps from ${plugin.id}`, e);
                }
            }
        }
        return apps;
    }
}

// Singleton instance
const pluginManager = new PluginManager();
export default pluginManager;
