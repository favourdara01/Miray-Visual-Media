import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useDropzone } from "react-dropzone";

const optimizeImage = (url) => {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_800,c_fill/");
};

export default function ManageMedia() {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [storage, setStorage] = useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("accessToken") || "";

  // ================= FETCH MEDIA =================
  const fetchMedia = async () => {
    try {
      const res = await api.get("/media");
      const data = res.data;

      if (Array.isArray(data)) {
        setMedia(data);
      } else if (Array.isArray(data?.data)) {
        setMedia(data.data);
      } else if (Array.isArray(data?.media)) {
        setMedia(data.media);
      } else {
        setMedia([]);
      }
    } catch (err) {
      console.error("Fetch media error:", err);
      setMedia([]);
    }
  };

  // ================= STORAGE =================
  const fetchStorage = async () => {
    try {
      const res = await api.get("/media/storage");
      setStorage(res.data || {});
    } catch (err) {
      console.error("Storage error:", err);
      setStorage(null);
    }
  };

  useEffect(() => {
    fetchMedia();
    fetchStorage();
  }, []);

  // ================= UPLOAD =================
  const onDrop = async (acceptedFiles) => {
    try {
      setUploading(true);
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      await api.post("/media/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      setUploading(false);
      setProgress(0);
      fetchMedia();
      fetchStorage();
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  // ================= REARRANGE ACTION HANDLER =================
  const handleMoveItem = async (index, direction) => {
    const portfolioItems = media.filter((m) => m?.isPortfolio);
    const nonPortfolioItems = media.filter((m) => !m?.isPortfolio);

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= portfolioItems.length) return;

    // Swap positions within locally filtered portfolio array mutations
    const rearrangedPortfolio = [...portfolioItems];
    const temporarySwapHolder = rearrangedPortfolio[index];
    rearrangedPortfolio[index] = rearrangedPortfolio[targetIndex];
    rearrangedPortfolio[targetIndex] = temporarySwapHolder;

    // Update frontend state matrix grid immediately for premium responsive feel
    const combinedStateOutput = [...rearrangedPortfolio, ...nonPortfolioItems];
    setMedia(combinedStateOutput);

    try {
      setIsSavingOrder(true);
      // Map out structured order objects array [{ id: X, position: Y }]
      const orderArray = rearrangedPortfolio.map((item, idx) => ({
        id: item._id,
        position: idx,
      }));

      await api.put("/media/rearrange", { orderArray }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to commit rearranged portfolio layout:", err);
      fetchMedia(); // Rollback local view layout variations on synchronization faults
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ================= DELETION PROCESSORS =================
  const deleteItem = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/media/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteTarget(null);
      fetchMedia();
      fetchStorage();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    }
  };

  const bulkDelete = async () => {
    const confirmBulk = window.confirm(`Are you sure you want to delete these ${selected.length} items?`);
    if (!confirmBulk) return;

    try {
      await Promise.all(
        selected.map((id) =>
          api.delete(`/media/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setSelected([]);
      fetchMedia();
      fetchStorage();
    } catch (err) {
      console.error("Bulk delete error:", err.response?.data || err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const safeMedia = Array.isArray(media) ? media : [];

  const filteredMedia = safeMedia.filter((m) => {
    const matchesType = filter === "all" ? true : m?.type === filter;
    const matchesSearch = (m?.caption || "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const grouped = {
    portfolio: filteredMedia.filter((m) => m?.isPortfolio),
    clients: filteredMedia.filter((m) => m?.client),
    others: filteredMedia.filter((m) => !m?.isPortfolio && !m?.client),
  };

  const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

  const renderGroup = (title, items, isPortfolioGroup = false) => (
    <>
      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between mt-10 mb-4">
            <h3 className="text-xl font-bold tracking-tight text-gray-800">{title}</h3>
            {isPortfolioGroup && isSavingOrder && (
              <span className="text-[10px] font-bold text-[#FE8521] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 animate-pulse">
                🔄 Syncing Order Layout...
              </span>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((m, idx) => (
              <div key={m._id} className="relative overflow-hidden bg-white border shadow-md border-gray-100/60 rounded-2xl group">
                <input
                  type="checkbox"
                  className="absolute z-10 top-3 left-3 w-4 h-4 rounded accent-[#015103] cursor-pointer"
                  checked={selected.includes(m._id)}
                  onChange={() => toggleSelect(m._id)}
                />

                <div onClick={() => setPreview(m)} className="relative h-48 overflow-hidden cursor-pointer bg-gray-50">
                  {m?.type === "image" ? (
                    <img
                      src={optimizeImage(m?.url)}
                      loading="lazy"
                      className="object-cover w-full h-full transition duration-500 transform group-hover:scale-102"
                      alt={m?.caption || "Studio asset"}
                    />
                  ) : (
                    <video src={m?.url} className="object-cover w-full h-full" />
                  )}
                </div>

                {/* INLINE LAYOUT POSITION CONSOLE ARROWS (ADMIN ONLY) */}
                {isPortfolioGroup && (
                  <div className="absolute inset-x-0 flex justify-between px-3 transition-all duration-200 opacity-0 pointer-events-none bottom-10 group-hover:opacity-100">
                    <button
                      type="button"
                      disabled={idx === 0 || isSavingOrder}
                      onClick={(e) => { e.stopPropagation(); handleMoveItem(idx, "left"); }}
                      className={`pointer-events-auto h-8 w-8 rounded-full shadow-lg border text-xs font-bold flex items-center justify-center transition backdrop-blur-md ${
                        idx === 0 
                          ? "bg-gray-100/50 text-gray-300 border-gray-200 cursor-not-allowed" 
                          : "bg-white/90 text-[#015103] border-gray-100 hover:bg-white active:scale-95"
                      }`}
                      title="Shift Presentation Sequence Backward"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1 || isSavingOrder}
                      onClick={(e) => { e.stopPropagation(); handleMoveItem(idx, "right"); }}
                      className={`pointer-events-auto h-8 w-8 rounded-full shadow-lg border text-xs font-bold flex items-center justify-center transition backdrop-blur-md ${
                        idx === items.length - 1 
                          ? "bg-gray-100/50 text-gray-300 border-gray-200 cursor-not-allowed" 
                          : "bg-white/90 text-[#015103] border-gray-100 hover:bg-white active:scale-95"
                      }`}
                      title="Advance Presentation Sequence Forward"
                    >
                      →
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-white border-t border-gray-50">
                  <p className="text-xs font-semibold truncate text-gray-700 max-w-[70%]">
                    {m?.caption || "Untitled Capture"}
                  </p>
                  <button
                    onClick={() => setDeleteTarget(m._id)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50/50 hover:bg-red-50 px-2 py-1 border border-red-100/40 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="p-6 space-y-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 pb-4 border-b border-gray-100 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-[#015103] tracking-tight">Studio Asset Media Vault</h2>
          {storage && (
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Cloud Storage: <span className="font-bold text-gray-700">{toMB(storage?.storage?.used || 0)} MB</span> used / {toMB(storage?.storage?.limit || 0)} MB threshold allocation metrics.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Search items..."
          className="p-3 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/20 bg-white placeholder-gray-300 text-black w-full max-w-xs transition"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-3 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/20 bg-white text-gray-600 transition"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Material Types</option>
          <option value="image">Still Images</option>
          <option value="video">Motion Video Files</option>
        </select>

        {selected.length > 0 && (
          <button
            onClick={bulkDelete}
            className="px-4 py-3 text-xs font-bold tracking-wider text-white uppercase transition transform bg-red-600 shadow-md hover:bg-red-700 shadow-red-500/10 rounded-xl active:scale-98"
          >
            Bulk Purge Selection ({selected.length})
          </button>
        )}
      </div>

      <div
        {...getRootProps()}
        className="p-10 text-center border-2 border-gray-200 border-dashed cursor-pointer rounded-2xl bg-white hover:bg-gray-50/60 transition group hover:border-[#FE8521]/40"
      >
        <input {...getInputProps()} />
        <span className="block mb-2 text-2xl transition duration-300 opacity-60 group-hover:scale-110">📤</span>
        <p className="text-sm font-bold text-gray-500 transition group-hover:text-gray-700">
          Drag & drop production media items or click to scan arrays
        </p>
        {uploading && (
          <div className="mt-4 max-w-xs mx-auto space-y-1.5">
            <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
              <div className="bg-[#FE8521] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs font-black text-[#FE8521] animate-pulse">{progress}% Cloud Ingestion Underway...</p>
          </div>
        )}
      </div>

      {renderGroup("Portfolio Showcase Layout", grouped.portfolio, true)}
      {renderGroup("Client Private Space Media", grouped.clients)}
      {renderGroup("Unmapped System Media", grouped.others)}

      {/* LIGHTBOX PREVIEW PORTAL */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center transition-opacity bg-black/95 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreview(null)}
        >
          <button className="absolute px-4 py-2 text-xs font-black tracking-widest text-white uppercase border top-6 right-6 bg-white/10 border-white/10 rounded-xl">
            Close Canvas ✕
          </button>
          <div className="relative p-2 max-w-5xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {preview.type === "image" ? (
              <img src={preview.url} className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl" alt="Lightbox display" />
            ) : (
              <video src={preview.url} controls autoPlay className="max-h-[80vh] max-w-full rounded-xl shadow-2xl" />
            )}
          </div>
        </div>
      )}

      {/* INDIVIDUAL ELIMINATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm p-6 mx-4 text-center bg-white border border-gray-100 shadow-2xl rounded-3xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-lg font-bold text-red-600 rounded-full bg-red-50">⚠️</div>
            <h3 className="mb-2 text-lg font-black tracking-tight text-gray-900">Drop Cloud Asset Archive?</h3>
            <p className="mb-6 text-xs font-medium leading-relaxed text-gray-400">
              This action maps a permanent cascade dropping record fields from MongoDB grids and Cloudinary storage nodes instantly.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="px-4 py-3 text-xs font-bold text-gray-500 transition border border-gray-100 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-98"
              >
                Cancel
              </button>
              <button 
                onClick={deleteItem} 
                className="px-4 py-3 text-xs font-bold text-white transition bg-red-600 shadow-md rounded-xl hover:bg-red-700 shadow-red-500/10 active:scale-98"
              >
                Drop Asset Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}