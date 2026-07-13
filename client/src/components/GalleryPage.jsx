import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar"; // Integrated navbar header overlay
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

// ⚡ CLOUDINARY TRANSFORM ENGINE: Controls network payloads for instant loads
const optimizeImage = (url, targetWidth = 650) => {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;
  // Forces Next-Gen file formats (WebP) and downsizes the bounding box box safely
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${targetWidth},c_limit/`
  );
};

const categories = ["All", "Events", "Portrait", "Headshot"];

const subCategories = {
  Events: ["Wedding", "Corporate", "Burial", "Birthday"],
};

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSub, setActiveSub] = useState(""); 
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  // 🔄 INFINITE SCROLL BATCH STATE CONFIGURATIONS
  const ITEMS_PER_BATCH = 8;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const observerTarget = useRef(null);

  // ================= FETCH ARCHIVE PIPELINE =================
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get("/media");
      
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

  // Reset rendering limits cleanly whenever user adjusts categories or subtabs
  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [activeCategory, activeSub]);

  // ================= STABLE FILTER MATRIX =================
  const filtered = media.filter((item) => {
    if (activeCategory === "All") return true;

    if (item.section !== activeCategory) return false;

    if (activeCategory === "Events" && activeSub) {
      return item.subCategory === activeSub;
    }

    return true;
  });

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMoreToLoad = filtered.length > visibleCount;

  // ================= NATIVE INFINITE SCROLL OBSERVER =================
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMoreToLoad && !loading) {
      setVisibleCount((prev) => prev + ITEMS_PER_BATCH);
    }
  }, [hasMoreToLoad, loading]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "250px", // Preloads the next row batch 250px early for fluid scrolling
      threshold: 0.01
    });

    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver, visibleItems]);

  // ================= LIGHTBOX SLIDES CONFIGS =================
  const slides = filtered.map((item) =>
    item.type === "image"
      ? { src: optimizeImage(item.url, 1600) } // Pulls pristine quality file ONLY when maximized inside Lightbox view
      : {
          type: "video",
          sources: [{ src: item.url, type: "video/mp4" }],
        }
  );

  return (
    <div className="min-h-screen bg-white select-none">
      
      {/* 🔮 STICKY HEADER AND FILTER WORKSPACE */}
      <div className="sticky top-0 z-30 pt-24 border-b border-gray-100 shadow-sm bg-white/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-6 py-5 mx-auto max-w-7xl lg:flex-row lg:items-center lg:justify-between">
          <Navbar />
          
          <div>
            <span className="bg-orange-50 text-[#FE8521] border border-orange-100 text-[9px] tracking-widest font-black uppercase px-3 py-1 rounded-xl mb-1 inline-block">
              Studio Archive Vault
            </span>
            <h1 className="text-3xl font-black text-[#015103] tracking-tight md:text-4xl">
              Master Collection
            </h1>
          </div>

          {/* DYNAMIC CATEGORY BUTTON ROW */}
          <div className="flex flex-wrap gap-2 pb-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveSub(""); 
                }}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition duration-300 transform active:scale-95 whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#FE8521] border-[#FE8521] text-white shadow-md shadow-orange-500/20"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* EVENTS FILTERS SUBCATEGORIES SLIDE PANEL */}
        {activeCategory === "Events" && (
          <div className="flex px-6 py-3 overflow-x-auto border-t border-gray-100 bg-gray-50/70 no-scrollbar">
            <div className="flex flex-wrap items-center gap-2 mx-auto max-w-7xl whitespace-nowrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">Filter:</span>
              <button
                onClick={() => setActiveSub("")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition duration-200 ${
                  activeSub === ""
                    ? "bg-[#015103] border-[#015103] text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                All Events
              </button>
              {subCategories.Events.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSub(sub)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition duration-200 ${
                    activeSub === sub
                      ? "bg-[#015103] border-[#015103] text-white shadow-sm"
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

      {/* ================= PRIMARY MEDIA CANVAS CORE ================= */}
      <div className="px-6 py-10 mx-auto max-w-7xl">

        {loading && visibleItems.length === 0 ? (
          /* INITIAL LOAD: Render Fluid Shimmering CSS Mesh Box Skeletons */
          <div className="gap-5 space-y-5 columns-1 sm:columns-2 md:columns-3 lg:columns-4">
            {[390, 260, 430, 290, 360, 410, 280, 330].map((height, i) => (
              <div
                key={i}
                style={{ height: `${height}px` }}
                className="w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-2xl break-inside-avoid border border-gray-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 space-y-2 text-center border-2 border-gray-100 border-dashed bg-gray-50/50 rounded-3xl">
            <span className="block text-4xl opacity-40 animate-bounce">🖼️</span>
            <p className="text-base font-bold text-gray-400">No Portfolio Assets Found</p>
            <p className="max-w-xs mx-auto text-xs text-gray-300">There are no files uploaded or matching these active filter criteria parameters.</p>
          </div>
        ) : (
          <>
            {/* LUXURY HIGH-PERFORMANCE MASONRY MESH GRID */}
            <div className="gap-5 space-y-5 columns-1 sm:columns-2 md:columns-3 lg:columns-4">
              {visibleItems.map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden cursor-pointer group rounded-2xl border border-black/[0.03] shadow-sm hover:shadow-xl transition-all duration-300 break-inside-avoid relative bg-gray-50 transform will-change-transform active:scale-[0.99]"
                  onClick={() => {
                    const targetIndex = filtered.findIndex((m) => m._id === item._id);
                    setIndex(targetIndex);
                  }}
                >
                  {item.type === "image" ? (
                    <img
                      src={optimizeImage(item.url, 650)} // Custom compression thumbnail proxy downsampler
                      loading="lazy"
                      alt={item.caption || "Miray Archive Piece"}
                      className="w-full transition duration-500 rounded-2xl ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="relative overflow-hidden bg-black rounded-2xl">
                      <video
                        src={item.url}
                        className="object-cover w-full h-auto transition rounded-2xl opacity-90 group-hover:opacity-100"
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata" // Bypasses network choking by fetching timestamps only
                      />
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-extrabold text-white shadow-sm">
                        🎥 Motion
                      </div>
                    </div>
                  )}
                  
                  {/* CINEMATIC REVEAL INSIGHT LABELS */}
                  <div className="absolute inset-0 flex items-end p-4 transition-opacity duration-300 opacity-0 pointer-events-none bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl group-hover:opacity-100">
                    <p className="text-[10px] font-black tracking-wider text-white uppercase drop-shadow-sm">
                      {item.section} • {item.subCategory || "Studio Profile"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= RADAR INFINITE TRACKING POINTER LAYER ================= */}
            <div 
              ref={observerTarget} 
              className="flex items-center justify-center w-full py-16 transition-all"
            >
              {hasMoreToLoad && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-[#FE8521] rounded-full animate-spin" />
                  <p className="text-[9px] font-black tracking-widest text-gray-300 uppercase animate-pulse">
                    Streaming Canvas Data...
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ================= LIGHTBOX PLUGINS POPUP CONTAINER ================= */}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
        plugins={[Video]}
        animation={{ fade: 250, swipe: 200 }}
      />

      {/* CSS INJECTIONS STYLING BLOCK */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}