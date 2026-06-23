import React, { useEffect, useState } from "react";
import MasterMindsAnimatedMark from "./MasterMindsAnimatedMark";
import styles from "./MasterMindsLoader.module.css";

const EXIT_MS = 550;

/** Full-viewport bootstrap loader — animated icon only, no wordmark. */
export default function MasterMindsLoader({ isLoading = true, children }) {
  const [overlayMounted, setOverlayMounted] = useState(isLoading);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setOverlayMounted(true);
      setExiting(false);
      return undefined;
    }

    if (!overlayMounted) {
      return undefined;
    }

    setExiting(true);
    const timer = window.setTimeout(() => {
      setOverlayMounted(false);
      setExiting(false);
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [isLoading, overlayMounted]);

  return (
    <>
      {!isLoading ? children : null}
      {overlayMounted ? (
        <div
          className={`${styles.overlay} ${exiting ? styles.overlayExiting : ""}`}
          role="status"
          aria-live="polite"
          aria-busy={!exiting}
          aria-label="Loading Master Minds application"
        >
          <div className={styles.content}>
            <MasterMindsAnimatedMark mode="page" size="lg" />
            <div className={styles.dots} aria-hidden>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
