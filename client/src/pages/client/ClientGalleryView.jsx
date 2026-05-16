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

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading gallery...
      </div>
    );
  }

  const clientName = gallery?.client?.name || "Client";

  return (
    <div className="min-h-screen bg-[#f7f7f7]">

      {/* HERO */}
      <div className="relative h-[80vh]">
        <img
          src={
            gallery?.coverImage ||
            media[0]?.url ||
            "https://placehold.co/1200x800"
          }
          className="object-cover w-full h-full"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">

          <h2 className="text-lg text-white/80">
            {clientName}
          </h2>

          <h1 className="text-4xl font-bold">
            {gallery?.title}
          </h1>

          <button
            onClick={scrollToGallery}
            className="px-6 py-2 mt-5 text-black bg-white rounded-md"
          >
            View Gallery
          </button>

        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-white shadow">

        <div className="flex gap-3">

          <button
            onClick={selectAll}
            className="px-4 py-2 text-sm border rounded-md"
          >
            {selected.length === media.length
              ? "Unselect All"
              : "Select All"}
          </button>

          {selected.length > 0 && (
            <button
              onClick={downloadSelected}
              className="px-4 py-2 text-sm text-white bg-[#015103] rounded-md"
            >
              Download Selected ({selected.length})
            </button>
          )}

          <button
            onClick={downloadAll}
            className="px-4 py-2 text-sm text-white bg-[#FE8521] rounded-md"
          >
            Download All
          </button>

        </div>

        <p className="text-sm text-gray-500">
          {media.length} items
        </p>

      </div>

      {/* GRID */}
      <div ref={sectionRef} className="p-5 md:p-8">

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {media.map((item, i) => (
            <div key={item._id} className="relative">

              <input
                type="checkbox"
                checked={selected.includes(item._id)}
                onChange={() => toggleSelect(item._id)}
                className="absolute z-10 top-2 left-2"
              />

              <img
                src={item.url}
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                className="object-cover w-full rounded-lg cursor-pointer h-52"
              />

            </div>
          ))}

        </div>

      </div>

      {/* LIGHTBOX */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={media.map((m) => ({ src: m.url }))}
        plugins={[Fullscreen, Zoom]}
      />

      {/* DOWNLOAD MODAL */}
      {downloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

          <div className="w-[90%] max-w-md p-6 bg-white rounded-xl shadow-xl">

            <h2 className="text-lg font-bold text-[#015103]">
              Confirm Download
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {downloadModal.type === "all"
                ? `You are about to download all ${media.length} images`
                : `You are about to download ${selected.length} selected images`}
            </p>

            {downloading && (
              <p className="mt-3 text-sm text-[#FE8521]">
                Preparing your file...
              </p>
            )}

            <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={() => setDownloadModal(null)}
                className="px-4 py-2 text-sm border rounded-md"
                disabled={downloading}
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  startDownload(downloadModal.ids, downloadModal.filename)
                }
                className="px-4 py-2 text-sm text-white bg-[#FE8521] rounded-md"
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "Confirm"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}