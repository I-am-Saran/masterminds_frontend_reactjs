import React from "react";
import { AlertTriangle } from "lucide-react";
import ModernModal from "../ModernModal";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Yes",
  cancelLabel = "No",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  return (
    <ModernModal
      open={open}
      onClose={onCancel}
      size="sm"
      showCloseButton={false}
      footer={
        <div className="kz-confirm-dialog__footer">
          <button type="button" className="kz-btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={variant === "danger" ? "kz-btn-danger" : "kz-btn-primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="kz-confirm-dialog">
        <div
          className={`kz-confirm-dialog__icon${
            variant === "danger" ? " kz-confirm-dialog__icon--danger" : ""
          }`}
        >
          <AlertTriangle size={22} strokeWidth={2.25} />
        </div>
        <div className="kz-confirm-dialog__copy">
          <h3 className="kz-confirm-dialog__title">{title}</h3>
          <p className="kz-confirm-dialog__message">{message}</p>
        </div>
      </div>
    </ModernModal>
  );
}
