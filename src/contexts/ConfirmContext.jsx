import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const ConfirmContext = createContext(null);

const DEFAULT_STATE = {
  open: false,
  title: "Are you sure?",
  message: "This action cannot be undone.",
  confirmLabel: "Yes",
  cancelLabel: "No",
  variant: "danger",
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        open: true,
        title: options.title ?? DEFAULT_STATE.title,
        message: options.message ?? DEFAULT_STATE.message,
        confirmLabel: options.confirmLabel ?? DEFAULT_STATE.confirmLabel,
        cancelLabel: options.cancelLabel ?? DEFAULT_STATE.cancelLabel,
        variant: options.variant ?? DEFAULT_STATE.variant,
      });
    });
  }, []);

  const settle = (result) => {
    setState((prev) => ({ ...prev, open: false }));
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(result);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx.confirm;
}
