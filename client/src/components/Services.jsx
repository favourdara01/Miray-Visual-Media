import { FaCameraRetro, FaVideo, FaRing, FaBirthdayCake } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Services() {
  const services = [
    {
      title: "Photography",
      description:
        "Capturing timeless moments with precision, emotion, and artistic direction.",
      icon: FaCameraRetro,
    },
    {
      title: "Videography",
      description:
        "Cinematic storytelling that transforms your moments into visual experiences.",
      icon: FaVideo,
    },
    {
      title: "Wedding Shoots",
      description:
        "Elegant wedding coverage preserving every emotion and detail beautifully.",
      icon: FaRing,
    },
    {
      title: "Content Creation",
      description:
        "Vibrant and memorable contents tailored to your celebration.",
      icon: FaBirthdayCake,
    },
  ];

  return (
    <section
      id="services"
      className="relative px-6 py-32 overflow-hidden text-[#111]"
      style={{
        background:
          "linear-gradient(to bottom, #eef6ee 0%, #ffffff 60%, #f8faf8 100%)",
      }}
    >
      {/* 🌈 SOFT BACKGROUND BLOBS */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#015103]/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#FE8521]/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-4">
            What We Do
          </p>

          <h2 className="text-4xl font-semibold md:text-5xl">
            Our Creative Services
          </h2>

          <p className="max-w-xl mx-auto mt-4 text-gray-500">
            We blend creativity, storytelling, and technical expertise to deliver
            premium visual experiences.
          </p>
        </motion.div>

        {/* ================= CARDS ================= */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative p-8 transition border shadow-sm group rounded-2xl border-black/5 bg-white/60 backdrop-blur-xl hover:shadow-xl"
              >
                {/* hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-[#FE8521]/10 to-[#015103]/10" />

                {/* ICON */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-[#015103]/10 group-hover:bg-[#FE8521]/20 transition">
                    <Icon
                      size={28}
                      className="text-[#015103] group-hover:text-[#FE8521] transition"
                    />
                  </div>
                </div>

                {/* TEXT */}
                <h3 className="mb-3 text-lg font-semibold text-center">
                  {service.title}
                </h3>

                <p className="text-sm leading-relaxed text-center text-gray-500">
                  {service.description}
                </p>

                {/* subtle bottom line */}
                <div className="mt-6 h-[2px] w-0 group-hover:w-full bg-[#FE8521] transition-all duration-500 mx-auto" />
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}