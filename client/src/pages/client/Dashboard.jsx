import { useEffect, useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [client, setClient] = useState(null);

  const navigate = useNavigate();

  const token = sessionStorage.getItem("accessToken");

  // ================= API =================
  const api = api.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("accessToken");
        navigate("/client/login");
      }
      return Promise.reject(err);
    }
  );

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

    const socket = io("http://localhost:5000", {
      auth: {
        token,
      },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7faf7] via-white to-[#eef7ee]">

      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">

        <div className="flex flex-col gap-4 p-4 mx-auto max-w-7xl md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#015103]">
              {client?.name || "Client"} 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {time.toLocaleString()}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-5 py-2 text-sm md:text-base text-white transition bg-[#FE8521] rounded-full hover:bg-orange-600"
          >
            Logout
          </button>

        </div>
      </div>

      {/* ================= HERO ================= */}
      <div className="px-4 pt-8 mx-auto max-w-7xl">

        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#015103] via-[#027a06] to-[#014001] p-8 md:p-12 shadow-2xl">

          {/* GLOW */}
          <div className="absolute w-64 h-64 rounded-full -top-10 -right-10 bg-white/10 blur-3xl" />
          <div className="absolute w-48 h-48 rounded-full bottom-0 left-0 bg-[#FE8521]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            {/* TEXT */}
            <div className="max-w-2xl">

              <p className="mb-3 text-sm tracking-[0.3em] uppercase text-white/60">
                Miray Visual Media
              </p>

              <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
                Every Moment,
                <br />
                Beautifully Captured 
              </h2>

              <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg">
                Relive your favorite memories through premium
                galleries crafted specially for you.
                Download, share, and enjoy every moment anytime.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">

                <button className="px-6 py-3 font-semibold text-black transition bg-white shadow-lg rounded-2xl hover:scale-105">
                  Explore Albums
                </button>

                

              </div>

            </div>

            {/* RIGHT CARD */}
            <div className="grid grid-cols-2 gap-4">

              <div className="p-5 border shadow-xl rounded-3xl bg-white/10 backdrop-blur-xl border-white/10">
                <p className="text-sm text-white/70">
                  Photos
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {totalPhotos}
                </h2>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 gap-4 px-4 py-8 mx-auto max-w-7xl sm:grid-cols-2 lg:grid-cols-3">

        <Stat
          label="Albums"
          value={galleries.length}
        />

        <Stat
          label="Photos"
          value={totalPhotos}
        />

        <Stat
          label="Latest Albums"
          value={galleries.length}
        />

      </div>

      {/* ================= GALLERIES ================= */}
      <div className="px-4 pb-12 mx-auto max-w-7xl">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#FE8521] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : galleries.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-gray-500">
              No albums available yet
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {galleries.map((g) => (
              <motion.div
                key={g._id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-white border shadow-lg rounded-3xl"
              >

                {/* IMAGE */}
                <div className="relative overflow-hidden">

                  <img
                    src={
                      g.coverImage ||
                      "https://placehold.co/600x400"
                    }
                    className="object-cover w-full transition duration-500 h-52 hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                </div>

                {/* CONTENT */}
                <div className="p-5">

                  <h2 className="text-xl font-bold text-[#015103]">
                    {g.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    {g.count || 0} photos
                  </p>

                  <div className="flex gap-3 mt-5">

                    <a
                      href={`/gallery/${g._id}`}
                      className="inline-flex items-center justify-center flex-1 px-5 py-3 font-medium text-white transition rounded-xl bg-[#FE8521] hover:bg-orange-600"
                    >
                      Open Album
                    </a>

                    <button
                      className="px-5 py-3 font-medium transition border border-gray-200 rounded-xl hover:bg-gray-100"
                    >
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

// ================= STAT CARD =================
function Stat({ label, value }) {
  return (
    <div className="p-6 bg-white border shadow-lg rounded-2xl">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-[#015103]">
        {value}
      </h2>

    </div>
  );
}