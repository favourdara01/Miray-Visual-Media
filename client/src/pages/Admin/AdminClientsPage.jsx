import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminClientsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const galleryRef = useRef();

  const [client, setClient] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [title, setTitle] = useState("");
  // ✅ NEW: Added custom shoot execution date picker for album generation
  const [shootDate, setShootDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW: delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  // ================= FETCH =================
  const fetchClient = async () => {
    try {
      const res = await api.get(`/client/${id}`);
      setClient(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGalleries = async () => {
    try {
      const res = await api.get(`/gallery/client/${id}`);
      console.log("GALLERIES:", res.data); // 🔥 DEBUG
      setGalleries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gallery fetch error:", err.response?.data || err.message);
      setGalleries([]); // prevent UI crash
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchClient();
        await fetchGalleries();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ================= CREATE =================
  const createGallery = async () => {
    if (!title.trim()) return;

    try {
      const res = await api.post(
        "/gallery/create",
        { 
          title, 
          clientId: id,
          date: shootDate // ✅ Sending selected shoot execution date parameter to your backend API
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGalleries((prev) => [res.data, ...prev]);
      setTitle("");
      setShootDate(new Date().toISOString().split("T")[0]); // Reset to today
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE =================
  const deleteGallery = async () => {
    try {
      await api.delete(`/gallery/${deleteTarget}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGalleries((prev) =>
        prev.filter((g) => g._id !== deleteTarget)
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= UPLOAD =================
  const handleUpload = async (files, galleryId) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    const formData = new FormData();

    fileArray.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("galleryId", galleryId);
    formData.append("clientId", id);

    try {
      await api.post("/media/upload-bulk", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchGalleries();
    } catch (err) {
      console.error("Upload error:", err);
      fetchGalleries();
    }
  };

  // ================= CHRONOLOGICAL TIMELINE ENGINE (3 MONTH SPLIT) =================
  const recentGalleries = [];
  const olderGalleries = [];

  galleries.forEach((g) => {
    // Falls back to g.createdAt if a custom shoot execution date field isn't saved yet
    const targetDate = new Date(g.date || g.createdAt);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (targetDate >= threeMonthsAgo) {
      recentGalleries.push(g);
    } else {
      olderGalleries.push(g);
    }
  });

  const renderGalleryCard = (g, isRecentSection) => (
    <div
      key={g._id}
      className="relative flex flex-col overflow-hidden transition-all duration-300 transform border border-gray-100 shadow-sm group bg-white/90 backdrop-blur-md rounded-2xl hover:shadow-xl hover:border-orange-200/40 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden bg-gray-100 h-44 rounded-t-2xl">
        <img
          src={g.coverImage || "/default.jpg"}
          alt={g.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Dynamic Context Section Tags */}
        <span className={`absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md text-white z-10 ${
          isRecentSection ? "bg-green-600/80" : "bg-amber-600/80"
        }`}>
          {isRecentSection ? "Recent" : "Older Collection"}
        </span>

        <div className="absolute inset-0 flex items-center justify-center transition duration-300 opacity-0 bg-black/40 backdrop-blur-xs group-hover:opacity-100">
          <button
            onClick={() => navigate(`/admin/gallery/${g._id}`)}
            className="px-4 py-2 text-xs font-bold tracking-wider text-gray-900 uppercase transition bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            Open Workspace
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between flex-grow p-4 bg-white rounded-b-2xl">
        <div>
          <h3 className="text-base font-bold tracking-tight text-gray-800 truncate">
            {g.title}
          </h3>
          <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
            📅 {new Date(g.date || g.createdAt).toDateString()}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-3 mt-4 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block cursor-pointer bg-gray-50 border border-gray-100 px-2 py-1 rounded hover:bg-gray-100 transition">
              📥 Upload Batch
              <input
                type="file"
                multiple
                onChange={(e) => handleUpload(e.target.files, g._id)}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setDeleteTarget(g._id)}
              className="text-xs font-bold tracking-wide text-red-500 transition hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 animate-spin rounded-full border-2 border-[#FE8521] border-t-transparent" />
          <p className="text-sm font-semibold text-gray-500">Loading client pipeline profile...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-sm p-8 text-center bg-white border shadow rounded-2xl">
          <span className="text-3xl">⚠️</span>
          <h3 className="mt-2 text-lg font-bold text-red-600">Client Not Found</h3>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-24 bg-gray-50" 
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      {/* PREMIUM HERO BANNER CONTAINER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#015103] to-[#123013] text-white py-16 px-6 shadow-xl">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#FE8521] blur-[100px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center max-w-5xl mx-auto text-center">
          <span className="bg-white/10 text-white border border-white/10 text-[10px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-4 backdrop-blur-md">
            Client Control Studio
          </span>
          
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            {client.name} {client.surname}
          </h1>
          <p className="text-white/70 text-sm font-medium mt-1.5">{client.email}</p>

          <div className="w-full max-w-md p-4 mt-8 border bg-black/20 border-white/5 backdrop-blur-md rounded-2xl">
            <div className="flex justify-between mb-2 text-xs font-bold tracking-wider uppercase text-white/60">
              <span>Cloud Vault Allocation</span>
              <span className="font-mono text-white">{client.storageUsed || 0} MB / {client.storageLimit || 5000} MB</span>
            </div>
            <div className="w-full h-2 overflow-hidden border rounded-full bg-white/10 border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#FE8521] to-orange-400 rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${Math.min(((client.storageUsed || 0) / (client.storageLimit || 5000)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={() => galleryRef.current.scrollIntoView({ behavior: "smooth" })}
            className="px-6 py-2.5 mt-8 font-bold text-xs uppercase tracking-wider text-gray-900 bg-white rounded-full shadow-md hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-0.5 transition duration-200"
          >
            Explore Active Albums
          </button>
        </div>
      </div>

      <div className="grid items-start max-w-5xl gap-8 px-6 mx-auto mt-12 lg:grid-cols-3">
        
        {/* NEW ALBUM GENERATOR SIDEBAR PANEL */}
        <div className="sticky z-20 p-6 border border-gray-100 shadow-xl lg:col-span-1 bg-white/80 backdrop-blur-lg rounded-2xl top-6">
          <h2 className="text-lg font-bold text-[#015103] tracking-tight mb-1">
            Create New Album
          </h2>
          <p className="mb-5 text-xs font-medium text-gray-400">Deploy a secure partitioned cloud bucket gallery container.</p>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Album Name</label>
              <input
                placeholder="E.g., Pre-Wedding Shoot..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* ✅ NEW: Date Field input parameter captures historic shoot logs */}
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Shoot Done Date</label>
              <input
                type="date"
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700"
              />
            </div>

            <button
              onClick={createGallery}
              className="w-full py-3 font-bold text-xs tracking-wider uppercase text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl shadow-md hover:shadow-lg transition duration-200"
            >
              Generate Container
            </button>
          </div>
        </div>

        {/* GALLERIES CHRONOLOGICAL ENGINE CONTAINERS */}
        <div ref={galleryRef} className="space-y-10 lg:col-span-2">
          
          {/* RECENT ALBUMS CONTAINER */}
          {recentGalleries.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-base font-bold tracking-tight text-gray-800">Recent Shoots</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full">Within 3 Months</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {recentGalleries.map((g) => renderGalleryCard(g, true))}
              </div>
            </div>
          )}

          {/* OLDER ALBUMS CONTAINER */}
          {olderGalleries.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-base font-bold tracking-tight text-gray-400">Older Collections</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-full">Older than 3 Months</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 opacity-80">
                {olderGalleries.map((g) => renderGalleryCard(g, false))}
              </div>
            </div>
          )}
          
          {galleries.length === 0 && (
            <div className="px-4 py-12 text-center border border-gray-200 border-dashed bg-white/40 rounded-2xl">
              <span className="block mb-1 text-2xl opacity-60">📁</span>
              <p className="text-sm font-semibold text-gray-500">No albums active</p>
              <p className="text-xs text-gray-400 mt-0.5">Generate a bucket to map streaming media nodes.</p>
            </div>
          )}
        </div>

      </div>

      {/* ================= PREMIUM DELETION CONFIRMATION MODAL ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-2xl border-red-50">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-red-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-red-700">Purge Storage Gallery?</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500">
              This will permanently delete this client album container. Linked media storage records mapped within the directory will become unlinked.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteGallery}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md"
              >
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}