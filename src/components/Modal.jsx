import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./ui/Button";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const EXIT_MS = 220;

export default function Modal({
  open,
  onClose,
  title,
  infoText,
  children,
  showFooter = true,
  confirmText = "Confirm",
  onConfirm,
  confirmDisabled = false,
  maxWidth,
}) {
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

  if (!mounted) return null;

  const backdropClass = phase === "exit" ? "kz-modal-backdrop--exit" : "kz-modal-backdrop--enter";
  const panelClass = phase === "exit" ? "kz-modal-panel--exit" : "kz-modal-panel--enter";

  return createPortal(
    <div
      className={`kz-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${backdropClass}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`kz-modal-panel rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border ${panelClass}`}
        role="dialog"
        aria-modal="true"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="kz-modal-header kz-modal-header--accent flex items-start justify-between border-b px-5 py-3.5">
            <div className="flex flex-col min-w-0 pr-3">
              <h3 className="text-lg font-bold tracking-tight">{title}</h3>
              {infoText ? (
                <div className="text-xs mt-1 opacity-80">{infoText}</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[color:var(--kz-hover-bg)] transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-card">{children}</div>

        {showFooter ? (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[color:var(--kz-border)] bg-[color:var(--kz-tint-03)]">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onConfirm || onClose} disabled={confirmDisabled}>
              {confirmText}
            </Button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
