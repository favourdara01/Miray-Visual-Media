import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= PUBLIC =================
import Home from "./pages/Home.jsx";
import GalleryPage from "./pages/Gallerypage";

// ================= ADMIN =================
import Dashboard from "./pages/Admin/Dashboard";
import Upload from "./pages/Admin/Upload";
import ManageMedia from "./pages/Admin/ManageMedia";
import Login from "./pages/Admin/Login";
import Bookings from "./pages/Admin/Bookings";
import Clients from "./pages/Admin/Clients";
import AdminClientsPage from "./pages/Admin/AdminClientsPage.jsx";
import CreateClient from "./pages/Admin/CreateClient.jsx";
import AdminGalleryView from "./pages/Admin/AdminGalleryView";

// ================= CLIENT =================
import ClientLogin from "./pages/client/Login";
import ClientDashboard from "./pages/client/Dashboard";
import ClientGalleryView from "./pages/client/ClientGalleryView";

// ================= LAYOUT / SECURITY =================
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

// ================= ERROR PAGES =================
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import ServerError from "./pages/ServerError";

// ================= GLOBAL WRAPPERS =================
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/OfflineBanner";

function App() {
  return (
    <BrowserRouter>

      {/* 🔥 GLOBAL UX LAYERS */}
      <ErrorBoundary>
        <OfflineBanner />

        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:id" element={<ClientGalleryView />} />

          {/* ================= CLIENT ================= */}
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/Dashboard" element={<ClientDashboard />} />

          {/* ================= ADMIN LOGIN ================= */}
          <Route path="/admin/login" element={<Login />} />

          {/* ================= ADMIN PROTECTED AREA ================= */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="manage" element={<ManageMedia />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="clients" element={<Clients />} />
            <Route path="create-client" element={<CreateClient />} />
            <Route path="client/:id" element={<AdminClientsPage />} />
            <Route path="gallery/:id" element={<AdminGalleryView />} />
          </Route>

          {/* ================= ERROR PAGES ================= */}
          <Route path="/403" element={<Forbidden />} />
          <Route path="/500" element={<ServerError />} />

          {/* ================= FALLBACK (VERY IMPORTANT) ================= */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </ErrorBoundary>

    </BrowserRouter>
  );
}

export default App;