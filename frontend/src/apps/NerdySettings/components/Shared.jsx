import React from "react";
import clsx from "clsx";

export const SettingsCard = ({
  icon,
  title,
  subtitle,
  action,
  showArrow = false,
  image,
  large = false,
  onClick,
  className,
}) => (
  <div
    onClick={onClick}
    className={clsx(
      "bg-[#2B2B2B] hover:bg-[#323232] border border-[#353535] rounded-lg p-4 transition-colors flex items-center gap-4 group mb-1",
      large ? "items-start" : "items-center",
      onClick && "cursor-pointer",
      className
    )}
  >
    {image && (
      <div className="w-16 h-16 rounded-md overflow-hidden bg-black shrink-0 border border-white/5">
        <img src={image} alt="" className="w-full h-full object-cover" />
      </div>
    )}
    {!image && icon && (
      <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
    )}

    <div className="flex-1 min-w-0">
      <div className="text-[15px] font-semibold text-white truncate">
        {title}
      </div>
      {subtitle && (
        <div className="text-[13px] text-[#A0A0A0] leading-tight mt-0.5">
          {subtitle}
        </div>
      )}
    </div>

    {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}

    {showArrow && (
      <div className="text-[#808080] group-hover:text-white transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>
    )}
  </div>
);

export const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={clsx(
      "w-10 h-5 rounded-full relative transition-colors duration-200 border-2",
      checked
        ? "bg-cyan-500 border-cyan-500"
        : "bg-transparent border-[#808080] hover:border-white"
    )}
  >
    <div
      className={clsx(
        "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-200",
        checked
          ? "right-0.5 bg-black"
          : "left-0.5 bg-[#808080] group-hover:bg-white"
      )}
    />
  </button>
);

export const SectionTitle = ({ title }) => (
  <h2 className="text-[15px] font-semibold text-white mb-3 mt-6">{title}</h2>
);
