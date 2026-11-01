/**
 * UI-only permission gate. The API must independently enforce every permission.
 */
export default function PermissionGate({ user, permission, anyOf = [], children, fallback = null }) {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const allowed = user?.role === 'admin' || (permission && permissions.includes(permission)) || anyOf.some((item) => permissions.includes(item));
  return allowed ? children : fallback;
}

