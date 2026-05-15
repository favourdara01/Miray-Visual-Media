import { useEffect, useState } from "react";
import api from "../api/axios";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

const optimizeImage = (url) => {
  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,w_800,c_fill/"
  );
};

// ================= CATEGORIES =================
const categories = ["All", "Events", "Portrait", "Headshot"];

const subCategories = {
  Events: ["Wedding", "Corporate", "Burial", "Birthday"],
};

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchMedia = async () => {
    try {
      setLoading(true);

      const res = await api.get("/media");

      const portfolio = res.data.filter((m) => m.isPortfolio);

      setMedia(portfolio);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // ================= FILTER =================
  const filtered = media.filter((item) => {
    if (activeCategory === "All") return true;

    if (activeCategory === "Events") {
      return subCategories.Events.includes(item.category);
    }

    return item.category === activeCategory;
  });

  // ================= LIGHTBOX =================
  const slides = filtered.map((item) =>
    item.type === "image"
      ? { src: item.url }
      : {
          type: "video",
          sources: [{ src: item.url, type: "video/mp4" }],
        }
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">

        <div className="px-6 py-5">

          <h1 className="text-2xl font-bold text-[#015103]">
            Gallery
          </h1>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-3 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm rounded-full border transition ${
                  activeCategory === cat
                    ? "bg-[#FE8521] text-white"
                    : "hover:bg-[#FE8521] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SUBCATEGORY */}
          {activeCategory === "Events" && (
            <div className="flex flex-wrap gap-3 mt-3">
              {subCategories.Events.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveCategory(sub)}
                  className="px-3 py-1 text-xs border rounded-full hover:bg-[#FE8521] hover:text-white"
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-6 py-10">

        {loading ? (
          <p className="text-center text-gray-400">
            Loading gallery...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">
            No images found
          </p>
        ) : (
          <div className="gap-4 space-y-4 columns-1 sm:columns-2 md:columns-3 lg:columns-4">

            {filtered.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden cursor-pointer group rounded-xl break-inside-avoid"
                onClick={() => {
                  const i = filtered.findIndex(
                    (m) => m._id === item._id
                  );
                  setIndex(i);
                }}
              >

                {item.type === "image" ? (
                  <img
                    src={optimizeImage(item.url)}
                    loading="lazy"
                    className="w-full transition duration-300 rounded-xl group-hover:scale-105"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full rounded-xl"
                  />
                )}

              </div>
            ))}

          </div>
        )}

      </div>

      {/* ================= LIGHTBOX ================= */}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
        plugins={[Video]}
      />

    </div>
  );
}