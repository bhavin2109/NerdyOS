import React, { useState, useEffect } from "react";
import fs from "../../services/fileSystem";

const NerdyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null); // filePath
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Notes directory
  const NOTES_DIR = "/home/documents";

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      // Ensure directory exists
      if (!(await fs.stat(NOTES_DIR))) {
        await fs.mkdir(NOTES_DIR);
      }
      const files = await fs.ls(NOTES_DIR);
      // Filter for .txt or .md
      const textFiles = files.filter(
        (f) =>
          f.type === "file" &&
          (f.path.endsWith(".txt") || f.path.endsWith(".md"))
      );
      setNotes(textFiles);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  const loadNote = async (path) => {
    setActiveNoteId(path);
    setLoading(true);
    try {
      const data = await fs.readFile(path);
      setContent(data);
    } catch (err) {
      console.error(err);
      setContent("Error reading note.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (activeNoteId) {
      await fs.writeFile(activeNoteId, content);
      fetchNotes(); // Refresh timestamp or list
    }
  };

  const handleNew = async () => {
    const name = prompt("Note Name:", `Note ${notes.length + 1}.txt`);
    if (name) {
      const path = `${NOTES_DIR}/${
        name.endsWith(".txt") ? name : name + ".txt"
      }`;
      await fs.writeFile(path, "");
      fetchNotes();
      loadNote(path);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <div className="w-48 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <span className="font-bold text-gray-600">Notes</span>
          <button
            onClick={handleNew}
            className="text-blue-500 hover:bg-blue-100 p-1 rounded"
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.path}
              className={`p-3 text-sm cursor-pointer border-b border-gray-100 truncate ${
                activeNoteId === note.path
                  ? "bg-yellow-100 font-medium"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => loadNote(note.path)}
            >
              {note.name || note.path.split("/").pop()}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-yellow-50">
        {activeNoteId ? (
          <>
            <div className="p-2 text-xs text-gray-400 border-b border-yellow-100 flex justify-between">
              <span>{activeNoteId}</span>
              <button
                onClick={handleSave}
                className="text-blue-600 hover:underline"
              >
                Save
              </button>
            </div>
            <textarea
              className="flex-1 w-full bg-transparent p-6 outline-none resize-none font-mono text-sm leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your note here..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select or create a note
          </div>
        )}
      </div>
    </div>
  );
};

export default NerdyNotes;
