import React, { useState } from "react";
import clsx from "clsx";
import useSystemStore from "../../store/systemStore";
import { SettingsCard, SectionTitle } from "./components/Shared";

// Pages
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
import UpdatePage from "./pages/UpdatePage";

// --- Icons (Using SVG for cleaner look) ---
const Icons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  System: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6v2H8v2h8v-2h-2v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z" />
    </svg>
  ),
  Bluetooth: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
    </svg>
  ),
  Network: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  Personalization: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  Apps: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </svg>
  ),
  Accounts: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  ),
  Time: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  ),
  Gaming: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  ),
  Accessibility: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
    </svg>
  ),
  Privacy: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  ),
  Update: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.51-3.47-3.51-9.11 0-12.58 3.51-3.47 9.14-3.47 12.65 0l3.65-3.69H7.06v-3L21 10.12z" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
  NetworkLarge: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  UpdateLarge: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.51-3.47-3.51-9.11 0-12.58 3.51-3.47 9.14-3.47 12.65 0l3.65-3.69H7.06v-3L21 10.12z" />
    </svg>
  ),
};

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full flex items-center gap-4 px-3 py-2 rounded-[4px] text-sm text-left transition-colors relative mb-0.5",
      isActive
        ? "bg-[#3C3C3C] text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-4 before:bg-[#76B9ED] before:rounded-full ml-1"
        : "text-[#E6E6E6] hover:bg-[#323232] hover:ml-1 ml-1"
    )}
  >
    <div className={clsx(isActive ? "text-[#76B9ED]" : "text-[#989898]")}>
      <Icon />
    </div>
    <span className="font-normal tracking-wide">{label}</span>
  </button>
);

