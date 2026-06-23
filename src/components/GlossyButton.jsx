import Button from "./ui/Button";

/** @deprecated Use PrimaryButton / kz-btn-primary — kept for legacy imports */
export default function GlossyButton({ variant = "filled", className = "", ...props }) {
  const mappedVariant = variant === "outlined" || variant === "text" ? "secondary" : "primary";
  return <Button variant={mappedVariant} className={className} {...props} />;
}
