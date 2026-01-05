import React, { useState, useEffect } from "react";

const SystemMonitor = () => {
  const [cpuUi, setCpuUi] = useState([]);
  const [memUi, setMemUi] = useState([]);

  // Simulate data points
  useEffect(() => {
    const update = () => {
      setCpuUi((prev) => {
        const next = [...prev, Math.random() * 100];
        return next.length > 40 ? next.slice(1) : next;
      });
      setMemUi((prev) => {
        const next = [...prev, 30 + Math.random() * 20]; // 30-50% usage
        return next.length > 40 ? next.slice(1) : next;
      });
    };

    const idx = setInterval(update, 1000);
    return () => clearInterval(idx);
  }, []);

  const Graph = ({ data, color }) => (
    <div className="h-32 bg-black/20 rounded border border-white/5 relative overflow-hidden flex items-end">
      {data.map((val, i) => (
        <div
          key={i}
          className={`flex-1 mx-[1px] ${color}`}
          style={{ height: `${val}%` }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#1c1c1e] text-white p-6 gap-6">
      <div>
        <h2 className="text-xl font-bold mb-2">CPU Usage</h2>
        <Graph data={cpuUi} color="bg-green-500" />
        <div className="mt-1 text-right text-sm text-green-400 font-mono">
          {cpuUi.length > 0 ? Math.round(cpuUi[cpuUi.length - 1]) : 0}%
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Memory Usage</h2>
        <Graph data={memUi} color="bg-blue-500" />
        <div className="mt-1 text-right text-sm text-blue-400 font-mono">
          {memUi.length > 0 ? Math.round(memUi[memUi.length - 1]) : 0}% / 16 GB
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-white/5 p-4 rounded text-center">
          <div className="text-gray-400 text-xs">Processes</div>
          <div className="text-2xl font-bold">142</div>
        </div>
        <div className="bg-white/5 p-4 rounded text-center">
          <div className="text-gray-400 text-xs">Uptime</div>
          <div className="text-xl font-bold">12:30:22</div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
