import React from "react";
import { KZ } from "../../constants/designTokens";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="kz-empty-state kz-empty-fade-in">
      {Icon ? (
        <div className="kz-empty-state-icon">
          <Icon size={22} strokeWidth={2} />
        </div>
      ) : null}
      <p className="kz-empty-state-title">{title}</p>
      {description ? <p className="kz-empty-state-desc">{description}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="kz-btn-primary mt-4" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function emptyStateStyles() {
  return { accent: KZ.primary };
}
