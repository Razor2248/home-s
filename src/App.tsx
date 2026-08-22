import { useEffect, type ReactElement } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SyncSplash, ToastProvider } from "./components/ui";
import { getSessionId, useSession } from "./lib/store";
import { isApiMode } from "./lib/config";
import { syncFromServer } from "./lib/api";
import type { Role } from "./lib/types";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Docs from "./pages/Docs";
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
  if (!session) {
    // Chế độ API: phiên còn trên localStorage nhưng dữ liệu chưa kịp tải về
    if (isApiMode() && getSessionId()) return <SyncSplash />;
    return <Navigate to="/login" replace />;
  }
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

/** Chế độ API: đồng bộ dữ liệu server → store định kỳ và khi quay lại tab */
function ApiSync() {
  const session = useSession();
  const sessionId = session?.id ?? null;
  useEffect(() => {
    if (!isApiMode() || !sessionId) return;
    syncFromServer(true);
    const t = setInterval(() => syncFromServer(true), 25000);
    const onFocus = () => syncFromServer(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [sessionId]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <ScrollTop />
        <ApiSync />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/docs" element={<Docs />} />
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
