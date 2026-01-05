import React, { useState, useEffect } from "react";
import fs from "../../services/fileSystem";

const NerdyWord = ({ filePath }) => {
  const [content, setContent] = useState(
    "<h1>Nerdy Doc</h1><p>Start typing here...</p>"
  );
  const [currentFilePath, setCurrentFilePath] = useState(filePath || null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (filePath) {
      setCurrentFilePath(filePath);
      loadFile(filePath);
    }
  }, [filePath]);

  const loadFile = async (path) => {
    try {
      const data = await fs.readFile(path);
      setContent(data || "<p></p>");
      setStatus("Loaded");
    } catch (err) {
      console.error(err);
      setStatus("Error loading file");
      // If empty/new file, it might throw or return empty.
      if (err.message.includes("No such file")) {
        // Assume new file creation on save
        setContent("");
      }
    }
  };

  const handleSave = async () => {
    if (!currentFilePath) {
      const name = prompt(
        "Enter filename to save (e.g. /home/documents/note.txt):",
        "/home/documents/new.txt"
      );
      if (!name) return;
      setCurrentFilePath(name);
      saveContent(name);
    } else {
      saveContent(currentFilePath);
    }
  };

  const saveContent = async (path) => {
    try {
      setStatus("Saving...");
      // Ensure directory exists if possible? fs.writeFile checks parent.
      await fs.writeFile(path, content);
      setStatus("Saved");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      alert(`Error saving: ${err.message}`);
      setStatus("Error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black">
      {/* Toolbar */}
      <div className="h-12 bg-gray-100 border-b border-gray-300 flex items-center px-4 gap-2">
        <button
          className="px-2 py-1 hover:bg-gray-200 rounded font-bold"
          onClick={() => document.execCommand("bold")}
        >
          B
        </button>
        <button
          className="px-2 py-1 hover:bg-gray-200 rounded italic"
          onClick={() => document.execCommand("italic")}
        >
          I
        </button>
        <button
          className="px-2 py-1 hover:bg-gray-200 rounded underline"
          onClick={() => document.execCommand("underline")}
        >
          U
        </button>
        <div className="border-l border-gray-300 h-6 mx-2" />
        <span className="text-xs text-gray-500 truncate max-w-[200px]">
          {currentFilePath || "Untitled"}
        </span>
        <div className="flex-1" />
        <span className="text-xs text-gray-400 mr-2">{status}</span>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 active:bg-blue-800"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {/* Editor Area */}
      <div
        className="flex-1 p-8 overflow-y-auto outline-none max-w-[800px] mx-auto w-full shadow-lg my-4 bg-white"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: content }}
        onBlur={(e) => setContent(e.currentTarget.innerHTML)}
      />
    </div>
  );
};

export default NerdyWord;
