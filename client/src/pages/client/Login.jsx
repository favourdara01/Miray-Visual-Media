import { useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
// ✅ NEW: Import professional utility icons for layout controls
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ NEW: Password reveal toggle tracker

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Intercept form submission

    // 🛡️ SECURITY: Local RegEx validation guard rails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return setError("Please provide a syntactically accurate email address.");
    }

    if (form.password.length < 4) {
      return setError("Credentials sequence fails minimal security length limits.");
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "/client/login",
        {
          email: form.email.trim(),
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      sessionStorage.setItem("accessToken", res.data.accessToken);
      sessionStorage.setItem("client", JSON.stringify(res.data.client));

      // Use modern react-router navigation instead of heavy window resets
      navigate("/client/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Authentication rejected. Verify parameters."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen px-4"
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md p-8 text-left border border-gray-100 shadow-2xl md:p-10 bg-white/90 backdrop-blur-lg rounded-3xl"
      >
        {/* BRAND IDENTITY BADGE */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FE8521] flex items-center justify-center text-white text-xl font-black shadow-md shadow-orange-500/20 transform rotate-6 hover:rotate-0 transition-transform duration-300">
            M
          </div>
          <h2 className="text-2xl font-black text-[#015103] tracking-tight mt-4">
            Client Portal Access
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400">
            Securely sign in to view your private photography vaults.
          </p>
        </div>

        {/* ALERTS CONTAINER */}
        {error && (
          <div className="p-3.5 mb-5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-fadeIn">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* AUTH FORM ACTION BOX */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Account Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={handleInputChange}
              className="w-full p-3.5 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-black placeholder-gray-300 bg-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Portal Password</label>
              
              {/* ✅ NEW: Forgot Password placeholder structural link */}
              <Link 
                to="/client/forgot-password" 
                className="text-[10px] font-bold text-[#FE8521] hover:text-[#e6761d] uppercase tracking-wide transition"
              >
                Forgot?
              </Link>
            </div>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"} // ✅ Dynamic type obfuscation mapping
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleInputChange}
                className="w-full p-3.5 pr-11 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-black placeholder-gray-300 bg-white"
              />
              
              {/* ✅ NEW: Interactive toggle tracking button icon element */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 text-sm transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-4 rounded-xl text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all duration-200 transform active:scale-[0.995] ${
                loading
                  ? "bg-gray-400 cursor-not-allowed shadow-none opacity-60"
                  : "bg-[#FE8521] hover:bg-[#e6761d] hover:shadow-xl shadow-orange-500/10"
              }`}
            >
              {loading ? "Authenticating Session..." : "Enter Vault Gallery"}
            </button>
          </div>
        </form>

        {/* SYSTEM REDIRECT ROUTING OVERLAYS */}
        <div className="flex flex-col items-center gap-2 pt-5 mt-8 text-center border-t border-gray-50">
          <Link
            to="/admin/login"
            className="text-xs text-gray-400 hover:text-[#015103] font-bold uppercase tracking-wider transition"
          >
            Switch to Management Hub
          </Link>
          <p className="text-[10px] text-gray-300 font-medium tracking-tight mt-2">
            Engine Mapped via Miray Visual System Infrastructure
          </p>
        </div>

      </motion.div>
    </div>
  );
}