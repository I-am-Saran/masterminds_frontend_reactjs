import { useId } from "react";
import CustomSelect from "./ui/Select";

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  options = [],
  placeholder,
  readOnly = false,
  id: providedId,
  name,
  autoComplete,
  required = false,
  disabled = false,
}) {
  const autoId = useId();
  const base = typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : "field";
  const id = providedId || `${base}-${autoId}`;
  const labelClass = "text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))]";
  const fieldClass =
    "w-full rounded-xl border px-3 py-2 transition bg-[color:var(--input-bg,var(--kz-input-bg))] border-[color:var(--border-color,var(--kz-border))] text-[color:var(--text-primary,var(--kz-text-primary))] placeholder:text-[color:var(--text-muted,var(--kz-placeholder))] focus:outline-none focus:ring-2 focus:ring-[color:var(--kz-focus-ring)] focus:border-[color:var(--accent-color,var(--kz-accent-vibrant))]";

  if (type === "select") {
    const hasEmptyOption = options.some((o) =>
      typeof o === "string" ? false : String(o?.value ?? "") === ""
    );
    const selectOptions = [
      ...(typeof placeholder === "string" && !hasEmptyOption
        ? [{ value: "", label: placeholder }]
        : []),
      ...options.map((o) => {
        if (typeof o === "string") return { value: o, label: o };
        return {
          value: o?.value ?? "",
          label: o?.label ?? String(o?.value ?? ""),
          disabled: o?.disabled,
        };
      }),
    ];

    return (
      <div className="grid gap-1">
        {label ? (
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>
        ) : null}
        <CustomSelect
          id={id}
          name={name}
          value={value ?? ""}
          onValueChange={(v) => onChange?.(v)}
          options={selectOptions}
          placeholder={typeof placeholder === "string" ? placeholder : "Select…"}
          required={required}
          disabled={disabled}
        />
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="grid gap-1">
        {label && <label htmlFor={id} className={labelClass}>{label}</label>}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          className={`min-h-28 ${fieldClass}`}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      {label && <label htmlFor={id} className={labelClass}>{label}</label>}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className={fieldClass}
      />
    </div>
  );
}
