import React from "react";
import useSystemStore from "../../../store/systemStore";
import { SettingsCard, Toggle } from "../components/Shared";

const GamingPage = () => {
  const { gameMode, toggleGameMode } = useSystemStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">Gaming</h1>

      <SettingsCard
        icon="🎮"
        title="Game Mode"
        subtitle="Optimize your PC for play by turning things off in the background"
        action={<Toggle checked={gameMode} onChange={toggleGameMode} />}
      />

      <SettingsCard
        icon="📹"
        title="Captures"
        subtitle="Save location, recording preference"
        showArrow
      />

      <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg border border-white/10 flex items-center gap-4">
        <div className="text-4xl">🕹️</div>
        <div>
          <h3 className="font-bold text-lg mb-1">Xbox Game Pass</h3>
          <p className="text-sm text-gray-300 mb-3">
            Discover your next favorite game. Play over 100 high-quality PC
            games.
          </p>
          <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-semibold">
            Join now
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamingPage;
