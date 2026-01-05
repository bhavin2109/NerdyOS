import React, { useState, useEffect } from "react";
import fs from "../../services/fileSystem";

const NerdyMedia = ({ filePath }) => {
  // Default to a public domain video (Big Buck Bunny or similar)
  const [src, setSrc] = useState(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );
  const [title, setTitle] = useState("BigBuckBunny.mp4");

  useEffect(() => {
    if (filePath) {
      loadFile(filePath);
    }
  }, [filePath]);

  const loadFile = async (path) => {
    try {
      const content = await fs.readFile(path);
      // If content is a blob, create URL. If string (URL), use it.
      // For this simulated OS, we might store "http..." strings in .mp4 files for simplicity,
      // OR we handle Blobs if we had a real file uploader.

      if (content instanceof Blob) {
        setSrc(URL.createObjectURL(content));
      } else if (typeof content === "string" && content.startsWith("http")) {
        setSrc(content);
      } else {
        // Assume it's a base64 or just text, might fail if not valid video
        setSrc(content);
      }
      setTitle(path.split("/").pop());
    } catch (e) {
      console.error("Failed to load media:", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="flex-1 flex items-center justify-center p-4 bg-black/90">
        <video
          src={src}
          controls
          className="w-full h-full object-contain rounded-lg shadow-2xl"
          autoPlay={!!filePath}
        />
      </div>
      <div className="h-12 bg-gray-800 flex items-center px-4 gap-4 border-t border-gray-700">
        <button className="text-sm hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors">
          Open File...
        </button>
        <div className="text-xs text-gray-400 flex-1 text-center truncate">
          {title}
        </div>
        <div className="w-16"></div>
      </div>
    </div>
  );
};

export default NerdyMedia;
