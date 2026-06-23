import LoginWorkflowAnimation from "./LoginWorkflowAnimation";

export default function LoginBrandPanel() {
  return (
    <aside className="login-page__brand" aria-label="Workflow animation">
      <div className="login-page__brand-inner">
        <div className="login-page__brand-visual login-page__brand-visual--enter">
          <LoginWorkflowAnimation />
        </div>
      </div>
    </aside>
  );
}
