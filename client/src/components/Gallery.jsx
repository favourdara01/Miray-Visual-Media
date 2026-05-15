import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

// UPDATED MAIN CATEGORIES
const categories = ["All", "Events", "Portrait", "Headshot"];

// SUBCATEGORY SYSTEM
const subCategories = {
  Events: ["Wedding", "Corporate", "Burial", "Birthday"],
};

const GalleryPreview = () => {
  const navigate = useNavigate();

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeSection, setActiveSection] = useState("All");
  const [activeSub, setActiveSub] = useState("");

  const [index, setIndex] = useState(-1);

  // ================= FETCH MEDIA =================
  const fetchMedia = async () => {
    try {
      setLoading(true);

      const res = await api.get("/media/portfolio");

      setMedia(res.data);

    } catch (err) {
      console.error(
        "❌ MEDIA ERROR:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // ================= FILTER =================
  const filtered = media.filter((item) => {
    if (activeSection === "All") return true;

    if (item.section !== activeSection) return false;

    if (activeSection === "Events" && activeSub) {
      return item.subCategory === activeSub;
    }

    return true;
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
    <section id="portfolio" className="px-6 py-20 bg-white md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* TITLE */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl text-[#015103]">
            Our Portfolio
          </h2>

          <p className="mt-2 text-gray-600">
            A glimpse of our creative work
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveSection(cat);
                setActiveSub("");
              }}
              className={`px-4 py-2 rounded-full border text-sm transition ${
                activeSection === cat
                  ? "bg-[#FE8521] text-white"
                  : "hover:bg-[#FE8521] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SUBCATEGORIES */}
        {activeSection === "Events" && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {subCategories.Events.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`px-3 py-1 text-sm border rounded-full transition ${
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

        {/* GRID */}
        {loading ? (
          <p className="text-center text-gray-400">
            Loading portfolio...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">
            No portfolio media found
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">

            {filtered.slice(0, 6).map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  const realIndex = filtered.findIndex(
                    (m) => m._id === item._id
                  );

                  setIndex(realIndex);
                }}
                className="overflow-hidden transition duration-300 shadow-sm cursor-pointer rounded-2xl hover:shadow-xl group"
              >

                {item.type === "image" ? (
                  <img
                    src={item.url}
                    className="object-cover w-full transition duration-500 h-60 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative">

                    <video
                      className="object-cover w-full h-60"
                      muted
                      loop
                      autoPlay
                    >
                      <source src={item.url} type="video/mp4" />
                    </video>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="px-3 py-1 text-sm text-white rounded-full bg-black/50">
                        Video
                      </span>
                    </div>

                  </div>
                )}

              </div>
            ))}

          </div>
        )}

        {/* LOAD MORE */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/gallery")}
            className="bg-[#FE8521] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
          >
            Load More
          </button>
        </div>

        {/* LIGHTBOX */}
        <Lightbox
          open={index >= 0}
          close={() => setIndex(-1)}
          index={index}
          slides={slides}
          plugins={[Video]}
        />

      </div>
    </section>
  );
};

export default GalleryPreview;