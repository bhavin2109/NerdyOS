import React, { useState } from "react";
import clsx from "clsx";
import AppIcon from "../../components/AppIcon";
import { APP_REGISTRY } from "../../os/appRegistry";

const WEB_APP_URLS = {
  youtube: "https://www.youtube.com/embed/videoseries?list=PLx0sYbCqOb8TBPRjMzshFSPxo6gipxs2n",
  google: "https://www.google.com/webhp?igu=1",
  pacman: "https://google.com/logos/2010/pacman10-i.html",
  flappybird: "https://nebez.github.io/floppybird/",
  vscode: "https://github1s.com/bhavin2109/NerdyOS",
  gemini: "https://gemini.google.com",
  chatgpt: "https://chatgpt.com",
  office_word: "https://office.live.com/start/Word.aspx",
  office_excel: "https://office.live.com/start/Excel.aspx",
  messages: "https://web.whatsapp.com",
  mail: "https://mail.google.com",
  maps: "https://www.google.com/maps",
  calendar: "https://calendar.google.com",
  notes: "https://keep.google.com",
  photos: "https://photos.google.com",
  doc: "https://docs.google.com",
  instagram: "https://www.instagram.com",
  facebook: "https://www.facebook.com",
};

const BLOCK_IFRAME_APPS = [
  "messages",
  "instagram",
  "facebook",
  "gemini",
  "chatgpt",
  "office_word",
  "office_excel",
  "notes",
  "mail",
  "calendar",
  "photos",
  "doc",
  "maps"
];

export const WebWrapperApp = ({ url, appId }) => {
  const targetUrl = url || WEB_APP_URLS[appId] || "https://www.google.com";
  const [iframeKey, setIframeKey] = useState(0);
  const appConfig = APP_REGISTRY[appId];

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleLaunchExternal = () => {
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const isBlocked = BLOCK_IFRAME_APPS.includes(appId);

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#18181A] text-white p-8 rounded-b-xl select-none text-center relative overflow-hidden">
        {/* Glow effect matching app branding */}
        <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />

        {/* High-res container */}
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center relative overflow-hidden shrink-0 shadow-2xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <AppIcon app={appConfig} className="w-16 h-16 object-contain relative z-10" />
        </div>

        {/* Info Text */}
        <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">
          {appConfig?.name || "Web Application"}
        </h2>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6 font-medium">
          To protect user privacy and account credentials, the official login portal of {appConfig?.name || "this application"} restricts loading inside virtual iframe containers.
        </p>

        {/* Get Link button */}
        <button
          onClick={handleLaunchExternal}
          className={clsx(
            "px-6 py-2.5 rounded-full font-bold text-xs text-white transition-all active:scale-95 shadow-lg flex items-center gap-2 border",
            appConfig?.color || "bg-blue-600 border-blue-500 hover:bg-blue-700 shadow-blue-500/20"
          )}
        >
          <span>Open secure tab</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#EBEBEB] text-slate-800 rounded-b-xl select-none">
      {/* Browser Ribbon / Toolbar */}
      <div className="h-10 bg-[#E3E3E3] border-b border-[#C8C8C8] flex items-center px-3 gap-3 shrink-0">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button className="p-1 rounded hover:bg-black/5 text-slate-500 disabled:opacity-40 transition-colors" disabled>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-1 rounded hover:bg-black/5 text-slate-500 disabled:opacity-40 transition-colors" disabled>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={handleRefresh} className="p-1 rounded hover:bg-black/5 text-slate-600 transition-colors" title="Reload Frame">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 9l-.5-3m12 6h-5" />
            </svg>
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 bg-white border border-[#BFC0C0] rounded-md h-7 px-3 flex items-center text-xs text-slate-500 font-medium select-text truncate">
          {targetUrl}
        </div>

        {/* External Link */}
        <button
          onClick={handleLaunchExternal}
          className="px-2.5 py-1 text-xs font-semibold text-blue-600 border border-blue-300 rounded hover:bg-blue-50 hover:border-blue-400 active:scale-95 transition-all flex items-center gap-1 bg-white shrink-0"
        >
          <span>External Tab</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Frame Viewport */}
      <div className="flex-1 bg-white relative">
        <iframe
          key={iframeKey}
          src={targetUrl}
          title={appId}
          className="w-full h-full border-none bg-white rounded-b-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
};
