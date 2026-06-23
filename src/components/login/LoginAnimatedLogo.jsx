import MasterMindsAnimatedMark from "../MasterMindsAnimatedMark";

/** Login auth panel logo — green pulse travels through the M mark (storyboard-style). */
export default function LoginAnimatedLogo({ className = "" }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Master Minds"
    >
      <MasterMindsAnimatedMark mode="login" showWordmark />
    </div>
  );
}
