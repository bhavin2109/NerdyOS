import React from "react";
import useSystemStore from "../../../store/systemStore";

const PersonalizationPage = () => {
  const {
    wallpaper,
    setWallpaper,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    accentMode,
    setAccentMode,
  } = useSystemStore();

  const wallpapers = [
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1932&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533130061792-649d45e41255?q=80&w=2072&auto=format&fit=crop",
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">
        Personalization
      </h1>

      <div className="mb-4">
        <div className="aspect-[21/9] w-full bg-black rounded-lg mb-4 overflow-hidden shadow-lg border border-white/10 relative">
          <img
            src={wallpaper}
            className="w-full h-full object-cover"
            alt="Current preview"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-medium border border-white/20">
            Preview
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">
          Select a theme to apply
        </h3>
        <div className="flex gap-4">
          <div
            className={`w-32 h-20 rounded-lg border-2 cursor-pointer relative overflow-hidden transition-all ${
              theme === "light"
                ? "border-cyan-400 scale-105"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onClick={() => setTheme("light")}
          >
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-black font-bold text-xs p-2">
              <div className="w-full h-full bg-white rounded shadow-sm flex flex-col p-1">
                <div className="w-8 h-1 bg-blue-500 rounded-full mb-1"></div>
                <div className="flex-1"></div>
              </div>
            </div>
            <div className="absolute bottom-1 left-0 w-full text-center text-[10px] text-black font-bold">
              Light
            </div>
          </div>
          <div
            className={`w-32 h-20 rounded-lg border-2 cursor-pointer relative overflow-hidden transition-all ${
              theme === "dark"
                ? "border-cyan-400 scale-105"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onClick={() => setTheme("dark")}
          >
            <div className="absolute inset-0 bg-[#1e1e1e] flex items-center justify-center text-white font-bold text-xs p-2">
              <div className="w-full h-full bg-[#2b2b2b] rounded shadow-sm flex flex-col p-1">
                <div className="w-8 h-1 bg-blue-500 rounded-full mb-1"></div>
                <div className="flex-1"></div>
              </div>
            </div>
            <div className="absolute bottom-1 left-0 w-full text-center text-[10px] text-white font-bold">
              Dark
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">Background</h3>
        <div className="grid grid-cols-3 gap-4">
          {wallpapers.map((wp, idx) => (
            <div
              key={idx}
              className={`aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                wallpaper === wp
                  ? "border-cyan-400 scale-105 shadow-lg shadow-cyan-500/20"
                  : "border-transparent hover:scale-105 border-gray-700/50"
              }`}
              onClick={() => setWallpaper(wp)}
            >
              <img
                src={wp}
                alt={`Wallpaper ${idx}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">Accent Color</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setAccentMode("auto")}
              className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                accentMode === "auto"
                  ? "bg-white/10 border-cyan-400 text-white"
                  : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
              }`}
            >
              Auto (Matches Wallpaper)
            </button>
            <button
              onClick={() => setAccentMode("manual")}
              className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                accentMode === "manual"
                  ? "bg-white/10 border-cyan-400 text-white"
                  : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
              }`}
            >
              Manual
            </button>
          </div>

          {accentMode === "manual" && (
            <div className="grid grid-cols-6 gap-3">
              {[
                "#3b82f6", // Blue
                "#06b6d4", // Cyan
                "#a855f7", // Purple
                "#ec4899", // Pink
                "#ef4444", // Red
                "#f97316", // Orange
                "#eab308", // Yellow
                "#22c55e", // Green
              ].map((color) => (
                <div
                  key={color}
                  className={`w-10 h-10 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 ${
                    accentColor === color
                      ? "border-white"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAccentColor(color)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPage;
