import { Navigate, Outlet } from "react-router";

function getStoredAssignedRole(): string | null {
  try {
    const stored = localStorage.getItem("parivesh_auth_user");
    if (stored) {
      const user = JSON.parse(stored) as { assignedRole?: string };
      return user.assignedRole ?? null;
    }
  } catch {
    // ignore malformed data
  }
  return null;
}

/**
 * Protects a route to a specific assigned role.
 * - No token / user → redirect to /login
 * - Wrong role      → redirect to /unauthorized
 * - Correct role    → render children via <Outlet>
 */
function RoleGuard({ role }: { role: string }) {
  const assignedRole = getStoredAssignedRole();
  if (!assignedRole) return <Navigate to="/login" replace />;
  if (assignedRole !== role) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

export function ScrutinyRoute() {
  return <RoleGuard role="scrutiny" />;
}

export function MomRoute() {
  return <RoleGuard role="mom" />;
}
