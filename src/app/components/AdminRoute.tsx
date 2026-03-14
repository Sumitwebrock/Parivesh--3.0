import { Navigate, Outlet } from "react-router";
import { isAdminLoggedIn } from "../services/adminAuth";

export function AdminRoute() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
