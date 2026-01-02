import NerdyFiles from "../apps/NerdyFiles/NerdyFiles";
import NerdySettings from "../apps/NerdySettings/NerdySettings";
import NerdyBrowser from "../apps/NerdyBrowser/NerdyBrowser";
import InDev from "../apps/InDev/InDev";

// Simple placeholder for apps not yet implemented
const PlaceholderApp = ({ title }) => <InDev appName={title} />;

export const APP_REGISTRY = {
  finder: {
    id: "finder",
    name: "Files",
    icon: "folder",
    component: NerdyFiles,
    defaultSize: { width: 900, height: 600 },
    defaultPosition: { x: 50, y: 50 },
    color: "bg-blue-600",
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: "settings",
    component: NerdySettings,
    defaultSize: { width: 900, height: 650 },
    color: "bg-slate-700",
  },
  browser: {
    id: "browser",
    name: "Browser",
    icon: "globe",
    component: NerdyBrowser,
    defaultSize: { width: 1024, height: 768 },
    color: "bg-cyan-600",
  },
  notes: {
    id: "notes",
    name: "Notes",
    icon: "note",
    component: () => <PlaceholderApp title="Notes" />,
    defaultSize: { width: 800, height: 600 },
    color: "bg-yellow-500",
  },
  calendar: {
    id: "calendar",
    name: "Calendar",
    icon: "calendar",
    component: () => <PlaceholderApp title="Calendar" />,
    defaultSize: { width: 800, height: 600 },
    color: "bg-rose-500",
  },
  messages: {
    id: "messages",
    name: "Messages",
    icon: "message",
    component: () => <PlaceholderApp title="Messages" />,
    defaultSize: { width: 800, height: 600 },
    color: "bg-emerald-500",
  },
  // Add other default OS apps as needed
};

// Helper to get app by ID
export const getAppById = (id) => APP_REGISTRY[id];

export default APP_REGISTRY;
