import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function useCountUp(target, { duration = 650, enabled = true } = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const numericTarget = Number(target) || 0;
  const [value, setValue] = useState(reducedMotion ? numericTarget : 0);

  useEffect(() => {
    if (!enabled) {
      setValue(numericTarget);
      return undefined;
    }

    if (reducedMotion) {
      setValue(numericTarget);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * numericTarget));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numericTarget, duration, enabled, reducedMotion]);

  return value;
}
