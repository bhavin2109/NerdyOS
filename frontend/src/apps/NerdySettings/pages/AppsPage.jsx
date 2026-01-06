import React from "react";
import useSystemStore from "../../../store/systemStore";
import { APP_REGISTRY } from "../../../os/appRegistry";
import { SettingsCard, SectionTitle } from "../components/Shared";

const AppsPage = () => {
  const { installedApps, uninstallApp, installApp } = useSystemStore();

  const allApps = Object.values(APP_REGISTRY).filter(
    (app) => app.id !== "settings"
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">Apps</h1>

      <SectionTitle title="Installed Apps" />

      <div className="flex flex-col gap-2">
        {allApps.map((app) => {
          const isInstalled = installedApps.includes(app.id);
          if (!isInstalled) return null; // Show only installed, or maybe all with "Install" option? Settings usually shows installed.

          return (
            <SettingsCard
              key={app.id}
              icon={app.icon} // Text icon or name char
              // TODO: better icon handling for SettingsCard if generic icon string passed
              title={app.name}
              subtitle="1.0.0 • Nerdy Corp"
              large={false}
              action={
                <button
                  onClick={() => uninstallApp(app.id)}
                  className="text-xs bg-[#3C3C3C] hover:bg-[#444] px-3 py-1.5 rounded border border-[#484848] text-white"
                >
                  Uninstall
                </button>
              }
            />
          );
        })}
      </div>

      <SectionTitle title="Advanced app settings" />
      <SettingsCard icon="🔒" title="Default apps" showArrow />
      <SettingsCard icon="📶" title="Offline maps" showArrow />
      <SettingsCard icon="🌐" title="Apps for websites" showArrow />
    </div>
  );
};

export default AppsPage;
