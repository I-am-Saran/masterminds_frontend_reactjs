import React from "react";
import { X } from "lucide-react";
import { getToastClassName, getToastMeta } from "../../utils/toastStyles";

export function ToastNotificationContent({
  type = "info",
  message = "",
  duration = 5000,
  onClose,
  closeLabel = "Dismiss notification",
}) {
  const meta = getToastMeta(type);
  const Icon = meta.icon;

  return (
    <div className={`${getToastClassName(type)} kz-toast--modern`}>
      <span className="kz-toast__accent" aria-hidden="true" />
      <span className={`kz-toast__icon-wrap kz-toast__icon-wrap--${type}`} aria-hidden="true">
        <Icon size={18} strokeWidth={2.25} />
      </span>
      <div className="kz-toast__content">
        <p className="kz-toast__label">{meta.label}</p>
        <p className="kz-toast__message">{message}</p>
      </div>
      {onClose ? (
        <button
          type="button"
          className="kz-toast__close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X size={16} strokeWidth={2.25} />
        </button>
      ) : null}
      <span
        className="kz-toast__progress"
        style={{ animationDuration: `${duration}ms` }}
        aria-hidden="true"
      />
    </div>
  );
}
