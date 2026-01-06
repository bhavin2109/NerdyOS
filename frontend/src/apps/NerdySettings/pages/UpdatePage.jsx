import React, { useState } from "react";
import useSystemStore from "../../../store/systemStore";

const UpdatePage = () => {
  const { lastUpdateCheck } = useSystemStore();
  const [checking, setChecking] = useState(false);

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 3000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-semibold text-white mb-6">Windows Update</h1>

      <div className="bg-[#2B2B2B] p-8 rounded-lg border border-[#353535] flex items-start gap-6 mb-8">
        <div className="text-5xl text-blue-500 mt-2">
          {checking ? <div className="animate-spin text-4xl">↻</div> : "✅"}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">
            {checking ? "Checking for updates..." : "You're up to date"}
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Last checked:{" "}
            {checking
              ? "Just now"
              : "Today, " + lastUpdateCheck.toLocaleTimeString()}
          </p>

          <button
            onClick={handleCheck}
            disabled={checking}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-md font-medium"
          >
            Check for updates
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {["Update history", "Advanced options", "Windows Insider Program"].map(
          (item) => (
            <div
              key={item}
              className="bg-[#2B2B2B] hover:bg-[#323232] cursor-pointer p-4 rounded-lg flex justify-between items-center border border-[#353535]"
            >
              <span>{item}</span>
              <span className="text-gray-500">{">"}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UpdatePage;
