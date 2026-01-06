import NerdyFiles from "../apps/NerdyFiles/NerdyFiles";
import NerdySettings from "../apps/NerdySettings/NerdySettings";
import NerdyBrowser from "../apps/NerdyBrowser/NerdyBrowser";
import NerdyShell from "../apps/NerdyShell/NerdyShell";
import NerdyCalc from "../apps/NerdyCalc/NerdyCalc";
import NerdyMedia from "../apps/NerdyMedia/NerdyMedia";
import NerdyWord from "../apps/NerdyOffice/NerdyWord";
import NerdyStore from "../apps/NerdyStore/NerdyStore";
import NerdyNotes from "../apps/NerdyNotes/NerdyNotes";
import SystemMonitor from "../apps/SystemMonitor/SystemMonitor";
import NerdyCalendar from "../apps/NerdyCalendar/NerdyCalendar";
import NerdyMessages from "../apps/NerdyMessages/NerdyMessages";
import InDev from "../apps/InDev/InDev";

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
    icon: "globe", // Material symbol
    component: NerdyBrowser,
    defaultSize: { width: 1000, height: 700 }, // Initial launch
    defaultPosition: { x: 100, y: 50 },
    color: "bg-orange-500",
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    icon: "computer", // or code symbol
    component: NerdyShell,
    defaultSize: { width: 700, height: 500 },
    color: "bg-black",
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    icon: "calendar", // Using calendar icon for now as placeholder or custom
    component: NerdyCalc,
    defaultSize: { width: 300, height: 450 },
    defaultPosition: { x: 200, y: 200 },
    color: "bg-gray-700",
  },
  media: {
    id: "media",
    name: "Media Player",
    icon: "play_circle",
    component: NerdyMedia,
    defaultSize: { width: 800, height: 500 },
    color: "bg-red-600",
  },
  doc: {
    id: "doc",
    name: "Nerdy Doc",
    icon: "article",
    component: NerdyWord,
    defaultSize: { width: 800, height: 600 },
    color: "bg-blue-500",
  },
  store: {
    id: "store",
    name: "App Store",
    icon: "bag",
    component: NerdyStore,
    defaultSize: { width: 900, height: 600 },
    color: "bg-purple-600",
  },
  notes: {
    id: "notes",
    name: "Notes",
    icon: "note",
    component: NerdyNotes, // Now implemented
    defaultSize: { width: 600, height: 400 },
    color: "bg-yellow-400",
  },
  calendar: {
    id: "calendar",
    name: "Calendar",
    icon: "calendar_month",
    component: NerdyCalendar,
    defaultSize: { width: 800, height: 600 },
    color: "bg-rose-500",
  },
  monitor: {
    id: "monitor",
    name: "System Monitor",
    icon: "monitoring",
    component: SystemMonitor,
    defaultSize: { width: 500, height: 400 },
    color: "bg-green-600",
  },
  messages: {
    id: "messages",
    name: "Messages",
    icon: "forum",
    component: NerdyMessages,
    defaultSize: { width: 800, height: 600 },
    color: "bg-emerald-500",
  },
  mail: {
    id: "mail",
    name: "Mail",
    icon: "mail",
    component: ({}) => <PlaceholderApp title="Mail" />,
    defaultSize: { width: 900, height: 600 },
    color: "bg-sky-500",
  },
  maps: {
    id: "maps",
    name: "Maps",
    icon: "map",
    component: ({}) => <PlaceholderApp title="Maps" />,
    defaultSize: { width: 900, height: 600 },
    color: "bg-green-500",
  },
  photos: {
    id: "photos",
    name: "Photos",
    icon: "photo",
    component: ({}) => <PlaceholderApp title="Photos" />,
    defaultSize: { width: 800, height: 600 },
    color: "bg-purple-500",
  },
  ide: {
    id: "ide",
    name: "Nerdy Studio",
    icon: "code",
    component: ({}) => <PlaceholderApp title="Nerdy Studio" />,
    defaultSize: { width: 1100, height: 700 },
    color: "bg-blue-700",
  },
  code_editor: {
    id: "code_editor",
    name: "Text Editor",
    icon: "edit_note",
    component: ({}) => <PlaceholderApp title="Text Editor" />,
    defaultSize: { width: 800, height: 600 },
    color: "bg-slate-600",
  },
  tasks: {
    id: "tasks",
    name: "Tasks",
    icon: "check_circle",
    component: ({}) => <PlaceholderApp title="Tasks" />,
    defaultSize: { width: 400, height: 500 },
    color: "bg-indigo-500",
  },
  pdf_reader: {
    id: "pdf_reader",
    name: "PDF Viewer",
    icon: "picture_as_pdf",
    component: ({}) => <PlaceholderApp title="PDF Viewer" />,
    defaultSize: { width: 800, height: 900 },
    color: "bg-red-500",
  },
};

export const getAppById = (id) => APP_REGISTRY[id];

export default APP_REGISTRY;
