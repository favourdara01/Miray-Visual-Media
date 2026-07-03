import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

const PortfolioUploader = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [mainCategory, setMainCategory] = useState("Events");
  const [subCategory, setSubCategory] = useState("Wedding");
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Modals state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [totalBatchCount, setTotalBatchCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const isCancelledRef = useRef(false);
  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  // ================= SECURE MOUNT GUARD =================
  useEffect(() => {
    // 🛡️ SECURITY REGULATION: Prevent unauthorized layout route tampering
    if (!token) {
      navigate("/admin/login");
    }
  }, [token, navigate]);

  // ================= DROPZONE + AUTO-COMPRESSION =================
  const onDrop = async (acceptedFiles) => {
    if (isUploading || isCompressing) return;

    setIsCompressing(true);
    const optimizedFilesQueue = [];

    const compressionOptions = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2560,
      useWebWorker: true
    };

    try {
      for (const file of acceptedFiles) {
        // 🛡️ SECURITY REGULATION: Explicitly reject spoofed mime payloads
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          console.warn(`Rejected invalid payload instance: ${file.name}`);
          continue;
        }

        if (file.type.startsWith("video")) {
          optimizedFilesQueue.push(file);
        } else {
          const compressedBlob = await imageCompression(file, compressionOptions);
          const compressedFile = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          optimizedFilesQueue.push(compressedFile);
        }
      }

      setFiles((prev) => {
        const updated = [...prev, ...optimizedFilesQueue];
        setTotalBatchCount(updated.length);
        return updated;
      });
    } catch (error) {
      console.error("Image pre-processing failed:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({ 
      onDrop, 
      disabled: isUploading || isCompressing,
      accept: { 'image/*': [], 'video/*': [] }
    });

  // ================= REMOVE INDIVIDUAL CARD (UX FIX) =================
  const removeFileFromQueue = (indexToRemove) => {
    if (isUploading) return;
    setFiles((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      setTotalBatchCount(updated.length);
      return updated;
    });
  };

  // ================= UPLOAD QUEUE ENGINE =================
  const handleUploadQueue = async (filesToUpload) => {
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

        setCompletedCount((prev) => prev + 1);
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        setProgress(0);

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
    handleUploadQueue(files);
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setTimeout(() => handleUploadQueue(files), 100); 
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
    <div className="relative max-w-3xl p-8 mx-auto border border-gray-100 shadow-2xl bg-white/80 backdrop-blur-lg rounded-3xl">

      {/* HEADER */}
      <div className="pb-4 mb-6 border-b border-gray-50">
        <span className="bg-orange-50 text-[#FE8521] border border-orange-100 text-[9px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-2 inline-block">
          Ingestion Node
        </span>
        <h2 className="text-2xl font-black text-[#015103] tracking-tight">
          Portfolio Upload Engine
        </h2>
      </div>

      {/* DROP AREA */}
      <div
        {...getRootProps()}
        className={`p-14 border-2 border-dashed rounded-2xl text-center transition duration-300 ${
          isUploading || isCompressing ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" :
          isDragActive
            ? "bg-orange-50/50 border-[#FE8521] scale-[0.99] shadow-inner"
            : "border-gray-200 hover:border-[#FE8521] hover:bg-orange-50/20 cursor-pointer shadow-2xs"
        }`}
      >
        <input {...getInputProps()} />
        {isCompressing ? (
          <div className="space-y-2">
            <div className="mx-auto flex h-6 w-6 animate-spin rounded-full border-2 border-[#FE8521] border-t-transparent" />
            <p className="text-sm font-bold tracking-tight text-gray-800">Optimizing Asset Arrays...</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-700">Drag & drop production assets here</p>
            {!isUploading && (
              <p className="text-xs font-semibold text-[#FE8521] bg-orange-50 inline-block px-2.5 py-0.5 rounded-full mt-1">or select local files</p>
            )}
          </div>
        )}
      </div>

      {/* INTERACTIVE PREVIEW TILES */}
      {files.length > 0 && !isCompressing && (
        <div className="grid grid-cols-3 gap-4 p-1 pb-6 mt-6 overflow-y-auto border-b max-h-60 border-gray-50">
          {files.map((file, i) => (
            <div
              key={i}
              className={`overflow-hidden bg-gray-50 rounded-xl relative border-2 aspect-square group shadow-xs transition ${
                isUploading && i === currentFileIndex ? "border-[#FE8521]" : "border-transparent"
              }`}
            >
              {file.type.startsWith("video") ? (
                <video src={URL.createObjectURL(file)} className="object-cover w-full h-full" />
              ) : (
                <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="Queue element" />
              )}
              
              {/* Individual queue clearance accent button */}
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => removeFileFromQueue(i)}
                  className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white transition rounded-full opacity-0 top-2 right-2 bg-black/60 hover:bg-red-600 group-hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PARAMETERS MATRIX SECTION */}
      <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
        <div>
          <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Main Category</label>
          <select
            disabled={isUploading || isCompressing}
            value={mainCategory}
            onChange={(e) => setMainCategory(e.target.value)}
            className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8521]/20 text-gray-700 disabled:bg-gray-50"
          >
            <option>Events</option>
            <option>Portrait</option>
            <option>Session</option>
            <option>Headshot</option>
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Sub Category</label>
          <select
            disabled={isUploading || isCompressing}
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8521]/20 text-gray-700 disabled:bg-gray-50"
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
      </div>

      {/* PROGRESS RUNTIME MONITOR */}
      {isUploading && (
        <div className="p-4 mt-6 border border-gray-100 bg-gray-50/60 rounded-2xl backdrop-blur-md">
          <div className="flex justify-between mb-1.5 text-xs font-semibold text-gray-600">
            <span>Streaming resource {completedCount + 1} of {totalBatchCount}</span>
            <span className="text-[#FE8521]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200/70">
            <div className="h-2 bg-[#FE8521] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          
          <button
            onClick={handleCancelAndClear}
            className="px-3 py-1.5 mt-3 text-xs font-bold text-red-600 transition rounded-xl bg-red-50 hover:bg-red-100"
          >
            ✕ Abort Active Pipeline Stream
          </button>
        </div>
      )}

      {/* MASTER ACTION DISPATCH ACTION BUTTON */}
      {!isUploading && !isCompressing && (
        <button
          onClick={startInitialUpload}
          disabled={files.length === 0}
          className="w-full p-4 mt-6 text-white rounded-xl bg-[#FE8521] hover:bg-[#e6761d] transition shadow-md font-bold text-xs tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.995]"
        >
          {completedCount > 0 ? `Resume Ingestion Loop (${files.length} Remaining)` : `Commit Assets Buffer (${files.length} Files)`}
        </button>
      )}

      {/* Success/Error Modals are kept completely active down here */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm p-8 text-center bg-white border shadow-2xl border-gray-50 rounded-3xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-50">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-black text-[#015103] tracking-tight">Upload Successful!</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-400">All cloud system directory updates completed with zero packet dropping.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full px-5 py-3 bg-[#FE8521] hover:bg-[#e6761d] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition shadow-md"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-3xl border-red-50">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-red-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-red-700">Upload Process Halted</h3>
            <div className="p-3.5 mt-2 text-xs text-left text-gray-500 border border-gray-100 bg-gray-50 rounded-2xl space-y-1 font-medium">
              <p>• Completed: <span className="font-bold text-green-600">{completedCount} saved successfully ✅</span></p>
              <p>• Current error: <span className="font-bold text-red-500">Failed at index {completedCount + 1}</span></p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleCancelAndClear} className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Stop & Clear</button>
              <button onClick={handleRetry} className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl transition shadow-md">🔄 Retry Now</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PortfolioUploader;