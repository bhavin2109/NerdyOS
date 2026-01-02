import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import AppTemplate from "../AppTemplate";
import { APP_REGISTRY } from "../../os/appRegistry";
import useWindowStore from "../../store/windowStore";

const NerdyAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm NerdyAI. I can help you navigate. Try saying 'open settings'.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const openWindow = useWindowStore((state) => state.openWindow);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processCommand = (text) => {
    const lowerText = text.toLowerCase().trim();

    if (lowerText.startsWith("open ")) {
      const appNameQuery = lowerText.replace("open ", "").trim();

      // Find app by name or id
      const appEntry = Object.values(APP_REGISTRY).find(
        (app) =>
          app.name.toLowerCase() === appNameQuery ||
          app.id.toLowerCase() === appNameQuery
      );

      if (appEntry) {
        openWindow(appEntry.id);
        return `Opening ${appEntry.name}...`;
      } else {
        return `I couldn't find an app named "${appNameQuery}".`;
      }
    }

    return "I'm still learning! currently I only understand 'open [app name]' commands.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newUserMsg = {
      id: Date.now(),
      text: userText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");

    // Process Response
    setTimeout(() => {
      const responseText = processCommand(userText);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: responseText,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppTemplate
      title="NerdyAI"
      contentClassName="bg-white/90 backdrop-blur-xl"
    >
      <div className="flex flex-col h-full">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex w-full",
                msg.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed",
                  msg.isUser
                    ? "bg-blue-500 text-white rounded-tr-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="relative flex items-center bg-white rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type 'open settings'..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2 mr-1 rounded-full text-blue-500 hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </AppTemplate>
  );
};

export default NerdyAI;
