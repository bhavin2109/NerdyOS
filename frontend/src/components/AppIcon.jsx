import React, { useState } from "react";

const ICON_MAP = {
  folder: "📂",
  settings: "⚙️",
  globe: "🌐",
  computer: "💻",
  calculate: "🔢",
  play_circle: "▶️",
  article: "📄",
  bag: "🛍️",
  note: "📝",
  calendar_month: "📅",
  monitoring: "📊",
  forum: "💬",
  mail: "✉️",
  map: "🗺️",
  photo: "🖼️",
  code: "💻",
  edit_note: "✍️",
  check_circle: "✅",
  picture_as_pdf: "📕",
  sparkles: "✨",
  message: "💬",
};

export function renderAppIcon(app) {
  if (!app?.icon) return app?.name?.[0] || "?";
  if (app.icon.length < 3) return app.icon;
  return ICON_MAP[app.icon] || app.name?.[0] || "?";
}

export default function AppIcon({ app, className = "" }) {
  const [error, setError] = useState(false);

  if (app?.iconUrl && !error) {
    // Replace text- classes with width/height classes for images
    let imgClassName = className
      .replace(/text-3xl/g, "w-10 h-10")
      .replace(/text-2xl/g, "w-8 h-8")
      .replace(/text-xl/g, "w-7 h-7")
      .replace(/text-lg/g, "w-6 h-6")
      .replace(/text-[a-zA-Z0-9_-]+/g, ""); // strip other text size classes

    if (!imgClassName.includes("w-") && !imgClassName.includes("h-")) {
      imgClassName += " w-full h-full";
    }
    imgClassName += " object-contain";

    return (
      <img
        src={app.iconUrl}
        alt={app.name || "App Icon"}
        className={imgClassName}
        draggable={false}
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <span className={className} aria-hidden>
      {renderAppIcon(app)}
    </span>
  );
}
