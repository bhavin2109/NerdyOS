import React from "react";
import useSystemStore from "../../../store/systemStore";
import { SettingsCard, Toggle, SectionTitle } from "../components/Shared";

const BluetoothPage = () => {
  const { bluetooth, toggleBluetooth, connectedDevices } = useSystemStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">
        Bluetooth & devices
      </h1>

      <SettingsCard
        large
        title="Bluetooth"
        subtitle="Discoverable as 'NerdyBook Pro'"
        action={<Toggle checked={bluetooth} onChange={toggleBluetooth} />}
        className={!bluetooth ? "opacity-75" : ""}
      />

      <div className="my-6 flex justify-center">
        <button
          disabled={!bluetooth}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md font-medium transition-colors"
        >
          <span className="text-xl">+</span> Add device
        </button>
      </div>

      {bluetooth && (
        <>
          <SectionTitle title="Connected Devices" />
          {connectedDevices.map((device) => (
            <SettingsCard
              key={device.id}
              icon={device.type === "audio" ? "🎧" : "🖱️"}
              title={device.name}
              subtitle={
                device.connected
                  ? `Connected ${device.battery ? `• ${device.battery}%` : ""}`
                  : "Paired"
              }
              action={
                <button className="text-xs bg-[#3C3C3C] hover:bg-[#444] px-3 py-1.5 rounded border border-[#484848]">
                  {device.connected ? "Disconnect" : "Connect"}
                </button>
              }
            />
          ))}
        </>
      )}

      <SectionTitle title="Other devices" />
      <SettingsCard icon="🖨️" title="Printers & scanners" showArrow />
      <SettingsCard icon="📷" title="Cameras" showArrow />
      <SettingsCard icon="🖱️" title="Mouse" showArrow />
    </div>
  );
};

export default BluetoothPage;
