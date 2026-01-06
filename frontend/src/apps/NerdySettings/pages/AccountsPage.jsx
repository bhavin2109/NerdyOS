import React from "react";
import useSystemStore from "../../../store/systemStore";
import { SettingsCard, SectionTitle } from "../components/Shared";

const AccountsPage = () => {
  const { userProfile, updateUserProfile } = useSystemStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">Accounts</h1>

      <div className="bg-[#2B2B2B] p-6 rounded-lg flex items-center gap-6 mb-8 border border-[#353535]">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/30">
          <img
            src={userProfile.avatar}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">{userProfile.name}</h2>
          <p className="text-gray-400">{userProfile.email}</p>
          <p className="text-cyan-400 text-sm mt-1 cursor-pointer hover:underline">
            Manage my Microsoft account
          </p>
        </div>
      </div>

      <SectionTitle title="Account settings" />
      <SettingsCard
        icon="👤"
        title="Your info"
        subtitle="Accounts, profile picture, data"
        showArrow
        onClick={() => {
          const newName = prompt("Enter new name:", userProfile.name);
          if (newName) updateUserProfile({ name: newName });
        }}
      />
      <SettingsCard
        icon="🔑"
        title="Sign-in options"
        subtitle="Windows Hello, security key, password"
        showArrow
      />
      <SettingsCard
        icon="📧"
        title="Email & accounts"
        subtitle="Accounts used by email, calendar, and contacts"
        showArrow
      />
      <SettingsCard
        icon="👨‍👩‍👧"
        title="Family & other users"
        subtitle="Device access, work, school users"
        showArrow
      />
      <SettingsCard
        icon="💾"
        title="Windows backup"
        subtitle="Back up your files, apps, preferences to restore them across devices"
        showArrow
      />
    </div>
  );
};

export default AccountsPage;
