import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const toggleMenu = () => setIsOpen(!isOpen);

  // ================= SCROLL DETECTION =================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = [
        "home",
        "about",
        "gallery",
        "team",
        "clients",
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

    return () => window.removeEventListener("scroll", handleScroll);
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
  };

  return (
    <>
      <nav
        className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-[#041d05]/80 shadow-lg"
            : "bg-[#041d05]"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">

          {/* LOGO */}
          <h1 className="text-xl font-bold tracking-wide text-white md:text-2xl">
            Miray Visual
          </h1>

          {/* DESKTOP MENU */}
          <ul className="items-center hidden gap-8 text-sm font-medium md:flex">

            {[
              "home",
              "about",
              "gallery",
              "team",
              "clients",
              "contact",
            ].map((section) => (
              <li
                key={section}
                onClick={() => scrollToSection(section)}
                className="relative transition cursor-pointer text-white/90 hover:text-[#FE8521]"
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}

                {/* ACTIVE INDICATOR */}
                {activeSection === section && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#FE8521] rounded-full" />
                )}
              </li>
            ))}

          </ul>

          {/* CLIENT LOGIN */}
          <Link
            to="/client/login"
            className="hidden md:flex items-center justify-center bg-[#FE8521] text-white px-5 py-2 rounded-full font-medium hover:bg-orange-600 transition"
          >
            Client Login
          </Link>

          {/* MOBILE ICON */}
          <div
            className="text-xl text-white cursor-pointer md:hidden"
            onClick={toggleMenu}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </nav>

      {/* MOBILE MENU - PUSHES CONTENT DOWN */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-[#041d05] ${
          isOpen ? "max-h-[500px] py-5" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-5 px-6 text-white">

          {[
            "home",
            "about",
            "gallery",
            "team",
            "clients",
            "contact",
          ].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`text-left transition ${
                activeSection === section
                  ? "text-[#FE8521]"
                  : "text-white"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}

          <Link
            to="/client/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center mt-2 bg-[#FE8521] py-3 rounded-full text-white font-medium"
          >
            Client Login
          </Link>

        </div>
      </div>
    </>
  );
}