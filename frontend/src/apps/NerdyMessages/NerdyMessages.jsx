import React, { useState } from "react";

const NerdyMessages = () => {
  const [activeContact, setActiveContact] = useState("Team Nerdy");
  const [messages, setMessages] = useState({
    "Team Nerdy": [
      {
        id: 1,
        sender: "Alice",
        text: "Hey! Did you see the new OS update?",
        time: "10:30 AM",
        isMe: false,
      },
      {
        id: 2,
        sender: "Bob",
        text: "Yeah, it looks amazing! The glassmorphism is on point.",
        time: "10:32 AM",
        isMe: false,
      },
      {
        id: 3,
        sender: "Me",
        text: "I'm working on the new Messages app right now.",
        time: "10:33 AM",
        isMe: true,
      },
    ],
    "John Doe": [
      {
        id: 1,
        sender: "John",
        text: "Meeting at 3 PM?",
        time: "Yesterday",
        isMe: false,
      },
      {
        id: 2,
        sender: "Me",
        text: "Sure, see you then.",
        time: "Yesterday",
        isMe: true,
      },
    ],
    "Sarah Smith": [
      {
        id: 1,
        sender: "Sarah",
        text: "Can you send me the files?",
        time: "Mon",
        isMe: false,
      },
    ],
  });

  const [inputText, setInputText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "Me",
      text: inputText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), newMsg],
    }));
    setInputText("");
  };

  return (
    <div className="flex h-full bg-white text-gray-900 border-t border-gray-200">
      {/* Sidebar */}
      <div className="w-1/3 min-w-[200px] border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Object.keys(messages).map((contact) => (
            <div
              key={contact}
              onClick={() => setActiveContact(contact)}
              className={`p-3 border-b border-gray-100 cursor-pointer transition-colors flex gap-3 items-center
                ${
                  activeContact === contact
                    ? "bg-emerald-50 border-l-4 border-l-emerald-500"
                    : "hover:bg-gray-100 border-l-4 border-l-transparent"
                }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {contact.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {contact}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    {messages[contact][messages[contact].length - 1].time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {messages[contact][messages[contact].length - 1].text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Chat Header */}
        <div className="h-14 border-b border-gray-200 bg-white/80 backdrop-blur flex items-center px-4 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
              {activeContact.charAt(0)}
            </div>
            <span className="font-bold text-gray-800">{activeContact}</span>
          </div>
          <button className="text-emerald-500 hover:text-emerald-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages[activeContact].map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[70%] ${
                msg.isMe ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl text-sm shadow-sm
                  ${
                    msg.isMe
                      ? "bg-emerald-500 text-white rounded-tr-md"
                      : "bg-white text-gray-800 rounded-tl-md border border-gray-100"
                  }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="iMessage"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-gray-50 hover:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4 ml-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NerdyMessages;
