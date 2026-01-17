import React, { useState } from "react";
import useMessagesStore from "../../store/messagesStore";

const NerdyMessages = () => {
  const {
    contacts,
    messages,
    activeContactId,
    setActiveContact,
    addContact,
    deleteContact,
    addMessage,
  } = useMessagesStore();

  const [inputText, setInputText] = useState("");
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState("");

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const activeMessages = messages[activeContactId] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    addMessage(activeContactId, inputText);
    setInputText("");
  };

  const handleAddContact = () => {
    if (!newContactName.trim()) return;
    const id = addContact(newContactName.trim());
    setActiveContact(id);
    setNewContactName("");
    setShowNewContactModal(false);
  };

  const handleDeleteContact = (id, e) => {
    e.stopPropagation();
    if (
      confirm(
        `Delete conversation with ${contacts.find((c) => c.id === id)?.name}?`,
      )
    ) {
      deleteContact(id);
    }
  };

  return (
    <div className="flex h-full bg-white text-gray-900 border-t border-gray-200">
      {/* Sidebar */}
      <div className="w-1/3 min-w-[200px] border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button
              onClick={() => setShowNewContactModal(true)}
              className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors text-lg font-bold"
            >
              +
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => {
            const contactMessages = messages[contact.id] || [];
            const lastMessage = contactMessages[contactMessages.length - 1];

            return (
              <div
                key={contact.id}
                onClick={() => setActiveContact(contact.id)}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-colors flex gap-3 items-center group
                  ${
                    activeContactId === contact.id
                      ? "bg-emerald-50 border-l-4 border-l-emerald-500"
                      : "hover:bg-gray-100 border-l-4 border-l-transparent"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {lastMessage?.time || ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {lastMessage?.text || "No messages yet"}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteContact(contact.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-sm"
                >
                  🗑️
                </button>
              </div>
            );
          })}

          {contacts.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">
              No contacts yet.
              <br />
              <button
                onClick={() => setShowNewContactModal(true)}
                className="text-emerald-500 hover:underline mt-2"
              >
                Add one?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-gray-200 bg-white/80 backdrop-blur flex items-center px-4 justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                  {activeContact.name.charAt(0)}
                </div>
                <span className="font-bold text-gray-800">
                  {activeContact.name}
                </span>
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
              {activeMessages.length > 0 ? (
                activeMessages.map((msg) => (
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
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  No messages yet. Say hello! 👋
                </div>
              )}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-80 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              New Contact
            </h3>
            <input
              type="text"
              placeholder="Contact name"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddContact()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              autoFocus
            />
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowNewContactModal(false);
                  setNewContactName("");
                }}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                disabled={!newContactName.trim()}
                className="flex-1 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NerdyMessages;
