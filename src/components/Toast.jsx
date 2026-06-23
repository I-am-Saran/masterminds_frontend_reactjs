import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ToastNotificationContent } from "./ui/ToastNotification";

export default function Toast({ type = "info", message = "", duration = 2500 }) {
  const [open, setOpen] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return;
    setOpen(true);
    const t = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(t);
  }, [message, duration]);

  if (!open || !message) return null;

  const content = (
    <div
      role="status"
      aria-live="polite"
      className="kz-toast-portal kz-toast-portal--inline"
    >
      <ToastNotificationContent
        type={type}
        message={message}
        duration={duration}
        onClose={() => setOpen(false)}
      />
    </div>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}
