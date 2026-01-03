import { motion } from "framer-motion";
import useSystemStore from "../../store/systemStore";

const ControlPanel = () => {
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
  } = useSystemStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "circOut" }}
      className="absolute top-10 right-2 w-80 bg-[#1c1c1efc] backdrop-blur-[100px] rounded-2xl p-3 text-white z-[100] select-none shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-2 gap-3 mb-3 h-36">
        {/* Top Left: Connectivity Block */}
        <div className="bg-[#323232]/50 hover:bg-[#323232]/70 rounded-2xl p-3 flex flex-col justify-center gap-3 transition-colors duration-200 border border-white/5 shadow-inner">
          <ConnectivityRow
            active={wifi}
            onClick={toggleWifi}
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

      {/* Bottom: Media Player */}
      {/* (Optional: Could add battery here too if desired, but minimizing for now as requested) */}
    </motion.div>
  );
};

const ConnectivityRow = ({
  active,
  onClick,
  icon,
  customIcon,
  label,
  subLabel,
}) => (
  <div
    className="flex items-center gap-3 cursor-pointer group"
    onClick={onClick}
  >
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
        active
          ? "bg-blue-500 text-white"
          : "bg-[#5A5A5A] text-white/50 group-hover:bg-[#666666]"
      }`}
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
    <div className="flex flex-col leading-tight">
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-[10px] text-gray-400">{subLabel}</span>
    </div>
  </div>
);

const MacOSSlider = ({ value, setValue, icon }) => (
  <div className="relative h-7 w-full bg-[#1e1e1e]/50 rounded-full overflow-hidden shadow-inner group border border-white/5">
    {/* Track Background */}
    <div className="absolute inset-0 bg-[#5A5A5A]/30"></div>

    {/* Active Fill */}
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

    {/* Icon Container (Left) - Inverted color when active passes over? 
        Hard to do w/o complex clipping. Standard macOS puts icon in a fixed circle on the left.
        We'll just overlay it on the left. */}
    <div className="absolute top-0 left-0 w-7 h-full flex items-center justify-center z-10 pointer-events-none">
      {/* Icon mask: if value is low, it's gray. if value covers it, it's black (on white). 
           Simplified: Just make it mix-blend-difference or sticky color. */}
      <div
        className={`text-xs ${
          value > 10 ? "text-black" : "text-gray-400"
        } transition-colors duration-200`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default ControlPanel;
