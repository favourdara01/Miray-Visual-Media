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



  // ================= FETCH =================
  const fetchMedia = async () => {
    const res = await api.get(
      `/media/gallery/${id}`
    );
    setMedia(res.data);
  };

  const fetchGalleryMeta = async () => {
    const res = await api.get(
      `/gallery/${id}`
    );

    setCover(res.data.coverImage);
    setClient(res.data.client);
  };

  // 🔥 REAL CLOUDINARY STORAGE
  const fetchStorage = async () => {
    try {
      const res = await api.get(
        "/media/storage"
      );

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
      await api.delete(
        `/media/${target._id}`
      );
    } catch (err) {
      fetchMedia();
    }
  };

  // ================= COVER =================
  const setAsCover = async (mediaId) => {
    await api.put(
      `/gallery/${id}/cover`,
      {
        imageUrl: media.find((m) => m._id === mediaId)?.url,
      }
    );

    fetchGalleryMeta();
    setSettings(null);
  };

  // ================= SELECT =================
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ================= BULK DELETE =================
  const bulkDelete = async () => {
    const backup = [...media];

    setMedia((prev) =>
      prev.filter((m) => !selected.includes(m._id))
    );
    setSelected([]);

    try {
      await Promise.all(
        selected.map((id) =>
          api.delete(`/media/${id}`)
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
    Array.from(files).forEach((file) =>
      formData.append("files", file)
    );
    formData.append("galleryId", id);

    try {
      await api.post(
        "/media/upload",
        formData,
        
      );

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-white">

      {/* HERO */}
      <div className="relative flex flex-col items-center justify-center text-center text-white h-[380px]">

        {cover && (
          <img
            src={cover}
            className="absolute inset-0 object-cover w-full h-full"
          />
        )}

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10">

          <h1 className="text-4xl font-bold">
            {client?.name} {client?.surname}
          </h1>

          {/* RECTANGULAR BUTTON */}
          <button className="px-6 py-3 mt-5 text-black bg-white rounded">
            View Gallery
          </button>

        </div>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between p-6">

        <div>
          <h2 className="text-xl font-semibold text-[#015103]">
            Gallery ({media.length})
          </h2>

          {/* REAL CLOUDINARY STORAGE */}
          {storage && (
            <p className="text-sm text-gray-500">
              Cloudinary Storage:{" "}
              {storage.used || 0} MB / {storage.limit || "∞"}
            </p>
          )}
        </div>

        {/* UPLOAD BUTTON IMPROVED */}
        <label className="px-4 py-2 text-white bg-[#FE8521] rounded cursor-pointer hover:bg-orange-600">
          Choose Files
          <input
            type="file"
            multiple
            onChange={uploadFiles}
            className="hidden"
          />
        </label>

        {selected.length > 0 && (
          <button
            onClick={bulkDelete}
            className="px-4 py-2 text-white bg-red-500 rounded"
          >
            Delete
          </button>
        )}
      </div>

      {/* GRID */}
      <div className="grid gap-4 p-6 md:grid-cols-3 lg:grid-cols-4">

        {media.map((item) => (
          <div key={item._id} className="relative bg-white rounded shadow">

            <input
              type="checkbox"
              className="absolute z-10 top-2 left-2"
              checked={selected.includes(item._id)}
              onChange={() => toggleSelect(item._id)}
            />

            <img
              src={item.url}
              onClick={() => setSelectedImage(item)}
              className="object-cover w-full h-64 cursor-pointer"
            />

            {/* DATE DISPLAY */}
            <p className="px-2 py-1 text-xs text-gray-500">
              {item.createdAt && formatDate(item.createdAt)}
            </p>

            <button
              onClick={() => setSettings(item)}
              className="absolute top-2 right-2"
            >
              ⚙️
            </button>

            <button
              onClick={() => setDeleteTarget(item)}
              className="absolute text-red-500 bottom-2 right-2"
            >
              Delete
            </button>

          </div>
        ))}
      </div>

      {/* FULLSCREEN (EASY CLOSE) */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.url}
            className="max-h-[85vh]"
          />
        </div>
      )}

      {/* DELETE MODAL (IMPROVED LIKE OTHER PAGE) */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="p-6 bg-white rounded-xl w-[300px] text-center">

            <p className="mb-4">
              Delete this image?
            </p>

            <div className="flex justify-center gap-3">

              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded"
              >
                Yes
              </button>

              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                No
              </button>

            </div>

          </div>
        </div>
      )}

      {/* SETTINGS */}
      {settings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="p-6 bg-white rounded">

            <button onClick={() => setAsCover(settings._id)}>
              Set as Cover
            </button>

            <button onClick={() => setSettings(null)}>
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}