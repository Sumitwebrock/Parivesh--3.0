import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import RoleSelection from "./pages/RoleSelection";
import ProponentDashboard from "./pages/ProponentDashboard";
import NewApplication from "./pages/NewApplication";
import ProponentDocuments from "./pages/ProponentDocuments";
import ProponentPayment from "./pages/ProponentPayment";
import ProponentTrack from "./pages/ProponentTrack";
import ProponentNotifications from "./pages/ProponentNotifications";
import ScrutinyDashboard from "./pages/ScrutinyDashboard";
import ScrutinyLogin from "./pages/ScrutinyLogin";
import MoMDashboard from "./pages/MoMDashboard";
import MomLogin from "./pages/MomLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import { AdminRoute } from "./components/AdminRoute";
import { ScrutinyRoute, MomRoute } from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import About from "./pages/About";
import Complaints from "./pages/Complaints";
import EnvironmentalClearance from "./pages/EnvironmentalClearance";
import ForestClearance from "./pages/ForestClearance";
import WildlifeClearance from "./pages/WildlifeClearance";
import CRZClearance from "./pages/CRZClearance";
import Downloads from "./pages/Downloads";
import Vacancies from "./pages/Vacancies";
import Guide from "./pages/Guide";
import Contact from "./pages/Contact";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/about",
    Component: About,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/complaints",
    Component: Complaints,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/downloads",
    Component: Downloads,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/vacancies",
    Component: Vacancies,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/clearance/environmental",
    Component: EnvironmentalClearance,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/clearance/forest",
    Component: ForestClearance,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/clearance/wildlife",
    Component: WildlifeClearance,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/clearance/crz",
    Component: CRZClearance,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/login",
    Component: RoleSelection,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/proponent",
    Component: ProponentDashboard,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/proponent/new",
    Component: NewApplication,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/proponent/documents",
    Component: ProponentDocuments,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/proponent/payment",
    Component: ProponentPayment,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/proponent/track",
    Component: ProponentTrack,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/proponent/notifications",
    Component: ProponentNotifications,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/scrutiny",
    Component: ScrutinyRoute,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        Component: ScrutinyDashboard,
        ErrorBoundary: ErrorBoundary,
      },
    ],
  },
  {
    path: "/scrutiny/login",
    Component: ScrutinyLogin,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/mom",
    Component: MomRoute,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        Component: MoMDashboard,
        ErrorBoundary: ErrorBoundary,
      },
    ],
  },
  {
    path: "/mom/login",
    Component: MomLogin,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/unauthorized",
    Component: Unauthorized,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/admin",
    ErrorBoundary: ErrorBoundary,
    Component: AdminRoute,
    children: [
      {
        index: true,
        Component: AdminDashboard,
        ErrorBoundary: ErrorBoundary,
      },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/guide",
    Component: Guide,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: "/contact",
    Component: Contact,
    ErrorBoundary: ErrorBoundary,
  },
]);