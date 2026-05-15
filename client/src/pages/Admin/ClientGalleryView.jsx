import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ClientGalleryView({ id }) {
  const [gallery, setGallery] = useState(null);
  const [index, setIndex] = useState(null);

const token = sessionStorage.getItem("accessToken") || "";

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get(
          `/gallery/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setGallery(res.data);
      } catch (err) {
        console.error("Gallery fetch error:", err);
      }
    };

    fetchGallery();
  }, [id]);

  if (!gallery) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#015103]">
        Loading gallery...
      </div>
    );
  }

  const images = gallery.images || [];

  const closeModal = () => setIndex(null);

  const next = () => {
    if (!images.length) return;
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    if (!images.length) return;
    setIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl text-[#015103]">
          {gallery.title}
        </h1>

        <p className="text-sm text-gray-500">
          Click any image to preview fullscreen
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4">

        {images.map((img, i) => (
          <div
            key={i}
            className="overflow-hidden transition bg-white shadow rounded-xl hover:shadow-lg hover:scale-[1.02]"
          >
            <img
              src={img?.url}
              className="object-cover w-full h-40 cursor-pointer md:h-44"
              onClick={() => setIndex(i)}
              alt="gallery"
            />
          </div>
        ))}

      </div>

      {/* EMPTY STATE */}
      {images.length === 0 && (
        <div className="p-10 mt-10 text-center bg-white shadow rounded-2xl">
          <p className="text-gray-500">No images in this gallery</p>
        </div>
      )}

      {/* ================= FULLSCREEN MODAL ================= */}
      {index !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">

          {/* CLOSE */}
          <button
            onClick={closeModal}
            className="absolute text-white top-5 right-5 text-2xl hover:text-[#FE8521] transition"
          >
            ✕
          </button>

          {/* LEFT */}
          <button
            onClick={prev}
            className="absolute left-2 md:left-5 text-white text-4xl hover:text-[#FE8521] transition"
          >
            ‹
          </button>

          {/* IMAGE */}
          <div className="px-4">
            <img
              src={images[index]?.url}
              className="max-h-[75vh] md:max-h-[80vh] rounded-xl shadow-2xl transition duration-300"
              alt="preview"
            />
          </div>

          {/* RIGHT */}
          <button
            onClick={next}
            className="absolute right-2 md:right-5 text-white text-4xl hover:text-[#FE8521] transition"
          >
            ›
          </button>

          {/* THUMBNAILS */}
          <div className="absolute flex gap-2 p-2 overflow-x-auto bottom-4 max-w-[95%] md:max-w-[90%]">
            {images.map((img, i) => (
              <img
                key={i}
                src={img?.url}
                onClick={() => setIndex(i)}
                className={`w-14 h-14 md:w-16 md:h-16 object-cover rounded cursor-pointer border-2 transition ${
                  i === index
                    ? "border-[#FE8521]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                alt="thumb"
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}