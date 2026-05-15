import { useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function ClientLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "api/client/login",
        form,
        {
          withCredentials: true, // 🔐 IMPORTANT (for refresh cookie)
        }
      );

      // ❌ REMOVE localStorage usage (security fix)

      // ✅ store only temporary access token
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
        "Login failed. PlesessionSase try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-200">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-96 p-8 bg-white shadow-2xl rounded-3xl border-t-4 border-[#FE8521]"
      >

        <h2 className="text-3xl font-bold text-center text-[#015103]">
          Client Access
        </h2>

        <p className="mb-6 text-sm text-center text-gray-500">
          Sign in to view your gallery
        </p>

        {/* ERROR */}
        {error && (
          <div className="p-2 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-[#FE8521]"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-[#FE8521]"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold ${
            loading
              ? "bg-gray-400"
              : "bg-[#FE8521] hover:bg-orange-600"
          }`}
        >
          {loading ? "Signing in..." : "Enter Gallery"}
        </button>

        <p className="mt-5 text-xs text-center text-gray-400">
          Powered by Miray Visual Media
        </p>

      </motion.div>
    </div>
  );
}