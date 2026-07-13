import { useState } from "react";
import api from "../api/axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛡️ FRONTEND INPUT VALIDATION
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ type: "error", message: "Please fill out all fields before sending." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/contact", form);
      setStatus({ type: "success", message: "Message sent successfully! ✨ Check your admin feed." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Could not reach the server. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative px-6 py-24 overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(to bottom, #eef6ee 0%, #ffffff 60%, #f8faf8 100%)",
      }}
    >
      {/* BACKGROUND GLOWS */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] bg-[#015103]/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[350px] h-[350px] bg-[#FE8521]/5 blur-[130px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* HEADER SECTION */}
        <div className="mb-16 space-y-3 text-center">
          <span className="text-[#FE8521] text-xs font-black tracking-widest uppercase">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#015103] tracking-tight">
            Let’s Create Something Beautiful
          </h2>
          <div className="w-12 h-[3px] bg-[#FE8521] mx-auto rounded-full mt-4" />
          <p className="max-w-xl mx-auto text-sm font-medium text-gray-400">
            Got an idea, a production project, or a creative vision? Drop a transmission and let's craft an archive together.
          </p>
        </div>

        <div className="grid items-stretch gap-10 md:grid-cols-2">
          
          {/* ================= FORM SIDE ================= */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between p-8 space-y-4 border shadow-xl rounded-3xl border-black/5 bg-white/70 backdrop-blur-xl"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amina Bello"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3.5 text-sm rounded-xl border border-gray-200 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-1">Email Address</label>
                <input
                  type="email"
                  placeholder="amina@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3.5 text-sm rounded-xl border border-gray-200 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-1">Message Parameters</label>
                <textarea
                  placeholder="Tell us about your shoot timeline, style direction, or budget questions..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full h-36 p-3.5 text-sm rounded-xl border border-gray-200 bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#015103]/20 transition resize-none"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-xs tracking-widest uppercase text-white bg-[#FE8521] hover:bg-orange-600 shadow-md active:scale-[0.99] transition disabled:opacity-50 select-none"
              >
                {loading ? "Transmitting..." : "Send Message"}
              </button>

              {status.message && (
                <div 
                  className={`p-3 text-xs font-bold rounded-xl border ${
                    status.type === "success" 
                      ? "text-emerald-700 bg-emerald-50 border-emerald-100" 
                      : "text-rose-700 bg-rose-50 border-rose-100"
                  }`}
                >
                  {status.type === "success" ? "✓" : "⚠️"} {status.message}
                </div>
              )}
            </div>
          </form>

          {/* ================= HIGH-END MAP SIDE ================= */}
          <div className="overflow-hidden border shadow-xl rounded-3xl border-black/5 bg-gray-50 relative group min-h-[450px]">
            {/* ✅ FIXED PRODUCTION GOOGLE MAP EMBED CODE FOR LAGOS */}
            <iframe
              title="Miray Studio Base Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.015243888365!2d3.3768224!3d6.519702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8cf3e4dfb12f%3A0x6b9d6286d5e08b1a!2sLagos!5e0!3m2!1sen!2sng!4v1710000000000!5m2!1sen!2sng"
              className="absolute inset-0 w-full h-full border-0"
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