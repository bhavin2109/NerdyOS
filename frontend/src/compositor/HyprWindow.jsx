/**
 * HyprWindow - Hyprland-style Window Component
 * Supports tiling and floating modes with border glow decorations
 */

import { memo, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import useConfigStore from "../store/configStore";

import { SPRING_CONFIGS, ANIMATION_VARIANTS } from "../config/animationConfig";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;
const SNAP_THRESHOLD = 20;

const HyprWindow = memo(function HyprWindow({
  id,
  title,
  children,
  className,
  // State
  isActive = false,
  isTiled = true,
  isFloating = false,
  isFullscreen = false,
  isMinimized = false,
  isPseudo = false,
  isPinned = false,
  // Tiled position (from tiling engine)
  tiledPosition = null,
  // Floating position (user-defined)
  floatingPosition = null,
  floatingSize = null,
  // Callbacks
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onFloat,
}) {
  // Local state for floating mode drag/resize
  const [localPosition, setLocalPosition] = useState({ x: 100, y: 100 });
  const [localSize, setLocalSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [snapPreview, setSnapPreview] = useState(null); // { x, y, width, height } or null

  // Refs for drag calculations
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeDirectionRef = useRef("");

  // Config values
  const decoration = useConfigStore((state) => state.decoration);
  const general = useConfigStore((state) => state.general);

  // Initialize floating position
  useEffect(() => {
    if (floatingPosition) {
      setLocalPosition(floatingPosition);
    }
    if (floatingSize) {
      setLocalSize(floatingSize);
    }
  }, [floatingPosition, floatingSize]);

  // Handle focus
  const handleFocus = useCallback(() => {
    if (onFocus) onFocus();
  }, [onFocus]);

  // Title bar drag start
  const handleTitleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      if (isTiled && !isFloating) return; // Can't drag in tiled mode

      e.preventDefault();
      handleFocus();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      initialRectRef.current = { ...localPosition };
    },
    [isTiled, isFloating, localPosition, handleFocus],
  );

  // Double-click to maximize
  const handleTitleDoubleClick = useCallback(
    (e) => {
      if (e.target.closest("button")) return;
      if (onMaximize) onMaximize();
    },
    [onMaximize],
  );

  // Resize start
  const handleResizeMouseDown = useCallback(
    (e, direction) => {
      if (isTiled && !isFloating && !isPseudo) return;
      e.preventDefault();
      e.stopPropagation();
      handleFocus();
      setIsResizing(true);
      resizeDirectionRef.current = direction;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      initialRectRef.current = { ...localPosition, ...localSize };
    },
    [isTiled, isFloating, isPseudo, localPosition, localSize, handleFocus],
  );

  // Global mouse move/up handlers
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Snap detection
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let snap = null;

        // Left half
        if (e.clientX < SNAP_THRESHOLD) {
          snap = {
            x: 0,
            y: 0,
            width: screenWidth / 2,
            height: screenHeight,
            type: "left",
          };
        }
        // Right half
        else if (e.clientX > screenWidth - SNAP_THRESHOLD) {
          snap = {
            x: screenWidth / 2,
            y: 0,
            width: screenWidth / 2,
            height: screenHeight,
            type: "right",
          };
        }
        // maximize (top)
        else if (e.clientY < SNAP_THRESHOLD) {
          snap = {
            x: 0,
            y: 0,
            width: screenWidth,
            height: screenHeight,
            type: "maximize",
          };
        }

        setSnapPreview(snap);

        setLocalPosition({
          x: Math.max(0, initialRectRef.current.x + deltaX),
          y: Math.max(0, initialRectRef.current.y + deltaY),
        });
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
        if (dir.includes("w")) {
          const w = Math.max(MIN_WIDTH, width - deltaX);
          newX = x + (width - w);
          newWidth = w;
        }

        // Vertical
        if (dir.includes("s"))
          newHeight = Math.max(MIN_HEIGHT, height + deltaY);
        if (dir.includes("n")) {
          const h = Math.max(MIN_HEIGHT, height - deltaY);
          newY = y + (height - h);
          newHeight = h;
        }

        setLocalSize({ width: newWidth, height: newHeight });
        setLocalPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      // Apply snap if exists
      if (isDragging && snapPreview) {
        if (snapPreview.type === "maximize") {
          if (onMaximize) onMaximize();
        } else {
          setLocalPosition({ x: snapPreview.x, y: snapPreview.y });
          setLocalSize({
            width: snapPreview.width,
            height: snapPreview.height,
          });
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setSnapPreview(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  // Calculate actual position and size
  const position =
    isTiled && tiledPosition && !isFloating
      ? { x: tiledPosition.x, y: tiledPosition.y }
      : localPosition;

  const size =
    isTiled && tiledPosition && !isFloating
      ? { width: tiledPosition.width, height: tiledPosition.height }
      : localSize;

  // Animation target
  const animateTarget = isMinimized
    ? { scale: 0.1, opacity: 0, y: -100 }
    : isFullscreen
      ? { x: 0, y: 0, width: "100%", height: "100%", borderRadius: 0 }
      : {
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          borderRadius: decoration?.rounding || 10,
        };

  // Border style based on active state
  const borderColor = isActive
    ? general?.col?.active_border || "rgba(203, 166, 247, 0.9)"
    : general?.col?.inactive_border || "rgba(49, 50, 68, 0.6)";

  const shadowStyle =
    isActive && decoration?.drop_shadow
      ? `0 0 ${decoration?.shadow_range || 20}px rgba(203, 166, 247, 0.3)`
      : undefined;

  return (
    <motion.div
      layoutId={id}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={animateTarget}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{
        ...SPRING_CONFIGS.window,
        duration: isDragging || isResizing ? 0 : undefined,
      }}
      className={clsx(
        "absolute overflow-hidden flex flex-col",
        isMinimized && "pointer-events-none",
        className,
      )}
      style={{
        borderRadius: decoration?.rounding || 10,
        borderWidth: general?.border_size || 2,
        borderStyle: "solid",
        borderColor: borderColor,
        boxShadow: shadowStyle,
        opacity: isMinimized
          ? 0
          : (isActive
              ? decoration?.active_opacity
              : decoration?.inactive_opacity) || 1,
        zIndex: isActive ? 10 : 1,
      }}
      onClick={handleFocus}
    >
      {/* Window Background with Blur */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: "rgba(30, 30, 46, 0.85)",
          backdropFilter: decoration?.blur
            ? `blur(${decoration?.blur_size || 8}px)`
            : undefined,
        }}
      />

      {/* Title Bar */}
      <div
        className={clsx(
          "h-9 flex items-center px-3 gap-2 shrink-0 select-none",
          "border-b border-surface-0",
          (isFloating || !isTiled) && "cursor-move",
        )}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleTitleDoubleClick}
      >
        {/* Window Controls (minimal Hyprland style) */}
        <div className="flex items-center gap-1.5 group/controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className={clsx(
              "w-3 h-3 rounded-full transition-all",
              "bg-red hover:brightness-110 active:scale-90",
              "opacity-60 group-hover/controls:opacity-100",
            )}
            title="Close"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
            className={clsx(
              "w-3 h-3 rounded-full transition-all",
              "bg-yellow hover:brightness-110 active:scale-90",
              "opacity-60 group-hover/controls:opacity-100",
            )}
            title="Minimize"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize?.();
            }}
            className={clsx(
              "w-3 h-3 rounded-full transition-all",
              "bg-green hover:brightness-110 active:scale-90",
              "opacity-60 group-hover/controls:opacity-100",
            )}
            title="Maximize"
          />
        </div>

        {/* Title */}
        <div className="flex-1 text-center text-sm font-medium text-text/90 truncate pointer-events-none">
          {title}
        </div>

        {/* Floating toggle */}
        {!isFullscreen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFloat?.();
            }}
            className={clsx(
              "w-6 h-6 flex items-center justify-center rounded",
              "text-overlay-0 hover:text-text hover:bg-surface-0 transition-colors",
            )}
            title={isFloating ? "Tile" : "Float"}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isFloating ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              )}
            </svg>
          </button>
        )}

        {/* Pin indicator */}
        {isPinned && (
          <div className="text-mauve" title="Pinned (always on top)">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">{children}</div>

      {/* Resize Handles (only for floating/pseudo windows) */}
      {(isFloating || isPseudo) && !isFullscreen && !isMinimized && (
        <>
          {/* Edges */}
          <div
            className="absolute top-0 left-2 right-2 h-1 cursor-n-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          />
          <div
            className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          />
          <div
            className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          />
          <div
            className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          />

          {/* Corners */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          />
        </>
      )}

      {/* Snap Preview Overlay */}
      {snapPreview && (
        <div
          className="fixed bg-mauve/20 border-2 border-mauve rounded-lg z-[100] pointer-events-none transition-all duration-150"
          style={{
            left: snapPreview.x,
            top: snapPreview.y,
            width: snapPreview.width,
            height: snapPreview.height,
          }}
        />
      )}
    </motion.div>
  );
});

export default HyprWindow;
