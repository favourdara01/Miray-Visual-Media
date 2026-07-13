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
  FaEnvelope,     // Added for Contacts
  FaPaperPlane,   // Added for Newsletter
} from "react-icons/fa";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaHome /> },
    { to: "/admin/upload", label: "Upload Media", icon: <FaUpload /> },
    { to: "/admin/manage", label: "Manage Media", icon: <FaImages /> },
    { to: "/admin/bookings", label: "Bookings", icon: <FaCalendar /> },
    { to: "/admin/messages", label: "Inquiries & Contacts", icon: <FaEnvelope /> }, // New public tracking
    { to: "/admin/newsletter", label: "Newsletter List", icon: <FaPaperPlane /> }, // New sub tracker
    { to: "/admin/create-client", label: "Create Client", icon: <FaUserPlus /> },
    { to: "/admin/clients", label: "Clients", icon: <FaUsers /> },
  ];

  return (
    <div className="flex min-h-screen p-4 md:p-6"
      style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >

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
          <h2 className="text-xl font-bold tracking-tight">Miray Admin</h2>

          {/* CLOSE BUTTON (MOBILE) */}
          <button
            className="text-white transition md:hidden hover:text-orange-400"
            onClick={() => setOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-[#015103] shadow-md"
                      : "hover:bg-white/10 text-white/80"
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
        <div className="flex items-center justify-between p-4 mb-4 bg-white border shadow-sm border-black/5 rounded-2xl md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="text-xl text-[#015103]"
          >
            <FaBars />
          </button>

          <h2 className="font-black text-xs uppercase tracking-widest text-[#015103]">
            Admin Control Panel
          </h2>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-2 md:p-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
}