import { useState, useEffect } from "react";
import fs from "../../services/fileSystem";

const NerdyTextEditor = ({ filePath = null }) => {
  const [content, setContent] = useState("// Start typing...\n");
  const [path, setPath] = useState(filePath || "/home/documents/untitled.txt");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (!filePath) return;
    fs.readFile(filePath).then(setContent).catch(() => setContent(""));
    setPath(filePath);
  }, [filePath]);

  const handleSave = async () => {
    await fs.writeFile(path, content);
    setSaved(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-100">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10 text-xs">
        <span className="text-white/50 truncate flex-1">{path}</span>
        <button onClick={handleSave} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white">
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        className="flex-1 w-full bg-transparent p-4 font-mono text-sm outline-none resize-none"
        spellCheck={false}
      />
    </div>
  );
};

export default NerdyTextEditor;
