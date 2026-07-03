import { useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import aboutImg from "../../assets/about.jpg";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // Prevent default form browser submission reloads
    if (e) e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      sessionStorage.setItem("accessToken", res.data.accessToken);
      navigate("/admin");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="grid min-h-screen md:grid-cols-2"
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      {/* ================= LEFT SIDE: IMMERSIVE IMAGE PANEL ================= */}
      <div className="items-center justify-center hidden p-6 md:flex lg:p-8">
        <div className="relative w-full h-full overflow-hidden shadow-2xl rounded-3xl group">
          <img
            src={aboutImg}
            className="absolute inset-0 object-cover w-full h-full transition duration-700 transform scale-101 group-hover:scale-103"
            alt="Studio branding backdrop"
          />

          {/* Deep professional overlay blend gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#015103]/90 via-[#015103]/40 to-black/20" />

          <div className="relative z-10 flex flex-col justify-end h-full p-10 text-white">
            <span className="bg-white/10 text-white border border-white/10 text-[9px] tracking-[0.3em] font-extrabold uppercase px-3 py-1 rounded-full mb-3 backdrop-blur-md w-fit">
              Studio Operations
            </span>
            <h1 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
              Welcome Back
            </h1>
            <p className="max-w-sm mt-2 text-xs font-medium leading-relaxed text-white/80">
              Access the administrative core to manage galleries, client vault records, and session timelines securely.
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: AUTHENTICATION FORM CARD ================= */}
      <div className="flex items-center justify-center px-6 py-12 text-black">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-md p-8 bg-white border shadow-2xl md:p-10 rounded-3xl border-gray-100/80"
        >
          {/* TOP BORDER ACCENT LOG */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#015103] rounded-b-full" />

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-[#015103] tracking-tight">
              Management Control Hub
            </h2>
            <p className="mt-1 text-xs font-medium text-gray-400">
              Enter specialized tokens to open the root dashboard.
            </p>
          </div>

          {/* ALERTS MODULE POPUP */}
          {error && (
            <div className="p-3.5 mb-5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-fadeIn">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* SEMANTIC FORM ELEMENT */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Administrative Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@mirayvisual.com"
                value={email}
                className="w-full p-3.5 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-black placeholder-gray-300 bg-white transition"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Secret Access Key
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  className="w-full p-3.5 pr-12 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-black placeholder-gray-300 bg-white transition"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute text-gray-400 hover:text-gray-700 p-1 text-sm -translate-y-1/2 right-3.5 top-1/2 transition"
                >
                  {show ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* BUTTON SUBMISSION LAYERS */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full p-4 rounded-xl text-white font-bold text-xs tracking-wider uppercase transition-all duration-200 transform active:scale-[0.995] shadow-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed opacity-60 shadow-none"
                    : "bg-[#FE8521] hover:bg-[#e6761d] hover:shadow-xl shadow-orange-500/10"
                }`}
              >
                {loading ? "Decrypting Session..." : "Initialize Control Link"}
              </button>
            </div>
          </form>

          {/* BASE INFRASTRUCTURE EMBLEMS */}
          <div className="pt-5 mt-8 text-center border-t border-gray-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
              Secure Core Node System
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;