import React from "react";
import MasterMindsAnimatedMark from "./MasterMindsAnimatedMark";
import styles from "./Loader.module.css";

/**
 * Centered page loader — animated M icon only (no wordmark).
 * Used when pages refresh, Suspense fallbacks, route guards, etc.
 * Login page logo is separate (static brand image on auth panel).
 */
export default function Loader({
  message = "",
  fullScreen = true,
  size = "md",
  skeleton = null,
}) {
  void skeleton;

  const content = (
    <div className={styles.content}>
      <MasterMindsAnimatedMark mode="page" size={size} />
      <div className={styles.dots} aria-hidden>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );

  const wrapperClass = fullScreen ? "kz-loader-panel" : "kz-loader-inline";

  return (
    <div
      className={wrapperClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message || "Loading"}
    >
      {content}
    </div>
  );
}
