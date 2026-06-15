import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

export default function ClientGalleryView() {
  const { id } = useParams();

  const [media, setMedia] = useState([]);
  const [gallery, setGallery] = useState(null);

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [downloadModal, setDownloadModal] = useState(null);

  const sectionRef = useRef(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const [mediaRes, galleryRes] = await Promise.all([
        api.get(`/media/gallery/${id}`),
        api.get(`/gallery/${id}`),
      ]);

      setMedia(mediaRes.data);
      setGallery(galleryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // ================= SELECT =================
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === media.length) {
      setSelected([]);
    } else {
      setSelected(media.map((m) => m._id));
    }
  };

  // ================= DOWNLOAD CORE =================
  const startDownload = async (ids, filename) => {
    try {
      setDownloading(true);

      const res = await api.post(
        "/media/download-selected",
        { mediaIds: ids },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
      setDownloadModal(null);
    }
  };

  // ================= TRIGGERS =================
  const downloadSelected = () => {
    setDownloadModal({
      type: "selected",
      ids: selected,
      filename: "selected-media.zip",
    });
  };

  const downloadAll = () => {
    setDownloadModal({
      type: "all",
      ids: media.map((m) => m._id),
      filename: `${gallery?.title || "gallery"}.zip`,
    });
  };

  const scrollToGallery = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ================= LOADING SCREEN =================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-3 bg-gray-50">
        <div className="w-10 h-10 border-2 border-[#FE8521] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase">Assembling Gallery Nodes...</p>
      </div>
    );
  }

  const clientName = gallery?.client?.name || "Client Collection";

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)" }}
    >
      {/* ================= IMMERSIVE HERO VIEWPORT ================= */}
      <div className="relative h-[85vh] sm:h-[80vh] w-full overflow-hidden shadow-lg">
        <img
          src={gallery?.coverImage || media[0]?.url || "https://placehold.co/1200x800"}
          className="object-cover w-full h-full duration-700 transform scale-101 animate-fadeIn"
          alt="Gallery backdrop header"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="bg-white/10 text-white border border-white/10 text-[9px] tracking-[0.3em] font-extrabold uppercase px-3 py-1 rounded-full mb-3 backdrop-blur-md">
            {clientName}
          </span>
          
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl drop-shadow-md">
            {gallery?.title}
          </h1>
          
          <button
            onClick={scrollToGallery}
            className="px-6 py-3 mt-8 text-xs font-bold tracking-wider uppercase transition duration-200 transform bg-white rounded-full shadow-md group text-gray-950 hover:shadow-2xl hover:bg-gray-50 active:scale-95"
          >
            Explore Master Collection <span className="inline-block transition-transform group-hover:translate-y-0.5 ml-0.5">↓</span>
          </button>
        </div>
      </div>

      {/* ================= STICKY ACTION UTILITY CONTROL BAR ================= */}
      <div className="sticky top-0 z-40 border-b shadow-xs border-gray-100/60 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 mx-auto md:p-5 max-w-7xl">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={selectAll}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-xl transition duration-150 ${
                selected.length === media.length
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {selected.length === media.length ? "Deselect All" : "Select All"}
            </button>

            {selected.length > 0 && (
              <button
                onClick={downloadSelected}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#015103] hover:bg-[#064208] rounded-xl transition shadow-sm hover:shadow-md animate-fadeIn"
              >
                Download Selected ({selected.length})
              </button>
            )}

            <button
              onClick={downloadAll}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl transition shadow-sm hover:shadow-md"
            >
              Download Full Gallery
            </button>
          </div>

          <p className="hidden font-mono text-xs font-bold tracking-wider text-gray-400 uppercase sm:block">
            {media.length} Vault Items Mapped
          </p>
        </div>
      </div>

      {/* ================= COMPACT PIXIEST MEDIA DISPLAY GRID ================= */}
      <div ref={sectionRef} className="p-4 mx-auto sm:p-6 md:p-8 max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item, i) => {
            const isChecked = selected.includes(item._id);
            return (
              <div 
                key={item._id} 
                className={`group relative overflow-hidden bg-gray-100 rounded-2xl border transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
                  isChecked ? "border-[#FE8521] ring-2 ring-[#FE8521]/20" : "border-transparent"
                }`}
              >
                {/* Checkbox Selector Interface Wrapper */}
                <div className={`absolute top-3 left-3 z-20 transition-opacity duration-200 ${
                  isChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                }`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelect(item._id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FE8521] focus:ring-[#FE8521] cursor-pointer shadow-md"
                  />
                </div>

                {/* Main Media Core Component Window Container */}
                <div className="relative w-full overflow-hidden cursor-pointer aspect-square bg-gray-50">
                  <img
                    src={item.url}
                    onClick={() => {
                      setIndex(i);
                      setOpen(true);
                    }}
                    className="object-cover w-full h-full transition duration-500 group-hover:scale-102"
                    alt="Gallery item matrix log node"
                    loading="lazy"
                  />
                  {/* Micro Dark Vignette Base Layer */}
                  <div className="absolute inset-0 transition duration-300 opacity-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent transparent group-hover:opacity-100" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= LIGHTBOX PREVIEW PLUGINS MODULE LAYER ================= */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={media.map((m) => ({ src: m.url }))}
        plugins={[Fullscreen, Zoom]}
      />

      {/* ================= DOWNLOAD INTERCEPT PROCESS MODAL ================= */}
      {downloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-3xl border-gray-50 animate-scaleUp">
            
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-orange-50">
              <span className="text-2xl">📦</span>
            </div>

            <h3 className="text-lg font-bold text-[#015103] tracking-tight">
              Confirm Storage Zip Download
            </h3>

            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500">
              {downloadModal.type === "all"
                ? `You are running a package compile instruction for all ${media.length} original assets into a compressed single archive file.`
                : `You are compiling a packaged cloud download for your ${selected.length} specifically selected assets.`}
            </p>

            {downloading && (
              <div className="mt-4 p-3 bg-orange-50/60 border border-orange-100 rounded-xl flex items-center justify-center gap-2.5 animate-pulse">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FE8521] border-t-transparent" />
                <span className="text-[11px] font-bold tracking-wide text-orange-700 uppercase">Compiling Storage Assets...</span>
              </div>
            )}

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDownloadModal(null)}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                disabled={downloading}
              >
                Cancel
              </button>

              <button
                onClick={() => startDownload(downloadModal.ids, downloadModal.filename)}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl transition shadow-md disabled:bg-gray-400 disabled:shadow-none"
                disabled={downloading}
              >
                {downloading ? "Processing" : "Confirm"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}