import { useState, useEffect, Suspense, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import MenuBar from "../menubar/MenuBar";
import Spotlight from "../spotlight/Spotlight";
import Window from "../window/Window";
import useWindowStore from "../../store/windowStore";
import useSystemStore from "../../store/systemStore";
import { getAppById } from "../appRegistry";
import { getFiles, createFile, seedFileSystem } from "../../services/indexedDb";

const Desktop = () => {
  const [contextMenu, setContextMenu] = useState(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [renamingValue, setRenamingValue] = useState("");

  const {
    windows,
    activeWindowId,
    focusWindow,
    closeWindow,
    toggleMinimize,
    toggleMaximize,
    setSnap,
    openWindow,
  } = useWindowStore();

  const { wallpaper } = useSystemStore();

  // Load Desktop Files
  const fetchDesktopFiles = async () => {
    try {
      await seedFileSystem();
      const files = await getFiles("desktop"); // 'desktop' folder
      setDesktopFiles(files || []);
    } catch (err) {
      console.error("Failed to load desktop files", err);
    }
  };

  useEffect(() => {
    fetchDesktopFiles();
  }, []);

  // Cmd+K / Cmd+Space Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };

    const handleToggleSpotlight = () => setIsSpotlightOpen((prev) => !prev);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("nerdyos:toggle-spotlight", handleToggleSpotlight);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(
        "nerdyos:toggle-spotlight",
        handleToggleSpotlight
      );
    };
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault();
    const menuWidth = 192; // w-48
    const menuHeight = 160; // approx
    const dockHeight = 90; // approx dock area

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    // Prevent overlap with bottom dock area
    if (y + menuHeight > window.innerHeight - dockHeight) {
      y = window.innerHeight - dockHeight - menuHeight;
    }

    setContextMenu({ x, y });
  };

  const handleClick = () => {
    if (contextMenu) setContextMenu(null);
    setSelectedFileId(null);
  };

  const handleCreateFolder = async () => {
    setContextMenu(null);

    // Windows-style: Ask for name first
    const name = prompt("Enter folder name:", "New Folder");
    if (!name || name.trim() === "") return;

    let folderName = name.trim();
    let counter = 1;

    // Check if name exists and auto-increment
    while (desktopFiles.some((file) => file.name === folderName)) {
      counter++;
      folderName = `${name.trim()} (${counter})`;
    }

    try {
      await createFile({
        parentId: "desktop",
        name: folderName,
        type: "folder",
        position: { x: 20, y: 20 }, // Default position
      });

      await fetchDesktopFiles();
    } catch (err) {
      console.error("Failed to create folder", err);
    }
  };

  const handleDeleteFile = async (fileId) => {
    setContextMenu(null);
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { deleteFile } = await import("../../services/indexedDb");
      await deleteFile(fileId);
      await fetchDesktopFiles();
      setSelectedFileId(null);
    } catch (err) {
      console.error("Failed to delete file", err);
    }
  };

  const handleStartRename = (file) => {
    setContextMenu(null);
    setRenamingFileId(file.id);
    setRenamingValue(file.name);
    setSelectedFileId(file.id);
  };

  const handleFileDoubleClick = (file) => {
    if (file.type === "folder") {
      // In a real OS, this opens Finder at this path
      // For now, let's open Finder
      openWindow("finder");
    } else {
      // Open file?
      alert(`Opening ${file.name}...`);
    }
  };

  const handleRenameComplete = async (fileId, newName) => {
    if (!newName || newName.trim() === "") {
      // If empty, keep original name
      setRenamingFileId(null);
      setRenamingValue("");
      return;
    }

    try {
      const { updateFile } = await import("../../services/indexedDb");
      await updateFile(fileId, { name: newName.trim() });
      await fetchDesktopFiles();
      setRenamingFileId(null);
      setRenamingValue("");
    } catch (err) {
      console.error("Failed to rename file", err);
    }
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-cover bg-center transition-all duration-300"
      style={{
        backgroundImage: `url('${wallpaper}')`,
      }}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Menu Bar */}
      <MenuBar />

      {/* Desktop Icons Area */}
      <div className="absolute top-8 left-0 bottom-0 right-0 z-0 pointer-events-none">
        {desktopFiles.map((file) => {
          const position = file.position || { x: 20, y: 20 };

          return (
            <div
              key={file.id}
              className={`absolute flex flex-col items-center gap-1 group w-20 pointer-events-auto cursor-move p-2 rounded ${
                selectedFileId === file.id
                  ? "bg-white/20 border border-white/30"
                  : "hover:bg-white/10"
              }`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("fileId", file.id);
                setSelectedFileId(file.id);
              }}
              onDragEnd={async (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const newX = e.clientX - rect.width / 2;
                const newY = e.clientY - rect.height / 2 - 32; // Adjust for menu bar

                try {
                  const { updateFile } = await import(
                    "../../services/indexedDb"
                  );
                  await updateFile(file.id, {
                    position: {
                      x: Math.max(0, newX),
                      y: Math.max(0, newY),
                    },
                  });
                  await fetchDesktopFiles();
                } catch (err) {
                  console.error("Failed to update position", err);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFileId(file.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (renamingFileId !== file.id) {
                  handleFileDoubleClick(file);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedFileId(file.id);
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  fileId: file.id,
                  file: file,
                });
              }}
            >
              <div className="text-4xl shadow-sm drop-shadow-md pointer-events-none">
                {file.type === "folder" ? "📁" : "📄"}
              </div>

              {/* Inline Rename Input */}
              {renamingFileId === file.id ? (
                <input
                  type="text"
                  value={renamingValue}
                  onChange={(e) => setRenamingValue(e.target.value)}
                  onBlur={() => handleRenameComplete(file.id, renamingValue)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameComplete(file.id, renamingValue);
                    } else if (e.key === "Escape") {
                      setRenamingFileId(null);
                      setRenamingValue("");
                    }
                  }}
                  autoFocus
                  className="text-xs text-center font-medium bg-white/90 text-gray-900 rounded px-1 py-0.5 w-full outline-none focus:ring-2 focus:ring-cyan-400"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-xs text-white text-center font-medium drop-shadow-md break-words w-full leading-tight pointer-events-none">
                  {file.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Windows Layer - Below MenuBar (top-8), Above Icons */}
      <div className="absolute top-8 left-0 right-0 bottom-0 z-10 pointer-events-none">
        <AnimatePresence>
          {windows.map((win) => {
            // Resolve component from registry
            const appConfig = getAppById(win.appId);
            if (!appConfig) return null;

            const AppComponent = appConfig.component;

            // Pass minimize state to Window animation, don't hide via CSS here
            // const style = win.isMinimized ? { display: "none" } : {};

            return (
              <div key={win.id} className="pointer-events-auto">
                <Window
                  id={win.id}
                  title={win.title}
                  isActive={activeWindowId === win.id}
                  isFullscreen={win.isFullscreen}
                  isMinimized={win.isMinimized}
                  snapState={win.snapState}
                  launchOrigin={win.launchOrigin} // Pass launch origin for animation
                  onFocus={() => focusWindow(win.id)}
                  onClose={() => closeWindow(win.id)}
                  onMinimize={() => toggleMinimize(win.id)}
                  onMaximize={() => toggleMaximize(win.id)}
                  onSnap={(type) => setSnap(win.id, type)}
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full bg-white/50">
                        Loading...
                      </div>
                    }
                  >
                    <AppComponent />
                  </Suspense>
                </Window>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Context Menu - High Z-Index */}
      {contextMenu && (
        <div
          className="absolute bg-slate-900/95 backdrop-blur-md border border-cyan-400/30 shadow-lg rounded-lg py-1 w-48 text-sm text-cyan-50 z-[60] pointer-events-auto"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.fileId ? (
            // File-specific menu
            <>
              <div
                className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer transition-colors"
                onClick={() => handleStartRename(contextMenu.file)}
              >
                Rename
              </div>
              <div
                className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer transition-colors text-red-400"
                onClick={() => handleDeleteFile(contextMenu.fileId)}
              >
                Delete
              </div>
            </>
          ) : (
            // Desktop menu
            <>
              <div
                className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer transition-colors"
                onClick={handleCreateFolder}
              >
                New Folder
              </div>
              <div className="border-t border-cyan-400/20 my-1"></div>
              <div
                className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer transition-colors"
                onClick={() => openWindow("settings")}
              >
                Change Wallpaper...
              </div>
            </>
          )}
        </div>
      )}

      {/* Spotlight Search */}
      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </div>
  );
};

export default Desktop;
