import { useEffect, type ReactElement } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastProvider } from "./components/ui";
import { useSession } from "./lib/store";
import type { Role } from "./lib/types";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import CustomerApp from "./pages/customer/CustomerApp";
import WorkerApp from "./pages/worker/WorkerApp";
import AdminApp from "./pages/admin/AdminApp";

const ROLE_HOME: Record<Role, string> = {
  customer: "/app/customer",
  worker: "/app/worker",
  admin: "/app/admin",
};

function RequireRole({ role, children }: { role: Role; children: ReactElement }) {
  const session = useSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={ROLE_HOME[session.role]} replace />;
  return children;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app/customer/*"
            element={
              <RequireRole role="customer">
                <CustomerApp />
              </RequireRole>
            }
          />
          <Route
            path="/app/worker/*"
            element={
              <RequireRole role="worker">
                <WorkerApp />
              </RequireRole>
            }
          />
          <Route
            path="/app/admin/*"
            element={
              <RequireRole role="admin">
                <AdminApp />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
