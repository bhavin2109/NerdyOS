import React from "react";
import { SettingsCard, SectionTitle } from "../components/Shared";

const PrivacyPage = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">
        Privacy & security
      </h1>

      <SectionTitle title="Security" />
      <SettingsCard
        icon="🛡️"
        title="Windows Security"
        subtitle="Antivirus, browser, firewall, and network protection"
        showArrow
      />
      <SettingsCard
        icon="🔎"
        title="Find my device"
        subtitle="Track your device if you think you've lost it"
        showArrow
      />
      <SettingsCard icon="🔒" title="Device encryption" showArrow />

      <SectionTitle title="Windows permissions" />
      <SettingsCard icon="📄" title="General" showArrow />
      <SettingsCard icon="🗣️" title="Speech" showArrow />
      <SettingsCard icon="📍" title="Location" showArrow />

      <SectionTitle title="App permissions" />
      <SettingsCard icon="📷" title="Camera" showArrow />
      <SettingsCard icon="🎤" title="Microphone" showArrow />
      <SettingsCard icon="🔔" title="Notifications" showArrow />
    </div>
  );
};

export default PrivacyPage;
