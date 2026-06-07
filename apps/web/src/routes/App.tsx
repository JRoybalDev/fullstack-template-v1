import { NavLink, Outlet } from "react-router-dom";
import { FiGrid, FiHome, FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { type ThemeMode, useThemeMode } from "../state/themeStore";

const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof FiSun }> = [
  { mode: "light", label: "Light theme", icon: FiSun },
  { mode: "dark", label: "Dark theme", icon: FiMoon },
  { mode: "system", label: "Use system theme", icon: FiMonitor }
];

export function App() {
  const { mode, resolvedTheme, setMode } = useThemeMode();

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          Fullstack Template
        </a>
        <div className="topbar-actions">
          <nav className="nav-links" aria-label="Primary">
            <NavLink to="/">
              <FiHome aria-hidden /> Public
            </NavLink>
            <NavLink to="/dashboard">
              <FiGrid aria-hidden /> Dashboard
            </NavLink>
          </nav>
          <div className="theme-switcher" aria-label={`Theme selector, currently ${resolvedTheme}`}>
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  aria-label={option.label}
                  aria-pressed={mode === option.mode}
                  className={mode === option.mode ? "active" : ""}
                  key={option.mode}
                  onClick={() => setMode(option.mode)}
                  title={option.label}
                  type="button"
                >
                  <Icon aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
