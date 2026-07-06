import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { user, token } = await loginUser({ email, password });

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0] as string[];
        setErrorMessage(firstError[0]);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual__overlay" />
        <div className="login-visual__brand">
          <span className="login-visual__logo" aria-hidden="true">
            <span className="login-visual__logo-ring" />
          </span>
          <span className="login-visual__wordmark">PMT</span>
        </div>

        <div className="login-visual__quote">
          <p className="login-visual__quote-text">
            "Every project ships faster when the whole team can see the path."
          </p>
          <div className="login-visual__byline">
            <span className="login-visual__byline-rule" />
            <span>DESMOND OKAFOR, PRODUCT LEAD</span>
          </div>
        </div>

        <div className="login-visual__dots">
          <span className="login-visual__dot login-visual__dot--active" />
          <span className="login-visual__dot" />
          <span className="login-visual__dot" />
        </div>
      </div>

      <div className="login-panel">
        <div className="login-form-wrap">
          <h1 className="login-heading">Welcome back</h1>
          <p className="login-subheading">Sign in to your workspace to continue</p>

          {errorMessage && (
            <div className="login-form__error" role="alert">
              {errorMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field" htmlFor="email">
              <span className="login-field__label">Email address</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-field__input"
                placeholder="name@company.com"
              />
            </label>

            <label className="login-field" htmlFor="password">
              <div className="login-field__label-row">
                <span className="login-field__label">Password</span>
                <a href="#" className="login-field__forgot">
                  Forgot password?
                </a>
              </div>
              <div className="login-field__password-row">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-field__input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
              {!isLoading && (
                <span className="login-submit__arrow" aria-hidden="true">→</span>
              )}
            </button>
          </form>

          <p className="login-footer">
            No account yet? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a13.5 13.5 0 0 1-2.4 3.3M6.6 6.6C4.4 8 2 12 2 12s1.6 2.9 4.5 4.9" />
      <path d="M9.5 9.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-1.1" />
    </svg>
  );
}