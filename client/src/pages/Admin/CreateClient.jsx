import { useState } from "react";
import api from "../../api/axios";

export default function CreateClient() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.post(
        "/client/create",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Client account created successfully 🎉");
      setForm({
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
      });

      console.log("CLIENT CREATED:", res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to establish new client record"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 py-12"
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      <div className="w-full max-w-xl p-8 border border-gray-100 shadow-2xl bg-white/80 backdrop-blur-lg rounded-3xl md:p-10">
        
        {/* HEADER */}
        <div className="pb-5 mb-8 border-b border-gray-50">
          <span className="bg-orange-50 text-[#FE8521] border border-orange-100 text-[10px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-3 inline-block">
            Onboarding Suite
          </span>
          <h2 className="text-3xl font-extrabold text-[#015103] tracking-tight">
            Create Client Profile
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400">
            Register a secure client portal partition and allocate active studio cloud vaults.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* FEEDBACK STATUS CARDS */}
          {error && (
            <div className="flex items-center gap-2 p-4 text-xs font-semibold text-red-700 border border-red-100 bg-red-50 rounded-xl animate-fadeIn">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-4 text-xs font-semibold text-green-700 border border-green-100 bg-green-50 rounded-xl animate-fadeIn">
              <span>✅</span> {success}
            </div>
          )}

          {/* DUAL ROW: COMPACTED NAME SYSTEM */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">First Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="John"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700 placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Name</label>
              <input
                name="surname"
                type="text"
                required
                placeholder="Doe"
                value={form.surname}
                onChange={handleChange}
                className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          {/* CORE ACCOUNT IDENTIFICATION PARAMETERS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="johndoe@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700 placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone Connection</label>
              <input
                name="phone"
                type="text"
                placeholder="+234..."
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          {/* SECURITY ACCESS CODE GENERATOR FIELD */}
          <div>
            <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Portal Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700 placeholder-gray-300"
            />
          </div>

          {/* LAUNCH METRIC DISPATCH BUTTON */}
          <div className="pt-4">
            <button
              disabled={loading}
              className={`w-full p-4 rounded-xl text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all duration-200 transform active:scale-[0.99] ${
                loading
                  ? "bg-gray-400 cursor-not-allowed shadow-none opacity-50"
                  : "bg-[#FE8521] hover:bg-[#e6761d] hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                  <span>Configuring Profile Nodes...</span>
                </div>
              ) : (
                "Deploy Client Partition"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}