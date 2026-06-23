import React, { useMemo } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

const EMPTY_SENTINEL = "__kz_select_empty__";

function normalizeOptions(options = []) {
  return options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return {
      value: String(opt?.value ?? ""),
      label: opt?.label ?? String(opt?.value ?? ""),
      disabled: Boolean(opt?.disabled),
    };
  });
}

function optionsFromChildren(children) {
  return React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && child.type === "option")
    .map((child) => ({
      value: String(child.props.value ?? ""),
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    }));
}

function toRadixValue(value) {
  if (value === "" || value == null) return EMPTY_SENTINEL;
  return String(value);
}

function fromRadixValue(value) {
  if (value === EMPTY_SENTINEL) return "";
  return value ?? "";
}

/**
 * Modern custom select — drop-in replacement for native <select>.
 * Supports options array or <option> children (WfSelect compat).
 */
export default function CustomSelect({
  value,
  onChange,
  onValueChange,
  options,
  children,
  placeholder = "Select…",
  disabled = false,
  required = false,
  id,
  name,
  className = "",
  size = "default",
  "aria-label": ariaLabel,
}) {
  const resolvedOptions = useMemo(() => {
    if (Array.isArray(options) && options.length > 0) {
      return normalizeOptions(options);
    }
    if (children) {
      return optionsFromChildren(children);
    }
    return [];
  }, [options, children]);

  const radixValue = toRadixValue(value);
  const placeholderOption = resolvedOptions.find((opt) => opt.value === "");
  const displayPlaceholder = placeholderOption?.label || placeholder;
  const showEmptyItem = Boolean(placeholderOption) || Boolean(placeholder);

  const selectableOptions = resolvedOptions.filter((opt) => opt.value !== "");

  const handleValueChange = (next) => {
    const resolved = fromRadixValue(next);
    onChange?.({ target: { value: resolved, name } });
    onValueChange?.(resolved);
  };

  return (
    <SelectPrimitive.Root
      value={radixValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      required={required}
      name={name}
    >
      <div className={`kz-select${size === "filter" ? " kz-select--filter" : ""} ${className}`.trim()}>
        <SelectPrimitive.Trigger
          id={id}
          className="kz-select-trigger"
          aria-label={ariaLabel}
        >
          <SelectPrimitive.Value placeholder={displayPlaceholder} className="kz-select-value" />
          <SelectPrimitive.Icon className="kz-select-icon">
            <ChevronDown size={16} strokeWidth={2} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
      </div>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="kz-select-content"
          position="popper"
          sideOffset={6}
          align="start"
        >
          <SelectPrimitive.ScrollUpButton className="kz-select-scroll-btn">
            <ChevronDown size={14} style={{ transform: "rotate(180deg)" }} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="kz-select-viewport">
            {showEmptyItem ? (
              <SelectItem value={EMPTY_SENTINEL} label={displayPlaceholder} />
            ) : null}
            {selectableOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                label={opt.label}
                disabled={opt.disabled}
              />
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="kz-select-scroll-btn">
            <ChevronDown size={14} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function SelectItem({ value, label, disabled }) {
  const radixValue = value === "" ? EMPTY_SENTINEL : value;

  return (
    <SelectPrimitive.Item
      value={radixValue}
      disabled={disabled}
      className="kz-select-item"
      textValue={typeof label === "string" ? label : undefined}
    >
      <SelectPrimitive.ItemIndicator className="kz-select-item-indicator">
        <Check size={14} strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/** Convenience alias for filter toolbars */
export function FilterSelect(props) {
  return <CustomSelect size="filter" {...props} />;
}
