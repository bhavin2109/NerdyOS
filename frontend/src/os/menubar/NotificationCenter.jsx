import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarWidget from "./CalendarWidget";

const NotificationCenter = ({ onClose, mode = "full" }) => {
  const showCalendar = mode === "full" || mode === "calendar";
  const showNotifications = mode === "full" || mode === "notifications";

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      app: "NerdyMail",
      title: "New Email from Boss",
      message: "Please review the Q4 report by EOD.",
      time: "10:30 AM",
      icon: "✉️",
    },
    {
      id: 2,
      app: "System",
      title: "Update Available",
      message: "NerdyOS 2.0 is ready to install.",
      time: "9:15 AM",
      icon: "🔄",
    },
  ]);

  const clearAll = () => setNotifications([]);
  const removeNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: "circOut" }}
      className="absolute top-10 right-2 w-[360px] h-[85vh] max-h-[700px] bg-[#1c1c1efc] backdrop-blur-[100px] rounded-2xl p-4 text-white z-[90] select-none shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 font-sans flex flex-col gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Calendar Section */}
      {showCalendar && (
        <div className="bg-[#323232]/30 rounded-xl p-2 border border-white/5">
          <EmbeddedCalendar />
        </div>
      )}

      {/* Notifications Section */}
      {showNotifications && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-semibold text-white/90">
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-white/40 gap-2">
                <span className="text-2xl">💤</span>
                <span className="text-sm">No new notifications</span>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="bg-[#323232]/50 hover:bg-[#323232]/80 border border-white/5 rounded-xl p-3 relative group transition-colors"
                  >
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-white/50 hover:text-white transition-opacity"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-semibold text-white/90">
                            {n.app}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {n.time}
                          </span>
                        </div>
                        <div className="text-sm font-medium leading-tight mb-1">
                          {n.title}
                        </div>
                        <div className="text-xs text-white/60 leading-snug">
                          {n.message}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Simplified copy of CalendarWidget logic for embedding
const EmbeddedCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // ... logic (simplified for brevity, ensuring it fits)
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const changeMonth = (offset) =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    );

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const firstDay = getFirstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const today = new Date();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
    days.push(
      <div
        key={i}
        className={`h-8 w-8 flex items-center justify-center rounded-full text-xs ${
          isToday
            ? "bg-cyan-500 text-white font-bold"
            : "text-white/80 hover:bg-white/10"
        }`}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-semibold">
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center mb-1">
        <div className="col-span-7 grid grid-cols-7">
          {dayNames.map((d) => (
            <div
              key={d}
              className="text-[10px] text-white/40 uppercase font-bold"
            >
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 justify-items-center">
        {days}
      </div>
    </div>
  );
};

export default NotificationCenter;
