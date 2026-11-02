
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  BookOpen,
  Menu,
  Sun,
  Moon,
  Code2,
  X,
  ArrowUpRight,
  LayoutDashboard,
  GraduationCap,
  LogOut,
  Sparkles,
  ChevronRight,
  Trophy,
  LoaderCircle,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

import '../styles/layout-premium.css';

/* =========================================================
   NAVIGATION CONFIGURATION
   ========================================================= */

const navItems = [
  {
    label: 'Home',
    path: '/',
    icon: BookOpen,
    end: true,
  },
  {
    label: 'Courses',
    path: '/courses',
    icon: GraduationCap,
  },
  {
    label: 'Resources',
    path: '/resources',
    icon: Code2,
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: LayoutDashboard,
  },
  {
    label: 'About',
    path: '/about',
    icon: Sparkles,
  },
  {
    label: 'Achievements',
    path: '/achievements',
    icon: Trophy,
  },
];

/* =========================================================
   THEME HELPERS
   ========================================================= */

const getSavedTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  try {
    const savedTheme = window.localStorage.getItem('tyagiji-theme');

    return savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : 'dark';
  } catch {
    return 'dark';
  }
};

const getUserInitials = (user) => {
  if (!user) return 'U';

  const name =
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    'User';

  const words = String(name).trim().split(/\s+/);

  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return words[0].slice(0, 2).toUpperCase();
};

