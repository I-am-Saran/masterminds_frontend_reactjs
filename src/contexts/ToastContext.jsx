import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { getToastClassName, getToastMeta } from "../utils/toastStyles";
import { extractApiErrorMessage } from "../utils/apiErrors";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastCounterRef = useRef(0);

  const showToast = useCallback((message, type = "info", duration = 5000) => {
    toastCounterRef.current += 1;
    const id = `${Date.now()}-${toastCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`;
    const text =
      typeof message === "string"
        ? message
        : extractApiErrorMessage(message, "Something went wrong");
    const newToast = {
      id,
      message: text,
      type,
      duration,
      open: true,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    showToast,
    removeToast,
    toasts,
  };

  const portalContent = (
    <>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
      <Toast.Viewport className="toast-viewport" />
    </>
  );
  const portalRoot = typeof document === "undefined" ? null : document.body;

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right" duration={5000}>
        {children}
        {portalRoot ? createPortal(portalContent, portalRoot) : portalContent}
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const meta = getToastMeta(toast.type);
  const Icon = meta.icon;

  return (
    <Toast.Root
      className={`${getToastClassName(toast.type)} kz-toast--modern pointer-events-auto`}
      duration={toast.duration}
      open={toast.open}
      onOpenChange={(open) => {
        if (!open) onRemove(toast.id);
      }}
    >
      <span className="kz-toast__accent" aria-hidden="true" />
      <span className={`kz-toast__icon-wrap kz-toast__icon-wrap--${toast.type}`} aria-hidden="true">
        <Icon size={18} strokeWidth={2.25} />
      </span>
      <div className="kz-toast__content">
        <p className="kz-toast__label">{meta.label}</p>
        <Toast.Description className="kz-toast__message">{toast.message}</Toast.Description>
      </div>
      <Toast.Close className="kz-toast__close" aria-label="Dismiss notification">
        <X size={16} strokeWidth={2.25} />
      </Toast.Close>
      <span
        className="kz-toast__progress"
        style={{ animationDuration: `${toast.duration}ms` }}
        aria-hidden="true"
      />
    </Toast.Root>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
