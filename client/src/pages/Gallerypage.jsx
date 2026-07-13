import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const sections = ["All", "Events", "Portrait", "Headshot"];

const subCategories = {
  Events: ["Wedding", "Corporate", "Burial", "Birthday"],
};

// ⚡ CLOUDINARY TRANSFORM ENGINE: Lowers payload data size instantly
const optimizePortfolioUrl = (url, targetWidth = 600) => {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;
  // Automatically serves Next-Gen formatting (WebP/AVIF) and reduces quality to a visually lossless 80%
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${targetWidth},c_limit/`
  );
};

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeSection, setActiveSection] = useState("All");
  const [activeSub, setActiveSub] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 INFINITE SCROLL & RENDERING LIMITS
  const ITEMS_PER_BATCH = 6;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  
  // Ref hook to lock the observer intersection target
  const observerTarget = useRef(null);

  // ================= DATA FETCH =================
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get("/media/portfolio");
      const data = res.data;

      let rawArray = [];
      if (Array.isArray(data)) rawArray = data;
      else if (Array.isArray(data?.data)) rawArray = data.data;
      else if (Array.isArray(data?.media)) rawArray = data.media;

      setMedia(rawArray.filter((m) => m.isPortfolio));
    } catch (err) {
      console.error("GALLERY PIPELINE FAULT:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Reset rendering limits cleanly whenever user adjusts categories
  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [activeSection, activeSub]);

  // ================= FILTERS ROUTING MATRIX =================
 // ================= STABLE REGISTRY FILTERS =================
  const filtered = media.filter((item) => {
    if (activeSection === "All") return true;
    
    // ✅ FIX: Use direct casing matches to align perfectly with your working GalleryPreview component logic
    if (item.section !== activeSection) return false;

    if (activeSection === "Events") {
      if (!activeSub) return true;
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

    // Trigger loading state 150px before target enters viewport layout for zero latency scrolling
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "150px",
      threshold: 0.1
    });

    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver, visibleItems]);

  return (
    <section
      className="min-h-screen px-6 pt-32 pb-24 bg-white select-none md:px-10"
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <Navbar />

        {/* Breadcrumbs */}
        <div className="mb-8 text-xs font-bold tracking-wider text-gray-400 uppercase">
          <Link to="/" className="hover:text-[#FE8521] transition">Home</Link>{" "}
          / <span className="text-[#015103]">Full Gallery Portfolio</span>
        </div>

        {/* Section Header */}
        <div className="mb-10 space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-[#015103] md:text-4xl">
            Immersive Art Vault
          </h2>
          <div className="w-12 h-[3px] bg-[#FE8521] rounded-full" />
        </div>

        {/* CATEGORY SELECTORS */}
        <div className="flex gap-3 pb-3 mb-6 overflow-x-auto no-scrollbar">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setActiveSection(sec);
                setActiveSub("");
              }}
              className={`px-5 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-xs ${
                activeSection === sec
                  ? "bg-[#FE8521] border-[#FE8521] text-white shadow-md shadow-orange-500/10"
                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* EVENTS FILTERS SUBCATEGORIES */}
        {activeSection === "Events" && (
          <div className="flex gap-2 pb-2 mb-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSub("")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition duration-200 ${
                activeSub === ""
                  ? "bg-[#015103] border-[#015103] text-white"
                  : "bg-white border-gray-100 text-gray-400 hover:text-gray-700"
              }`}
            >
              All Events
            </button>
            {subCategories.Events.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition duration-200 whitespace-nowrap ${
                  activeSub === sub
                    ? "bg-[#015103] border-[#015103] text-white"
                    : "bg-white border-gray-100 text-gray-400 hover:text-gray-700"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* PRIMARY MEDIA CONTROLLER CANVAS */}
        {loading && visibleItems.length === 0 ? (
          /* Initial Load: Full Skeleton Masonry Grid with Shimmer Heights */
          <div className="gap-5 space-y-5 columns-1 sm:columns-2 md:columns-3">
            {[380, 260, 420, 290, 350, 400].map((height, i) => (
              <div
                key={i}
                style={{ height: `${height}px` }}
                className="w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-2xl break-inside-avoid"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 space-y-2 text-center">
            <p className="text-base font-bold text-gray-400">No portfolio pieces found</p>
            <p className="text-xs text-gray-300">Try modifying your categorization tabs to pull fresh items.</p>
          </div>
        ) : (
          <>
            {/* LUXURY PERFORMANCE OPTIMIZED MASONRY GRID */}
            <div className="gap-5 space-y-5 columns-1 sm:columns-2 md:columns-3">
              {visibleItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelected(item)}
                  className="relative overflow-hidden bg-gray-50 border border-black/[0.03] shadow-xs cursor-pointer break-inside-avoid group rounded-2xl transition-all duration-300 transform will-change-transform active:scale-[0.99] hover:shadow-md"
                >
                  {item.type === "image" ? (
                    <img
                      src={optimizePortfolioUrl(item.url, 650)} // 🔥 Cloudinary downscale intercept injection
                      alt={item.caption || "Miray Portfolio"}
                      loading="lazy"
                      className="object-cover w-full transition duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <video 
                      className="object-cover w-full pointer-events-none" 
                      muted 
                      loop 
                      autoPlay 
                      playsInline
                    >
                      <source src={item.url} type="video/mp4" />
                    </video>
                  )}

                  {/* GLASSMORPHIC SLIDE INSIGHT LABEL BANNER */}
                  <div className="absolute inset-0 flex items-end p-4 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:opacity-100">
                    <p className="text-xs font-bold tracking-wide text-white uppercase drop-shadow-sm">
                      {item.section} • {item.subCategory || "Studio Feature"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= INFINITE SCROLL DETECTION RADAR WIRE ================= */}
            <div 
              ref={observerTarget} 
              className="flex items-center justify-center w-full py-12 transition-all"
            >
              {hasMoreToLoad && (
                <div className="flex flex-col items-center gap-2">
                  {/* Subtle, looping pro visualizer circle spinner */}
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-[#FE8521] rounded-full animate-spin" />
                  <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase animate-pulse">
                    Streaming Canvas Data...
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* LIGHTBOX IMMERSIVE LARGE MEDIA ENLARGER */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
        >
          {selected.type === "image" ? (
            <img
              src={optimizePortfolioUrl(selected.url, 1600)} // Pull high-res file ONLY when lightbox mode launches
              alt="Expanded preview"
              className="max-h-[88vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            />
          ) : (
            <video controls autoPlay className="max-h-[88vh] max-w-[92vw] rounded-2xl shadow-2xl animate-in fade-in duration-200">
              <source src={selected.url} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      {/* INJECT TAILWIND CUSTOM ANIMATIONS BLOCK */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}