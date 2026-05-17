import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { FaCamera, FaVideo, FaStar } from "react-icons/fa";
import about from "/src/assets/about.jpg";  

// ================= COUNT UP (ON VIEW) =================
const Counter = ({ target }) => {
  const [count, setCount] = useState(0);
  const [start, setStart] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const duration = 1500;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [start, target]);

  return <span ref={ref}>{count}+</span>;
};

const About = () => {
  return (
    <section
      id="about"
      className="px-6 py-24 text-black md:px-10 bg-gradient-to-br from-white via-gray-50 to-white"
    >
      <div className="mx-auto space-y-20 max-w-7xl">

        {/* ================= TOP ================= */}
        <div className="grid items-center md:grid-cols-2 gap-14">

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{
              y: -6,
              scale: 1.01,
              rotate: -0.5,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="relative group"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#015103]/10 to-[#FE8521]/10 blur-2xl scale-95 group-hover:scale-100 transition duration-500" />

            <img
              src={about}
              className="relative z-10 w-full h-[480px] object-cover rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition duration-500 group-hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)]"
            />

            {/* Floating Accent */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-5 -right-5 z-20 w-24 h-24 rounded-3xl bg-[#FE8521]/20 backdrop-blur-md border border-white/40"
            />

            {/* Small Floating Card */}
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute z-20 flex items-center gap-3 px-4 py-3 bg-white shadow-xl top-6 -left-4 rounded-2xl"
            >
              <div className="p-2 text-white rounded-xl bg-[#015103]">
                <FaCamera />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Professional Media
                </p>
                <h4 className="text-sm font-semibold text-[#015103]">
                  Cinematic Quality
                </h4>
              </div>
            </motion.div>
          </motion.div>

          {/* TEXT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm font-medium rounded-full bg-[#015103]/10 text-[#015103]">
              
              About Miray Visuals Media
            </div>

            <h2 className="text-3xl font-bold leading-tight text-[#015103] md:text-5xl mb-6">
              Turning Moments Into
              <span className="text-[#FE8521]"> Timeless Visual Stories</span>
            </h2>

            <p className="mb-6 text-lg leading-relaxed text-gray-600">
              At{" "}
              <span className="font-semibold text-[#015103]">
                Miray Visuals Media
              </span>
              , we capture moments with creativity, precision, and cinematic
              storytelling — transforming ordinary scenes into unforgettable
              experiences.
            </p>

            <p className="mb-5 leading-relaxed text-gray-700">
              We specialize in premium photography, videography, and reels
              production for weddings, brands, events, and personal moments.
            </p>

            <p className="mb-8 leading-relaxed text-gray-700">
              Every frame is carefully crafted to preserve emotions,
              authenticity, and beauty that lasts forever.
            </p>

            {/* MINI FEATURES */}
            <div className="grid gap-4 sm:grid-cols-2">

              <div className="flex items-start gap-3 p-4 transition bg-white border shadow-md rounded-2xl hover:-translate-y-1 hover:shadow-lg">
                <div className="p-3 text-white rounded-xl bg-[#015103]">
                  <FaCamera />
                </div>

                <div>
                  <h4 className="font-semibold text-[#015103]">
                    Photography
                  </h4>
                  <p className="text-sm text-gray-500">
                    Clean, cinematic and emotional imagery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 transition bg-white border shadow-md rounded-2xl hover:-translate-y-1 hover:shadow-lg">
                <div className="p-3 text-white rounded-xl bg-[#FE8521]">
                  <FaVideo />
                </div>

                <div>
                  <h4 className="font-semibold text-[#015103]">
                    Videography
                  </h4>
                  <p className="text-sm text-gray-500">
                    Story-driven visuals with premium editing.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* ================= STATS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-6 text-center md:grid-cols-4"
        >

          {[
            { value: 500, label: "Projects", color: "#FE8521" },
            { value: 250, label: "Happy Clients", color: "#015103" },
            { value: 5, label: "Years Experience", color: "#FE8521" },
            { value: 800, label: "Media Delivered", color: "#015103" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden bg-white border shadow-lg p-7 md:p-10 rounded-3xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#FE8521]/10 blur-2xl" />

              <h3
                className="relative z-10 text-4xl font-bold md:text-5xl"
                style={{ color: stat.color }}
              >
                <Counter target={stat.value} />
              </h3>

              <p className="relative z-10 mt-3 text-base text-gray-600">
                {stat.label}
              </p>
            </motion.div>
          ))}

        </motion.div>

      </div>
    </section>
  );
};

export default About;