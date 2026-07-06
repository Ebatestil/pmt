import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.css";

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userJson = localStorage.getItem("auth_user");
  const user: StoredUser | null = userJson ? JSON.parse(userJson) : null;
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  }

  return (
    <nav className="navbar" data-theme={theme}>
      <div className="navbar__left">
        {onMenuClick && (
          <button
            type="button"
            className="navbar__menu-toggle"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        )}

        <div className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            <span className="navbar__logo-ring" />
          </span>
          <span className="navbar__wordmark">PMT</span>
        </div>
      </div>

      <div className="navbar__actions">
        <button
          type="button"
          className="navbar__theme-toggle"
          aria-label="Toggle light and dark mode"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="navbar__profile" ref={menuRef}>
          <button
            type="button"
            className="navbar__profile-trigger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="navbar__dropdown">
              {user && (
                <div className="navbar__dropdown-header">
                  <p className="navbar__dropdown-name">{user.name}</p>
                  <p className="navbar__dropdown-email">{user.email}</p>
                </div>
              )}
              <button
                type="button"
                className="navbar__dropdown-item"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      className="navbar__theme-icon navbar__theme-icon--sun"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="navbar__theme-icon navbar__theme-icon--moon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}