import React from "react";
import CustomSelect from "../ui/Select";

export function WfBrandButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  className = "",
  size = "md",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`kz-btn-primary wf-brand-btn wf-brand-btn--${size} ${className}`}
    >
      {Icon ? <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.25} /> : null}
      {children}
    </button>
  );
}

export function WfGhostButton({ children, onClick, type = "button", disabled = false, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`kz-btn-secondary wf-ghost-btn ${className}`}
    >
      {children}
    </button>
  );
}

export function WfSection({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`wf-panel ${className}`}>
      <div className="wf-panel-head">
        <div className="min-w-0">
          <h2 className="wf-panel-title">{title}</h2>
          {subtitle ? <p className="wf-panel-subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="wf-panel-body">{children}</div>
    </section>
  );
}

export function WfFieldLabel({ children, required }) {
  return (
    <label className="wf-field-label">
      {children}
      {required ? <span className="wf-field-required">*</span> : null}
    </label>
  );
}

export function WfInput({ className = "", ...props }) {
  return <input className={`wf-input ${className}`} {...props} />;
}

export function WfSelect({ className = "", children, ...props }) {
  return (
    <CustomSelect className={`wf-input wf-select ${className}`.trim()} {...props}>
      {children}
    </CustomSelect>
  );
}

export function WfTextarea({ className = "", ...props }) {
  return <textarea className={`wf-input wf-textarea ${className}`} {...props} />;
}

export function WfOptionChip({ active, children }) {
  return (
    <span className={`wf-option-chip${active ? " wf-option-chip--on" : ""}`}>
      {active ? "✓ " : ""}
      {children}
    </span>
  );
}

export function WfMetaItem({ label, value, children }) {
  return (
    <div className="wf-meta-item">
      <span className="wf-meta-label">{label}</span>
      <span className="wf-meta-value">{children ?? value ?? "—"}</span>
    </div>
  );
}
