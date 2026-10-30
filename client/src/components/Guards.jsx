
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldCheck,
  LockKeyhole,
  LoaderCircle,
} from 'lucide-react';

/**
 * Premium authentication loading screen
 */
function AuthLoading({ message = 'Restoring your session...' }) {
  return (
    <main
      className="auth-guard-loading"
      role="status"
      aria-live="polite"
    >
      <div className="auth-loading-card">
        <div className="auth-loading-icon">
          <ShieldCheck size={30} />
        </div>

        <div className="auth-loading-spinner">
          <LoaderCircle size={23} />
        </div>

        <h2>TyagiJI Learning</h2>

        <p>{message}</p>

        <span className="auth-loading-caption">
          Secure learning environment
        </span>
      </div>
    </main>
  );
}

/**
 * Reusable authentication guard
 *
 * Protects routes that require a logged-in user.
 */
export function AuthGuard({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: 'Please sign in to continue.',
        }}
      />
    );
  }

  // Optional role-based protection
  if (
    Array.isArray(roles) &&
    roles.length > 0 &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          message: 'You do not have permission to access this page.',
        }}
      />
    );
  }

  return children ?? <Outlet />;
}

/**
 * Admin-only route guard
 *
 * Only authenticated admin users can access these routes.
 */
export function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <AuthLoading message="Verifying administrator permissions..." />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: 'Please sign in to access the admin panel.',
        }}
      />
    );
  }

  if (user.role !== 'admin') {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          message: 'Administrator access is required.',
        }}
      />
    );
  }

  return children ?? <Outlet />;
}

/**
 * Guest-only route guard
 *
 * Prevents authenticated users from visiting login/register pages.
 */
export function GuestGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoading message="Checking your account..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
}

/**
 * Permission fallback component
 */
export function UnauthorizedAccess() {
  return (
    <main className="auth-unauthorized">
      <div className="auth-unauthorized-card">
        <div className="auth-unauthorized-icon">
          <LockKeyhole size={32} />
        </div>

        <h1>Access Restricted</h1>

        <p>
          You do not have permission to view this page.
          Contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </main>
  );
}

export default AuthGuard;
