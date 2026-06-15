import { useState, useRef } from "react";
import api from "../../api/axios";
import { useDropzone } from "react-dropzone";

const PortfolioUploader = () => {
  const [files, setFiles] = useState([]);
  const [mainCategory, setMainCategory] = useState("Events");
  const [subCategory, setSubCategory] = useState("Wedding");
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Modals state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Use a ref to track if the user clicked cancel mid-upload
  const isCancelledRef = useRef(false);

  const token = sessionStorage.getItem("accessToken") || "";

  // ================= DROPZONE =================
  const onDrop = (acceptedFiles) => {
    if (isUploading) return;
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({ onDrop, disabled: isUploading });

  // ================= UPLOAD QUEUE ENGINE =================
  const handleUpload = async () => {
    if (!files.length) return alert("Select files first");
    
    setIsUploading(true);
    isCancelledRef.current = false;
    setProgress(0);

    // Loop through files sequentially (one-by-one) to prevent server memory lag
    for (let i = 0; i < files.length; i++) {
      if (isCancelledRef.current) break;

      setCurrentFileIndex(i);
      const file = files[i];
      const form = new FormData();
      
      form.append("files", file); // Appending a single file to keep network payloads lightweight
      form.append("section", mainCategory);
      form.append("isPortfolio", "true");

      if (mainCategory === "Events") {
        form.append("subCategory", subCategory);
      }

      try {
        await api.post("/media/upload", form, {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          },
        });
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        // Save where we failed so retry can pick up from this exact index
        setCurrentFileIndex(i); 
        setShowErrorModal(true);
        return; // Halt execution immediately
      }
    }

    // Checking if loop finished successfully or was cut short by a cancellation request
    if (!isCancelledRef.current) {
      setShowSuccessModal(true);
      setFiles([]);
      setMainCategory("Events");
      setSubCategory("Wedding");
    }
    
    setIsUploading(false);
    setProgress(0);
  };

  // ================= RETRY LOGIC =================
  const handleRetry = () => {
    setShowErrorModal(false);
    // Slice array to only include remaining un-uploaded items
    const remainingFiles = files.slice(currentFileIndex);
    setFiles(remainingFiles);
    // Re-trigger upload loop instantly
    setTimeout(() => handleUpload(), 100); 
  };

  const handleCancelAndClear = () => {
    isCancelledRef.current = true;
    setIsUploading(false);
    setProgress(0);
    setFiles([]);
    setShowErrorModal(false);
  };

  return (
    <div className="relative max-w-3xl p-8 mx-auto bg-white shadow-sm rounded-2xl">

      {/* HEADER */}
      <h2 className="mb-6 text-2xl font-bold text-[#015103]">
        Portfolio Upload
      </h2>

      {/* DROP AREA */}
      <div
        {...getRootProps()}
        className={`p-12 border-2 border-dashed rounded-xl text-center transition ${
          isUploading ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" :
          isDragActive
            ? "bg-orange-50 border-[#FE8521]"
            : "border-gray-300 hover:border-[#FE8521] hover:bg-orange-50/40 cursor-pointer"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">Drag & drop images/videos here</p>
        {!isUploading && (
          <p className="mt-2 text-sm text-[#FE8521] font-medium">or click to select files</p>
        )}
      </div>

      {/* PREVIEW */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 p-1 mt-6 overflow-y-auto max-h-60">
          {files.map((file, i) => (
            <div
              key={i}
              className={`overflow-hidden bg-gray-100 rounded-xl relative border-2 ${
                isUploading && i === currentFileIndex ? "border-[#FE8521]" : 
                isUploading && i < currentFileIndex ? "border-green-500 opacity-40" : "border-transparent"
              }`}
            >
              {file.type.startsWith("video") ? (
                <video src={URL.createObjectURL(file)} className="object-cover w-full h-32" />
              ) : (
                <img src={URL.createObjectURL(file)} className="object-cover w-full h-32" />
              )}
              {isUploading && i < currentFileIndex && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-600 bg-green-500/10">
                  ✓ Done
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MAIN CATEGORY */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Main Category</label>
        <select
          disabled={isUploading}
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521] disabled:bg-gray-100"
        >
          <option>Events</option>
          <option>Portrait</option>
          <option>Session</option>
          <option>Headshot</option>
        </select>
      </div>

      {/* SUB CATEGORY */}
      <div className="mt-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Sub Category</label>
        <select
          disabled={isUploading}
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521] disabled:bg-gray-100"
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

      {/* PROGRESS CONTAINER */}
      {isUploading && (
        <div className="p-4 mt-6 border bg-gray-50 rounded-xl">
          <div className="flex justify-between mb-1 text-xs font-medium text-gray-600">
            <span>Uploading file {currentFileIndex + 1} of {files.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
            <div className="h-2 bg-[#FE8521] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          
          {/* ✅ CANCEL BUTTON WORKING LIVE */}
          <button
            onClick={() => {
              isCancelledRef.current = true;
              handleCancelAndClear();
            }}
            className="px-3 py-1 mt-3 text-xs font-semibold text-red-600 transition rounded-lg bg-red-50 hover:bg-red-100"
          >
            ✕ Cancel Entire Upload
          </button>
        </div>
      )}

      {/* ACTIONS BUTTON */}
      {!isUploading && (
        <button
          onClick={handleUpload}
          className="w-full p-3 mt-6 text-white rounded-xl bg-[#FE8521] hover:bg-[#e6761d] transition shadow-sm font-semibold"
        >
          Upload Portfolio ({files.length} Files)
        </button>
      )}

      {/* ================= SUCCESS MODAL ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm p-8 text-center bg-white border border-gray-100 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-50">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-[#015103]">Upload Successful!</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              All selected assets have been sequence-streamed to your database portfolio smoothly.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full px-5 py-3 bg-[#FE8521] hover:bg-[#e6761d] text-white font-semibold text-sm rounded-xl transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* ================= ✅ NEW: ERROR / RETRY MODAL ================= */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-2xl border-red-50">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-red-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-red-700">Upload Process Halted</h3>
            <p className="mt-2 text-sm text-gray-600">
              An error occurred while uploading file index <strong>{currentFileIndex + 1}</strong>. Would you like to retry the remaining files or cancel?
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCancelAndClear}
                className="w-1/2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Stop & Clear
              </button>
              <button
                onClick={handleRetry}
                className="w-1/2 px-4 py-2.5 text-sm font-semibold text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl transition shadow-sm"
              >
                🔄 Retry Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PortfolioUploader;