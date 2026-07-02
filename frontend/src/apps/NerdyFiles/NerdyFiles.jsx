import { useState, useEffect } from "react";
import clsx from "clsx";
import fs from "../../services/fileSystem";
import useWindowStore from "../../store/windowStore";

const SIDEBAR_ITEMS = [
  { id: "/home", label: "Recents", icon: "🕐" },
  { id: "/home/desktop", label: "Desktop", icon: "🖥️" },
  { id: "/home/documents", label: "Documents", icon: "📄" },
  { id: "/home/downloads", label: "Downloads", icon: "⬇️" },
  { id: "/home/pictures", label: "Pictures", icon: "🖼️" },
  { id: "/home/music", label: "Music", icon: "🎵" },
];

const NerdyFiles = ({ initialPath = "/home/desktop" }) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState(initialPath);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const { openWindow } = useWindowStore();

  useEffect(() => {
    setCurrentPath(initialPath);
    setActiveSidebarItem(
      SIDEBAR_ITEMS.some((i) => i.id === initialPath) ? initialPath : null
    );
  }, [initialPath]);

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const fetched = await fs.ls(currentPath);
      const sorted = fetched.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "directory" ? -1 : 1;
      });
      setFiles(sorted);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file) => {
    if (file.type === "directory") {
      setCurrentPath(file.path);
    } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      openWindow("doc", { filePath: file.path });
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
      openWindow("photos");
    } else if (file.name.endsWith(".pdf")) {
      openWindow("pdf_reader");
    } else {
      openWindow("code_editor", { filePath: file.path });
    }
  };

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="flex h-full bg-[#f5f5f7] text-gray-900">
      <div className="hidden sm:flex w-[180px] bg-[#ebebf0]/90 border-r border-gray-200/80 p-2 flex-col gap-0.5 shrink-0">
        <div className="text-[11px] font-semibold text-gray-400 px-3 py-2 uppercase tracking-wide">Favorites</div>
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => { setCurrentPath(item.id); setActiveSidebarItem(item.id); }}
            className={clsx(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] text-left",
              activeSidebarItem === item.id ? "bg-[#007AFF]/15 text-[#007AFF] font-medium" : "text-gray-700 hover:bg-black/5"
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white/70 text-[13px]">
          <button onClick={() => setCurrentPath(currentPath.substring(0, currentPath.lastIndexOf("/")) || "/")} className="px-2 py-1 rounded hover:bg-black/5 disabled:opacity-30" disabled={currentPath === "/"}>←</button>
          <div className="flex items-center gap-1 text-gray-500 truncate">
            {pathParts.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <button
                  onClick={() => setCurrentPath("/" + pathParts.slice(0, i + 1).join("/"))}
                  className="hover:text-[#007AFF]"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>
          <div className="ml-auto flex gap-1">
            <button onClick={() => setViewMode("grid")} className={clsx("px-2 py-1 rounded text-xs", viewMode === "grid" ? "bg-gray-200" : "hover:bg-black/5")}>Grid</button>
            <button onClick={() => setViewMode("list")} className={clsx("px-2 py-1 rounded text-xs", viewMode === "list" ? "bg-gray-200" : "hover:bg-black/5")}>List</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading...</div>
          ) : files.length === 0 ? (
            <div className="text-center text-gray-400 py-12">This folder is empty</div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
              {files.map((file) => (
                <div key={file.path} onDoubleClick={() => handleFileClick(file)} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/80 cursor-default">
                  <div className="text-4xl">{file.type === "directory" ? "📁" : "📄"}</div>
                  <span className="text-xs text-center truncate w-full">{file.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 rounded-lg overflow-hidden">
              {files.map((file) => (
                <div key={file.path} onDoubleClick={() => handleFileClick(file)} className="flex items-center gap-3 px-4 py-2 hover:bg-[#007AFF]/10 cursor-default border-b border-gray-100 last:border-0">
                  <span>{file.type === "directory" ? "📁" : "📄"}</span>
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 capitalize">{file.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NerdyFiles;
