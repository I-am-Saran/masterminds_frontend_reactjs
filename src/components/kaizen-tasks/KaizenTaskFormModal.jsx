import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import KaizenTaskForm from "./KaizenTaskForm";
const EXIT_MS = 220;

export default function KaizenTaskFormModal({
  open,
  onClose,
  onSubmit,
  saving,
  initial,
  history,
  title = "Create Ticket",
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
    return () => {
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [open, mounted, exitDuration]);

  if (!mounted) return null;

  const backdropClass = phase === "exit" ? "kz-modal-backdrop--exit" : "kz-modal-backdrop--enter";
  const panelClass = phase === "exit" ? "kz-modal-panel--exit" : "kz-modal-panel--enter";

  return createPortal(
    <div
      className={`kz-modal-overlay ${backdropClass}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`kz-modal-panel kz-modal-panel--ticket-form ${panelClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-form-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="kz-modal-header kz-modal-header--accent">
          <div className="kz-modal-title-wrap">
            <h2 id="ticket-form-title" className="kz-modal-title">
              {title}
            </h2>
            <p className="kz-modal-subtitle">
              Create a ticket with the essential details only.
            </p>
          </div>
          <button type="button" onClick={onClose} className="kz-modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="kz-modal-body kz-modal-body--ticket-form custom-scrollbar">
          <KaizenTaskForm
            mode="create"
            variant="modal"
            saving={saving}
            onSubmit={onSubmit}
            onCancel={onClose}
            initial={initial}
            history={history}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
