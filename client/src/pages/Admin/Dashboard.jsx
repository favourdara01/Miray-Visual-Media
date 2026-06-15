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

  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token") || "";

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

    // ✅ FIX: Fixed the connection fallback order for Render's HTTP proxy layer
    const socket = io(
      "https://miray-visual-media-1.onrender.com",
      {
        withCredentials: true,
        auth: { token },
        transports: ["polling", "websocket"],
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
    <div 
      className="min-h-screen p-6 space-y-8 md:p-8"
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100/80">
        <div>
          <h1 className="text-3xl font-extrabold text-[#015103] tracking-tight">
            Admin Control Center
          </h1>
          <p className="mt-1 text-xs font-medium text-gray-400">Real-time studio system tracking and performance node diagnostics.</p>
        </div>

        <div className="px-3.5 py-1.5 text-white bg-[#015103] border border-green-700 font-bold text-[10px] tracking-wider uppercase rounded-full shadow-sm">
          🛡️ Secure Mode Active
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        <StatCard label="Total Media Files" value={analytics.totalMedia} color="#FE8521" icon="📸" />
        <StatCard label="Total Downloads" value={analytics.totalDownloads} color="#015103" icon="📥" />
        <StatCard label="Total Metric Views" value={analytics.totalViews} color="#015103" icon="👁️" />
      </div>

      <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-2">
        {/* BOOKINGS LIST */}
        <Section title="Recent Bookings Pipeline" onViewAll={() => navigate("/admin/bookings")}>
          <div className="space-y-3.5 mt-4">
            {bookings.slice(0, 6).map((b) => {
              const statusLower = (b.status || "").toLowerCase();
              const isConfirmed = statusLower === "confirmed" || statusLower === "approved";
              const isPending = statusLower === "pending";

              return (
                <div 
                  key={b._id} 
                  className="flex items-center justify-between p-4 transition border border-gray-100 bg-gray-50/50 backdrop-blur-md rounded-2xl hover:bg-gray-50 hover:shadow-xs group"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-sm group-hover:text-[#015103] transition">{b.name}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{b.service}</p>
                  </div>

                  <span className={`px-3 py-1 font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-xs border ${
                    isConfirmed ? "bg-green-50 text-green-700 border-green-100" :
                    isPending ? "bg-amber-50 text-amber-700 border-amber-100" :
                    "bg-gray-50 text-gray-600 border-gray-200"
                  }`}>
                    {b.status}
                  </span>
                </div>
              );
            })}
            
            {bookings.length === 0 && (
              <p className="py-4 text-xs font-medium text-center text-gray-400">No recent records detected.</p>
            )}
          </div>
        </Section>

        {/* NOTIFICATIONS CONTAINER */}
        <Section title="Live Socket Feed Monitoring">
          <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
            {notifications.map((n, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 p-4 border shadow-xs border-orange-100/70 bg-orange-50/40 backdrop-blur-md rounded-2xl animate-fadeIn"
              >
                <div className="h-2 w-2 rounded-full bg-[#FE8521] animate-ping" />
                <p className="text-sm font-medium leading-relaxed text-gray-700">
                  New incoming booking received from <span className="font-bold text-gray-900">{n.name}</span>
                </p>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-12 text-center border border-gray-200 border-dashed rounded-2xl">
                <span className="block mb-1 text-xl opacity-50">⚡</span>
                <p className="text-xs font-semibold text-gray-400">Idle Pipeline State</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Real-time gateway listeners are active. No stream data parsed yet.</p>
              </div>
            )}
          </div>
        </Section>
      </div>

    </div>
  );
}

// ================= PREMIUM COMPONENT HELPERS =================
function StatCard({ label, value, color, icon }) {
  return (
    <div 
      className="relative p-6 overflow-hidden transition duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl group hover:shadow-md"
      style={{ borderLeftWidth: "4px", borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</p>
          <h2 className="font-mono text-3xl font-black tracking-tight" style={{ color }}>
            {value.toLocaleString()}
          </h2>
        </div>
        <div className="text-2xl transition duration-300 opacity-20 group-hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, onViewAll }) {
  return (
    <div className="w-full p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-50">
        <h2 className="text-base font-bold tracking-tight text-gray-800">{title}</h2>

        {onViewAll && (
          <button 
            onClick={onViewAll} 
            className="text-xs font-bold tracking-wider uppercase text-[#FE8521] hover:text-[#e6761d] transition duration-150"
          >
            Explore Options →
          </button>
        )}
      </div>

      {children}
    </div>
  );
}