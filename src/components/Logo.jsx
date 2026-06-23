import React from "react";
import { APP_LOGO } from "../constants/brandingAssets";

const HEIGHT = {
  sm: "h-7",
  md: "h-9",
  lg: "h-11",
  xl: "h-16",
  xxl: "h-24",
  auto: "",
};

/**
 * @param {"full"|"compact"|"login"|"icon"|"icon-only"} variant
 * @param {"sm"|"md"|"lg"|"xl"|"xxl"|"auto"} size — use "auto" when width is set via className
 */
export default function Logo({
  variant = "compact",
  size = "md",
  className = "",
}) {
  const isIcon = variant === "icon" || variant === "icon-only";
  const src = isIcon
    ? APP_LOGO.icon
    : variant === "login"
      ? APP_LOGO.login
      : APP_LOGO.full;
  const heightClass =
    size === "auto"
      ? ""
      : isIcon
        ? HEIGHT[size] || "h-9"
        : HEIGHT[size] || HEIGHT.md;

  return (
    <img
      src={src}
      alt="Master Minds"
      className={`${heightClass} w-auto object-contain ${className}`.trim()}
    />
  );
}
