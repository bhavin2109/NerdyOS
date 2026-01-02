import { motion } from "framer-motion";
import { useState } from "react";
import useSystemStore from "../../store/systemStore";

const ControlPanel = () => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(true);
  const [dnd, setDnd] = useState(false);

  const { brightness, setBrightness, volume, setVolume } = useSystemStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-10 right-2 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 text-white z-[100]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Connectivity Group */}
        <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col gap-3">
          <div className="flex gap-3">
            <ConnectivityToggle
              active={wifi}
              onClick={() => setWifi(!wifi)}
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              }
              label="Wi-Fi"
              subLabel={wifi ? "NerdyOS_5G" : "Off"}
            />
            <ConnectivityToggle
              active={bluetooth}
              onClick={() => setBluetooth(!bluetooth)}
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                /> // Accessability Icon placeholder, replaced with BT below
              }
              customIcon={
                <svg
                  className={`w-5 h-5 ${
                    bluetooth ? "text-white" : "text-white"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V5l12 7-5 4.167M9 19l6.083-4.833M9 5l6.083 4.833"
                  />
                </svg>
              }
              label="Bluetooth"
              subLabel={bluetooth ? "On" : "Off"}
            />
          </div>
          <div className="flex gap-3">
            <ConnectivityToggle
              active={airdrop}
              onClick={() => setAirdrop(!airdrop)}
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              }
              label="AirDrop"
              subLabel="Everyone"
            />
            <ConnectivityToggle
              active={false}
              onClick={() => {}}
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              }
              label="Hotspot"
              subLabel="Off"
            />
          </div>
        </div>

        {/* Do Not Disturb & Screen Mirroring */}
        <div className="flex flex-col gap-3">
          <div
            className="flex-1 bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setDnd(!dnd)}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                dnd ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-400"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <div className="text-sm font-medium">Do Not Disturb</div>
          </div>

          <div className="flex-1 bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
            </div>
            <div className="text-sm font-medium">Screen Mirroring</div>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-slate-800/50 rounded-xl p-4 flex flex-col gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
            Display
          </span>
          <div className="relative h-8 w-full bg-slate-900/50 rounded-full overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div
              className="absolute top-0 left-0 h-full bg-white transition-all"
              style={{ width: `${brightness}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="absolute top-0 left-3 h-full flex items-center text-slate-500 pointer-events-none mix-blend-difference">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
            Sound
          </span>
          <div className="relative h-8 w-full bg-slate-900/50 rounded-full overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div
              className="absolute top-0 left-0 h-full bg-white transition-all"
              style={{ width: `${volume}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="absolute top-0 left-3 h-full flex items-center text-slate-500 pointer-events-none mix-blend-difference">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Media Player Placeholder */}
      <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">Nothing Playing</div>
          <div className="text-xs text-slate-400 truncate">
            Select music to start
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

const ConnectivityToggle = ({
  active,
  onClick,
  icon,
  customIcon,
  label,
  subLabel,
}) => (
  <div
    className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
      active
        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
        : "bg-slate-700 text-slate-400"
    }`}
    onClick={onClick}
    title={`${label}: ${subLabel}`}
  >
    {customIcon || (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icon}
      </svg>
    )}
  </div>
);

export default ControlPanel;
