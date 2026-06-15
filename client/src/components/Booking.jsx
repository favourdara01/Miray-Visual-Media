import { useState } from "react";
import api from "../api/axios";
import bookin from "../assets/bookin.jpg";

export default function Booking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    date: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await api.post("/bookings", formData);

      setSuccess("Booking sent successfully 🎉");

      setFormData({
        name: "",
        email: "",
        service: "",
        date: "",
        message: "",
      });

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="bookshoot"
      className="relative px-6 py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #eef6ee 0%, #ffffff 60%, #f8faf8 100%)",
      }}
    >
      {/* SOFT BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] bg-[#015103]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#FE8521]/10 blur-[120px]" />
      </div>

      <div className="grid items-center max-w-6xl gap-12 mx-auto md:grid-cols-2">

        {/* IMAGE SIDE */}
        <div className="h-[500px] rounded-3xl overflow-hidden shadow-xl">
          <img
            src={bookin}
            alt="booking"
            className="object-cover w-full h-full transition duration-700 hover:scale-105"
          />
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5 border shadow-xl rounded-3xl border-black/5 bg-white/60 backdrop-blur-xl"
        >

          <div className="mb-4">
            <h2 className="text-3xl font-bold text-[#015103]">
              Book a Session
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tell us about your shoot — we’ll handle the rest.
            </p>
          </div>

          <input
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/40"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/40"
            required
          />

          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#015103]/30"
            required
          >
            <option value="">Select Service</option>
            <option>Wedding</option>
            <option>Birthday</option>
            <option>Branding</option>
            <option>Reels</option>
            <option>Others</option>
          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/40"
            required
          />

          <textarea
            name="message"
            placeholder="Tell us more about your vision..."
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 h-28 focus:outline-none focus:ring-2 focus:ring-[#015103]/30"
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#FE8521] hover:scale-[1.02] transition shadow-lg disabled:opacity-60"
          >
            {loading ? "Sending..." : "Book Now"}
          </button>

          {/* SUCCESS */}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-xl">
              {success}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