const HeroCard = ({ profile }) => (
  <div className="bg-[#2B2B2B] border border-[#353535] rounded-lg p-0 overflow-hidden mb-6 flex relative group">
    {/* Device Image / Artwork */}
    <div className="w-24 bg-black relative shrink-0">
      <img
        src={profile.avatar}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        alt="Profile"
      />
    </div>

    {/* Info */}
    <div className="flex-1 p-5 flex flex-col justify-center">
      <h2 className="text-xl font-semibold text-white mb-0.5">
        {profile.name}
      </h2>
      <div className="text-sm text-[#A0A0A0] uppercase tracking-wider font-semibold">
        NerdyOS Pro
      </div>
      <div className="text-xs text-[#808080] mt-1 hover:text-[#76B9ED] cursor-pointer">
        Rename
      </div>
    </div>

    {/* Statuses */}
    <div className="flex flex-col justify-center pr-8 gap-3 border-l border-[#353535] pl-6 my-4">
      <div className="flex items-center gap-3">
        <div className="text-[#76B9ED]">
          <Icons.NetworkLarge />
        </div>
        <div>
          <div className="text-sm font-medium text-white">NerdyNet_5G</div>
          <div className="text-xs text-[#A0A0A0]">Connected, secured</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[#76B9ED]">
          <Icons.UpdateLarge />
        </div>
        <div>
          <div className="text-sm font-medium text-white">Windows Update</div>
          <div className="text-xs text-[#A0A0A0]">
            Last checked: 14 mins ago
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HomeContent = ({ profile }) => (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
    <h1 className="text-2xl font-semibold text-white mb-6">Home</h1>

    <HeroCard profile={profile} />

    <SectionTitle title="Recommended settings" />

    {/* Recommended Settings Card */}
    <div className="bg-[#2B2B2B] border border-[#353535] rounded-lg p-0 mb-6 overflow-hidden">
      <div className="flex items-center justify-between p-4 hover:bg-[#323232] transition-colors cursor-pointer border-b border-[#353535]">
        <div className="flex items-center gap-4">
          <div className="text-xl">✨</div>
          <div>
            <div className="text-[14px] text-white">
              Turn on dark mode based on sunset
            </div>
            <div className="text-xs text-[#A0A0A0]">
              Automatically switch themes to reduce eye strain
            </div>
          </div>
        </div>
        <button className="bg-[#3C3C3C] hover:bg-[#444] text-white text-[13px] px-4 py-1.5 rounded-[4px] border border-[#484848]">
          Apply
        </button>
      </div>
      <div className="flex items-center justify-between p-4 hover:bg-[#323232] transition-colors cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="text-xl">⌨️</div>
          <div>
            <div className="text-[14px] text-white">Taskbar behaviors</div>
            <div className="text-xs text-[#A0A0A0]">
              Customize alignment and badging
            </div>
          </div>
        </div>
        <div className="text-[#808080]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <SettingsCard
        image="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
        title="Microsoft 365"
        subtitle="View benefits"
        large
        showArrow
      />
      <SettingsCard
        icon="☁️"
        title="Cloud storage"
        subtitle="You are using 0% of your 5 GB"
        showArrow
      />
      <SettingsCard
        icon="🎮"
        title="Gaming"
        subtitle="Game Mode is On"
        showArrow
      />
    </div>
  </div>
);

const NerdySettings = () => {
  const { userProfile } = useSystemStore();
  const [activeTab, setActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { id: "Home", icon: Icons.Home, label: "Home" },
    { id: "System", icon: Icons.System, label: "System" },
    { id: "Bluetooth", icon: Icons.Bluetooth, label: "Bluetooth & devices" },
    { id: "Network", icon: Icons.Network, label: "Network & internet" },
    {
      id: "Personalization",
      icon: Icons.Personalization,
      label: "Personalization",
    },
    { id: "Apps", icon: Icons.Apps, label: "Apps" },
    { id: "Accounts", icon: Icons.Accounts, label: "Accounts" },
    { id: "Time", icon: Icons.Time, label: "Time & language" },
    { id: "Gaming", icon: Icons.Gaming, label: "Gaming" },
    { id: "Accessibility", icon: Icons.Accessibility, label: "Accessibility" },
    { id: "Privacy", icon: Icons.Privacy, label: "Privacy & security" },
    { id: "Update", icon: Icons.Update, label: "Windows Update" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return <HomeContent profile={userProfile} />;
      case "System":
        return <SystemPage />;
      case "Bluetooth":
        return <BluetoothPage />;
      case "Network":
        return <NetworkPage />;
      case "Personalization":
        return <PersonalizationPage />;
      case "Apps":
        return <AppsPage />;
      case "Accounts":
        return <AccountsPage />;
      case "Time":
        return <TimePage />;
      case "Gaming":
        return <GamingPage />;
      case "Accessibility":
        return <AccessibilityPage />;
      case "Privacy":
        return <PrivacyPage />;
      case "Update":
        return <UpdatePage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-[#A0A0A0]">
            <div className="text-4xl mb-4 text-[#333]">🚧</div>
            <h2 className="text-lg font-semibold text-white mb-2">
              {activeTab}
            </h2>
            <p className="text-sm">This section is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full bg-[#1F1F1F] text-white font-sans overflow-hidden select-none">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#202020] flex flex-col pt-0 pb-4 h-full shrink-0">
        {/* Profile Header */}
        <div className="px-4 py-6 mb-2">
          <div className="flex items-center gap-3 mb-6 px-2">
            <img
              src={userProfile.avatar}
              className="w-8 h-8 rounded-full object-cover"
              alt="Profile"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold leading-tight">
                {userProfile.name}
              </span>
              <span className="text-[11px] text-[#A0A0A0] leading-tight truncate max-w-[150px]">
                {userProfile.email}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#76B9ED]">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Find a setting"
              className="w-full bg-[#2D2D2D] border-b border-[#8D8D8D] group-focus-within:border-[#76B9ED] text-[13px] text-white placeholder-[#A0A0A0] pl-9 pr-3 py-1.5 outline-none transition-colors rounded-t-[4px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#1C1C1C] h-full overflow-y-auto p-8 relative">
        <div className="max-w-[1000px] mx-auto pb-10">{renderContent()}</div>
      </div>
    </div>
  );
};

export default NerdySettings;
