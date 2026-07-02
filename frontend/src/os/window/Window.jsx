import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import WebGLGenie from "./WebGLGenie";
import clsx from "clsx";
import { TWEEN_CONFIGS, BEZIER_CURVES } from "../../config/animationConfig";

const MIN_WIDTH = 280;
const MIN_HEIGHT = 180;
const SNAP_THRESHOLD = 20;
const MENU_BAR_HEIGHT = 32;

const MAC_MINIMIZE = {
  type: "tween",
  duration: 0.45,
  ease: [0.32, 0.72, 0, 1],
};

const MAC_OPEN = {
  type: "tween",
  duration: 0.35,
  ease: BEZIER_CURVES.windowOpen,
};

const captureElement = async (el) => {
  const width = el.offsetWidth || 800;
  const height = el.offsetHeight || 600;

  let cssText = "";
  for (const sheet of document.styleSheets) {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        for (const rule of rules) {
          cssText += rule.cssText;
        }
      }
    } catch (e) {
      // ignore cross-origin sheet access errors
    }
  }

  const clone = el.cloneNode(true);
  const scripts = clone.querySelectorAll("script");
  scripts.forEach((s) => s.remove());

  const serialized = new XMLSerializer().serializeToString(clone);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <style xmlns="http://www.w3.org/1999/xhtml">
          ${cssText}
        </style>
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; position: relative; margin: 0; padding: 0;">
          ${serialized}
        </div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
};

