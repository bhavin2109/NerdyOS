import { useState } from "react";
import AppTemplate from "../AppTemplate";

const NerdyBrowser = () => {
  const [url, setUrl] = useState("https://www.google.com/webhp?igu=1");
  const [inputUrl, setInputUrl] = useState(url);
  const [history, setHistory] = useState([url]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleNavigate = (e) => {
    e.preventDefault();
    let target = inputUrl;
    if (!target.startsWith("http")) target = `https://${target}`;

    // Push to history
    const newHistory = [...history.slice(0, historyIndex + 1), target];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setUrl(target);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setUrl(prevUrl);
      setInputUrl(prevUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setUrl(nextUrl);
      setInputUrl(nextUrl);
    }
  };

  const handleRefresh = () => {
    const current = document.querySelector("iframe").src;
    document.querySelector("iframe").src = current;
  };

  return (
    <AppTemplate
      title="Browser"
      contentClassName="p-0 flex flex-col"
      actions={
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
        </div>
      }
    >
      <div className="bg-gray-100 p-2 border-b border-gray-200 flex gap-2 items-center">
        <button
          className="text-gray-500 hover:text-gray-700 px-2 disabled:opacity-30"
          onClick={handleBack}
          disabled={historyIndex === 0}
        >
          ←
        </button>
        <button
          className="text-gray-500 hover:text-gray-700 px-2 disabled:opacity-30"
          onClick={handleForward}
          disabled={historyIndex === history.length - 1}
        >
          →
        </button>
        <button
          className="text-gray-500 hover:text-gray-700 px-2"
          onClick={handleRefresh}
        >
          ↻
        </button>
        <form onSubmit={handleNavigate} className="flex-1">
          <input
            type="text"
            className="w-full px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-blue-400"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
        </form>
      </div>
      <iframe
        src={url}
        className="flex-1 w-full h-full border-none bg-white"
        title="browser-frame"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </AppTemplate>
  );
};

export default NerdyBrowser;
