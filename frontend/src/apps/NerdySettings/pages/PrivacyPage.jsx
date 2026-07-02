import React from "react";
import { SettingsCard, SectionTitle } from "../components/Shared";

const PrivacyPage = () => (
  <div>
    <h1 className="text-2xl font-semibold text-white mb-6">Privacy & Security</h1>

    <SectionTitle title="Security" />
    <SettingsCard icon="🛡️" title="NerdyOS Security" subtitle="Firewall and browser protection" showArrow />
    <SettingsCard icon="🔎" title="Find My Device" subtitle="Locate this device if lost" showArrow />
    <SettingsCard icon="🔒" title="FileVault" subtitle="Encrypt data on this device" showArrow />

    <SectionTitle title="Privacy" />
    <SettingsCard icon="📄" title="Analytics" showArrow />
    <SettingsCard icon="🗣️" title="Speech Recognition" showArrow />
    <SettingsCard icon="📍" title="Location Services" showArrow />

    <SectionTitle title="App Permissions" />
    <SettingsCard icon="📷" title="Camera" showArrow />
    <SettingsCard icon="🎤" title="Microphone" showArrow />
    <SettingsCard icon="🔔" title="Notifications" showArrow />
  </div>
);

export default PrivacyPage;
