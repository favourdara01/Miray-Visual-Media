import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Locks background window scrolling only while the drawer slider is active
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  // ================= SCROLL DETECTION MECHANISMS =================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = [
        "home",
        "about",
        "services",
        "team",
        "gallery",
        "pricing",
        "bookings",
        "contact",
      ];

      for (let sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop - 120;
          const bottom = top + el.offsetHeight;

          if (window.scrollY >= top && window.scrollY < bottom) {
            setActiveSection(sec);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset"; // Global memory leak cleanup wrapper safety
    };
  }, []);

  // ================= INTERACTIVE SCROLL NAVIGATION ROUTER =================
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  const navItems = [
    "home",
    "about",
    "services",
    "team",
    "gallery",
    "pricing",
    "bookings",
    "contact",
  ];

  return (
    <>
      <nav
        className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 select-none ${
          scrolled
            ? "backdrop-blur-xl bg-[#041d05]/85 border-b border-white/[0.04] py-3 shadow-xl"
            : "bg-[#041d05] py-5"
        }`}
      >
        <div className="flex items-center justify-between px-6 mx-auto max-w-7xl">
          
          {/* BASE LOGO */}
          <h1 
            onClick={() => scrollToSection("home")}
            className="text-xl font-black tracking-tight text-white cursor-pointer"
          >
            Miray<span className="text-[#FE8521]">.</span>Visual
          </h1>

          {/* DESKTOP/WIDE LAPTOP NAVIGATION HUB (Hides safely beneath 1024px breakpoints) */}
          <ul className="items-center hidden text-xs font-bold tracking-wider uppercase gap-7 lg:flex">
            {navItems.map((section) => (
              <li
                key={section}
                onClick={() => scrollToSection(section)}
                className={`relative transition-colors duration-200 cursor-pointer hover:text-[#FE8521] ${
                  activeSection === section ? "text-[#FE8521]" : "text-white/80"
                }`}
              >
                {section === "bookings" ? "Book Shoot" : section}

                {activeSection === section && (
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#FE8521] rounded-full" />
                )}
              </li>
            ))}
          </ul>

          {/* PRIVATE DESKTOP ACTION CLIENT LINK */}
          <Link
            to="/client/login"
            className="hidden lg:flex items-center justify-center bg-[#FE8521] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md hover:bg-orange-600 active:scale-[0.98] transition-all duration-200"
          >
            Client Login
          </Link>

          {/* HAMBURGER TRIGGER GATE (Kicks in cleanly for both mobile and tablet widths) */}
          <div
            className="relative z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-lg text-white cursor-pointer lg:hidden hover:bg-white/[0.08] transition"
            onClick={toggleMenu}
          >
            {isOpen ? <FaTimes className="text-orange-400" /> : <FaBars />}
          </div>
        </div>
      </nav>

      {/* ================= MINIMALISTIC MOBILE & TABLET SIDEBAR DRAWER PANEL ================= */}
      <div
        className={`fixed top-0 right-0 h-screen w-64 z-40 bg-[#031504]/95 backdrop-blur-2xl border-l border-white/[0.05] shadow-2xl p-6 pt-24 transition-transform duration-300 ease-out flex flex-col justify-between lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Core Nav Link Stack */}
        <div className="space-y-6">
          <p className="text-[9px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-2">
            Navigation Index
          </p>
          
          <div className="flex flex-col gap-1">
            {navItems.map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`py-2.5 text-xs font-black tracking-widest text-left uppercase transition-all duration-200 rounded-lg px-2 transform active:scale-98 ${
                  activeSection === section 
                    ? "text-[#FE8521] bg-white/[0.03]" 
                    : "text-white/80 hover:text-[#FE8521] hover:bg-white/[0.01]"
                }`}
              >
                {section === "bookings" ? "Book A Shoot" : section}
              </button>
            ))}
          </div>
        </div>

        {/* Action Panel Drawer Base */}
        <div className="pt-4 space-y-4 border-t border-white/5">
          <Link
            to="/client/login"
            onClick={() => {
              setIsOpen(false);
              document.body.style.overflow = "unset";
            }}
            className="flex items-center justify-center w-full bg-[#FE8521] py-3 rounded-xl text-white font-black tracking-widest uppercase text-[10px] shadow-lg active:scale-[0.99] transition"
          >
            Client Vault 🔑
          </Link>
          <p className="text-[8px] tracking-wider text-center text-white/20 uppercase font-bold">
            © Miray Visual Media
          </p>
        </div>
      </div>

      {/* BLACKDROP GLASS BLUR OUTSIDE CLICK DISMISSER MASK */}
      {isOpen && (
        <div 
          onClick={toggleMenu} 
          className="fixed inset-0 z-30 w-screen h-screen transition-all bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}
    </>
  );
}