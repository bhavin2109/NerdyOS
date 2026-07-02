import NerdyTextEditor from "../NerdyTextEditor/NerdyTextEditor";

const NerdyStudio = (props) => (
  <div className="h-full flex flex-col">
    <div className="px-3 py-1.5 bg-[#252526] text-xs text-white/60 border-b border-white/10">Nerdy Studio — Project Editor</div>
    <div className="flex-1 min-h-0">
      <NerdyTextEditor {...props} />
    </div>
  </div>
);

export default NerdyStudio;
