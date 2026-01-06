import React, { useState, useEffect } from "react";
import { SettingsCard, Toggle } from "../components/Shared";

const TimePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">
        Time & language
      </h1>

      <div className="mb-6 p-4 rounded-lg bg-[#2B2B2B] border border-[#353535]">
        <div className="text-4xl font-light mb-1">
          {currentDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        <div className="text-gray-400">
          {currentDate.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <SettingsCard
        icon="🕒"
        title="Set time automatically"
        action={<Toggle checked={true} onChange={() => {}} />}
      />
      <SettingsCard
        icon="🌐"
        title="Time zone"
        subtitle="(UTC-08:00) Pacific Time (US & Canada)"
        showArrow
      />
      <SettingsCard
        icon="🗣️"
        title="Language & region"
        subtitle="Windows display language, preferred languages, regional format"
        showArrow
      />
    </div>
  );
};

export default TimePage;
