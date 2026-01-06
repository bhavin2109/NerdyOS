import React from "react";
import { SettingsCard, SectionTitle } from "../components/Shared";

const AccessibilityPage = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">Accessibility</h1>

      <SectionTitle title="Vision" />
      <SettingsCard icon="🅰️" title="Text size" showArrow />
      <SettingsCard icon="👁️" title="Visual effects" showArrow />
      <SettingsCard icon="🖱️" title="Mouse pointer and touch" showArrow />

      <SectionTitle title="Hearing" />
      <SettingsCard icon="👂" title="Audio" showArrow />
      <SettingsCard icon="📝" title="Captions" showArrow />

      <SectionTitle title="Interaction" />
      <SettingsCard icon="🗣️" title="Speech" showArrow />
      <SettingsCard icon="⌨️" title="Keyboard" showArrow />
      <SettingsCard icon="🖱️" title="Mouse" showArrow />
    </div>
  );
};

export default AccessibilityPage;
