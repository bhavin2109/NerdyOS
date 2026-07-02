import React from "react";
import useSystemStore from "../../../store/systemStore";
import { APP_REGISTRY } from "../../../os/appRegistry";
import { SettingsCard, SectionTitle } from "../components/Shared";
import AppIcon from "../../../components/AppIcon";
import clsx from "clsx";

const AppsPage = () => {
  const { installedApps, uninstallApp } = useSystemStore();

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
          if (!isInstalled) return null;

          return (
            <SettingsCard
              key={app.id}
              icon={
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-sm relative overflow-hidden shrink-0 select-none",
                  app.color || "bg-blue-600"
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  <AppIcon app={app} className="w-7 h-7 object-contain relative z-10" />
                </div>
              }
              title={app.name}
              subtitle="1.0.0 • Nerdy Corp"
              large={false}
              action={
                !['finder', 'settings', 'browser', 'terminal', 'store'].includes(app.id) && (
                  <button
                    onClick={() => uninstallApp(app.id)}
                    className="text-xs bg-[#3C3C3C] hover:bg-[#ff453a]/20 hover:text-[#ff453a] hover:border-[#ff453a]/30 active:scale-95 px-3 py-1.5 rounded-lg border border-[#484848] text-white transition-all font-medium"
                  >
                    Uninstall
                  </button>
                )
              }
            />
          );
        })}
      </div>

      <SectionTitle title="Advanced app settings" />
      <SettingsCard
        icon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl bg-blue-500 shadow-sm relative overflow-hidden shrink-0 select-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <span className="relative z-10">🔒</span>
          </div>
        }
        title="Default apps"
        showArrow
      />
      <SettingsCard
        icon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl bg-emerald-600 shadow-sm relative overflow-hidden shrink-0 select-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <span className="relative z-10">🗺️</span>
          </div>
        }
        title="Offline maps"
        showArrow
      />
      <SettingsCard
        icon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl bg-purple-600 shadow-sm relative overflow-hidden shrink-0 select-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <span className="relative z-10">🌐</span>
          </div>
        }
        title="Apps for websites"
        showArrow
      />
    </div>
  );
};

export default AppsPage;
