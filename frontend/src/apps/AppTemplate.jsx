import clsx from "clsx";

const AppTemplate = ({
  title,
  actions,
  children,
  className,
  contentClassName,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col h-full w-full bg-white/50 backdrop-blur-md",
        className
      )}
    >
      {/* Header / Toolbar */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 shrink-0">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            {title}
          </h1>
          <div className="flex gap-2">{actions}</div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={clsx(
          "flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
          contentClassName || "p-4"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default AppTemplate;
