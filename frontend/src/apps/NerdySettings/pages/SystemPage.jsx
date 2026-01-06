import React from "react";
import useSystemStore from "../../../store/systemStore";
import { SettingsCard, Toggle, SectionTitle } from "../components/Shared";

const SystemPage = () => {
  const {
    brightness,
    setBrightness,
    volume,
    setVolume,
    notificationsEnabled,
    toggleNotifications,
    nightLight,
    toggleNightLight,
    battery,
  } = useSystemStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">System</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#2B2B2B] p-4 rounded-lg flex flex-col gap-2">
          <span className="text-3xl">💻</span>
          <div className="text-sm font-bold">NerdyBook Pro</div>
          <div className="text-xs text-gray-400">NerdyOS 1.0</div>
          <div className="text-xs text-blue-400 mt-auto cursor-pointer">
            Rename
          </div>
        </div>
        <div className="bg-[#2B2B2B] p-4 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-3xl">🔋</span>
            <span className="text-xl font-bold">{battery.level}%</span>
          </div>
          <div className="text-sm font-bold">Battery</div>
          <div className="text-xs text-gray-400">
            {battery.charging ? "Charging" : `Estimated 4h remaining`}
          </div>
          <div className="w-full bg-[#444] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${battery.level}%` }}
            />
          </div>
        </div>
      </div>

      <SectionTitle title="Display" />
      <SettingsCard
        icon="☀️"
        title="Brightness"
        subtitle="Adjust the brightness of the built-in display"
        action={
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-32 accent-cyan-500"
          />
        }
      />
      <SettingsCard
        icon="🌙"
        title="Night Light"
        subtitle="Use warmer colors to help block blue light"
        action={<Toggle checked={nightLight} onChange={toggleNightLight} />}
      />

      <SectionTitle title="Sound" />
      <SettingsCard
        icon="🔊"
        title="Volume"
        subtitle="System volume output"
        action={
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-32 accent-cyan-500"
          />
        }
      />

      <SectionTitle title="Notifications" />
      <SettingsCard
        icon="🔔"
        title="Notifications"
        subtitle="Get notifications from apps and other senders"
        action={
          <Toggle
            checked={notificationsEnabled}
            onChange={toggleNotifications}
          />
        }
      />

      <SettingsCard
        icon="💤"
        title="Focus Assist"
        subtitle="Notifications are prioritized"
        showArrow
      />
    </div>
  );
};

export default SystemPage;
