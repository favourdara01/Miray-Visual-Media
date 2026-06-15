import { useState } from "react";
import api from "../api/axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await api.post("/contact", form);

      setSuccess("Message sent successfully ✨");

      setForm({ name: "", email: "", message: "" });

      setTimeout(() => setSuccess(""), 5000);
    } catch {
      alert("Error sending message");
    }

    setLoading(false);
  };

  return (
    <section
      id="contact"
      className="relative px-6 py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #eef6ee 0%, #ffffff 60%, #f8faf8 100%)",
      }}
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] bg-[#015103]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#FE8521]/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#015103]">
            Let’s Create Something Beautiful
          </h2>

          <p className="max-w-xl mx-auto mt-3 text-gray-500">
            Got an idea? A shoot? A vision? Let’s bring it to life together.
          </p>
        </div>

        <div className="grid items-stretch gap-10 md:grid-cols-2">

          {/* FORM CARD */}
          <form
            onSubmit={handleSubmit}
            className="p-8 space-y-4 border shadow-xl rounded-3xl border-black/5 bg-white/60 backdrop-blur-xl"
          >
            <input
              placeholder="Your Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/40"
            />

            <input
              placeholder="Email Address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/40"
            />

            <textarea
              placeholder="Tell us about your shoot..."
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              className="w-full h-32 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#015103]/30"
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-[#FE8521] hover:scale-[1.02] transition shadow-lg disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {success && (
              <p className="p-3 text-sm text-green-700 bg-green-100 rounded-xl">
                {success}
              </p>
            )}
          </form>

          {/* MAP CARD (UPDATED TO LAGOS, NIGERIA) */}
          <div className="overflow-hidden border shadow-xl rounded-3xl border-black/5">
            <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.4631061732!2d3.1191410145265552!3d6.548376798031201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m5!1s0x103b8b2ae68280c1%3A0xdc9e87a3da9c4a01!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              className="w-full h-full min-h-[420px] border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  );
}