import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Lock background scrolling when the immersive full-screen menu overlay is active
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  // ================= SCROLL DETECTION =================
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
      document.body.style.overflow = "unset"; // Safety cleanup
    };
  }, []);

  // ================= SCROLL FUNCTION =================
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
          
          {/* LOGO */}
          <h1 
            onClick={() => scrollToSection("home")}
            className="text-xl font-black tracking-tight text-white cursor-pointer md:text-2xl"
          >
            Miray<span className="text-[#FE8521]">.</span>Visual
          </h1>

          {/* DESKTOP/WIDE LAPTOP MENU (Shifted to lg: to prevent medium screen crowding) */}
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

                {/* SLICK ACTIVE LINE TRANSITION */}
                {activeSection === section && (
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#FE8521] rounded-full" />
                )}
              </li>
            ))}
          </ul>

          {/* CLIENT ACCESS ACTION NODE */}
          <Link
            to="/client/login"
            className="hidden lg:flex items-center justify-center bg-[#FE8521] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md hover:bg-orange-600 active:scale-[0.98] transition-all duration-200"
          >
            Client Login
          </Link>

          {/* HAMBURGER TRIGGER GATE (Visible on both mobile and tablet widths) */}
          <div
            className="relative z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-lg text-white cursor-pointer lg:hidden hover:bg-white/[0.08] transition"
            onClick={toggleMenu}
          >
            {isOpen ? <FaTimes className="text-orange-400" /> : <FaBars />}
          </div>
        </div>
      </nav>

      {/* ================= PREMIUM FULL-SCREEN OVERLAY MENU ================= */}
      <div
        className={`fixed inset-0 z-40 lg:hidden flex flex-col justify-between bg-[#041d05]/95 backdrop-blur-2xl transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Nav Links Stack Container */}
        <div className="flex flex-col justify-center flex-grow px-8 pt-24 space-y-5">
          <p className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-2">
            Navigation Partition
          </p>
          
          <div className="flex flex-col gap-3">
            {navItems.map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-2xl font-black tracking-tight text-left uppercase transition-all duration-200 transform active:scale-95 ${
                  activeSection === section ? "text-[#FE8521] pl-2" : "text-white hover:text-[#FE8521]"
                }`}
              >
                {section === "bookings" ? "Book A Shoot" : section}
              </button>
            ))}
          </div>
        </div>

        {/* Immersive Fixed Bottom Drawer Sheet */}
        <div className="p-8 space-y-4 border-t border-white/5 bg-black/20">
          <Link
            to="/client/login"
            onClick={() => {
              setIsOpen(false);
              document.body.style.overflow = "unset";
            }}
            className="flex items-center justify-center w-full bg-[#FE8521] py-4 rounded-xl text-white font-bold tracking-wider uppercase text-sm shadow-xl active:scale-[0.99] transition"
          >
            Access Private Vault Gallery 🔑
          </Link>
          <p className="text-[10px] text-center text-white/30">
            © {new Date().getFullYear()} Miray Visual Media Premium Studio Platform
          </p>
        </div>
      </div>
    </>
  );
}