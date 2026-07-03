import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useDropzone } from "react-dropzone";

const optimizeImage = (url) => {
  if (!url) return "";

  // already optimized or external URL
  if (!url.includes("cloudinary.com")) return url;

  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,w_800,c_fill/"
  );
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

  // Native drag-and-drop state tracker
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [storage, setStorage] = useState(null);

  // Pull token from localStorage if not available in current scope
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

      acceptedFiles.forEach((file) =>
        formData.append("files", file)
      );

      await api.post(
        "/media/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          onUploadProgress: (event) => {
            const percent = Math.round(
              (event.loaded * 100) / event.total
            );

            setProgress(percent);
          },
        }
      );

      setUploading(false);
      setProgress(0);

      fetchMedia();
      fetchStorage();
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } =
    useDropzone({
      onDrop,
      multiple: true,
    });

  // ================= NATIVE DRAG & DROP REARRANGE (PORTFOLIO ONLY) =================
  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping elements natively
  };

  const handleDrop = async (targetIndex) => {
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const portfolioItems = media.filter((m) => m?.isPortfolio);
    const nonPortfolioItems = media.filter((m) => !m?.isPortfolio);

    const rearrangedPortfolio = [...portfolioItems];
    // Remove the item being dragged from its original position
    const [draggedItem] = rearrangedPortfolio.splice(draggedItemIndex, 1);
    // Insert the dragged item cleanly into its new dropped index target
    rearrangedPortfolio.splice(targetIndex, 0, draggedItem);

    // Update the local state instantly for a lightning-fast responsive feel
    setMedia([...rearrangedPortfolio, ...nonPortfolioItems]);
    setDraggedItemIndex(null);

    try {
      setIsSavingOrder(true);
      // Map out structured order coordinate objects array [{ id: X, position: Y }]
      const orderArray = rearrangedPortfolio.map((item, idx) => ({
        id: item._id,
        position: idx,
      }));

      await api.put("/media/rearrange", { orderArray }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to commit dropped portfolio layout:", err);
      fetchMedia(); // Rollback grid position matrix on synchronization faults
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ================= DELETE =================
  const deleteItem = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(
        `/media/${deleteTarget}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // ================= SAFE MEDIA =================
  const safeMedia = Array.isArray(media)
    ? media
    : [];

  const filteredMedia = safeMedia.filter((m) => {
    const matchesType =
      filter === "all"
        ? true
        : m?.type === filter;

    const matchesSearch =
      (m?.caption || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  const grouped = {
    portfolio: filteredMedia.filter(
      (m) => m?.isPortfolio
    ),

    clients: filteredMedia.filter(
      (m) => m?.client
    ),

    others: filteredMedia.filter(
      (m) => !m?.isPortfolio && !m?.client
    ),
  };

  const toMB = (bytes) =>
    (bytes / (1024 * 1024)).toFixed(2);

  const renderGroup = (title, items) => {
    const isPortfolioGroup = title === "Portfolio";

    return (
      <>
        {items.length > 0 && (
          <>
            <div className="flex items-center gap-4 mt-10 mb-4">
              <h3 className="text-xl font-semibold text-gray-700">
                {title}
              </h3>
              {isPortfolioGroup && isSavingOrder && (
                <span className="text-xs font-medium text-orange-500 animate-pulse">
                  Saving arrangement order...
                </span>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((m, idx) => (
                <div
                  key={m._id}
                  className={`relative bg-white shadow rounded-2xl ${
                    isPortfolioGroup ? "cursor-grab active:cursor-grabbing transition-transform duration-200" : ""
                  }`}
                  // 🔥 Native HTML5 Drag and Drop triggers (Applied dynamically *only* to Portfolio items)
                  draggable={isPortfolioGroup}
                  onDragStart={isPortfolioGroup ? () => handleDragStart(idx) : undefined}
                  onDragOver={isPortfolioGroup ? handleDragOver : undefined}
                  onDrop={isPortfolioGroup ? () => handleDrop(idx) : undefined}
                >
                  <input
                    type="checkbox"
                    className="absolute z-10 top-3 left-3"
                    checked={selected.includes(
                      m._id
                    )}
                    onChange={() =>
                      toggleSelect(m._id)
                    }
                  />

                  <div
                    onClick={() => setPreview(m)}
                    className="cursor-pointer"
                  >
                    {m?.type === "image" ? (
                      <img
                        src={optimizeImage(
                          m?.url
                        )}
                        loading="lazy"
                        className="object-cover w-full h-48 pointer-events-none rounded-t-2xl" // pointer-events-none ensures clean card dragging
                      />
                    ) : (
                      <video
                        src={m?.url}
                        className="object-cover w-full h-48 pointer-events-none rounded-t-2xl"
                      />
                    )}
                  </div>

                  <p className="p-2 text-sm truncate select-none">
                    {m?.caption || "Untitled"}
                  </p>

                  <button
                    onClick={() =>
                      setDeleteTarget(m._id)
                    }
                    className="absolute z-10 px-2 py-1 text-xs text-white bg-red-500 rounded top-2 right-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">
        Media Manager
      </h2>

      {storage && (
        <p className="text-sm text-gray-500">
          Storage:{" "}
          {toMB(
            storage?.storage?.used || 0
          )}MB
          /
          {toMB(
            storage?.storage?.limit || 0
          )}MB
        </p>
      )}

      <div className="flex gap-3 my-4">
        <input
          placeholder="Search..."
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="p-2 border rounded"
        />

        <select
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="image">
            Images
          </option>
          <option value="video">
            Videos
          </option>
        </select>

        {selected.length > 0 && (
          <button
            onClick={bulkDelete}
            className="px-3 py-2 text-white bg-red-500 rounded"
          >
            Delete ({selected.length})
          </button>
        )}
      </div>

      <div
        {...getRootProps()}
        className="p-6 text-center transition border-2 border-gray-300 border-dashed cursor-pointer rounded-2xl bg-gray-50 hover:bg-gray-100"
      >
        <input {...getInputProps()} />

        <p className="text-gray-600">
          Drag & drop or click to upload
        </p>

        {uploading && (
          <p className="mt-2 font-semibold text-blue-500">{progress}% uploading...</p>
        )}
      </div>

      {renderGroup(
        "Portfolio",
        grouped.portfolio
      )}

      {renderGroup(
        "Client Media",
        grouped.clients
      )}

      {renderGroup(
        "Others",
        grouped.others
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreview(null)}
        >
          {preview.type === "image" ? (
            <img
              src={preview.url}
              className="max-h-[80vh] max-w-[90vw] rounded-lg"
            />
          ) : (
            <video
              src={preview.url}
              controls
              className="max-h-[80vh] max-w-[90vw]"
            />
          )}
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm p-6 mx-4 text-center bg-white shadow-xl rounded-2xl">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Delete Media File?</h3>
            <p className="mb-6 text-sm text-gray-500">
              This action is permanent. The file will be removed from your database and Cloudinary storage instantly.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={deleteItem} 
                className="px-4 py-2 text-sm font-medium text-white transition bg-red-600 rounded-xl hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}