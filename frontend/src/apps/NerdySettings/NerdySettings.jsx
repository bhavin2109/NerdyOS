import React, { useState, useMemo } from "react";
import clsx from "clsx";
import useSystemStore from "../../store/systemStore";
import { SettingsCard, SectionTitle } from "./components/Shared";

import SystemPage from "./pages/SystemPage";
import BluetoothPage from "./pages/BluetoothPage";
import NetworkPage from "./pages/NetworkPage";
import PersonalizationPage from "./pages/PersonalizationPage";
import AppsPage from "./pages/AppsPage";
import AccountsPage from "./pages/AccountsPage";
import TimePage from "./pages/TimePage";
import GamingPage from "./pages/GamingPage";
import AccessibilityPage from "./pages/AccessibilityPage";
import PrivacyPage from "./pages/PrivacyPage";

const Icons = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
  ),
  System: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6v2H8v2h8v-2h-2v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /></svg>
  ),
  Bluetooth: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71z" /></svg>
  ),
  Network: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg>
  ),
  Personalization: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" /></svg>
  ),
  Apps: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4z" /></svg>
  ),
  Accounts: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" /></svg>
  ),
  Time: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
  ),
  Gaming: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" /></svg>
  ),
  Accessibility: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" /></svg>
  ),
  Privacy: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z" /></svg>
  ),
};

const NAV_ITEMS = [
  { id: "Home", icon: Icons.Home, label: "General" },
  { id: "Personalization", icon: Icons.Personalization, label: "Appearance" },
  { id: "System", icon: Icons.System, label: "System" },
  { id: "Network", icon: Icons.Network, label: "Network" },
  { id: "Bluetooth", icon: Icons.Bluetooth, label: "Bluetooth" },
  { id: "Apps", icon: Icons.Apps, label: "Apps" },
  { id: "Accounts", icon: Icons.Accounts, label: "Users & Groups" },
  { id: "Time", icon: Icons.Time, label: "Date & Time" },
  { id: "Gaming", icon: Icons.Gaming, label: "Performance" },
  { id: "Accessibility", icon: Icons.Accessibility, label: "Accessibility" },
  { id: "Privacy", icon: Icons.Privacy, label: "Privacy & Security" },
];

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-left transition-colors mb-0.5",
      isActive ? "bg-[#0A84FF]/20 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
    )}
  >
    <div className={clsx(isActive ? "text-[#0A84FF]" : "text-white/50")}><Icon /></div>
    <span>{label}</span>
  </button>
);

const HomeContent = ({ profile, onNavigate }) => (
  <div>
    <h1 className="text-2xl font-semibold text-white mb-6">General</h1>
    <div className="bg-[#2c2c2e] rounded-xl p-5 mb-6 flex items-center gap-5 border border-white/5">
      <img src={profile.avatar} className="w-16 h-16 rounded-full object-cover" alt="Profile" />
      <div>
        <h2 className="text-lg font-semibold">{profile.name}</h2>
        <p className="text-sm text-white/50">{profile.email}</p>
        <button
          onClick={() => onNavigate("Accounts")}
          className="text-sm text-[#0A84FF] mt-1 hover:underline"
        >
          Manage profile
        </button>
      </div>
    </div>
    <SectionTitle title="Suggestions" />
    <SettingsCard
      icon="🌙"
      title="Appearance"
      subtitle="Wallpaper, theme, and accent color"
      showArrow
      onClick={() => onNavigate("Personalization")}
    />
    <SettingsCard
      icon="📱"
      title="Dock & Menu Bar"
      subtitle="Auto-hide dock, menu bar options"
      showArrow
      onClick={() => onNavigate("System")}
    />
    <SettingsCard
      icon="☁️"
      title="NerdyCloud"
      subtitle="Sync settings across devices"
      showArrow
    />
  </div>
);

const NerdySettings = () => {
  const { userProfile } = useSystemStore();
  const [activeTab, setActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return NAV_ITEMS;
    const q = searchQuery.toLowerCase();
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery]);

  const renderContent = () => {
    switch (activeTab) {
      case "Home": return <HomeContent profile={userProfile} onNavigate={setActiveTab} />;
      case "System": return <SystemPage />;
      case "Bluetooth": return <BluetoothPage />;
      case "Network": return <NetworkPage />;
      case "Personalization": return <PersonalizationPage />;
      case "Apps": return <AppsPage />;
      case "Accounts": return <AccountsPage />;
      case "Time": return <TimePage />;
      case "Gaming": return <GamingPage />;
      case "Accessibility": return <AccessibilityPage />;
      case "Privacy": return <PrivacyPage />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-[#1e1e1e] text-white font-sans overflow-hidden select-none">
      <button
        className="md:hidden absolute top-2 left-2 z-20 px-3 py-1.5 rounded-lg bg-white/10 text-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰ Settings
      </button>

      <div className={clsx(
        "w-[240px] sm:w-[260px] bg-[#252526] flex flex-col h-full shrink-0 border-r border-white/5",
        "absolute md:relative z-10 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="px-4 py-5">
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><Icons.Search /></div>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#3a3a3c] text-[13px] text-white placeholder-white/40 pl-8 pr-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#0A84FF]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredNav.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto p-4 sm:p-8" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        <div className="max-w-[900px] mx-auto pb-10">{renderContent()}</div>
      </div>
    </div>
  );
};

export default NerdySettings;
