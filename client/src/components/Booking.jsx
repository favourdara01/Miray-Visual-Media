import { useState } from "react";
import api from "../api/axios";
import bookin from "../assets/bookin.jpg";

export default function Booking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", // ✅ NEW: Captured safely on frontend layout
    service: "",
    date: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // ✅ Calculates the exact current day boundary parameters to disable historical calendar clicks
  const todayIsoString = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await api.post("/bookings", formData);

      setSuccess("Booking request delivered successfully 🎉");

      setFormData({
        name: "",
        email: "",
        phone: "",
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
        background: "linear-gradient(to bottom, #eef6ee 0%, #ffffff 60%, #f8faf8 100%)",
      }}
    >
      {/* SOFT BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[300px] h-[300px] bg-[#015103]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-[#FE8521]/10 blur-[120px]" />
      </div>

      <div className="grid items-stretch max-w-5xl gap-8 mx-auto md:grid-cols-12">
        
        {/* IMAGE SIDE FRAMING PANEL */}
        <div className="md:col-span-5 h-[320px] md:h-auto rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 hidden sm:block">
          <img
            src={bookin}
            alt="booking sessions"
            className="object-cover w-full h-full transition duration-700 hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#015103]/40 to-transparent pointer-events-none" />
        </div>

        {/* PREMIUM FORM INTERFACE GRAPHIC CONTAINER */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between p-8 space-y-5 border border-gray-100 shadow-2xl md:col-span-7 md:p-10 rounded-3xl bg-white/80 backdrop-blur-lg"
        >
          <div>
            <span className="bg-orange-50 text-[#FE8521] border border-orange-100 text-[9px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-3 inline-block">
              Reservations Room
            </span>
            <h2 className="text-3xl font-black text-[#015103] tracking-tight">
              Book a Session
            </h2>
            <p className="mt-1 text-xs font-medium text-gray-400">
              Tell us about your production vision — our team will handle the rest.
            </p>
          </div>

          <div className="space-y-4">
            {/* Input fields wrapped inside responsive sizing container cells */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 bg-white text-gray-700 placeholder-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 bg-white text-gray-700 placeholder-gray-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone Contact</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+234..."
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 bg-white text-gray-700 placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Target Appointment Date</label>
                <input
                  type="date"
                  name="date"
                  min={todayIsoString} // ✅ ENFORCED: Native block stops any past date coordinates from being clicked
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-3 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 bg-white text-gray-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Service Category</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full p-3 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#015103]/20 bg-white text-gray-700"
                required
              >
                <option value="">Select Service</option>
                <option>Wedding</option>
                <option>Birthday</option>
                <option>Branding</option>
                <option>Reels</option>
                <option>Others</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Project Brief Description</label>
              <textarea
                name="message"
                placeholder="Share your aesthetic directions or timeline ideas with us..."
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 text-sm font-medium rounded-xl border border-gray-200 h-24 focus:outline-none focus:ring-2 focus:ring-[#015103]/20 bg-white text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          {/* ACTION SUBMIT LOGISTICS CORE BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#FE8521] hover:bg-[#e6761d] transition-all duration-200 transform active:scale-[0.99] shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Transmitting Fields..." : "Commit Reservation"}
            </button>
          </div>

          {/* DYNAMIC SUCCESS OVERLAY INFRASTRUCTURE FEEDBACK MODAL FRAME */}
          {success && (
            <div className="p-3 text-xs font-semibold text-green-700 border border-green-100 bg-green-50 rounded-xl animate-fadeIn">
              {success}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}