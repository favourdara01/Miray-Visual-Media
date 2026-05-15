import { useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";

import {
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaHome,
  FaImages,
  FaCalendarAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const subscribe = async () => {
    if (!email) return;

    await api.post("/subscribe", { email });
    setMsg("Subscribed ✨");
    setEmail("");
  };

  // smooth scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 70,
        behavior: "smooth",
      });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <footer
      className="relative pt-20 pb-10 overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(to bottom, #0b2e1a 0%, #015103 50%, #0b2e1a 100%)",
      }}
    >
      {/* SOFT GLOW BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] bg-[#FE8521]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-white/10 blur-[120px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="px-6 mx-auto max-w-7xl"
      >

        <div className="grid gap-12 md:grid-cols-3">

          {/* BRAND */}
          <motion.div variants={item}>
            <h2 className="text-3xl font-bold">
              Miray Visual Media
            </h2>

            <p className="mt-3 leading-relaxed text-white/80">
              We craft cinematic visuals that tell your story with emotion,
              precision, and timeless creativity.
            </p>

            {/* SOCIALS */}
            <div className="flex gap-4 mt-6">

              {[FaInstagram, FaWhatsapp, FaTiktok].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="p-3 rounded-full bg-white/10 hover:bg-[#FE8521] transition"
                >
                  <Icon />
                </motion.a>
              ))}

            </div>
          </motion.div>

          {/* LINKS */}
          <motion.div variants={item}>
            <h3 className="mb-4 text-xl font-semibold">
              Explore
            </h3>

            <ul className="space-y-4 text-white/80">

              <li
                onClick={() => scrollToSection("home")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <FaHome className="group-hover:text-[#FE8521]" />
                <span className="group-hover:text-[#FE8521] transition">
                  Home
                </span>
              </li>

              <li
                onClick={() => scrollToSection("gallery")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <FaImages className="group-hover:text-[#FE8521]" />
                <span className="group-hover:text-[#FE8521] transition">
                  Gallery
                </span>
              </li>

              <li
                onClick={() => scrollToSection("bookshoot")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <FaCalendarAlt className="group-hover:text-[#FE8521]" />
                <span className="group-hover:text-[#FE8521] transition">
                  Book a Shoot
                </span>
              </li>

              <li
                onClick={() => scrollToSection("contact")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <FaEnvelope className="group-hover:text-[#FE8521]" />
                <span className="group-hover:text-[#FE8521] transition">
                  Contact
                </span>
              </li>

            </ul>
          </motion.div>

          {/* NEWSLETTER */}
          <motion.div variants={item}>
            <h3 className="mb-4 text-xl font-semibold">
              Stay Inspired
            </h3>

            <p className="mb-4 text-white/80">
              Get updates, behind-the-scenes shots, and creative inspiration.
            </p>

            <div className="flex gap-2">

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/60 backdrop-blur border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/40"
              />

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={subscribe}
                className="px-5 rounded-xl bg-[#FE8521] font-semibold hover:opacity-90 transition"
              >
                Join
              </motion.button>

            </div>

            {msg && (
              <p className="mt-3 text-sm text-green-300">{msg}</p>
            )}
          </motion.div>

        </div>

        {/* BOTTOM */}
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-between pt-6 mt-10 text-sm border-t border-white/10 md:flex-row text-white/60"
        >
          <p>© {new Date().getFullYear()} Miray Visual Media</p>

          {/* YOUR CREDIT */}
          <p className="mt-2 md:mt-0">
            Built by <span className="text-[#FE8521] font-semibold">FavourDara</span> ✨
          </p>
        </motion.div>

      </motion.div>
    </footer>
  );
}