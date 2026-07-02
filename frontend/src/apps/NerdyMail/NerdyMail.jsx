import { useState } from "react";

const MOCK_EMAILS = [
  { id: 1, from: "team@nerdyos.com", subject: "Welcome to NerdyOS Mail", preview: "Your inbox is ready to use.", time: "10:30 AM", unread: true },
  { id: 2, from: "calendar@nerdyos.com", subject: "Meeting reminder", preview: "Team sync at 3 PM today.", time: "Yesterday", unread: false },
  { id: 3, from: "support@nerdyos.com", subject: "Tips for getting started", preview: "Explore Files, Terminal, and Notes.", time: "Mon", unread: false },
];

const NerdyMail = () => {
  const [selected, setSelected] = useState(MOCK_EMAILS[0]);
  const [emails] = useState(MOCK_EMAILS);

  return (
    <div className="flex h-full bg-[#f5f5f7] text-gray-900">
      <div className="w-full sm:w-72 border-r border-gray-200 bg-white/80 flex flex-col">
        <div className="p-3 border-b border-gray-200 font-semibold text-sm">Inbox</div>
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelected(email)}
              className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-blue-50/60 ${selected?.id === email.id ? "bg-blue-50" : ""}`}
            >
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${email.unread ? "text-gray-900" : "text-gray-600"}`}>{email.from}</span>
                <span className="text-gray-400">{email.time}</span>
              </div>
              <div className={`text-sm truncate ${email.unread ? "font-semibold" : ""}`}>{email.subject}</div>
              <div className="text-xs text-gray-500 truncate">{email.preview}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="hidden sm:flex flex-1 flex-col bg-white p-6">
        {selected && (
          <>
            <h1 className="text-xl font-semibold mb-2">{selected.subject}</h1>
            <div className="text-sm text-gray-500 mb-6">From: {selected.from}</div>
            <p className="text-gray-700 leading-relaxed">{selected.preview}</p>
            <p className="text-gray-700 leading-relaxed mt-4">
              This is a local demo inbox built into NerdyOS. Connect a backend to sync real email.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default NerdyMail;
