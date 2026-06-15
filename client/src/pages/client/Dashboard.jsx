import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

export default function ClientDashboard() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [client, setClient] = useState(null);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("accessToken");

  // ================= FETCH =================
  const fetchGalleries = async () => {
    try {
      const res = await api.get("/gallery/client");
      setGalleries(res.data);

      if (res.data.length > 0) {
        setClient(res.data[0].client);
      }
    } catch (err) {
      console.log("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= CLOCK =================
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ================= INIT =================
  useEffect(() => {
    if (!token) {
      navigate("/client/login");
      return;
    }

    fetchGalleries();

    // ✅ FIXED: Shifted socket node points from localhost to production URL with safe fallback polling parameters
    const socket = io("https://miray-visual-media-1.onrender.com", {
      auth: { token },
      transports: ["polling", "websocket"],
      withCredentials: true
    });

    socket.on("new-media", () => {
      fetchGalleries();
    });

    socket.on("new-gallery", () => {
      fetchGalleries();
    });

    socket.on("connect_error", () => {
      console.log("Socket auth failed");
    });

    return () => socket.disconnect();
  }, []);

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    sessionStorage.removeItem("accessToken");
    navigate("/client/login");
  };

  // ================= TOTAL =================
  const totalPhotos = galleries.reduce(
    (acc, g) => acc + (g.count || 0),
    0
  );

  // Formatting Lagos time for typography presentation
  const formattedTime = time.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        background: "linear-gradient(to bottom, #f7faf7 0%, #ffffff 50%, #eef7ee 100%)"
      }}
    >
      {/* ================= FIXED FLOATING HEADER BANNER ================= */}
      <div className="sticky top-0 z-50 border-b border-gray-100 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-6xl p-5 mx-auto">
          <div>
            <h1 className="text-2xl font-black text-[#015103] tracking-tight">
              {client?.name || "Client Workspace"} 👋
            </h1>
            <p className="text-[11px] font-mono font-bold text-gray-400 tracking-wider mt-0.5">
              ⏱️ {formattedTime} — {time.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#FE8521] hover:bg-orange-600 rounded-full transition-all duration-200 transform active:scale-95 shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ================= PREMIUM TEXTURED HERO MODULE ================= */}
      <div className="max-w-6xl px-6 pt-8 mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#015103] via-[#053d06] to-[#012002] p-8 md:p-12 shadow-xl border border-white/5">
          {/* Subtle Ambient Vignettes */}
          <div className="absolute rounded-full pointer-events-none w-72 h-72 -top-16 -right-16 bg-white/5 blur-3xl" />
          <div className="absolute w-64 h-64 rounded-full -bottom-16 -left-16 bg-[#FE8521]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="bg-white/10 text-white border border-white/10 text-[9px] tracking-[0.25em] font-extrabold uppercase px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-md">
                Miray Visual Media
              </span>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
                Every Single Moment,<br />Beautifully Preserved
              </h2>
              <p className="mt-4 text-xs font-medium leading-relaxed text-white/75">
                Relive your curated studio collections cleanly rendered within encrypted pipelines. Review, batch download, and stream memories securely at structural speeds anytime.
              </p>
            </div>

            {/* INTEGRATED INSIGHT METRIC ACCENT BADGE */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 min-w-[160px] text-center md:text-right">
              <p className="text-[10px] font-bold tracking-wider text-white/60 uppercase">Captured Frames</p>
              <h2 className="mt-1 font-mono text-4xl font-black text-white">{totalPhotos.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HORIZONTAL GLOSS METRICS METERS ================= */}
      <div className="grid max-w-6xl grid-cols-3 gap-4 px-6 mx-auto mt-8">
        <Stat label="Active Vaults" value={galleries.length} labelIcon="📁" />
        <item className="hidden" /> {/* Structural balance filler helper mapping items cleanly */}
        <Stat label="Total Asset Assets" value={totalPhotos} labelIcon="🖼️" />
        <Stat label="Latest Pipelines" value={galleries.length} labelIcon="⚡" />
      </div>

      {/* ================= COMPACT PIXIEST PORTFOLIO ALBUMS GRID ================= */}
      <div className="max-w-6xl px-6 mx-auto mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-2">
            <div className="w-8 h-8 border-2 border-[#FE8521] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gray-400">Compiling gallery directory arrays...</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="py-20 text-center border border-gray-200 border-dashed bg-white/40 rounded-2xl">
            <span className="block mb-1 text-2xl opacity-50">📁</span>
            <p className="text-sm font-bold tracking-tight text-gray-500">No Vault Containers Provisioned</p>
            <p className="text-xs text-gray-400 mt-0.5">Your photographer has not linked collection channels to this instance profile yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((g) => (
              <motion.div
                key={g._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col justify-between overflow-hidden transition-all duration-300 border border-gray-100 shadow-sm group bg-white/90 backdrop-blur-md hover:shadow-xl hover:border-orange-200/40 rounded-2xl"
              >
                {/* Visual Cover Elements bounding height box constraints to fix bloated card sizing issues */}
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  <img
                    src={g.coverImage || "https://placehold.co/600x400"}
                    alt={g.title}
                    loading="lazy"
                    className="object-cover w-full h-full transition duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                </div>

                {/* Typography Information Body */}
                <div className="flex flex-col justify-between flex-grow p-5">
                  <div>
                    <h2 className="text-base font-bold text-[#015103] tracking-tight truncate max-w-full">
                      {g.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                      <span>📅 {new Date(g.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>•</span>
                      <span className="text-gray-500">📊 {g.count || 0} items</span>
                    </div>
                  </div>

                  {/* Operational Utility Actions Menu Trigger */}
                  <div className="flex gap-3 pt-4 mt-6 border-t border-gray-50">
                    <a
                      href={`/#/gallery/${g._id}`}
                      className="inline-flex items-center justify-center flex-1 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-white transition rounded-xl bg-[#FE8521] hover:bg-orange-600 shadow-sm hover:shadow-md"
                    >
                      Open Gallery
                    </a>

                    <button className="px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 rounded-xl">
                      Download All
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= PREMIUM SUB-COMPONENT HELPERS =================
function Stat({ label, value, labelIcon }) {
  return (
    <div className="flex items-center justify-between p-5 transition duration-200 border border-gray-100 shadow-xs bg-white/80 backdrop-blur-md rounded-2xl group hover:shadow-md">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
          {label}
        </p>
        <h2 className="text-2xl font-black text-[#015103] font-mono tracking-tight">
          {value.toLocaleString()}
        </h2>
      </div>
      <div className="text-xl transition duration-200 pointer-events-none opacity-30 group-hover:scale-110">
        {labelIcon}
      </div>
    </div>
  );
}