import { useState, useRef } from "react";
import api from "../../api/axios";
import { useDropzone } from "react-dropzone";
// ✅ NEW: Import the browser compression tool
import imageCompression from "browser-image-compression";

const PortfolioUploader = () => {
  const [files, setFiles] = useState([]);
  const [mainCategory, setMainCategory] = useState("Events");
  const [subCategory, setSubCategory] = useState("Wedding");
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // ✅ NEW: Compression loader state

  // Modals state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Tracks the total count of the initial batch for the progress text
  const [totalBatchCount, setTotalBatchCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Use a ref to track if the user clicked cancel mid-upload
  const isCancelledRef = useRef(false);

  const token = sessionStorage.getItem("accessToken") || "";

  // ================= DROPZONE + AUTO-COMPRESSION =================
  const onDrop = async (acceptedFiles) => {
    if (isUploading || isCompressing) return;

    setIsCompressing(true);
    const optimizedFilesQueue = [];

    // Settings for the compression engine
    const compressionOptions = {
      maxSizeMB: 1.5,          // ✅ Limits image size to a max of 1.5MB (perfect for high-quality portfolio view)
      maxWidthOrHeight: 2560,  // ✅ Preserves 2K/4K crispness for studio work
      useWebWorker: true       // ✅ Runs in background thread so the browser UI doesn't freeze or stutter
    };

    try {
      for (const file of acceptedFiles) {
        // Skip compression for videos, only compress images
        if (file.type.startsWith("video")) {
          optimizedFilesQueue.push(file);
        } else {
          console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          
          // Execute compression directly on client machine
          const compressedBlob = await imageCompression(file, compressionOptions);
          
          // Convert Blob back to a standard File object so FormData accepts it cleanly
          const compressedFile = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });

          console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
          optimizedFilesQueue.push(compressedFile);
        }
      }

      setFiles(optimizedFilesQueue);
      setTotalBatchCount(optimizedFilesQueue.length);
      setCompletedCount(0);
    } catch (error) {
      console.error("Image pre-processing failed:", error);
      alert("Error processing images. Try uploading fewer files at once.");
    } finally {
      setIsCompressing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({ onDrop, disabled: isUploading || isCompressing });

  // ================= UPLOAD QUEUE ENGINE =================
  const handleUploadQueue = async (filesToUpload, startingIndexFromBatch = 0) => {
    setIsUploading(true);
    isCancelledRef.current = false;
    setProgress(0);

    for (let i = 0; i < filesToUpload.length; i++) {
      if (isCancelledRef.current) break;

      setCurrentFileIndex(i);
      const file = filesToUpload[i];
      const form = new FormData();
      
      form.append("files", file); 
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

        // Safe tracking of completed items across retries
        setCompletedCount((prev) => prev + 1);

      } catch (err) {
        console.error(err);
        setIsUploading(false);
        setProgress(0);

        // Slice the array so 'files' state ONLY contains the failed file and remaining queue
        const remainingQueue = filesToUpload.slice(i);
        setFiles(remainingQueue);
        setCurrentFileIndex(0); 

        setShowErrorModal(true);
        return; 
      }
    }

    if (!isCancelledRef.current) {
      setShowSuccessModal(true);
      setFiles([]);
      setMainCategory("Events");
      setSubCategory("Wedding");
      setCompletedCount(0);
      setTotalBatchCount(0);
    }
    
    setIsUploading(false);
    setProgress(0);
  };

  const startInitialUpload = () => {
    handleUploadQueue(files, 0);
  };

  // ================= RETRY LOGIC =================
  const handleRetry = () => {
    setShowErrorModal(false);
    setTimeout(() => handleUploadQueue(files, completedCount), 100); 
  };

  const handleCancelAndClear = () => {
    isCancelledRef.current = true;
    setIsUploading(false);
    setProgress(0);
    setFiles([]);
    setCompletedCount(0);
    setTotalBatchCount(0);
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
          isUploading || isCompressing ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" :
          isDragActive
            ? "bg-orange-50 border-[#FE8521]"
            : "border-gray-300 hover:border-[#FE8521] hover:bg-orange-50/40 cursor-pointer"
        }`}
      >
        <input {...getInputProps()} />
        {isCompressing ? (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700 animate-pulse">⚡ Optimizing & Compressing Media...</p>
            <p className="text-xs text-gray-500">Shrinking payloads locally to guarantee safe Render delivery</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600">Drag & drop images/videos here</p>
            {!isUploading && (
              <p className="mt-2 text-sm text-[#FE8521] font-medium">or click to select files</p>
            )}
          </>
        )}
      </div>

      {/* PREVIEW */}
      {files.length > 0 && !isCompressing && (
        <div className="grid grid-cols-3 gap-3 p-1 mt-6 overflow-y-auto max-h-60">
          {files.map((file, i) => (
            <div
              key={i}
              className={`overflow-hidden bg-gray-100 rounded-xl relative border-2 ${
                isUploading && i === currentFileIndex ? "border-[#FE8521]" : "border-transparent"
              }`}
            >
              {file.type.startsWith("video") ? (
                <video src={URL.createObjectURL(file)} className="object-cover w-full h-32" />
              ) : (
                <img src={URL.createObjectURL(file)} className="object-cover w-full h-32" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* MAIN CATEGORY */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Main Category</label>
        <select
          disabled={isUploading || isCompressing}
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
          disabled={isUploading || isCompressing}
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
            <span>Uploading optimized file {completedCount + 1} of {totalBatchCount}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
            <div className="h-2 bg-[#FE8521] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          
          <button
            onClick={handleCancelAndClear}
            className="px-3 py-1 mt-3 text-xs font-semibold text-red-600 transition rounded-lg bg-red-50 hover:bg-red-100"
          >
            ✕ Cancel Entire Upload
          </button>
        </div>
      )}

      {/* ACTIONS BUTTON */}
      {!isUploading && !isCompressing && (
        <button
          onClick={startInitialUpload}
          className="w-full p-3 mt-6 text-white rounded-xl bg-[#FE8521] hover:bg-[#e6761d] transition shadow-sm font-semibold"
        >
          {completedCount > 0 ? `Resume Upload (${files.length} Remaining)` : `Upload Portfolio (${files.length} Files)`}
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

      {/* ================= ERROR / RETRY MODAL ================= */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-2xl border-red-50">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-red-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-red-700">Upload Process Halted</h3>
            <p className="p-3 mt-2 text-sm text-left text-gray-600 border border-gray-100 bg-gray-50 rounded-xl">
              • Completed items: <span className="font-semibold text-green-600">{completedCount} saved successfully ✅</span><br />
              • Current error: <span className="font-medium text-red-500">Failed at file index {completedCount + 1}</span>
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Would you like to retry the failed file and remaining pipeline queue, or stop and clear the dashboard?
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