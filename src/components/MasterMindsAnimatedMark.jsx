import React from "react";
import {
  MASTER_MINDS_ICON_PATH,
  MASTER_MINDS_ICON_VIEWBOX,
} from "../constants/masterMindsLogoPath";
import styles from "./MasterMindsAnimatedMark.module.css";

/**
 * Animated Master Minds icon — stroke draw, traveling pulse, and soft glow.
 * @param {"loader"|"login"|"page"} mode — page: login-style pulse without initial draw (in-app loaders)
 * @param {boolean} showWordmark — "Master Minds" text below icon (login layout)
 * @param {boolean} showTitle — large title for full-screen loader
 */
export default function MasterMindsAnimatedMark({
  mode = "login",
  showWordmark = false,
  showTitle = false,
  size = "md",
  className = "",
}) {
  const modeClass =
    mode === "loader"
      ? styles.modeLoader
      : mode === "page"
        ? styles.modePage
        : styles.modeLogin;

  const sizeClass =
    size === "sm" ? styles.sizeSm : size === "lg" ? styles.sizeLg : null;

  const rootClass = [styles.root, modeClass, sizeClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className={styles.stage}>
        <div className={styles.glowAura} />
        <svg
          className={styles.iconSvg}
          viewBox={MASTER_MINDS_ICON_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          <path
            className={styles.track}
            d={MASTER_MINDS_ICON_PATH}
            pathLength="1"
          />
          <path
            className={styles.fill}
            d={MASTER_MINDS_ICON_PATH}
            fillRule="evenodd"
            clipRule="evenodd"
          />
          <path
            className={styles.draw}
            d={MASTER_MINDS_ICON_PATH}
            pathLength="1"
          />
          <path
            className={styles.pulse}
            d={MASTER_MINDS_ICON_PATH}
            pathLength="1"
          />
        </svg>
      </div>

      {showWordmark ? (
        <div className={styles.wordmark}>
          <span className={styles.wordmarkMaster}>Master</span>{" "}
          <span className={styles.wordmarkMinds}>Minds</span>
        </div>
      ) : null}

      {showTitle ? (
        <h1 className={styles.loaderTitle}>
          <span className={styles.loaderTitleMaster}>Master</span>{" "}
          <span className={styles.loaderTitleMinds}>Minds</span>
        </h1>
      ) : null}
    </div>
  );
}
