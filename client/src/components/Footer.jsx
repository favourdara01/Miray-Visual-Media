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
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (!email) return;
    try {
      setLoading(true);
      await api.post("/subscribe", { email });
      setMsg("Subscribed perfectly ✨");
      setEmail("");
    } catch (err) {
      setMsg("Network connection error.");
    } finally {
      setLoading(false);
    }
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
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <footer
      className="relative pt-24 pb-12 overflow-hidden text-white border-t select-none border-white/5"
      style={{
        background:
          "linear-gradient(to bottom, #072213 0%, #013702 50%, #001f01 100%)",
      }}
    >
      {/* 🌌 CINEMATIC ULTRA-GLOW LIGHT SHARDS */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FE8521]/15 blur-[160px] rounded-full animate-pulse duration-[8s]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[450px] h-[450px] bg-emerald-500/10 blur-[140px] rounded-full" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="px-6 mx-auto max-w-7xl"
      >
        <div className="grid gap-16 pb-16 lg:grid-cols-12">
          
          {/* ================= BRAND BOX ================= */}
          <motion.div variants={item} className="space-y-6 lg:col-span-5">
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Miray<span className="text-[#FE8521]">.</span>Visual
              </h2>
              <div className="w-12 h-[2px] bg-[#FE8521] rounded-full" />
            </div>

            <p className="max-w-md text-base font-medium leading-relaxed text-white/70">
              We craft deep cinematic visual profiles that translate raw event layers, 
              portraits, and motion showcases into timeless creative archives.
            </p>

            {/* SOCIAL MEDIA HOVER MAP */}
            <div className="flex gap-3 pt-2">
              {[
                { Icon: FaInstagram, url: "https://instagram.com" },
                { Icon: FaWhatsapp, url: "https://wa.me" },
                { Icon: FaTiktok, url: "https://tiktok.com" }
              ].map(({ Icon, url }, i) => (
                <motion.a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 hover:text-white hover:bg-[#FE8521] hover:border-[#FE8521] shadow-lg transition-all duration-300"
                >
                  <Icon className="text-lg" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ================= LINKS MAP ================= */}
          <motion.div variants={item} className="space-y-6 sm:col-span-6 lg:col-span-3">
            <h3 className="text-sm font-black tracking-widest text-[#FE8521] uppercase">
              Explore Partition
            </h3>

            <ul className="space-y-4 text-base font-semibold text-white/60">
              {[
                { label: "Home", id: "home", Icon: FaHome },
                { label: "Studio Gallery", id: "gallery", Icon: FaImages },
                { label: "Book a Shoot", id: "bookshoot", Icon: FaCalendarAlt },
                { label: "Contact Terminal", id: "contact", Icon: FaEnvelope }
              ].map(({ label, id, Icon }) => (
                <li
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="flex items-center gap-3 transition-colors duration-200 cursor-pointer group hover:text-white"
                >
                  <Icon className="text-sm text-white/30 group-hover:text-[#FE8521] transition-colors duration-200" />
                  <span className="relative py-0.5">
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FE8521] transition-all duration-300 group-hover:w-full" />
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ================= NEWSLETTER FORM ================= */}
          <motion.div variants={item} className="space-y-6 sm:col-span-6 lg:col-span-4">
            <div className="space-y-2">
              <h3 className="text-sm font-black tracking-widest text-[#FE8521] uppercase">
                Stay Inspired
              </h3>
              <p className="text-sm font-medium text-white/60">
                Get behind-the-scenes delivery notes, optimization updates, and studio drops.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur focus-within:border-[#FE8521]/50 focus-within:ring-2 focus-within:ring-[#FE8521]/10 transition-all duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full py-2 pl-4 pr-2 text-sm text-white bg-transparent placeholder-white/40 focus:outline-none"
                />

                <motion.button
                  whileHover={{ opacity: 0.95 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={subscribe}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#FE8521] text-xs font-bold tracking-wider uppercase text-white shadow-md select-none transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? "..." : "Join"}
                </motion.button>
              </div>

              {msg && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-bold px-1 ${msg.includes("✨") ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {msg}
                </motion.p>
              )}
            </div>
          </motion.div>

        </div>

        {/* ================= COPYRIGHT LOG FOOTER BOUNDARY ================= */}
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-between pt-8 text-xs font-medium border-t border-white/[0.06] md:flex-row text-white/40 gap-4"
        >
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p>© {new Date().getFullYear()} Miray Visual Media Inc.</p>
            <p className="text-[10px] text-white/20 font-normal">
              🔒 Standard essential session data keys active. No third-party tracking pixels injected.
            </p>
          </div>

          {/* PRIVACY EXPLANATION TERMINAL & DEVELOPER FOOTPRINT */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => alert("Miray Visual uses strictly necessary authorization cookies to manage secure profile validations and dashboard logs safely. We collect zero tracking data.")}
              className="hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-white/10 hover:decoration-[#FE8521]"
            >
              Privacy Policy
            </button>
            
            <p className="tracking-wide">
              Built by <span className="text-[#FE8521] font-bold hover:text-white transition-colors duration-200">FavourDara</span>
            </p>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
}