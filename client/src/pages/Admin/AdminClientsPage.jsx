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
  const [loading, setLoading] = useState(true);

  // 🔥 NEW: delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);



  // ================= FETCH =================
  const fetchClient = async () => {
    try {
      const res = await api.get(
        `/client/${id}`,
       
      );
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
        { title, clientId: id },
        
      );

      setGalleries((prev) => [res.data, ...prev]);
      setTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE =================
  const deleteGallery = async () => {
    try {
      await api.delete(
        `/gallery/${deleteTarget}`,
      
      );

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
      await api.post(
        "/media/upload-bulk",
        formData,
       
      );

      fetchGalleries();
    } catch (err) {
      console.error("Upload error:", err);
      fetchGalleries();
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading client data...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center text-red-500">
        Client not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}  >

      {/* HERO */}
      <div className="flex flex-col items-center justify-center text-center text-white h-[320px] bg-gradient-to-r from-[#015103] to-[#FE8521]">

        <h1 className="text-3xl font-bold">
          {client.name} {client.surname}
        </h1>

        <p className="text-white/80">{client.email}</p>

        <div className="mt-4 text-sm text-white/80">
          Storage Used: {client.storageUsed || 0}MB /{" "}
          {client.storageLimit || 5000}MB
        </div>

        <div className="w-64 h-2 mt-2 overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full bg-white"
            style={{
              width: `${Math.min(
                ((client.storageUsed || 0) /
                  (client.storageLimit || 5000)) *
                  100,
                100
              )}%`,
            }}
          />
        </div>

        <button
          onClick={() =>
            galleryRef.current.scrollIntoView({ behavior: "smooth" })
          }
          className="px-6 py-2 mt-4 font-medium text-black bg-white rounded-full hover:bg-gray-100"
        >
          View Galleries
        </button>
      </div>

      {/* CREATE */}
      <div className="p-6">
        <div className="p-4 bg-white shadow rounded-2xl">

          <h2 className="mb-3 font-semibold text-[#015103]">
            Create New Album
          </h2>

          <input
            placeholder="Album name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 mb-3 border rounded-xl focus:ring-2 focus:ring-[#FE8521]"
          />

          <button
            onClick={createGallery}
            className="px-5 py-2 text-white bg-[#FE8521] rounded-lg hover:bg-orange-600"
          >
            Create Album
          </button>
        </div>
      </div>

      {/* GALLERIES */}
      <div
        ref={galleryRef}
        className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {galleries.map((g) => (
          <div
            key={g._id}
            className="overflow-hidden transition bg-white shadow rounded-2xl hover:shadow-xl"
          >

            <div className="relative h-48 bg-gray-200">
              <img
                src={g.coverImage || "/default.jpg"}
                className="object-cover w-full h-full"
              />

              <div className="absolute inset-0 flex items-center justify-center transition opacity-0 bg-black/50 hover:opacity-100">
                <button
                  onClick={() =>
                    navigate(`/admin/gallery/${g._id}`)
                  }
                  className="px-4 py-2 text-black bg-white rounded-full"
                >
                  Open Gallery
                </button>
              </div>
            </div>

            <div className="p-4">

              <h3 className="font-semibold text-[#015103]">
                {g.title}
              </h3>

              <p className="text-sm text-gray-500">
                {new Date(g.createdAt).toDateString()}
              </p>

              <div className="flex items-center justify-between mt-3">

                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleUpload(e.target.files, g._id)
                  }
                  className="text-sm"
                />

                {/* 🔥 UPDATED: open modal instead of instant delete */}
                <button
                  onClick={() => setDeleteTarget(g._id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>

              </div>

            </div>
          </div>
        ))}
      </div>

      {/* 🔥 DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="p-6 bg-white rounded-xl w-[300px] text-center">

            <p className="mb-4">
              Are you sure you want to delete this album?
            </p>

            <div className="flex justify-center gap-3">

              <button
                onClick={deleteGallery}
                className="px-4 py-2 text-white bg-red-500 rounded"
              >
                Yes
              </button>

              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}