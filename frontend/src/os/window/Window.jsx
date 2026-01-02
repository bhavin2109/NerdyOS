import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const SNAP_THRESHOLD = 20;

const Window = ({
  title,
  children,
  className,
  isActive = true,
  isFullscreen = false,
  isMinimized = false,
  snapState = null,
  launchOrigin = null, // { x, y, width, height }
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [snapPreview, setSnapPreview] = useState(null);

  // Refs for tracking drag deltas
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeDirectionRef = useRef("");

  const handleFocus = () => {
    if (onFocus) onFocus();
  };

  // --- Title Bar Interactions ---
  const handleTitleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest("button")) return;
    if (isFullscreen) return;

    e.preventDefault();
    handleFocus();

    if (snapState) {
      onSnap(null);
    }

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialRectRef.current = { ...position };
  };

  const handleTitleDoubleClick = (e) => {
    if (e.target.closest("button")) return;
    onMaximize();
  };

  // --- Resizing ---
  const handleResizeMouseDown = (e, direction) => {
    if (isFullscreen || snapState || isMinimized) return;
    e.preventDefault();
    e.stopPropagation();
    handleFocus();
    setIsResizing(true);

    resizeDirectionRef.current = direction;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialRectRef.current = { ...position, ...size };
  };

  // --- Global Mouse Listeners ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        let newX = initialRectRef.current.x + deltaX;
        let newY = initialRectRef.current.y + deltaY;

        if (newY < 0) newY = 0; // Menu bar constraint

        setPosition({ x: newX, y: newY });

        // Snap Regions
        const screenW = window.innerWidth;
        if (e.clientX < SNAP_THRESHOLD) setSnapPreview("left");
        else if (e.clientX > screenW - SNAP_THRESHOLD) setSnapPreview("right");
        else if (e.clientY < SNAP_THRESHOLD) setSnapPreview("maximize");
        else setSnapPreview(null);
      }

      if (isResizing) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        const { x, y, width, height } = initialRectRef.current;
        const dir = resizeDirectionRef.current;

        let newWidth = width;
        let newHeight = height;
        let newX = x;
        let newY = y;

        // Horizontal
        if (dir.includes("e")) newWidth = Math.max(MIN_WIDTH, width + deltaX);
        else if (dir.includes("w")) {
          const w = Math.max(MIN_WIDTH, width - deltaX);
          newX = x + (width - w);
          newWidth = w;
        }

        // Vertical
        if (dir.includes("s"))
          newHeight = Math.max(MIN_HEIGHT, height + deltaY);
        else if (dir.includes("n")) {
          const h = Math.max(MIN_HEIGHT, height - deltaY);
          newY = y + (height - h);
          newHeight = h;
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging && snapPreview && onSnap) {
        onSnap(snapPreview);
      }
      setIsDragging(false);
      setIsResizing(false);
      setSnapPreview(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, snapPreview, onSnap]);

  // --- Animation Variants ---

  // Prepare Origin for Animation
  const initialAnim = launchOrigin
    ? {
        x: launchOrigin.x,
        y: launchOrigin.y,
        width: launchOrigin.width,
        height: launchOrigin.height,
        opacity: 0,
        scale: 0.6, // Matches macOS launch scale precisely
        borderRadius: "2rem",
      }
    : { scale: 0.9, opacity: 0, y: 50 };

  const exitAnim = launchOrigin
    ? {
        x: launchOrigin.x,
        y: launchOrigin.y,
        width: launchOrigin.width,
        height: launchOrigin.height,
        opacity: 0,
        scale: 0.6,
        borderRadius: "2rem",
        transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }, // Apple-like easing
      }
    : { scale: 0.9, opacity: 0, transition: { duration: 0.2 } };

  let targetAnimate = {};

  if (isMinimized) {
    // Use exit animation target logic for minimize
    targetAnimate = exitAnim;
    // Force opacity 0 in case exitAnim doesn't have it (it does)
    targetAnimate.opacity = 0;
    targetAnimate.pointerEvents = "none";
  } else if (isFullscreen || snapState === "maximize") {
    // Fullscreen/Maximized
    targetAnimate = {
      x: 0,
      y: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      scale: 1,
      opacity: 1,
    };
  } else if (snapState === "left") {
    targetAnimate = {
      x: 0,
      y: 0,
      width: "50%",
      height: "100%",
      borderRadius: 0,
      scale: 1,
      opacity: 1,
    };
  } else if (snapState === "right") {
    targetAnimate = {
      x: "50%",
      y: 0,
      width: "50%",
      height: "100%",
      borderRadius: 0,
      scale: 1,
      opacity: 1,
    };
  } else {
    // Normal Windowed
    targetAnimate = {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      borderRadius: "0.5rem",
      scale: 1,
      opacity: 1,
    };
  }

  return (
    <>
      {/* Snap Preview Ghost */}
      {snapPreview && (
        <div
          className="fixed z-[100] bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg pointer-events-none transition-all duration-200 ease-out"
          style={{
            top: 10,
            bottom: 10,
            left: snapPreview === "right" ? "50%" : 10,
            right: snapPreview === "left" ? "50%" : 10,
            width:
              snapPreview === "maximize"
                ? "calc(100% - 20px)"
                : "calc(50% - 20px)",
          }}
        />
      )}

      <motion.div
        initial={initialAnim}
        animate={targetAnimate}
        exit={exitAnim}
        transition={{
          type: isDragging || isResizing ? "tween" : "spring",
          duration: isDragging || isResizing ? 0 : undefined,
          stiffness: 350,
          damping: 35,
          mass: 1,
        }}
        className={clsx(
          "absolute flex flex-col overflow-hidden transition-shadow duration-300",
          // Glass / Water Effect
          "bg-slate-900/70 backdrop-blur-2xl backdrop-saturate-150",
          // Neon Borders & Glow
          isActive
            ? "shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50 z-10"
            : "shadow-lg border border-white/10 z-0 opacity-90 grayscale-[30%]",
          className
        )}
        onMouseDownCapture={handleFocus}
      >
        {/* Title Bar */}
        <div
          className={clsx(
            "h-10 flex items-center px-4 select-none cursor-default border-b transition-colors shrink-0 relative",
            isActive
              ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-white/10"
              : "bg-transparent border-transparent"
          )}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={handleTitleDoubleClick}
        >
          <div className="flex gap-2 group mr-4">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] flex items-center justify-center transition-all hover:scale-110 active:scale-90 group-hover:after:content-['x'] after:text-[8px] after:text-black/50"
            ></button>
            <button
              onClick={onMinimize}
              className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24] flex items-center justify-center transition-all hover:scale-110 active:scale-90 group-hover:after:content-['-'] after:text-[8px] after:text-black/50"
            ></button>
            <button
              onClick={onMaximize}
              className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] flex items-center justify-center transition-all hover:scale-110 active:scale-90 group-hover:after:content-['+'] after:text-[6px] after:text-black/50"
            ></button>
          </div>
          <div className="flex-1 text-center text-sm font-medium text-cyan-50/90 pointer-events-none truncate drop-shadow-md tracking-wide">
            {title}
          </div>
          {/* Gloss overlay for water effect on titlebar */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="w-14"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </div>

        {/* Resize Handles (Only if normal state) */}
        {!snapState && !isFullscreen && !isMinimized && (
          <>
            <div
              className="absolute top-0 left-0 right-0 h-1 cursor-n-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "n")}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "s")}
            />
            <div
              className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "e")}
            />
            <div
              className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "w")}
            />
            <div
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
              onMouseDown={(e) => handleResizeMouseDown(e, "se")}
            />
          </>
        )}
      </motion.div>
    </>
  );
};

export default Window;
