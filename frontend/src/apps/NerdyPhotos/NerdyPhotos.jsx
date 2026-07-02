import { useState, useEffect } from "react";
import fs from "../../services/fileSystem";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

const NerdyPhotos = ({ initialPath = "/home/pictures" }) => {
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await fs.ready();
        const dirs = ["/home/pictures", "/home/desktop", "/home/downloads"];
        const all = [];
        for (const dir of dirs) {
          const files = await fs.ls(dir);
          files.filter((f) => f.type === "file" && IMAGE_EXT.test(f.name)).forEach((f) => all.push(f));
        }
        setPhotos(all);
        if (all.length) setSelected(all[0]);
      } catch {
        setPhotos([]);
      }
    })();
  }, [initialPath]);

  return (
    <div className="flex h-full bg-[#1c1c1e] text-white">
      <div className="w-48 border-r border-white/10 overflow-y-auto p-2">
        {photos.length === 0 ? (
          <p className="text-xs text-white/50 p-2">No photos yet. Add images to Pictures.</p>
        ) : (
          photos.map((p) => (
            <button key={p.path} onClick={() => setSelected(p)} className={`w-full text-left p-2 rounded-lg text-xs mb-1 ${selected?.path === p.path ? "bg-white/15" : "hover:bg-white/8"}`}>
              {p.name}
            </button>
          ))
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {selected ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-sm text-white/70">{selected.name}</p>
            <p className="text-xs text-white/40 mt-2">{selected.path}</p>
          </div>
        ) : (
          <p className="text-white/40">Select a photo</p>
        )}
      </div>
    </div>
  );
};

export default NerdyPhotos;
