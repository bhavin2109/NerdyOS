import React from "react";
import useSystemStore from "../../../store/systemStore";
import { SettingsCard, SectionTitle } from "../components/Shared";

const AccountsPage = () => {
  const { userProfile, updateUserProfile } = useSystemStore();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Users & Groups</h1>

      <div className="bg-[#2c2c2e] p-6 rounded-xl flex items-center gap-6 mb-8 border border-white/5">
        <img src={userProfile.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{userProfile.name}</h2>
          <p className="text-white/50">{userProfile.email}</p>
          <button
            onClick={() => {
              const newName = prompt("Enter new name:", userProfile.name);
              if (newName) updateUserProfile({ name: newName });
            }}
            className="text-[#0A84FF] text-sm mt-2 hover:underline"
          >
            Edit profile
          </button>
        </div>
      </div>

      <SectionTitle title="Sign-in & Security" />
      <SettingsCard icon="👤" title="Login Items" subtitle="Apps that open at startup" showArrow />
      <SettingsCard icon="🔑" title="Password" subtitle="Change your NerdyOS password" showArrow />
      <SettingsCard icon="📧" title="Email & Accounts" subtitle="Connected accounts" showArrow />
      <SettingsCard icon="💾" title="NerdyCloud Backup" subtitle="Back up your files and settings" showArrow />
    </div>
  );
};

export default AccountsPage;
