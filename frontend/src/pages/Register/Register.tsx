import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerUser } from "../../api/auth";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      await Swal.fire({
        icon: "success",
        title: "Account created",
        text: "Your account was successfully created.",
        confirmButtonText: "OK",
        confirmButtonColor: "#e3ad5c",
        background: "#1c1d24",
        color: "#f2f1ee",
      });

      navigate("/login");
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
    <div className="register-page">
      <div className="register-visual">
        <div className="register-visual__overlay" />
        <div className="register-visual__brand">
          <span className="register-visual__logo" aria-hidden="true">
            <span className="register-visual__logo-ring" />
          </span>
          <span className="register-visual__wordmark">PMT</span>
        </div>

        <div className="register-visual__quote">
          <p className="register-visual__quote-text">
            "The best teams don't manage projects — they make progress visible."
          </p>
          <div className="register-visual__byline">
            <span className="register-visual__byline-rule" />
            <span>NADIA RUSSO, ENGINEERING MANAGER</span>
          </div>
        </div>

        <div className="register-visual__dots">
          <span className="register-visual__dot" />
          <span className="register-visual__dot register-visual__dot--active" />
          <span className="register-visual__dot" />
        </div>
      </div>

      <div className="register-panel">
        <div className="register-form-wrap">
          <h1 className="register-heading">Create your account</h1>
          <p className="register-subheading">Set up your workspace in a couple of minutes</p>

          {errorMessage && (
            <div className="register-form__error" role="alert">
              {errorMessage}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <label className="register-field" htmlFor="name">
              <span className="register-field__label">Full name</span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="register-field__input"
                placeholder="Jordan Lee"
                required
              />
            </label>

            <label className="register-field" htmlFor="email">
              <span className="register-field__label">Email address</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="register-field__input"
                placeholder="name@company.com"
                required
              />
            </label>

            <label className="register-field" htmlFor="password">
              <span className="register-field__label">Password</span>
              <div className="register-field__password-row">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="register-field__input"
                  placeholder="Create a password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="register-field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>

            <label className="register-field" htmlFor="confirm-password">
              <span className="register-field__label">Confirm password</span>
              <div className="register-field__password-row">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="register-field__input"
                  placeholder="Re-enter your password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="register-field__toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </label>

            <button type="submit" className="register-submit" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
              {!isLoading && (
                <span className="register-submit__arrow" aria-hidden="true">→</span>
              )}
            </button>
          </form>

          <p className="register-footer">
            Already have an account? <Link to="/login">Sign in</Link>
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