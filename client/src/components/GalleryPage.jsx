import { useEffect, useState } from "react";
import api from "../api/axios";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

const optimizeImage = (url) => {
  if (!url) return "";
  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,w_800,c_fill/"
  );
};

const categories = ["All", "Events", "Portrait", "Headshot"];

const subCategories = {
  Events: ["Wedding", "Corporate", "Burial", "Birthday"],
};

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  // ✅ FIXED: Added missing activeSub state to allow subfiltering without wiping the main section category
  const [activeSub, setActiveSub] = useState(""); 
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get("/media");
      
      // Ensure data is parsed correctly regardless of response wrapper wrapping arrays
      const rawData = res.data?.data || res.data?.media || res.data;
      const portfolio = Array.isArray(rawData) ? rawData.filter((m) => m.isPortfolio) : [];

      setMedia(portfolio);
    } catch (err) {
      console.error("Gallery Page fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // ================= FILTER (FIXED) =================
  const filtered = media.filter((item) => {
    if (activeCategory === "All") return true;

    // ✅ FIXED: Using 'section' instead of 'category' to map accurately to your database properties
    if (item.section !== activeCategory) return false;

    // ✅ FIXED: Filter subcategories inside Events using the active subcategory state
    if (activeCategory === "Events" && activeSub) {
      return item.subCategory === activeSub;
    }

    return true;
  });

  // ================= LIGHTBOX SLIDES =================
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
      
      {/* ================= PREMIUM GLASS NAVIGATION HEADER ================= */}
      <div className="sticky top-0 z-20 border-b border-gray-100 shadow-xs bg-white/80 backdrop-blur-md">
        <div className="flex flex-col gap-4 px-6 py-5 mx-auto max-w-7xl md:flex-row md:items-center md:justify-between">
          <div>
            <span className="bg-orange-50 text-[#FE8521] border border-orange-100 text-[9px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-1 inline-block">
              Studio Archive
            </span>
            <h1 className="text-3xl font-black text-[#015103] tracking-tight">
              Master Gallery Collection
            </h1>
          </div>

          {/* MAIN CATEGORIES */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveSub(""); // Reset subcategories on main category change
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border transition duration-200 transform active:scale-95 shadow-2xs ${
                  activeCategory === cat
                    ? "bg-[#FE8521] border-[#FE8521] text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#FE8521] hover:text-[#FE8521]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* EVENTS SUBCATEGORIES SUBBAR PANEL */}
        {activeCategory === "Events" && (
          <div className="px-6 py-3 transition duration-300 border-t bg-gray-50/60 border-gray-100/80 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-2 mx-auto max-w-7xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-2">Filter Event:</span>
              <button
                onClick={() => setActiveSub("")}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                  activeSub === ""
                    ? "bg-[#015103] border-[#015103] text-white shadow-xs"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                All Events
              </button>
              {subCategories.Events.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSub(sub)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                    activeSub === sub
                      ? "bg-[#015103] border-[#015103] text-white shadow-xs"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= CONTENT CONTAINER MODULE ================= */}
      <div className="px-6 py-10 mx-auto max-w-7xl">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-2">
            <div className="w-8 h-8 border-2 border-[#FE8521] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gray-400">Compiling multi-column layout assets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-gray-200 border-dashed bg-gray-50 rounded-2xl">
            <span className="block mb-2 text-3xl opacity-50">🖼️</span>
            <p className="text-sm font-bold tracking-tight text-gray-500">No Media Nodes Found</p>
            <p className="text-xs text-gray-400 mt-0.5">There are no matching items uploaded under this tracking parameter.</p>
          </div>
        ) : (
          /* Premium Masonry layout style constraints */
          <div className="gap-5 space-y-5 columns-1 sm:columns-2 md:columns-3 lg:columns-4">
            {filtered.map((item, i) => (
              <div
                key={item._id}
                className="overflow-hidden cursor-pointer group rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 break-inside-avoid relative bg-gray-50 transform hover:-translate-y-0.5"
                onClick={() => {
                  const targetIndex = filtered.findIndex((m) => m._id === item._id);
                  setIndex(targetIndex);
                }}
              >
                {item.type === "image" ? (
                  <img
                    src={optimizeImage(item.url)}
                    loading="lazy"
                    alt="Portfolio entry"
                    className="w-full transition duration-500 rounded-2xl group-hover:scale-101"
                  />
                ) : (
                  <div className="relative overflow-hidden rounded-2xl">
                    <video
                      src={item.url}
                      className="object-cover w-full h-auto rounded-2xl"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-extrabold text-white">
                      🎥 Motion
                    </div>
                  </div>
                )}
                {/* Subtle Hover shadow mask element overlays */}
                <div className="absolute inset-0 transition duration-300 opacity-0 pointer-events-none bg-black/5 group-hover:opacity-100 rounded-2xl" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FULL IMMERSIVE LIGHTBOX GALLERY PLUGINS ================= */}
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