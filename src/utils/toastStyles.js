import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const TOAST_META = {
  success: { icon: CheckCircle2, label: "Success" },
  error: { icon: XCircle, label: "Error" },
  warning: { icon: AlertTriangle, label: "Warning" },
  info: { icon: Info, label: "Info" },
};

/** Shared toast variant class names (theme tokens in kaizen-enterprise.css). */
export function getToastClassName(type = "info") {
  const variant = ["success", "error", "warning", "info"].includes(type) ? type : "info";
  return `kz-toast kz-toast--${variant}`;
}

export function getToastMeta(type = "info") {
  return TOAST_META[type] || TOAST_META.info;
}
