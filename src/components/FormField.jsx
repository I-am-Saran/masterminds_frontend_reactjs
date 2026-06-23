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
          <label htmlFor={id} className="text-sm text-[color:var(--kz-text-secondary)]">
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
        {label && <label htmlFor={id} className="text-sm text-gray-700">{label}</label>}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          className="min-h-28 w-full rounded-xl bg-white border border-neutral-300 px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      {label && <label htmlFor={id} className="text-sm text-gray-700">{label}</label>}
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
        className="w-full rounded-xl bg-white border border-neutral-300 px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
      />
    </div>
  );
}
