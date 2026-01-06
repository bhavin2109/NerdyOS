import React from "react";
import useSystemStore from "../../../store/systemStore";
import { SettingsCard, Toggle } from "../components/Shared";

const NetworkPage = () => {
  const { wifi, toggleWifi, airplaneMode, toggleAirplaneMode } =
    useSystemStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">
        Network & internet
      </h1>

      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl border-4 ${
              wifi
                ? "border-green-500 text-green-500"
                : "border-gray-600 text-gray-500"
            }`}
          >
            🌍
          </div>
          <div className="font-bold text-lg">
            {wifi ? "Connected" : "Not connected"}
          </div>
          <div className="text-sm text-gray-400">
            {wifi ? "NerdyNet_5G" : "You are offline"}
          </div>
        </div>
        <div className="flex-1 ml-8 flex flex-col gap-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Properties</span>
            <span className="text-cyan-400 cursor-pointer">Public network</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Data usage</span>
            <span>12.5 GB (last 30 days)</span>
          </div>
        </div>
      </div>

      <SettingsCard
        icon="📡"
        title="Wi-Fi"
        subtitle="Connect, manage known networks"
        action={<Toggle checked={wifi} onChange={toggleWifi} />}
        showArrow={wifi}
      />
      <SettingsCard
        icon="✈️"
        title="Airplane mode"
        subtitle="Stop all wireless communication"
        action={<Toggle checked={airplaneMode} onChange={toggleAirplaneMode} />}
      />
      <SettingsCard
        icon="🛡️"
        title="VPN"
        subtitle="Add, connect, manage"
        showArrow
      />
      <SettingsCard
        icon="📱"
        title="Mobile hotspot"
        subtitle="Share your internet connection"
        action={<Toggle checked={false} onChange={() => {}} />}
      />
    </div>
  );
};

export default NetworkPage;
