import { motion } from "framer-motion";

export default function Pricing() {
  const plans = [
    {
      title: "Portrait Session",
      price: "₦40k – ₦110k",
      desc: "Perfect for personal shoots, branding, and lifestyle moments.",
      features: [
        "30 mins – 2 hours session",
        "3 – 9 edited photos",
        "1 – 3 outfit changes",
        "Professional retouching",
      ],
    },
    {
      title: "Event Coverage",
      price: "₦120k – ₦250k",
      desc: "Capture every moment from your special events.",
      features: [
        "2 – 8 hours coverage",
        "100 – 350 edited photos",
        "Highlight video included",
        "Full event storytelling",
      ],
    },
    {
      title: "Wedding Package",
      price: "₦180k – ₦900k",
      desc: "A complete cinematic wedding experience.",
      popular: true,
      features: [
        "Pre-wedding shoot",
        "1 – 2 days coverage",
        "Photography + Videography",
        "Drone coverage",
        "Photobook + Frame",
        "Flash drive delivery",
      ],
    },
    {
      title: "Videography",
      price: "₦100k – ₦1M+",
      desc: "High-quality video production for all needs.",
      features: [
        "Long-form video",
        "Highlight video",
        "Music videos",
        "Short films",
        "Flash drive delivery",
      ],
    },
  ];

  // ✅ SCROLL FUNCTION
  const handleBookNow = () => {
    const section = document.getElementById("bookshoot");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="pricing"
      className="px-6 py-28"
      style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-20 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-3">
            Pricing
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-[#015103]">
            Flexible Packages For Every Moment
          </h2>

          <p className="max-w-xl mx-auto mt-4 text-gray-500">
            Choose a package that fits your vision. Every shoot is crafted
            with creativity, precision, and storytelling.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-2xl p-8 border transition-all duration-500 cursor-pointer hover:shadow-xl hover:-translate-y-1
                ${
                  plan.popular
                    ? "bg-[#015103] text-white border-[#015103] shadow-xl scale-[1.03]"
                    : "bg-white text-gray-800 border-gray-200"
                }
              `}
            >

              <div className="relative z-10">

                {/* POPULAR BADGE */}
                {plan.popular && (
                  <span className="absolute -top-3 right-4 bg-[#FE8521] text-white text-xs px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}

                {/* TITLE */}
                <h3 className="mb-2 text-xl font-semibold">
                  {plan.title}
                </h3>

                {/* PRICE */}
                <p className="text-2xl font-bold mb-4 text-[#FE8521]">
                  {plan.price}
                </p>

                {/* DESC */}
                <p className="mb-6 text-sm opacity-80">
                  {plan.desc}
                </p>

                {/* FEATURES */}
                <ul className="mb-8 space-y-3 text-sm">
                  {plan.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>

                {/* BUTTON */}
                <button
                  onClick={handleBookNow}
                  className={`w-full py-2 rounded-lg font-medium transition
                    ${
                      plan.popular
                        ? "bg-[#FE8521] text-white hover:opacity-90"
                        : "bg-[#015103] text-white hover:opacity-90"
                    }
                  `}
                >
                  Book Now
                </button>

              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}