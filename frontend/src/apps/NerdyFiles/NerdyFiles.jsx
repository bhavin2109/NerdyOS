import { useState, useEffect } from "react";
import AppTemplate from "../AppTemplate";
import clsx from "clsx";
import fs from "../../services/fileSystem";
import useWindowStore from "../../store/windowStore";

const SIDEBAR_ITEMS = [
  { id: "/home", label: "Home", icon: "🏠" },
  { id: "/home/desktop", label: "Desktop", icon: "🖥️" },
  { id: "/home/documents", label: "Documents", icon: "📄" },
  { id: "/home/downloads", label: "Downloads", icon: "⬇️" },
  { id: "/home/pictures", label: "Pictures", icon: "🖼️" },
  { id: "/home/music", label: "Music", icon: "🎵" },
];

const NerdyFiles = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState("/home/desktop");
  const [currentPath, setCurrentPath] = useState("/home/desktop");
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const { openWindow } = useWindowStore();

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  // Sync sidebar with current path
  useEffect(() => {
    // Check if current path matches strictly or is a child of sidebar item (optional logic)
    if (SIDEBAR_ITEMS.some((item) => item.id === currentPath)) {
      setActiveSidebarItem(currentPath);
    } else {
      setActiveSidebarItem(null);
    }
  }, [currentPath]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const fetched = await fs.ls(currentPath);
      // Sort: Directories first, then files
      const sorted = fetched.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "directory" ? -1 : 1;
      });
      setFiles(sorted);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarClick = (path) => {
    setCurrentPath(path);
  };

  const handleFileClick = (file) => {
    if (file.type === "directory") {
      setCurrentPath(file.path);
    } else {
      // Open file
      if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        openWindow("doc", { filePath: file.path });
      } else {
        // Default fallback
        alert(`Opening ${file.name}`);
      }
    }
  };

  const handleNavigateUp = () => {
    if (currentPath === "/" || currentPath === "/home") return; // Optional constraint
    const parent =
      currentPath.substring(0, currentPath.lastIndexOf("/")) || "/";
    setCurrentPath(parent);
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:", "New Folder");
    if (!name) return;
    const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;

    try {
      await fs.mkdir(newPath);
      fetchFiles();
    } catch (err) {
      alert(err.message);
    }
  };

  const toolbarActions = (
    <div className="flex gap-2 text-sm items-center">
      <button
        onClick={handleNavigateUp}
        disabled={currentPath === "/"}
        className="px-2 py-1 rounded text-gray-600 hover:bg-black/5 disabled:opacity-30"
      >
        ⬆️ Up
      </button>
      <div className="h-4 w-px bg-gray-300 mx-1"></div>
      <button
        onClick={handleCreateFolder}
        className="px-2 py-1 rounded text-gray-600 hover:bg-black/5 transition-colors text-xs flex items-center gap-1"
      >
        <span>➕</span> New Folder
      </button>
      <div className="h-4 w-px bg-gray-300 mx-1"></div>
      <button
        onClick={() => setViewMode("grid")}
        className={clsx(
          "px-2 py-1 rounded transition-colors",
          viewMode === "grid"
            ? "bg-white shadow text-black"
            : "text-gray-600 hover:bg-black/5"
        )}
      >
        Grid
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={clsx(
          "px-2 py-1 rounded transition-colors",
          viewMode === "list"
            ? "bg-white shadow text-black"
            : "text-gray-600 hover:bg-black/5"
        )}
      >
        List
      </button>
    </div>
  );

  return (
    <AppTemplate
      title="NerdyFiles"
      actions={toolbarActions}
      contentClassName="p-0"
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-[200px] bg-gray-50/50 backdrop-blur-xl border-r border-gray-200/50 p-3 flex flex-col gap-1 shrink-0">
          <div className="text-xs font-semibold text-gray-400 px-3 py-2 mb-1 uppercase tracking-wider">
            Favorites
          </div>
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200",
                activeSidebarItem === item.id
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
              )}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white/80">
          {/* Breadcrumb / Path Bar */}
          <div className="px-4 py-2 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-2">
            <span>📂</span> {currentPath}
          </div>

          {/* Scrollable File Area */}
          <div className="flex-1 overflow-auto p-6" onClick={() => {}}>
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-400">
                Loading...
              </div>
            ) : files.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400 select-none">
                Empty Folder
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-6">
                {files.map((file) => (
                  <div
                    key={file.path}
                    onDoubleClick={() => handleFileClick(file)}
                    className="flex flex-col items-center gap-3 group p-2 rounded-xl hover:bg-blue-50/80 cursor-default transition-colors"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                      {file.type === "directory" ? "📁" : "📄"}
                    </div>
                    <span className="text-xs text-center text-gray-600 font-medium truncate w-full group-hover:text-blue-600 px-1 select-none">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 border-b border-gray-200 pb-2 mb-2 px-4 select-none">
                  <div className="col-span-2">Name</div>
                  <div>Type</div>
                  <div>Size</div>
                </div>
                {files.map((file) => (
                  <div
                    key={file.path}
                    onDoubleClick={() => handleFileClick(file)}
                    className="grid grid-cols-4 items-center text-sm py-2 px-4 rounded-lg hover:bg-blue-50 cursor-default even:bg-gray-50/30 transition-colors group"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <span className="text-lg opacity-80">
                        {file.type === "directory" ? "📁" : "📄"}
                      </span>
                      <span className="truncate font-medium text-gray-700 group-hover:text-blue-600 select-none">
                        {file.name}
                      </span>
                    </div>
                    <div className="text-gray-500 capitalize text-xs select-none">
                      {file.type}
                    </div>
                    <div className="text-gray-400 text-xs select-none">--</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppTemplate>
  );
};

export default NerdyFiles;
