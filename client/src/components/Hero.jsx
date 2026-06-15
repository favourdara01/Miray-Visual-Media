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
      className="flex items-center min-h-screen px-6 overflow-hidden md:px-10 pt-28"
      style={{
        background:
          "linear-gradient(135deg, #041d05 0%, #0b260c 55%, #1a2e1a 100%)",
      }}
    >
      <div className="grid items-center w-full mx-auto gap-14 max-w-7xl md:grid-cols-2">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* SMALL LABEL */}
          <div className="inline-flex items-center px-4 py-2 mb-6 text-sm border rounded-full bg-white/10 border-white/10 backdrop-blur-md text-white/80">
            Miray Visual Media
          </div>

          {/* HEADING */}
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            <Typewriter
              options={{
                strings: [
                  "Capturing Moments That Tell Stories",
                  "Cinematic Visuals That Inspire",
                  "Photography. Videography. Reels.",
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </h1>

          {/* SUBTEXT */}
          <p className="max-w-xl mb-8 text-base leading-relaxed text-gray-300 md:text-lg">
            <span className="font-semibold text-[#FE8521]">
              Creative visuals
            </span>{" "}
            crafted with precision and cinematic storytelling
            for brands, events, weddings, and timeless memories.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-4">

            <button
              onClick={() => scrollTo("bookshoot")}
              className="bg-[#FE8521] text-white px-7 py-3 rounded-full font-semibold shadow-lg hover:scale-105 hover:bg-orange-500 transition duration-300"
            >
              Book a Session
            </button>

            <button
              onClick={() => scrollTo("portfolio")}
              className="px-7 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-[#015103] transition duration-300"
            >
              View Gallery
            </button>

          </div>
        </motion.div>

        {/* RIGHT SIDE - IMAGE GRID */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative hidden grid-cols-2 gap-5 md:grid"
        >

          {/* IMAGE 1 */}
          <motion.img
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            src= {hero1}
            className="object-cover w-full h-[420px] rounded-[28px] shadow-2xl border border-white/10 hover:scale-[1.03] transition duration-500"
          />

          {/* IMAGE 2 */}
          <motion.img
            animate={{ y: [0, 14, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            src={hero2}
            className="object-cover w-full h-[350px] mt-12 rounded-[28px] shadow-2xl border border-white/10 hover:scale-[1.03] transition duration-500"
          />

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;