/* =========================================================
   MAIN LAYOUT
   ========================================================= */

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getSavedTheme);
  const [themeSaving, setThemeSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { user, logout } = useAuth();
  const location = useLocation();

  const isDark = theme === 'dark';
  const isAdmin = user?.role === 'admin';

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';
  const userInitials = getUserInitials(user);

  /* -------------------------------------------------------
     CLOSE MOBILE NAVIGATION
     ------------------------------------------------------- */

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  /* -------------------------------------------------------
     CLOSE MENU WHEN ROUTE CHANGES
     ------------------------------------------------------- */

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search, closeMenu]);

  /* -------------------------------------------------------
     APPLY THEME
     ------------------------------------------------------- */

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    try {
      window.localStorage.setItem('tyagiji-theme', theme);
    } catch {
      // The selected theme still works without local storage.
    }
  }, [theme]);

  /* -------------------------------------------------------
     LOAD AUTHENTICATED USER THEME PREFERENCE
     ------------------------------------------------------- */

  useEffect(() => {
    const savedPreference = user?.preferences?.theme;

    if (
      savedPreference === 'dark' ||
      savedPreference === 'light'
    ) {
      setTheme(savedPreference);
    }
  }, [user?.preferences?.theme]);

  /* -------------------------------------------------------
     MOBILE MENU: ESCAPE KEY AND SCROLL LOCK
     ------------------------------------------------------- */

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeMenu]);

  /* -------------------------------------------------------
     SCROLL PROGRESS INDICATOR
     ------------------------------------------------------- */

  useEffect(() => {
    let animationFrame = null;

    const updateProgress = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      animationFrame = window.requestAnimationFrame(() => {
        const scrollTop =
          window.scrollY ||
          document.documentElement.scrollTop;

        const scrollHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;

        const progress =
          scrollHeight > 0
            ? (scrollTop / scrollHeight) * 100
            : 0;

        setScrollProgress(Math.min(100, Math.max(0, progress)));
      });
    };

    updateProgress();

    window.addEventListener('scroll', updateProgress, {
      passive: true,
    });

    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  /* -------------------------------------------------------
     THEME TOGGLE
     ------------------------------------------------------- */

  const toggleTheme = async () => {
    if (themeSaving) return;

    const nextTheme = isDark ? 'light' : 'dark';

    // Update immediately for a responsive interface.
    setTheme(nextTheme);

    if (!user) return;

    setThemeSaving(true);

    try {
      await api('/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          theme: nextTheme,
        }),
      });
    } catch (error) {
      // Keep the local theme even if the preference API fails.
      console.warn('Could not save theme preference:', error);
    } finally {
      setThemeSaving(false);
    }
  };

  /* -------------------------------------------------------
     LOGOUT
     ------------------------------------------------------- */

  const handleLogout = async () => {
    if (loggingOut) return;

    closeMenu();
    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className={`cp-app-shell ${isDark ? 'cp-theme-dark' : 'cp-theme-light'}`}>

      {/* SCROLL PROGRESS */}

      <div
        className="cp-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* ACCESSIBILITY */}

      <a
        className="cp-skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="cp-header">
        <div className="cp-header-inner">

          {/* BRAND */}

          <Link
            className="cp-brand"
            to="/"
            aria-label="TyagiJI Learning Platform home"
            onClick={closeMenu}
          >
            <span className="cp-brand-mark">
              <img
                src="/logo-mark.svg"
                alt=""
                width="42"
                height="42"
              />
            </span>

            <span className="cp-brand-copy">
              <strong>
                TyagiJI <span>Learning Platform</span>
              </strong>

              <small>
                Learn. Practice. Build.
              </small>
            </span>
          </Link>

          {/* MOBILE MENU BUTTON */}

          <button
            className={`cp-menu-toggle${open ? ' is-open' : ''}`}
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="cp-primary-navigation"
          >
            {open ? (
              <X size={21} aria-hidden="true" />
            ) : (
              <Menu size={21} aria-hidden="true" />
            )}
          </button>

          {/* =================================================
              NAVIGATION
              ================================================= */}

          <nav
            id="cp-primary-navigation"
            aria-label="Main navigation"
            className={`cp-nav${open ? ' is-open' : ''}`}
          >
            <div className="cp-mobile-nav-heading">
              <span className="cp-mobile-eyebrow">
                EXPLORE TYAGIJI
              </span>

              <span className="cp-mobile-nav-title">
                Your next skill starts here.
              </span>
            </div>

            <div className="cp-nav-items">
              {navItems.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  className={({ isActive }) =>
                    `cp-nav-link${isActive ? ' is-active' : ''}`
                  }
                  onClick={closeMenu}
                >
                  <Icon
                    className="cp-nav-icon"
                    size={17}
                    aria-hidden="true"
                  />

                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="cp-mobile-nav-footer">
              <span>Build something great today.</span>

              <Code2 size={19} aria-hidden="true" />
            </div>
          </nav>

          {/* =================================================
              HEADER ACTIONS
              ================================================= */}

          <div className="cp-header-actions">

            {/* THEME */}

            <button
              type="button"
              className="cp-theme-toggle"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-busy={themeSaving}
              disabled={themeSaving}
            >
              <span className="cp-theme-icon" aria-hidden="true">
                {themeSaving ? (
                  <LoaderCircle
                    size={18}
                    className="cp-spin"
                  />
                ) : isDark ? (
                  <Sun size={19} strokeWidth={2} />
                ) : (
                  <Moon size={19} strokeWidth={2} />
                )}
              </span>
            </button>

            <span
              className="cp-action-divider"
              aria-hidden="true"
            />

            {/* AUTHENTICATED USER */}

            {user ? (
              <>
                <Link
                  className="cp-dashboard-link"
                  to={dashboardPath}
                  onClick={closeMenu}
                >
                  <span className="cp-user-avatar">
                    {userInitials}
                  </span>

                  <span className="cp-dashboard-copy">
                    <small>
                      {isAdmin ? 'Administrator' : 'Your account'}
                    </small>

                    <strong>
                      {isAdmin ? 'Admin panel' : 'My learning'}
                    </strong>
                  </span>

                  <ChevronRight
                    className="cp-dashboard-chevron"
                    size={16}
                    aria-hidden="true"
                  />
                </Link>

                <button
                  className="cp-signout-button"
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <LoaderCircle
                      size={16}
                      className="cp-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <LogOut size={16} aria-hidden="true" />
                  )}

                  <span>
                    {loggingOut ? 'Signing out' : 'Sign out'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  className="cp-login-link"
                  to="/login"
                  onClick={closeMenu}
                >
                  Log in
                </Link>

                <Link
                  className="cp-primary-button"
                  to="/register"
                  onClick={closeMenu}
                >
                  <span>Get started</span>

                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP */}

      {open && (
        <button
          type="button"
          className="cp-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          tabIndex={-1}
        />
      )}

      {/* =================================================
          MAIN PAGE CONTENT
          ================================================= */}

      <main
        id="main-content"
        className="cp-main"
        tabIndex={-1}
      >
        <Outlet />
      </main>

      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="cp-footer">
        <div className="cp-footer-main">

          {/* FOOTER BRAND */}

          <div className="cp-footer-brand-column">
            <Link
              className="cp-brand cp-footer-brand"
              to="/"
              onClick={closeMenu}
            >
              <span className="cp-brand-mark">
                <img
                  src="/logo-mark.svg"
                  alt=""
                  width="42"
                  height="42"
                />
              </span>

              <span className="cp-brand-copy">
                <strong>
                  TyagiJI <span>Learning Platform</span>
                </strong>

                <small>
                  Learn. Practice. Build.
                </small>
              </span>
            </Link>

            <p className="cp-footer-description">
              Turn curiosity into capability with guided lessons,
              practical projects, and a community built around
              learning by doing.
            </p>

            <div className="cp-footer-status">
              <span className="cp-status-dot" />

              <span>
                Keep learning. Keep building.
              </span>
            </div>
          </div>

          {/* EXPLORE */}

          <div className="cp-footer-column">
            <h2>Explore</h2>

            <Link to="/courses">Courses</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/resources">Learning resources</Link>
            <Link to="/progress">Achievements</Link>
          </div>

          {/* COMPANY */}

          <div className="cp-footer-column">
            <h2>TyagiJI</h2>

            <Link to="/about">About us</Link>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of service</Link>
          </div>

          {/* CTA */}

          <div className="cp-footer-cta">
            <span className="cp-footer-cta-icon">
              <Sparkles
                size={20}
                aria-hidden="true"
              />
            </span>

            <h2>Make your next move.</h2>

            <p>
              Choose a course, build a project, and turn your
              progress into real skills.
            </p>

            <Link
              to={user ? dashboardPath : '/courses'}
              className="cp-footer-cta-link"
            >
              {user ? 'Continue learning' : 'Explore courses'}

              <ArrowUpRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* FOOTER BOTTOM */}

        <div className="cp-footer-bottom">
          <span>
            © {new Date().getFullYear()} TyagiJI Learning Platform
          </span>

          <span className="cp-footer-made">
            <BookOpen size={14} aria-hidden="true" />

            Learn. Practice. Build.
          </span>
        </div>
      </footer>
    </div>
  );
}