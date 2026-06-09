import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiGrid, FiHome, FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { siteConfig } from "../shared/siteConfig";
import { type ThemeMode, useThemeMode } from "../state/themeStore";

const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof FiSun }> = [
  { mode: "light", label: "Light theme", icon: FiSun },
  { mode: "dark", label: "Dark theme", icon: FiMoon },
  { mode: "system", label: "Use system theme", icon: FiMonitor }
];

export function App() {
  const { mode, resolvedTheme, setMode } = useThemeMode();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const mainClassName = isDashboard ? "app-main app-main--dashboard" : "app-main page-grid site-template-body";

  return (
    <div className={isDashboard ? "app-shell" : `app-shell site-template-shell site-template-shell--asides-${siteConfig.frontendAsideMode}`}>
      {!isDashboard ? (
        <header className="topbar grid-area-header">
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
      ) : null}
      {isDashboard ? (
        <main className={mainClassName}>
          <Outlet />
        </main>
      ) : (
        <AnimatePresence mode="wait">
          <motion.main
            animate={{ opacity: 1, y: 0 }}
            className={mainClassName}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 10 }}
            key={location.pathname}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      )}
    </div>
  );
}
