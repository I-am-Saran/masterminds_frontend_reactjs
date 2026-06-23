import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const MODAL_SIZE_CLASSES = {
  sm: "kz-modal-panel--compact",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  detail: "kz-modal-panel--detail",
};

const EXIT_MS = 220;

/**
 * Modern modal component with click-outside-to-close, escape key, and enter/exit motion.
 */
export default function ModernModal({
  open,
  onClose,
  title,
  children,
  footer,
  size,
  maxWidth = "max-w-6xl",
  showCloseButton = true,
  fullSize = false,
}) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const previousOverflowRef = useRef("");
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState(open ? "enter" : "exit");
  const exitDuration = prefersReducedMotion ? 0 : EXIT_MS;

  useEffect(() => {
    if (open) {
      previousOverflowRef.current = document.body.style.overflow;
      setMounted(true);
      setPhase("enter");
      document.body.style.overflow = "hidden";
      return undefined;
    }

    if (mounted) {
      setPhase("exit");
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = previousOverflowRef.current;
      }, exitDuration);
      return () => clearTimeout(timer);
    }

    document.body.style.overflow = previousOverflowRef.current;
    return undefined;
  }, [open, mounted, exitDuration]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (backdropRef.current && event.target === backdropRef.current) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (mounted && phase === "enter") {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mounted, phase, onClose]);

  if (!mounted) return null;

  const isCompact = size === "sm";
  const widthClass = fullSize
    ? "w-[98vw] max-w-full h-[98vh] max-h-[98vh]"
    : size
      ? `w-full ${MODAL_SIZE_CLASSES[size] || MODAL_SIZE_CLASSES.xl} max-h-[95vh]`
      : `w-full ${maxWidth} max-h-[95vh]`;

  const backdropClass = phase === "exit" ? "kz-modal-backdrop--exit" : "kz-modal-backdrop--enter";
  const panelClass = phase === "exit" ? "kz-modal-panel--exit" : "kz-modal-panel--enter";

  return createPortal(
    <div
      ref={backdropRef}
      className={`kz-modal-backdrop fixed inset-0 z-50 p-2 flex items-center justify-center backdrop-blur-md ${backdropClass}`}
    >
      <div
        ref={modalRef}
        className={`kz-modal-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col border ${panelClass} ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className={`kz-modal-header flex items-start justify-between border-b ${
              isCompact ? "kz-modal-header--accent px-5 py-3.5" : "px-6 py-4"
            }`}
          >
            <h2 className={isCompact ? "text-lg font-bold tracking-tight" : "text-xl font-bold"}>
              {title}
            </h2>
            {showCloseButton && (
              <button
                className="p-2 rounded-lg hover:bg-[color:var(--kz-hover-bg)] text-primary transition-colors"
                onClick={onClose}
                aria-label="Close"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div
          className={`overflow-y-auto flex-1 bg-card ${
            isCompact ? "kz-modal-body--compact" : "px-6 py-5"
          } ${fullSize ? "min-h-0" : ""}`}
        >
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-[color:var(--kz-border)] bg-[color:var(--kz-tint-03)]">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
