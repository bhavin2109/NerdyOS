import Router from "./Router";
import { useEffect } from "react";
import useWindowStore from "../store/windowStore";
import useNotificationStore from "../store/notificationStore";
import Notification from "../os/notifications/Notification";
import { AnimatePresence } from "framer-motion";
import { memo } from "react";

import useSystemStore from "../store/systemStore";

// Memoize App to prevent unnecessary re-renders
const App = memo(function App() {
  const { activeWindowId, closeWindow, windows, focusWindow } =
    useWindowStore();
  const { theme, brightness } = useSystemStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Meta key (Cmd) or Ctrl key
      const isModifier = e.metaKey || e.ctrlKey;

      // Cmd + Space: Open Spotlight
      if (isModifier && e.code === "Space") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("nerdyos:toggle-spotlight"));
      }

      // Cmd + W: Close Active Window
      if (isModifier && e.key === "w") {
        e.preventDefault();
        const currentActive = useWindowStore.getState().activeWindowId;
        if (currentActive) {
          useWindowStore.getState().closeWindow(currentActive);
        }
      }

      // Cmd + M: Minimize Active Window
      if (isModifier && e.key === "m") {
        e.preventDefault();
        const currentActive = useWindowStore.getState().activeWindowId;
        if (currentActive) {
          useWindowStore.getState().toggleMinimize(currentActive);
        }
      }

      // Cmd + Tab: Cycle Apps (Basic implementation)
      if (isModifier && e.code === "Tab") {
        // Use 'code' for Tab to avoid issues
        e.preventDefault();
        const state = useWindowStore.getState();
        const wins = state.windows;
        if (wins.length < 2) return;

        const currentIndex = wins.findIndex(
          (w) => w.id === state.activeWindowId
        );
        // Simple cycle: Next one, wrapping around
        // In real OS helpers, this is MRU (Most Recently Used), but simple cycle is fine for now
        let nextIndex = currentIndex + 1;
        if (nextIndex >= wins.length) nextIndex = 0;

        const nextWindow = wins[nextIndex];
        if (nextWindow) {
          state.focusWindow(nextWindow.id);
        }
      }

      // Esc: Close Modal / Focus out (Optional context)
      // Spotlight handles its own Escape.
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Empty dependency array means we rely on getState() for fresh data

  /* Notifications Layer */
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div
      className={`w-screen h-screen overflow-hidden bg-center bg-cover select-none font-sans text-white ${theme}`}
    >
      {/* OS Shell Layer */}
      <Router />

      {/* Global Notifications Container */}
      <div className="fixed top-12 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <Notification
              key={notif.id}
              {...notif}
              onDismiss={() => removeNotification(notif.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Brightness Overlay */}
      <div
        className="fixed inset-0 z-[99999] pointer-events-none bg-black transition-opacity duration-100"
        style={{ opacity: (100 - brightness) / 100 }}
      />
    </div>
  );
});

export default App;
