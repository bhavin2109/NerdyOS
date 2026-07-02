import { useState, useEffect } from "react";

const STORAGE_KEY = "nerdyos-tasks";

const NerdyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      setTasks(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      setTasks([]);
    }
  }, []);

  const persist = (next) => {
    setTasks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    persist([...tasks, { id: crypto.randomUUID(), text: input.trim(), done: false }]);
    setInput("");
  };

  return (
    <div className="h-full bg-[#f5f5f7] p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New task..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Add</button>
      </form>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => persist(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
            />
            <span className={`flex-1 ${t.done ? "line-through text-gray-400" : "text-gray-800"}`}>{t.text}</span>
            <button onClick={() => persist(tasks.filter((x) => x.id !== t.id))} className="text-red-400 text-sm">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NerdyTasks;
