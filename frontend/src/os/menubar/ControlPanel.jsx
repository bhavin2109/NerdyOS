import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSystemStore from "../../store/systemStore";

const ControlPanel = ({ initialView = null }) => {
  const {
    wifi,
    toggleWifi,
    bluetooth,
    toggleBluetooth,
    airdrop,
    toggleAirdrop,
    battery,
    brightness,
    setBrightness,
    volume,
    setVolume,
    accentColor,
  } = useSystemStore();

  const [activeDetail, setActiveDetail] = useState(initialView); // 'wifi' | 'bluetooth' | null

  // Wifi selection logic
  const networks = [
    { id: "nerdy", name: "NerdyOS_5G", secured: true, signal: 4 },
    { id: "guest", name: "Guest_WiFi", secured: false, signal: 3 },
    { id: "neighbor", name: "FBI Surveillance Van", secured: true, signal: 2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "circOut" }}
      className="absolute top-10 right-2 w-80 bg-[#1c1c1efc] backdrop-blur-[100px] rounded-2xl p-3 text-white z-[100] select-none shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 font-sans overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="wait">
        {activeDetail === "wifi" ? (
          <motion.div
            key="wifi-detail"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="flex flex-col h-[300px]"
          >
            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveDetail(null)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="font-semibold">Wi-Fi</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 mb-2">
                <span className="text-sm">Wi-Fi</span>
                <div
                  className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                    wifi ? "" : "bg-gray-600"
                  }`}
                  style={{ backgroundColor: wifi ? accentColor : undefined }}
                  onClick={toggleWifi}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      wifi ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {wifi &&
                networks.map((net) => (
                  <div
                    key={net.id}
                    className="flex items-center justify-between p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-4 h-4 text-white/70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                      </svg>
                      <span
                        className={`text-sm ${
                          net.id === "nerdy" ? "font-semibold" : "text-white"
                        }`}
                        style={{
                          color: net.id === "nerdy" ? accentColor : undefined,
                        }}
                      >
                        {net.name}
                      </span>
                    </div>
                    {net.secured && (
                      <svg
                        className="w-3 h-3 text-white/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                    {net.id === "nerdy" && (
                      <svg
                        className="w-4 h-4"
                        style={{ color: accentColor }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main-controls"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
          >
            <div className="grid grid-cols-2 gap-3 mb-3 h-36">
              {/* Top Left: Connectivity Block */}
              <div className="bg-[#323232]/50 rounded-2xl p-3 flex flex-col justify-center gap-3 border border-white/5 shadow-inner">
                <ConnectivityRow
                  active={wifi}
                  accentColor={accentColor}
                  onClick={() => {
                    if (!wifi) toggleWifi();
                  }}
                  onExpand={() => setActiveDetail("wifi")}
                  label="Wi-Fi"
                  subLabel={wifi ? "NerdyOS_5G" : "Off"}
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  }
                />
                <ConnectivityRow
                  active={bluetooth}
                  accentColor={accentColor}
                  onClick={toggleBluetooth}
                  label="Bluetooth"
                  subLabel={bluetooth ? "On" : "Off"}
                  customIcon={
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
                        d="M9 19V5l12 7-5 4.167M9 19l6.083-4.833M9 5l6.083 4.833"
                      />
                    </svg>
                  }
                />
                <ConnectivityRow
                  active={airdrop}
                  accentColor={accentColor}
                  onClick={toggleAirdrop}
                  label="AirDrop"
                  subLabel={airdrop ? "Everyone" : "Off"}
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  }
                />
              </div>

              {/* Top Right: Focus & Mirroring */}
              <div className="flex flex-col gap-3 h-full">
                <div className="flex-1 bg-[#323232]/50 hover:bg-[#323232]/70 rounded-2xl p-3 flex items-center gap-3 transition-colors duration-200 border border-white/5 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
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
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Focus</span>
                  </div>
                </div>
                <div className="flex-1 bg-[#323232]/50 hover:bg-[#323232]/70 rounded-2xl p-3 flex items-center gap-3 transition-colors duration-200 border border-white/5 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#323232] text-white flex items-center justify-center">
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
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Mirroring</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="bg-[#323232]/50 rounded-2xl p-3 mb-3 border border-white/5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Display
                </span>
                <MacOSSlider
                  value={brightness}
                  setValue={setBrightness}
                  accentColor={accentColor}
                  icon={
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
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Sound
                </span>
                <MacOSSlider
                  value={volume}
                  setValue={setVolume}
                  accentColor={accentColor}
                  icon={
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
                  }
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ConnectivityRow = ({
  active,
  onClick,
  onExpand,
  icon,
  customIcon,
  label,
  subLabel,
  accentColor,
}) => (
  <div className="flex items-center gap-0 group">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
        active ? "text-white" : "bg-[#5A5A5A] text-white/50 hover:bg-[#666666]"
      }`}
      style={{ backgroundColor: active ? accentColor : undefined }}
      onClick={onClick}
    >
      {customIcon || (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      )}
    </div>
    <div
      className="flex flex-col leading-tight flex-1 ml-3 cursor-pointer"
      onClick={onExpand || onClick}
    >
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-[10px] text-gray-400">{subLabel}</span>
    </div>
    {onExpand && (
      <div
        className="p-1 text-white/30 hover:text-white cursor-pointer"
        onClick={onExpand}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    )}
  </div>
);

const MacOSSlider = ({ value, setValue, icon, accentColor }) => (
  <div className="relative h-7 w-full bg-[#1e1e1e]/50 rounded-full overflow-hidden shadow-inner group border border-white/5">
    {/* Track Background */}
    <div className="absolute inset-0 bg-[#5A5A5A]/30"></div>

    {/* Active Fill */}
    <div
      className="absolute top-0 left-0 h-full transition-all duration-150 ease-out"
      style={{ width: `${value}%`, backgroundColor: "white" }}
    ></div>
    {/* Note: MacOS sliders are usually white or gray, but user asked for theme match. 
       Usually sliders are white, but icons are colored. 
       Wait, Control Panel icons are "blue" usually. 
       Let's stick to standard macOS slider (white active) BUT for the *icons*, I used accentColor.
       Actually, let's keep slider active fill as white (standard) or make it accentColor?
       Standard macOS Big Sur+ sliders are white. The icons are the themed part.
       BUT, let's try making the slider fill accentColor if the user really wants "theme matching".
       The prompts says "control panel icons... make them matching".
       So the buttons (ConnectivityRow) definitely need color. 
       The sliders? Let's leave them white for high visibility against dark mode, or standard.
       Actually, let's make them white to be safe, but I put inline style earlier?
       Ah, I replaced bg-white with just style width.
       Let's revert slider to bg-white.
    */}
    <div
      className="absolute top-0 left-0 h-full bg-white transition-all duration-150 ease-out"
      style={{ width: `${value}%` }}
    ></div>

    {/* Input */}
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
    />

    {/* Icon Container (Left) */}
    <div className="absolute top-0 left-0 w-7 h-full flex items-center justify-center z-10 pointer-events-none">
      <div
        className={`text-xs ${
          value > 10 ? "text-gray-600" : "text-gray-400"
        } transition-colors duration-200`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default ControlPanel;
