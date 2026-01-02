import { motion } from "framer-motion";

const Notification = ({ title, message, icon, onDismiss }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="w-80 bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl overflow-hidden flex items-start gap-3 p-4 select-none pointer-events-auto"
    >
      {/* App Icon / Status Icon */}
      <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center shrink-0 shadow-sm text-2xl">
        {icon || "🔔"}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm truncate">
          {title}
        </h4>
        <p className="text-gray-600 text-xs mt-0.5 leading-snug break-words">
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors -mt-1 -mr-1 p-1 rounded-full hover:bg-black/5"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default Notification;
