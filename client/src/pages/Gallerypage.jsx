import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const sections = ["All", "Events", "Portrait", "Headshot"];

const subCategories = {
  Events: ["Wedding", "Corporate", "Burial", "Birthday"],
};

const GalleryPage = () => {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeSection, setActiveSection] = useState("All");
  const [activeSub, setActiveSub] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchMedia = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/media");

      setMedia(res.data.filter((m) => m.isPortfolio));
    } catch (err) {
      console.error("FETCH ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // ================= STRICT FILTER (FIXED) =================
  const filtered = media.filter((item) => {
    if (activeSection === "All") return true;

    if (item.section !== activeSection) return false;

    if (activeSection === "Events") {
      if (!activeSub) return true;

      return item.subCategory === activeSub;
    }

    return true;
  });

  return (
    <section
      className="min-h-screen px-6 py-20 bg-white md:px-10"
      style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <Navbar />

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#FE8521]">
            Home
          </Link>{" "}
          / Gallery
        </div>

        {/* Title */}
        <h2 className="mb-6 text-3xl font-bold text-[#015103]">
          Full Gallery
        </h2>

        {/* SECTION FILTER */}
        <div className="flex gap-3 pb-3 mb-6 overflow-x-auto">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setActiveSection(sec);
                setActiveSub("");
              }}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
                activeSection === sec
                  ? "bg-[#FE8521] text-white"
                  : "hover:bg-[#FE8521] hover:text-white"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* SUBCATEGORY */}
        {activeSection === "Events" && (
          <div className="flex gap-3 mb-8 overflow-x-auto">
            {subCategories.Events.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap ${
                  activeSub === sub
                    ? "bg-[#FE8521] text-white"
                    : "hover:bg-[#FE8521] hover:text-white"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="gap-4 space-y-4 columns-1 sm:columns-2 md:columns-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 mb-4 bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">No media found</p>
        ) : (
          // MASONRY GRID
          <div className="gap-4 space-y-4 columns-1 sm:columns-2 md:columns-3">
            {filtered.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelected(item)}
                className="relative mb-4 overflow-hidden shadow-sm cursor-pointer break-inside-avoid group rounded-xl"
              >
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    className="object-cover w-full transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <video className="object-cover w-full">
                    <source src={item.url} type="video/mp4" />
                  </video>
                )}

                <div className="absolute inset-0 flex items-end p-3 transition bg-black/0 group-hover:bg-black/40">
                  <p className="text-sm text-white transition opacity-0 group-hover:opacity-100">
                    {item.section} • {item.subCategory}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        >
          {selected.type === "image" ? (
            <img
              src={selected.url}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            />
          ) : (
            <video controls className="max-h-[90vh] max-w-[90vw]">
              <source src={selected.url} type="video/mp4" />
            </video>
          )}
        </div>
      )}
    </section>
  );
};

export default GalleryPage;