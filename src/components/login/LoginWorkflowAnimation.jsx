import { Component, useEffect, useState } from "react";
import LoginWorkflowAnimatedIllustration from "./LoginWorkflowAnimatedIllustration";
import LoginWorkflowIllustrationStatic from "./LoginWorkflowIllustrationStatic";

class AnimationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("Login workflow animation failed, using static fallback.", error);
  }

  render() {
    if (this.state.hasError) {
      return <LoginWorkflowIllustrationStatic />;
    }
    return this.props.children;
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/** Login hero animation with static SVG fallback on error or reduced motion. */
export default function LoginWorkflowAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const illustration = prefersReducedMotion ? (
    <LoginWorkflowIllustrationStatic />
  ) : (
    <AnimationErrorBoundary>
      <LoginWorkflowAnimatedIllustration />
    </AnimationErrorBoundary>
  );

  return <div className="login-hero__animation-glow">{illustration}</div>;
}
