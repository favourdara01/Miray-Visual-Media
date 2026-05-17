import { useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ClientLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "/client/login",
        form,
        {
          withCredentials: true,
        }
      );

      sessionStorage.setItem(
        "accessToken",
        res.data.accessToken
      );

      sessionStorage.setItem(
        "client",
        JSON.stringify(res.data.client)
      );

      window.location.href = "/client/dashboard";

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-white via-gray-50 to-gray-200">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white border shadow-2xl rounded-3xl border-white/30 backdrop-blur-xl"
      >

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#FE8521] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            M
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-[#015103]">
          Client Access
        </h2>

        <p className="mb-6 text-sm text-center text-gray-500">
          Sign in to view your private gallery
        </p>

        {/* ERROR */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-xl">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-gray-400"
              : "bg-[#FE8521] hover:bg-orange-600"
          }`}
        >
          {loading ? "Signing in..." : "Enter Gallery"}
        </button>

        {/* ADMIN LOGIN */}
        <div className="mt-6 text-center">
          <Link
            to="/admin/login"
            className="text-sm text-[#015103] hover:underline font-medium"
          >
            Admin Login
          </Link>
        </div>

        {/* FOOTER */}
        <p className="mt-6 text-xs text-center text-gray-400">
          Powered by Miray Visual Media
        </p>

      </motion.div>
    </div>
  );
}

