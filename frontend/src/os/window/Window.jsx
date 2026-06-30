import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const SNAP_THRESHOLD = 20;

// Shake detection constants
const SHAKE_THRESHOLD = 50; // Minimum movement to count as significant
const SHAKE_TIME_WINDOW = 500; // Time window in ms to detect shake
const SHAKE_MIN_REVERSALS = 3; // Minimum direction changes to trigger shake
const SHAKE_COOLDOWN = 1000; // Cooldown between shakes

const Window = ({
  title,
  children,
  className,
  isActive = true,
  isFullscreen = false,
  isMinimized = false,
  snapState = null,
  launchOrigin = null, // { x, y, width, height }
  tiledPosition = null,
  isTiled = false,
  isFloating = true,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onFloat,
  onSnap,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [snapPreview, setSnapPreview] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  // Refs for tracking drag deltas
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeDirectionRef = useRef("");

  // Shake detection refs
  const shakeHistoryRef = useRef([]);
  const lastShakeTimeRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastDirectionRef = useRef({ x: 0, y: 0 });

  const handleFocus = () => {
    if (onFocus) onFocus();
  };

  // --- Title Bar Interactions ---
  const handleTitleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest("button")) return;
    if (isFullscreen) return;
    if (isTiled && tiledPosition) return; // Disable dragging in tiled mode

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
    if (isTiled && tiledPosition) return; // Disable resizing in tiled mode
    e.preventDefault();
    e.stopPropagation();
    handleFocus();
    setIsResizing(true);

    resizeDirectionRef.current = direction;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialRectRef.current = { ...position, ...size };
  };

  // --- Shake Detection ---
  const detectShake = useCallback((currentX, currentY) => {
    const now = Date.now();

    // Check cooldown
    if (now - lastShakeTimeRef.current < SHAKE_COOLDOWN) return;

    const lastPos = lastPositionRef.current;
    const dx = currentX - lastPos.x;
    const dy = currentY - lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only track significant movements
    if (distance > SHAKE_THRESHOLD / 3) {
      // Determine direction
      const dirX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
      const dirY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

      // Check for direction reversal
      const lastDir = lastDirectionRef.current;
      const xReversed = lastDir.x !== 0 && dirX !== 0 && lastDir.x !== dirX;
      const yReversed = lastDir.y !== 0 && dirY !== 0 && lastDir.y !== dirY;

      if (xReversed || yReversed) {
        shakeHistoryRef.current.push({ time: now, x: currentX, y: currentY });
      }

      lastDirectionRef.current = { x: dirX, y: dirY };
    }

    lastPositionRef.current = { x: currentX, y: currentY };

    // Clean old entries
    shakeHistoryRef.current = shakeHistoryRef.current.filter(
      (entry) => now - entry.time < SHAKE_TIME_WINDOW,
    );

    // Trigger shake if enough reversals
    if (shakeHistoryRef.current.length >= SHAKE_MIN_REVERSALS) {
      setIsShaking(true);
      lastShakeTimeRef.current = now;
      shakeHistoryRef.current = [];

      // Auto-reset shake animation
      setTimeout(() => setIsShaking(false), 500);
    }
  }, []);

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

        // Detect shaking
        detectShake(e.clientX, e.clientY);

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
  }, [isDragging, isResizing, snapPreview, onSnap, detectShake]);

  // Actual position and size based on tiling vs floating mode
  const actualPosition = isTiled && tiledPosition
    ? { x: tiledPosition.x, y: tiledPosition.y }
    : position;

  const actualSize = isTiled && tiledPosition
    ? { width: tiledPosition.width, height: tiledPosition.height }
    : size;

  // --- Animation Variants ---

  // Get screen dimensions for menu bar position calculation
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920;

  // Menu bar position (top center of screen)
  const menuBarPosition = {
    x: screenWidth / 2 - 40, // Center minus half of minimized width
    y: 10, // Near top (menu bar area)
  };

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
    // Wavy minimize animation - scale down and move to top menu bar with wave distortion
    targetAnimate = {
      x: menuBarPosition.x,
      y: menuBarPosition.y,
      width: 80,
      height: 50,
      scale: 0.1,
      scaleX: 1.3, // Horizontal wave stretch
      scaleY: 0.7, // Vertical wave squish
      opacity: 0,
      borderRadius: "1rem",
      pointerEvents: "none",
    };
  } else if (isFullscreen || snapState === "maximize") {
    // Maximize to full usable area (below MenuBar, dock auto-hides)
    const screenH = typeof window !== "undefined" ? window.innerHeight : 1080;
    targetAnimate = {
      x: 0,
      y: 32,
      width: "100%",
      height: screenH - 32,
      borderRadius: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  } else if (snapState === "left") {
    const screenH = typeof window !== "undefined" ? window.innerHeight : 1080;
    const screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
    targetAnimate = {
      x: 0,
      y: 32,
      width: Math.floor(screenW / 2),
      height: screenH - 32,
      borderRadius: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  } else if (snapState === "right") {
    const screenH = typeof window !== "undefined" ? window.innerHeight : 1080;
    const screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
    targetAnimate = {
      x: Math.floor(screenW / 2),
      y: 32,
      width: Math.floor(screenW / 2),
      height: screenH - 32,
      borderRadius: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  } else {
    // Normal Windowed
    targetAnimate = {
      x: actualPosition.x,
      y: actualPosition.y,
      width: actualSize.width,
      height: actualSize.height,
      borderRadius: isTiled ? "0.75rem" : "1rem",
      scale: 1,
      scaleX: 1,
      scaleY: 1,
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
          // Different spring settings for minimize animation - softer, more fluid
          stiffness: isMinimized ? 180 : 350,
          damping: isMinimized ? 25 : 35,
          mass: isMinimized ? 0.8 : 1,
        }}
        className="absolute"
        style={{ transformOrigin: "center center" }}
        onMouseDownCapture={handleFocus}
      >
        {/* Inner wrapper for visual styles and jelly animation - separate from positioning */}
        <div
          className={clsx(
            "w-full h-full flex flex-col overflow-hidden transition-all duration-300 rounded-2xl",
            // macOS Premium Glass Effect
            "bg-slate-950/45 backdrop-blur-[35px] backdrop-saturate-150",
            // Premium macOS Shadows & Highlights
            isActive
              ? "shadow-[0_25px_60px_rgba(0,0,0,0.55)] border border-white/15 z-10"
              : "shadow-[0_12px_30px_rgba(0,0,0,0.35)] border border-white/5 z-0 opacity-90",
            // Jelly/Fluid Animation on Shake
            isShaking && "animate-jelly",
            className,
          )}
          style={{ transformOrigin: "center center" }}
        >
          {/* Title Bar */}
          <div
            className={clsx(
              "h-9 flex items-center px-4 select-none cursor-default border-b transition-colors shrink-0 relative",
              isActive
                ? "bg-slate-950/15 border-white/10"
                : "bg-transparent border-transparent",
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
            <div className="flex-1 text-center text-xs font-semibold text-white/85 pointer-events-none truncate tracking-wide">
              {title}
            </div>
            <div className="flex items-center justify-end w-14 pr-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFloat?.();
                }}
                className="p-1 text-white/50 hover:text-cyan-400 hover:bg-white/10 rounded transition-all active:scale-90"
                title={isFloating ? "Tile window (dock to split screen)" : "Float window (free move/resize)"}
              >
                {isFloating ? (
                  // Tiling icon
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ) : (
                  // Floating overlaps icon
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </div>

          {/* Resize Handles (Only if normal state) - Enlarged for better usability */}
          {!snapState && !isFullscreen && !isMinimized && (
            <>
              {/* Edge handles - 6px for easier grabbing */}
              <div
                className="absolute top-0 left-[6px] right-[6px] h-[6px] cursor-n-resize z-50 hover:bg-cyan-400/10 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, "n")}
              />
              <div
                className="absolute bottom-0 left-[6px] right-[6px] h-[6px] cursor-s-resize z-50 hover:bg-cyan-400/10 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, "s")}
              />
              <div
                className="absolute top-[6px] bottom-[6px] right-0 w-[6px] cursor-e-resize z-50 hover:bg-cyan-400/10 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, "e")}
              />
              <div
                className="absolute top-[6px] bottom-[6px] left-0 w-[6px] cursor-w-resize z-50 hover:bg-cyan-400/10 transition-colors"
                onMouseDown={(e) => handleResizeMouseDown(e, "w")}
              />
              {/* Corner handles - 12px for easier grabbing */}
              <div
                className="absolute top-0 left-0 w-[12px] h-[12px] cursor-nw-resize z-[51] hover:bg-cyan-400/20 transition-colors rounded-tl"
                onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
              />
              <div
                className="absolute top-0 right-0 w-[12px] h-[12px] cursor-ne-resize z-[51] hover:bg-cyan-400/20 transition-colors rounded-tr"
                onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
              />
              <div
                className="absolute bottom-0 left-0 w-[12px] h-[12px] cursor-sw-resize z-[51] hover:bg-cyan-400/20 transition-colors rounded-bl"
                onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
              />
              <div
                className="absolute bottom-0 right-0 w-[12px] h-[12px] cursor-se-resize z-[51] hover:bg-cyan-400/20 transition-colors rounded-br"
                onMouseDown={(e) => handleResizeMouseDown(e, "se")}
              />
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Window;
