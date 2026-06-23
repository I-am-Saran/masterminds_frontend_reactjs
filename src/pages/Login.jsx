import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "../contexts/SessionContext";
import { useToast } from "../contexts/ToastContext";
import { post, ssoLogin } from "../services/api.js";
import {
  signInWithMicrosoftPopup,
  getMicrosoftAuthErrorMessage,
  isMicrosoftAuthConfigured,
} from "../services/microsoftAuth.js";
import {
  BRAND_PAGE_TITLE,
  REMEMBER_EMAIL_KEY,
  brandCopyright,
} from "../constants/brand";
import Logo from "../components/Logo";
import LoginBrandPanel from "../components/login/LoginBrandPanel";
import MicrosoftIcon from "../components/login/MicrosoftIcon";

const OUTLOOK_COMPOSE_RECIPIENT = "qacompliance@hepl.com";
const OUTLOOK_COMPOSE_CC = "saran.s@hepl.com";

function openOutlookCompose(subject) {
  const outlookWebUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(OUTLOOK_COMPOSE_RECIPIENT)}&cc=${encodeURIComponent(OUTLOOK_COMPOSE_CC)}&ccRecipients=${encodeURIComponent(OUTLOOK_COMPOSE_CC)}&subject=${encodeURIComponent(subject)}`;
  window.open(outlookWebUrl, "_blank");
}

export default function Login() {
  const { session, setSession, restored } = useSession();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [pageEnter, setPageEnter] = useState(false);
  const [shakeFields, setShakeFields] = useState({ email: false, password: false });

  const authBusy = loading || msLoading;

  function triggerFieldShake(field) {
    setShakeFields((prev) => ({ ...prev, [field]: true }));
    window.setTimeout(() => {
      setShakeFields((prev) => ({ ...prev, [field]: false }));
    }, 450);
  }

  function resolveAuthError(error, fallbackMessage) {
    if (error?.data) {
      if (typeof error.data === "string") {
        return error.data;
      }
      if (error.data.detail) {
        return error.data.detail;
      }
      if (error.data.error) {
        return typeof error.data.error === "string"
          ? error.data.error
          : error.data.error.message || error.data.error.detail || fallbackMessage;
      }
      if (error.data.message) {
        return error.data.message;
      }
    }
    return error?.message || fallbackMessage;
  }

  function completeLogin({ token, user }) {
    sessionStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setSession({
      token,
      user,
      user_id: user.id,
      tenant_id: user.tenant_id,
    });

    showToast("Login successful!", "success");
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 50);
  }

  useEffect(() => {
    if (!restored) return;

    const token = sessionStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          navigate("/", { replace: true });
          return;
        }
      } catch {
        sessionStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    }

    if (session && session.user && session.user.id) {
      navigate("/", { replace: true });
    }
  }, [session, restored, navigate]);

  useEffect(() => {
    document.body.classList.add("auth-page-active");
    document.title = BRAND_PAGE_TITLE;

    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    const frame = window.requestAnimationFrame(() => setPageEnter(true));

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.classList.remove("auth-page-active");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email || !password) {
      if (!email) triggerFieldShake("email");
      if (!password) triggerFieldShake("password");
      showToast("Please enter both email and password", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await post("/api/auth/login", { email, password });

      if (response.error) {
        showToast(response.error || "Login failed", "error");
        return;
      }

      const { token, user, requires_password_change } = response.data;

      if (!token || !user) {
        showToast("Invalid response from server", "error");
        return;
      }

      sessionStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      setSession({
        token,
        user,
        user_id: user.id,
        tenant_id: user.tenant_id,
      });

      if (requires_password_change === true) {
        showToast("Please change your password to continue", "info");
        setTimeout(() => {
          navigate("/change-password", { replace: true });
        }, 50);
      } else {
        showToast("Login successful!", "success");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 50);
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast(
        resolveAuthError(error, "Login failed. Please check your credentials."),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (authBusy) return;

    try {
      setMsLoading(true);
      const microsoftToken = await signInWithMicrosoftPopup();
      const response = await ssoLogin(microsoftToken);

      if (response.error) {
        showToast(response.error || "Microsoft sign-in failed", "error");
        return;
      }

      const { token, user } = response.data || {};
      if (!token || !user) {
        showToast("Invalid response from server", "error");
        return;
      }

      completeLogin({ token, user });
    } catch (error) {
      console.error("Microsoft login error:", error);
      showToast(
        getMicrosoftAuthErrorMessage(error) ||
          resolveAuthError(error, "Microsoft sign-in failed. Please try again."),
        "error"
      );
    } finally {
      setMsLoading(false);
    }
  };

  return (
    <div
      className={`login-page login-page--split${pageEnter ? " login-page--enter" : ""}`}
      data-auth-page
    >
      <LoginBrandPanel />

      <main className="login-page__auth">
        <div className="login-page__auth-inner">
          <div className="login-page__auth-card">
            <Logo variant="login" size="auto" className="login-page__auth-logo" />

            <form onSubmit={handleLogin} className="login-page__form" noValidate>
              <div className="login-page__field">
                <label htmlFor="email" className="login-page__label">
                  Username / Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`login-page__input${shakeFields.email ? " login-page__input--shake" : ""}`}
                  placeholder="Enter your email"
                  required
                  disabled={authBusy}
                />
              </div>

              <div className="login-page__field">
                <label htmlFor="password" className="login-page__label">
                  Password
                </label>
                <div className="login-page__password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`login-page__input login-page__input--password${shakeFields.password ? " login-page__input--shake" : ""}`}
                    placeholder="Enter your password"
                    required
                    disabled={authBusy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="login-page__icon-btn"
                    disabled={authBusy}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-page__form-row">
                <label className="login-page__remember" htmlFor="remember-me">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={authBusy}
                    className="login-page__remember-input"
                  />
                  <span className="login-page__remember-label">Remember me</span>
                </label>

                <button
                  type="button"
                  className="login-page__forgot"
                  onClick={() => openOutlookCompose("Master Minds: Password Reset Request")}
                >
                  Forgot Password
                </button>
              </div>

              <button
                type="submit"
                disabled={authBusy}
                aria-busy={loading}
                className="login-page__btn login-page__btn--primary"
              >
                {loading ? (
                  <span className="login-page__btn-content">
                    <span className="login-page__spinner" aria-hidden />
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {isMicrosoftAuthConfigured() && (
              <>
                <div className="login-page__divider" role="separator" aria-label="or">
                  OR
                </div>

                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  disabled={authBusy}
                  aria-busy={msLoading}
                  className="login-page__btn login-page__btn--microsoft"
                >
                  {msLoading ? (
                    <span className="login-page__btn-content">
                      <span className="login-page__spinner" aria-hidden />
                      Signing in with Microsoft...
                    </span>
                  ) : (
                    <span className="login-page__btn-content">
                      <MicrosoftIcon size={20} />
                      Sign in with Microsoft
                    </span>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              className="login-page__request-access"
              onClick={() => openOutlookCompose("Request access to Master Minds")}
            >
              Request Access
            </button>
          </div>

          <p className="login-page__copyright">{brandCopyright()}</p>
        </div>
      </main>
    </div>
  );
}
