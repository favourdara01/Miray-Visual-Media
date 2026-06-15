import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

export default function AdminGalleryView() {
  const { id } = useParams();

  const [media, setMedia] = useState([]);
  const [client, setClient] = useState(null);
  const [cover, setCover] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [settings, setSettings] = useState(null);

  const [selected, setSelected] = useState([]);
  const [storage, setStorage] = useState(null);

  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  // ================= FETCH =================
  const fetchMedia = async () => {
    const res = await api.get(`/media/gallery/${id}`);
    setMedia(res.data);
  };

  const fetchGalleryMeta = async () => {
    const res = await api.get(`/gallery/${id}`);
    setCover(res.data.coverImage);
    setClient(res.data.client);
  };

  const fetchStorage = async () => {
    try {
      const res = await api.get("/media/storage");
      setStorage(res.data?.storage || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedia();
    fetchGalleryMeta();
    fetchStorage();
  }, [id]);

  // ================= DELETE =================
  const confirmDelete = async () => {
    const target = deleteTarget;
    setMedia((prev) => prev.filter((m) => m._id !== target._id));
    setDeleteTarget(null);

    try {
      await api.delete(`/media/${target._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      fetchMedia();
    }
  };

  // ================= COVER =================
  const setAsCover = async (mediaId) => {
    try {
      await api.put(
        `/gallery/${id}/cover`,
        { imageUrl: media.find((m) => m._id === mediaId)?.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGalleryMeta();
      setSettings(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SELECT =================
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ================= BULK DELETE =================
  const bulkDelete = async () => {
    const confirmBulk = window.confirm(`Are you sure you want to delete these ${selected.length} items?`);
    if (!confirmBulk) return;

    const backup = [...media];
    setMedia((prev) => prev.filter((m) => !selected.includes(m._id)));
    const itemsToDelete = [...selected];
    setSelected([]);

    try {
      await Promise.all(
        itemsToDelete.map((id) =>
          api.delete(`/media/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
    } catch (err) {
      setMedia(backup);
    }
  };

  // ================= UPLOAD =================
  const uploadFiles = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("galleryId", id);

    try {
      await api.post("/media/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedia();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DATE FORMAT =================
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ================= CHRONOLOGICAL TIMELINE SEPARATOR (3 MONTHS) =================
  const recentMedia = [];
  const olderMedia = [];

  media.forEach((item) => {
    const itemDate = new Date(item.createdAt);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (itemDate >= threeMonthsAgo) {
      recentMedia.push(item);
    } else {
      olderMedia.push(item);
    }
  });

  const renderMediaCard = (item, isRecent) => (
    <div
      key={item._id}
      className="relative overflow-hidden transition-all duration-300 transform border border-gray-100 shadow-sm group bg-white/90 backdrop-blur-md rounded-2xl hover:shadow-xl hover:border-orange-200/50 hover:-translate-y-1"
    >
      {/* Selection Control Checkbox Overlay */}
      <input
        type="checkbox"
        className="absolute z-20 top-3 left-3 w-4 h-4 rounded border-gray-300 text-[#FE8521] focus:ring-[#FE8521] cursor-pointer"
        checked={selected.includes(item._id)}
        onChange={() => toggleSelect(item._id)}
      />

      {/* Frame Wrapper Element Container */}
      <div className="relative h-64 overflow-hidden bg-gray-50">
        <img
          src={item.url}
          alt="Gallery asset"
          onClick={() => setSelectedImage(item)}
          className="object-cover w-full h-full transition-transform duration-500 cursor-pointer group-hover:scale-102"
        />

        {/* Dynamic Timeline Context Ribbon Item Badges */}
        <span
          className={`absolute bottom-3 left-3 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-md text-white z-10 ${
            isRecent ? "bg-green-600/70" : "bg-amber-600/70"
          }`}
        >
          {isRecent ? "Recent" : "Archive"}
        </span>
      </div>

      {/* Interactive Trigger Overlay Utilities Interface Layout Control */}
      <div className="flex items-center justify-between p-3 bg-white border-t border-gray-50 rounded-b-2xl">
        <p className="text-[11px] font-medium text-gray-400">
          📅 {item.createdAt && formatDate(item.createdAt)}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettings(item)}
            className="p-1.5 text-xs font-semibold rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
            title="Asset Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen pb-24 bg-gray-50"
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      {/* HERO BANNER WITH DYNAMIC BACKGROUND OVERLAY PORT */}
      <div className="relative flex flex-col items-center justify-center text-center text-white h-[360px] overflow-hidden shadow-lg bg-slate-900">
        {cover && (
          <img src={cover} className="absolute inset-0 object-cover w-full h-full transform scale-102 blur-xs opacity-60" alt="Gallery cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 max-w-xl px-4">
          <span className="bg-white/10 text-white border border-white/10 text-[10px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-3 inline-block backdrop-blur-md">
            Production Asset Workspace
          </span>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl drop-shadow-sm">
            {client?.name} {client?.surname}
          </h1>
          <button className="px-5 py-2.5 mt-6 font-bold text-xs uppercase tracking-wider text-gray-900 bg-white rounded-full shadow-md hover:bg-gray-50 hover:shadow-xl transition transform hover:-translate-y-0.5 duration-200">
            View Live Gallery
          </button>
        </div>
      </div>

      {/* FIXED SYSTEM MANAGEMENT CONTEXT CONTROL BAR BAR */}
      <div className="flex flex-col gap-4 p-4 px-6 mx-auto mt-8 border border-gray-100 shadow-xs max-w-7xl sm:flex-row sm:items-center sm:justify-between bg-white/70 backdrop-blur-md rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-[#015103] tracking-tight">
            Gallery Assets Collection ({media.length})
          </h2>
          {storage && (
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Cloud Vault Balance: <span className="font-mono text-gray-600">{storage.used || 0} MB</span> / {storage.limit || "∞"} MB
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <button
              onClick={bulkDelete}
              className="px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition bg-red-600 shadow-md hover:bg-red-700 rounded-xl"
            >
              Batch Delete ({selected.length})
            </button>
          )}

          <label className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl cursor-pointer transition shadow-md hover:shadow-lg">
            📥 Add Media Batch
            <input type="file" multiple onChange={uploadFiles} className="hidden" />
          </label>
        </div>
      </div>

      {/* GRID DISPATCH CHRONOLOGICAL CHANNELS VIEWPORTS */}
      <div className="px-6 mx-auto mt-10 space-y-12 max-w-7xl">
        {recentMedia.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-base font-bold tracking-tight text-gray-800">Recent Uploads</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full">Within 3 Months</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recentMedia.map((item) => renderMediaCard(item, true))}
            </div>
          </div>
        )}

        {olderMedia.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-base font-bold tracking-tight text-gray-400">Older Archives</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-full">Older than 3 Months</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 opacity-85">
              {olderMedia.map((item) => renderMediaCard(item, false))}
            </div>
          </div>
        )}

        {media.length === 0 && (
          <div className="py-16 text-center border-2 border-gray-200 border-dashed bg-white/40 rounded-3xl">
            <span className="block mb-2 text-3xl opacity-60">🖼️</span>
            <p className="text-sm font-semibold text-gray-500">Workspace bucket is empty</p>
            <p className="text-xs text-gray-400 mt-0.5">Initialize your production upload stream pipelines above.</p>
          </div>
        )}
      </div>

      {/* ================= LIGHTBOX PREVIEW SYSTEM ================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 bg-black/95 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage.url} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" alt="Preview expansion" />
          <p className="absolute bottom-6 text-xs font-semibold tracking-wide text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            Click Anywhere to Minimize Workspace
          </p>
        </div>
      )}

      {/* ================= DELETION CONFIRMATION INTERCEPT OVERLAY ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-2xl border-red-50">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-red-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-red-700">Purge Media Asset?</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500">
              This action is permanent. The asset will be removed from your cloud storage vault and linked portfolio directories instantly.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md"
              >
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ASSET SPECIFIC PARAMETERS CONFIGURATION POPUP ================= */}
      {settings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xs p-6 text-center bg-white border border-gray-100 shadow-2xl rounded-2xl">
            <h3 className="mb-4 text-base font-bold tracking-tight text-gray-800">Asset Options</h3>
           <div className="space-y-2">
              <button
                onClick={() => setAsCover(settings._id)}
                className="w-full py-2.5 font-bold text-xs tracking-wider uppercase text-white bg-[#015103] hover:bg-[#0c3f0d] rounded-xl transition shadow-sm"
              >
                Set as Album Cover
              </button>
              <button
                onClick={() => setSettings(null)}
                className="w-full py-2.5 font-bold text-xs tracking-wider uppercase text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Dismiss Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}