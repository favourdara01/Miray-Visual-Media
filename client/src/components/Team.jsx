import { motion } from "framer-motion";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import mira from "/src/assets/mira.jpeg";
import favour from "/src/assets/favour.jpg";
import princess from "/src/assets/princess.jpg";
import team4 from "/src/assets/team4.jpg";

const teamMembers = [
  {
    id: 1,
    name: "Miracle John",
    role: "Creative Director",
    image: mira,
    instagram: "https://www.instagram.com/official_omininowest?igsh=MXJnMW5zZzZ4bzZwYw==",
    linkedin: "#",
  },
  {
    id: 2,
    name: "Favour Dara",
    role: "Photographer",
    image: favour,
    instagram: "https://www.instagram.com/favourdara01?igsh=ZHJwN3ZncDUyaHlp",
    linkedin: "#",
  },
  {
    id: 3,
    name: "Akinmoye Oluwaponmile",
    role: "Virtual Assistant",
    image: princess,
    instagram: "#",
    linkedin: "#",
  },
  {
    id: 4,
    name: "Daramola Samson",
    role: "Editor",
    image: team4,
    instagram: "#",
    linkedin: "#",
  },
];

const Team = () => {
  return (
    <section
      id="team"
      className="relative px-6 overflow-hidden py-28 md:px-10"
      style={{
        background:
          "linear-gradient(to bottom, #eef6ee 0%, #ffffff 60%, #f8faf8 100%)",
      }}
    >
      {/* SOFT BACKGROUND BLOBS */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#015103]/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#FE8521]/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-3">
            Our Team
          </p>

          <h2 className="text-4xl md:text-5xl font-semibold text-[#015103]">
            Meet The Creatives
          </h2>

          <p className="max-w-xl mx-auto mt-4 text-gray-500">
            A passionate team dedicated to turning moments into timeless visuals.
          </p>
        </motion.div>

        {/* TEAM GRID */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative overflow-hidden transition duration-500 border shadow-md group rounded-3xl bg-white/60 backdrop-blur-xl border-black/5 hover:shadow-2xl"
            >

              {/* IMAGE */}
              <div className="relative overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="object-cover w-full transition duration-500 h-72 group-hover:scale-110"
                />

                {/* GRADIENT OVERLAY (SOFT) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              </div>

              {/* CONTENT */}
              <div className="p-5 text-center">

                <h3 className="text-lg font-semibold text-[#015103]">
                  {member.name}
                </h3>

                <p className="text-sm text-[#FE8521] mt-1">
                  {member.role}
                </p>

                {/* SOCIALS */}
                <div className="flex justify-center gap-4 mt-4 transition duration-300 opacity-0 group-hover:opacity-100">
                  <a
                    href={member.instagram}
                    target="_blank"
                    className="p-2 rounded-full bg-[#FE8521]/10 hover:bg-[#FE8521] hover:text-white transition"
                  >
                    <FaInstagram />
                  </a>

                  <a
                    href={member.linkedin}
                    target="_blank"
                    className="p-2 rounded-full bg-[#015103]/10 hover:bg-[#015103] hover:text-white transition"
                  >
                    <FaLinkedin />
                  </a>
                </div>
              </div>

              {/* HOVER GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-[#FE8521]/10 to-[#015103]/10 pointer-events-none" />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Team;