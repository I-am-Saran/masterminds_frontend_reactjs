export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  ariaLabel,
  type = "button",
  disabled = false,
  ...props
}) {
  const variantClass = {
    primary: "kz-btn-primary",
    secondary: "kz-btn-secondary",
    outline: "kz-btn-secondary",
    ghost: "kz-btn-secondary !border-transparent !bg-transparent hover:!bg-[color:var(--kz-hover-bg)]",
  }[variant] || "kz-btn-primary";

  const sizeClass = {
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-base",
  }[size] || "h-9 px-4 text-sm";

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
