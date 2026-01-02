import { useState, useEffect } from "react";
import AppTemplate from "../AppTemplate";
import clsx from "clsx";
import { getFiles, createFile, seedFileSystem } from "../../services/indexedDb";

const SIDEBAR_ITEMS = [
  { id: "airdrop", label: "AirDrop", icon: "📡" },
  { id: "recents", label: "Recents", icon: "🕒" },
  { id: "applications", label: "Applications", icon: "🤖" },
  { id: "desktop", label: "Desktop", icon: "🖥️" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "downloads", label: "Downloads", icon: "⬇️" },
];

const NerdyFiles = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState("desktop");
  const [currentPath, setCurrentPath] = useState("desktop"); // Default to desktop
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await seedFileSystem();
      fetchFiles();
    };
    init();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  // Sync sidebar with current path if it matches a sidebar item
  useEffect(() => {
    if (SIDEBAR_ITEMS.some((item) => item.id === currentPath)) {
      setActiveSidebarItem(currentPath);
    } else {
      setActiveSidebarItem(null); // Deselect if deep in a folder not in sidebar
    }
  }, [currentPath]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Special handling for "root" or other sidebar items that map differently
      // For simplicity, we assume sidebar IDs are valid parentIds for now
      const fetched = await getFiles(currentPath);
      setFiles(fetched || []);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarClick = (id) => {
    // If it's a special ID like 'recents' or 'airdrop', we might want custom logic later.
    // For now, treat them as folder IDs. 'applications' etc might be empty.
    setActiveSidebarItem(id);
    setCurrentPath(id);
  };

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      setCurrentPath(file.id);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:", "New Folder");
    if (!name) return;

    try {
      await createFile({
        parentId: currentPath,
        name,
        type: "folder",
      });
      fetchFiles();
    } catch (err) {
      alert("Failed to create folder");
    }
  };

  const toolbarActions = (
    <div className="flex gap-2 text-sm items-center">
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
                    key={file.id}
                    onDoubleClick={() => handleFileClick(file)}
                    className="flex flex-col items-center gap-3 group p-2 rounded-xl hover:bg-blue-50/80 cursor-default transition-colors"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                      {file.type === "folder" ? "📁" : "📄"}
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
                    key={file.id}
                    onDoubleClick={() => handleFileClick(file)}
                    className="grid grid-cols-4 items-center text-sm py-2 px-4 rounded-lg hover:bg-blue-50 cursor-default even:bg-gray-50/30 transition-colors group"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <span className="text-lg opacity-80">
                        {file.type === "folder" ? "📁" : "📄"}
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
