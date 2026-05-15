import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUpload,
  FaImages,
  FaCalendar,
  FaUsers,
  FaUserPlus,
} from "react-icons/fa";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaHome /> },
    { to: "/admin/upload", label: "Upload Media", icon: <FaUpload /> },
    { to: "/admin/manage", label: "Manage Media", icon: <FaImages /> },
    { to: "/admin/bookings", label: "Bookings", icon: <FaCalendar /> },
    { to: "/admin/create-client", label: "Create Client", icon: <FaUserPlus /> },
    { to: "/admin/clients", label: "Clients", icon: <FaUsers /> },
  ];

  return (
    <div className="flex min-h-screen p-4 md:p-6"
      style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}>

      {/* 🔥 MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR */}
      <div
        className={`
          fixed md:static z-50 top-0 left-0 h-full w-64
          bg-[#015103] text-white p-6 space-y-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Miray Admin</h2>

          {/* CLOSE BUTTON (MOBILE) */}
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-2">

          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-white text-[#015103] font-semibold"
                      : "hover:bg-white/10"
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}

        </nav>
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1">

        {/* MOBILE HEADER */}
        <div className="flex items-center justify-between p-4 bg-white shadow-sm md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="text-xl text-[#015103]"
          >
            <FaBars />
          </button>

          <h2 className="font-semibold text-[#015103]">
            Admin Panel
          </h2>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
}