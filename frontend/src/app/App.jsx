/**
 * NerdyOS Main Application
 * Root component with Hyprland-style desktop environment
 */

import { useEffect, useState, memo } from "react";
import { MotionConfig } from "framer-motion";

// Stores
import useSystemStore from "../store/systemStore";
import useConfigStore from "../store/configStore";

// Components
import Desktop from "../os/desktop/Desktop";

// Memoize App to prevent unnecessary re-renders
const App = memo(function App() {
  const { theme, brightness } = useSystemStore();
  const [isReady, setIsReady] = useState(false);

  // Initialize configuration on mount
  useEffect(() => {
    // Initialize config store
    const configStore = useConfigStore.getState();
    if (!configStore.isLoaded) {
      configStore.initialize();
    }

    // Expose config store for window rules lookup
    window.__configStore = useConfigStore.getState();

    setIsReady(true);
  }, []);

  // Apply CSS variables from config
  useEffect(() => {
    const configStore = useConfigStore.getState();
    const cssVars = configStore.getCSSVariables();

    const root = document.documentElement;
    for (const [key, value] of Object.entries(cssVars)) {
      root.style.setProperty(key, value);
    }
  }, []);

  // Handle config reload event
  useEffect(() => {
    const handleReload = () => {
      useConfigStore.getState().reload();
      console.log("[NerdyOS] Configuration reloaded");
    };

    window.addEventListener("nerdyos:reload", handleReload);
    return () => window.removeEventListener("nerdyos:reload", handleReload);
  }, []);

  if (!isReady) {
    // Loading screen
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-crust">
        <div className="text-center">
          <div className="text-5xl mb-4">🐧</div>
          <div className="text-text text-lg font-light">Loading NerdyOS...</div>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}>
      <div className={`w-screen h-screen overflow-hidden font-sans ${theme}`}>
        <Desktop />
        <div
          className="fixed inset-0 z-[99999] pointer-events-none bg-black transition-opacity duration-100"
          style={{ opacity: (100 - brightness) / 100 }}
        />
      </div>
    </MotionConfig>
  );
});

export default App;
