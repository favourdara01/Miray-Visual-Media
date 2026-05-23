import { useEffect, useState } from "react";
import api from "../../api/axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    totalMedia: 0,
    totalViews: 0,
    totalDownloads: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  const token = sessionStorage.getItem("accessToken") || "";

  // ================= ANALYTICS =================
  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics(res.data);
    } catch (err) {
      console.log("Analytics error:", err.message);
    }
  };

  // ================= BOOKINGS =================
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data);
    } catch (err) {
      console.log("Bookings error:", err.message);
    }
  };

useEffect(() => {
  if (!token) {
    navigate("/admin/login");
    return;
  }

  fetchAnalytics();
  fetchBookings();

  const socket = io(
    "https://miray-visual-media-1.onrender.com",
    {
      withCredentials: true,
      auth: { token },
      transports: ["websocket", "polling"],
    }
  );

  socket.on("connect_error", () => {
    console.log("Socket auth failed");
  });

  socket.on("new-media", () => {
    fetchAnalytics();
  });

  socket.on("new-booking", (data) => {
    setNotifications((prev) => [data, ...prev]);
    fetchBookings();
  });

  return () => socket.disconnect();
}, []);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-b from-[#f8faf8] to-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#015103]">
          Admin Dashboard
        </h1>

        <div className="px-4 py-2 text-white bg-[#FE8521] rounded-full text-sm">
          Secure Mode Active
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">

        <StatCard label="Total Media" value={analytics.totalMedia} color="#FE8521" />
        <StatCard label="Total Downloads" value={analytics.totalDownloads} color="#015103" />
        <StatCard label="Total Views" value={analytics.totalViews} color="#015103" />

      </div>

      {/* BOOKINGS */}
      <Section title="Recent Bookings" onViewAll={() => navigate("/admin/bookings")}>
        {bookings.slice(0, 6).map((b) => (
          <div key={b._id} className="flex justify-between p-3 rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium">{b.name}</p>
              <p className="text-sm text-gray-500">{b.service}</p>
            </div>

            <span className="px-3 py-1 text-xs bg-gray-100 rounded-full">
              {b.status}
            </span>
          </div>
        ))}
      </Section>

      {/* NOTIFICATIONS */}
      <Section title="Live Notifications">
        {notifications.map((n, i) => (
          <div key={i} className="p-3 border-l-4 border-[#FE8521] bg-orange-50 rounded-lg">
            New booking from <b>{n.name}</b>
          </div>
        ))}
      </Section>

    </div>
  );
}

// ================= COMPONENT HELPERS =================
function StatCard({ label, value, color }) {
  return (
    <div className="p-6 bg-white border-l-4 shadow-sm rounded-xl" style={{ borderColor: color }}>
      <p className="text-gray-500">{label}</p>
      <h2 className="text-3xl font-bold" style={{ color }}>
        {value}
      </h2>
    </div>
  );
}

function Section({ title, children, onViewAll }) {
  return (
    <div className="p-4 mt-10 bg-white shadow-sm md:p-6 rounded-xl">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        {onViewAll && (
          <button onClick={onViewAll} className="text-[#FE8521] text-sm">
            View All →
          </button>
        )}
      </div>

      {children}
    </div>
  );
}