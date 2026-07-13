import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ ALL FRAGILE MP4 IMPORTS REMOVED FROM THIS TOP AREA!

// Array map using clean, static absolute paths pointing to your public folder
const CINEMATIC_VIDEOS = [
  {
    id: "v1",
    url: "/reel1.mp4", // Points to public/reel1.mp4
    title: "Cinematic Event",
    tag: "Cinematic Reel"
  },
  {
    id: "v2",
    url: "/videos/forever.mp4", // Points to public/videos/forever.mp4 (or wherever you placed it inside public)
    title: "Forever Moments",
    tag: "Wedding Highlights"
  }
];

const TESTIMONIALS = [
  {
    id: "t1",
    name: "Amina Bello",
    role: "Bride",
    text: "Miray Visual didn't just take pictures; they captured the exact feeling of our wedding day. Every time I open our gallery, I'm brought to tears. Truly exceptional work!",
  },
  {
    id: "t2",
    name: "Tunde Bakare",
    role: "Corporate Client",
    text: "The speed of the automated studio delivery system combined with the immaculate quality of the headshots makes them our permanent production partner in Lagos.",
  },
  {
    id: "t3",
    name: "Chidi Okafor",
    role: "Studio Session Client",
    text: "Professional, premium, and seamless. The web client dashboard made selecting and downloading our family portraits incredibly effortless.",
  }
];

export default function VideoAndTestimonialSuite() {
  const [activeVideo, setActiveVideo] = useState(CINEMATIC_VIDEOS[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-16 space-y-24 bg-white">
      
      {/* ======================================================== */}
      {/* 1. CINEMATIC VIDEO LOOPS SECTION                          */}
      {/* ======================================================== */}
      <section className="max-w-6xl px-6 mx-auto">
        <div className="pb-5 mb-8 border-b border-gray-50">
          <span className="bg-orange-50 text-[#FE8521] border border-orange-100 text-[10px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-3 inline-block">
            Motion Pictures
          </span>
          <h2 className="text-3xl font-extrabold text-[#015103] tracking-tight">
            Cinematic Showcases
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400">
            Dynamic visual stories filmed, compiled, and rendered to capture true atmosphere.
          </p>
        </div>

        <div className="grid items-stretch grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Large Immersive Player */}
          <div className="relative overflow-hidden border border-gray-100 shadow-xl lg:col-span-2 aspect-video bg-gray-950 rounded-3xl">
            <video
              key={activeVideo.id}
              src={activeVideo.url}
              autoPlay
              muted
              loop // 🔥 Forces the loop configuration natively
              playsInline
              preload="auto" // 🚀 Caches video segments in background memory layers to prevent local lag stalls
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            <div className="absolute text-white bottom-6 left-6 right-6">
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#FE8521] bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
                {activeVideo.tag}
              </span>
              <h3 className="mt-2 text-xl font-bold tracking-tight">{activeVideo.title}</h3>
            </div>
          </div>

          {/* Playlist Selection Column */}
          <div className="flex flex-col justify-center gap-4 lg:col-span-1">
            <p className="px-2 text-xs font-bold tracking-wider text-gray-400 uppercase">Select Motion Clip</p>
            {CINEMATIC_VIDEOS.map((video) => {
              const isActive = video.id === activeVideo.id;
              return (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`w-full p-4 rounded-2xl border text-left transition duration-300 transform active:scale-[0.99] ${
                    isActive
                      ? "bg-orange-50/50 border-[#FE8521] shadow-sm"
                      : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
                  }`}
                >
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-[#FE8521]" : "text-gray-400"}`}>
                    {video.tag}
                  </p>
                  <h4 className="mt-1 text-sm font-bold tracking-tight text-gray-800">{video.title}</h4>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. PRO TESTIMONIALS CAROUSEL                            */}
      {/* ======================================================== */}
      <section 
        className="py-20 shadow-inner border-y border-gray-100/60"
        style={{ background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)" }}
      >
        <div className="max-w-4xl px-6 mx-auto text-center">
          <span className="bg-white text-[#015103] border border-gray-100 text-[10px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-4 inline-block shadow-xs">
            Client Words
          </span>
          <h2 className="text-3xl font-black text-[#015103] tracking-tight mb-12">
            Trusted by Beautiful Souls
          </h2>

          <div className="relative min-h-[180px] md:min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="max-w-2xl mx-auto"
              >
                <span className="text-4xl text-[#FE8521]/30 font-serif block mb-2">“</span>
                <p className="text-base italic font-medium leading-relaxed text-gray-700 md:text-lg">
                  {TESTIMONIALS[currentIndex].text}
                </p>
                
                {/* ✅ Avatar img element has been removed cleanly, centering text alignments perfectly */}
                <div className="mt-5 text-center">
                  <p className="text-sm font-bold tracking-tight text-gray-900">
                    {TESTIMONIALS[currentIndex].name}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {TESTIMONIALS[currentIndex].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  i === currentIndex ? "w-6 bg-[#FE8521]" : "w-1.5 bg-gray-200"
                }`}
                title={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}