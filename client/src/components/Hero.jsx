import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";
import hero1 from "/src/assets/hero1.jpg";
import hero2 from "/src/assets/hero2.jpg";

const Hero = () => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section
      id="home"
      className="relative flex items-center min-h-screen px-6 pt-32 pb-16 overflow-hidden md:px-10"
      style={{
        background:
          "linear-gradient(135deg, #021203 0%, #061c07 45%, #0d220e 100%)",
      }}
    >
      {/* LUXURY CINEMATIC AMBIENT LIGHT FLOOD */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#FE8521]/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/5 blur-[130px] rounded-full" />
      </div>

      <div className="grid items-center w-full gap-12 mx-auto max-w-7xl lg:grid-cols-12">
        
        {/* ================= LEFT CONTENT COLUMN ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-left lg:col-span-7"
        >
          {/* SMALL INSIGHT BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest text-white/90 uppercase border rounded-xl bg-white/[0.04] border-white/10 backdrop-blur-md shadow-xl">
            <span className="w-1.5 h-1.5 bg-[#FE8521] rounded-full animate-pulse" />
            Premium Studio Experience
          </div>

          {/* SPLIT TYPEWRITER HEADER */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]">
            <span className="block mb-2 md:inline md:mr-3">We Craft</span>
            <span className="inline-block text-[#FE8521] border-b-2 border-transparent">
              <Typewriter
                options={{
                  strings: [
                    "Cinematic Reels.",
                    "Timeless Stories.",
                    "Immaculate Portraits.",
                    "Visual Inspiration.",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 60,
                  deleteSpeed: 40,
                  wrapperClassName: "text-[#FE8521] font-black",
                  cursorClassName: "text-[#FE8521] font-light animate-pulse",
                }}
              />
            </span>
          </h1>

          {/* DESCRIPTIVE BODY BLOCK */}
          <p className="max-w-xl text-base font-medium leading-relaxed text-white/70 md:text-lg">
            High-end visual profiles crafted with technical precision and cinematic composition 
            for premium brands, destination events, and iconic portraiture matrices.
          </p>

          {/* ================= INTERACTION HUB (FIXED MOBILE SIZES) ================= */}
          {/* Forces a true row layout with zero full-screen width bloating on compact devices */}
          <div className="flex flex-row flex-wrap items-center w-auto gap-3 pt-2">
            <button
              onClick={() => scrollTo("bookshoot")}
              className="w-auto px-6 py-3.5 bg-[#FE8521] text-white rounded-xl text-xs font-black tracking-widest uppercase shadow-xl hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
            >
              Book a Session
            </button>

            <button
              onClick={() => scrollTo("gallery")}
              className="w-auto px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md text-white text-xs font-black tracking-widest uppercase hover:bg-white hover:text-[#041d05] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
            >
              View Gallery
            </button>
          </div>
        </motion.div>

        {/* ================= RIGHT PICTURE MATRIX COLUMN ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative grid grid-cols-2 gap-4 mt-6 lg:col-span-5 lg:mt-0"
        >
          {/* PHOTO COMPONENT GRID 1 */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="overflow-hidden rounded-2xl md:rounded-[28px] shadow-2xl border border-white/5 bg-white/[0.02] aspect-[3/4] lg:aspect-auto lg:h-[430px]"
          >
            <img
              src={hero1}
              alt="Miray Production Grid Asset"
              loading="eager"
              className="object-cover w-full h-full pointer-events-none hover:scale-[1.03] transition duration-700 ease-out"
            />
          </motion.div>

          {/* PHOTO COMPONENT GRID 2 */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="overflow-hidden rounded-2xl md:rounded-[28px] shadow-2xl border border-white/5 bg-white/[0.02] aspect-[3/4] lg:aspect-auto lg:h-[370px] mt-8 lg:mt-12"
          >
            <img
              src={hero2}
              alt="Miray Cinematic Portraiture"
              loading="eager"
              className="object-cover w-full h-full pointer-events-none hover:scale-[1.03] transition duration-700 ease-out"
            />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;