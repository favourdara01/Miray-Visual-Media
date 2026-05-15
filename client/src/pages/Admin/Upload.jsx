import { useState } from "react";
import api from "../../api/axios";
import { useDropzone } from "react-dropzone";

const PortfolioUploader = () => {
  const [files, setFiles] = useState([]);
  const [mainCategory, setMainCategory] = useState("Events");
  const [subCategory, setSubCategory] = useState("Wedding");
  const [progress, setProgress] = useState(0);

  // ✅ NEW: modal state
  const [showModal, setShowModal] = useState(false);

const token = sessionStorage.getItem("accessToken") || "";

  // ================= DROPZONE =================
  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({ onDrop });

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!files.length) return alert("Select files first");

    const form = new FormData();

    files.forEach((file) => {
      form.append("files", file);
    });

    // MAIN CATEGORY
    form.append("section", mainCategory);
    form.append("isPortfolio", "true");

    // ✅ ONLY SEND SUBCATEGORY IF EVENTS
    if (mainCategory === "Events") {
      form.append("subCategory", subCategory);
    }

    try {
      await api.post(
        "/media/upload",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (e) => {
            const percent = Math.round(
              (e.loaded * 100) / e.total
            );
            setProgress(percent);
          },
        }
      );

      // ❌ REMOVED ALERT
      // alert("Upload successful 🚀");

      // ✅ SHOW MODAL INSTEAD
      setShowModal(true);

      setFiles([]);
      setProgress(0);

      // reset
      setMainCategory("Events");
      setSubCategory("Wedding");

    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  return (
    <div className="max-w-3xl p-8 mx-auto bg-white shadow-sm rounded-2xl">

      {/* HEADER */}
      <h2 className="mb-6 text-2xl font-bold text-[#015103]">
        Portfolio Upload
      </h2>

      {/* DROP AREA */}
      <div
        {...getRootProps()}
        className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
          isDragActive
            ? "bg-orange-50 border-[#FE8521]"
            : "border-gray-300 hover:border-[#FE8521] hover:bg-orange-50/40"
        }`}
      >
        <input {...getInputProps()} />

        <p className="text-gray-600">
          Drag & drop images/videos here
        </p>
        <p className="mt-2 text-sm text-[#FE8521] font-medium">
          or click to select files
        </p>
      </div>

      {/* PREVIEW */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-6">
          {files.map((file, i) => (
            <div
              key={i}
              className="overflow-hidden bg-gray-100 rounded-xl"
            >
              {file.type.startsWith("video") ? (
                <video
                  src={URL.createObjectURL(file)}
                  className="object-cover w-full h-32"
                  controls
                />
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  className="object-cover w-full h-32"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* MAIN CATEGORY */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Main Category
        </label>

        <select
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
        >
          <option>Events</option>
          <option>Portrait</option>
          <option>Session</option>
          <option>Headshot</option>
        </select>
      </div>

      {/* SUB CATEGORY (ONLY EVENTS ACTIVE VISUALLY) */}
      <div className="mt-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Sub Category
        </label>

        <select
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
        >
          {mainCategory === "Events" && (
            <>
              <option>Wedding</option>
              <option>Corporate</option>
              <option>Burial</option>
              <option>Birthday</option>
            </>
          )}

          {mainCategory === "Portrait" && <option>Portrait</option>}
          {mainCategory === "Session" && <option>Session</option>}
          {mainCategory === "Headshot" && <option>Headshot</option>}
        </select>
      </div>

      {/* PROGRESS */}
      {progress > 0 && (
        <div className="mt-6">
          <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
            <div
              className="h-2 bg-[#FE8521] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-gray-600">
            Uploading... {progress}%</p>
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        className="w-full p-3 mt-6 text-white rounded-xl bg-[#FE8521] hover:bg-[#e6761d] transition shadow-sm hover:shadow-md"
      >
        Upload Portfolio
      </button>

      {/* ================= SUCCESS MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-[300px]">

            <h2 className="text-lg font-bold text-[#015103]">
              Upload Successful 🚀
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your files have been uploaded successfully.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-[#FE8521] text-white rounded-lg"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default PortfolioUploader;