const Window = ({
  title,
  children,
  className,
  isActive = true,
  isFullscreen = false,
  isMinimized = false,
  snapState = null,
  launchOrigin = null,
  minimizeTarget = null,
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
  const [position, setPosition] = useState({ x: 80, y: 60 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [snapPreview, setSnapPreview] = useState(null);

  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeDirectionRef = useRef("");
  const liveRectRef = useRef(null);

  const handleFocus = () => onFocus?.();

  const actualPosition =
    isTiled && tiledPosition ? { x: tiledPosition.x, y: tiledPosition.y } : position;
  const actualSize =
    isTiled && tiledPosition
      ? { width: tiledPosition.width, height: tiledPosition.height }
      : size;

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 1080;

  const dockTarget = minimizeTarget || {
    x: screenWidth / 2 - 24,
    y: screenHeight - 20,
    width: 48,
    height: 48,
  };

  const [animatingState, setAnimatingState] = useState(null); // 'minimizing' | 'maximizing' | null
  const [snapshotImg, setSnapshotImg] = useState(null);
  const [savedRect, setSavedRect] = useState(null);
  const [visuallyHidden, setVisuallyHidden] = useState(isMinimized);

  useEffect(() => {
    if (isMinimized) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSavedRect(rect);
        captureElement(containerRef.current)
          .then((img) => {
            setSnapshotImg(img);
            setAnimatingState("minimizing");
            setVisuallyHidden(true);
          })
          .catch((err) => {
            console.error("Genie capture error:", err);
            setVisuallyHidden(true);
          });
      } else {
        setVisuallyHidden(true);
      }
    } else {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSavedRect(rect);
        captureElement(containerRef.current)
          .then((img) => {
            setSnapshotImg(img);
            setAnimatingState("maximizing");
          })
          .catch((err) => {
            console.error("Genie capture error:", err);
            setVisuallyHidden(false);
          });
      } else {
        setVisuallyHidden(false);
      }
    }
  }, [isMinimized]);

  const applyLiveRect = useCallback((rect) => {
    liveRectRef.current = rect;
    const el = containerRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
  }, []);

  const handleTitlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType !== "touch") return;
    if (e.target.closest("button")) return;
    if (isFullscreen || (isTiled && tiledPosition)) return;

    e.preventDefault();
    handleFocus();
    if (snapState) onSnap?.(null);

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialRectRef.current = { ...actualPosition, ...actualSize };
    containerRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handleTitleDoubleClick = (e) => {
    if (e.target.closest("button")) return;
    onMaximize?.();
  };

  const handleResizePointerDown = (e, direction) => {
    if (isFullscreen || snapState || isMinimized) return;
    if (isTiled && tiledPosition) return;
    e.preventDefault();
    e.stopPropagation();
    handleFocus();
    setIsResizing(true);
    resizeDirectionRef.current = direction;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialRectRef.current = { ...position, ...size };
    containerRef.current?.setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        const newX = Math.max(0, initialRectRef.current.x + deltaX);
        const newY = Math.max(0, initialRectRef.current.y + deltaY);

        applyLiveRect({
          x: newX,
          y: newY,
          width: initialRectRef.current.width,
          height: initialRectRef.current.height,
        });

        const screenW = window.innerWidth;
        if (e.clientX < SNAP_THRESHOLD) setSnapPreview("left");
        else if (e.clientX > screenW - SNAP_THRESHOLD) setSnapPreview("right");
        else if (e.clientY < SNAP_THRESHOLD + MENU_BAR_HEIGHT) setSnapPreview("maximize");
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

        if (dir.includes("e")) newWidth = Math.max(MIN_WIDTH, width + deltaX);
        else if (dir.includes("w")) {
          const w = Math.max(MIN_WIDTH, width - deltaX);
          newX = x + (width - w);
          newWidth = w;
        }
        if (dir.includes("s")) newHeight = Math.max(MIN_HEIGHT, height + deltaY);
        else if (dir.includes("n")) {
          const h = Math.max(MIN_HEIGHT, height - deltaY);
          newY = y + (height - h);
          newHeight = h;
        }

        applyLiveRect({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handlePointerUp = () => {
      if (isDragging && snapPreview) onSnap?.(snapPreview);
      if (liveRectRef.current && (isDragging || isResizing)) {
        const { x, y, width, height } = liveRectRef.current;
        setPosition({ x, y });
        setSize({ width, height });
        liveRectRef.current = null;
      }
      setIsDragging(false);
      setIsResizing(false);
      setSnapPreview(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, isResizing, snapPreview, onSnap, applyLiveRect]);



  const initialAnim = launchOrigin
    ? {
        x: launchOrigin.x,
        y: launchOrigin.y,
        width: launchOrigin.width,
        height: launchOrigin.height,
        opacity: 0,
        scale: 0.85,
        borderRadius: "1rem",
      }
    : { scale: 0.92, opacity: 0, y: 24 };

  const exitAnim = launchOrigin
    ? {
        x: launchOrigin.x,
        y: launchOrigin.y,
        width: launchOrigin.width,
        height: launchOrigin.height,
        opacity: 0,
        scale: 0.85,
        borderRadius: "1rem",
        transition: TWEEN_CONFIGS.windowClose,
      }
    : { scale: 0.92, opacity: 0, transition: TWEEN_CONFIGS.windowClose };

  const targetAnimate = useMemo(() => {
    if (visuallyHidden) {
      return {
        x: actualPosition.x,
        y: actualPosition.y,
        width: actualSize.width,
        height: actualSize.height,
        borderRadius: isTiled ? "0.625rem" : "0.75rem",
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        opacity: 0,
        pointerEvents: "none",
      };
    }
    if (isFullscreen || snapState === "maximize") {
      return {
        x: 0,
        y: MENU_BAR_HEIGHT,
        width: screenWidth,
        height: screenHeight - MENU_BAR_HEIGHT,
        borderRadius: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      };
    }
    if (snapState === "left") {
      return {
        x: 0,
        y: MENU_BAR_HEIGHT,
        width: Math.floor(screenWidth / 2),
        height: screenHeight - MENU_BAR_HEIGHT,
        borderRadius: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      };
    }
    if (snapState === "right") {
      return {
        x: Math.floor(screenWidth / 2),
        y: MENU_BAR_HEIGHT,
        width: Math.floor(screenWidth / 2),
        height: screenHeight - MENU_BAR_HEIGHT,
        borderRadius: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      };
    }
    return {
      x: actualPosition.x,
      y: actualPosition.y,
      width: actualSize.width,
      height: actualSize.height,
      borderRadius: isTiled ? "0.625rem" : "0.75rem",
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  }, [
    visuallyHidden,
    isFullscreen,
    snapState,
    screenWidth,
    screenHeight,
    actualPosition,
    actualSize,
    isTiled,
  ]);

  const transition = isDragging || isResizing
    ? { duration: 0 }
    : isMinimized
      ? MAC_MINIMIZE
      : MAC_OPEN;

  return (
    <>
      {snapPreview && (
        <div
          className="fixed z-[100] bg-white/15 border-2 border-white/30 rounded-xl pointer-events-none"
          style={{
            top: MENU_BAR_HEIGHT + 8,
            bottom: 8,
            left: snapPreview === "right" ? "50%" : 8,
            right: snapPreview === "left" ? "50%" : 8,
            width: snapPreview === "maximize" ? "calc(100% - 16px)" : "calc(50% - 16px)",
          }}
        />
      )}

      <motion.div
        ref={containerRef}
        initial={initialAnim}
        animate={targetAnimate}
        exit={exitAnim}
        transition={transition}
        className="absolute gpu-layer window-shell"
        style={{
          transformOrigin: "center center",
          willChange: isDragging || isResizing ? "transform, width, height" : "auto",
        }}
        onPointerDownCapture={handleFocus}
      >
        <div
          className={clsx(
            "w-full h-full flex flex-col overflow-hidden rounded-xl",
            "bg-[#1c1c1e]/88 md:bg-[#1c1c1e]/78 backdrop-blur-md md:backdrop-blur-xl",
            isActive
              ? "shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/12 z-10"
              : "shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-white/6 z-0 opacity-95",
            className,
          )}
        >
          <div
            className={clsx(
              "h-9 flex items-center px-3 select-none cursor-default border-b shrink-0 touch-none",
              isActive ? "bg-white/[0.04] border-white/8" : "bg-transparent border-transparent",
            )}
            onPointerDown={handleTitlePointerDown}
            onDoubleClick={handleTitleDoubleClick}
          >
            <div className="flex gap-2 group mr-3">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] hover:scale-110 active:scale-90 transition-transform"
                aria-label="Close"
              />
              <button
                onClick={onMinimize}
                className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24] hover:scale-110 active:scale-90 transition-transform"
                aria-label="Minimize"
              />
              <button
                onClick={onMaximize}
                className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] hover:scale-110 active:scale-90 transition-transform"
                aria-label="Maximize"
              />
            </div>
            <div className="flex-1 text-center text-xs font-medium text-white/80 pointer-events-none truncate">
              {title}
            </div>
            <div className="w-14 flex justify-end">
              {isFloating !== undefined && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFloat?.();
                  }}
                  className="p-1 text-white/40 hover:text-white/80 rounded transition-colors"
                  title={isFloating ? "Tile window" : "Float window"}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">{children}</div>

          {!snapState && !isFullscreen && !isMinimized && isFloating && (
            <>
              <div className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize z-50 touch-none" onPointerDown={(e) => handleResizePointerDown(e, "n")} />
              <div className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize z-50 touch-none" onPointerDown={(e) => handleResizePointerDown(e, "s")} />
              <div className="absolute top-2 bottom-2 right-0 w-1.5 cursor-e-resize z-50 touch-none" onPointerDown={(e) => handleResizePointerDown(e, "e")} />
              <div className="absolute top-2 bottom-2 left-0 w-1.5 cursor-w-resize z-50 touch-none" onPointerDown={(e) => handleResizePointerDown(e, "w")} />
              <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-[51] touch-none" onPointerDown={(e) => handleResizePointerDown(e, "se")} />
            </>
          )}
        </div>
      </motion.div>

      {animatingState && snapshotImg && savedRect && (
        <WebGLGenie
          snapshot={snapshotImg}
          rect={savedRect}
          target={dockTarget}
          direction={animatingState === "minimizing" ? "minimize" : "maximize"}
          onComplete={() => {
            setAnimatingState(null);
            setSnapshotImg(null);
            if (!isMinimized) {
              setVisuallyHidden(false);
            }
          }}
        />
      )}
    </>
  );
};

export default Window;
