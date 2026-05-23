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

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      sessionStorage.setItem(
        "accessToken",
        res.data.accessToken
      );

      navigate("/admin");

    } catch (err) {
      console.log(err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
        "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2 bg-gradient-to-br from-white via-gray-50 to-gray-100">

      {/* LEFT IMAGE */}
      <div className="items-center justify-center hidden p-6 md:flex lg:p-10">
        <div className="relative w-full h-full overflow-hidden shadow-xl rounded-3xl">

          <img
            src={aboutImg}
            className="absolute inset-0 object-cover w-full h-full"
          />

          <div className="absolute inset-0 bg-[#015103]/40" />

          <div className="relative z-10 flex flex-col justify-end h-full p-10 text-white">
            <h1 className="text-3xl font-bold">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-white/80">
              Manage your studio securely and efficiently.
            </p>
          </div>

        </div>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center px-4 py-10 text-black">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl border-t-4 border-[#015103]"
        >

          <h2 className="text-2xl font-bold text-center text-[#015103]">
            Admin Login
          </h2>

          <p className="mb-6 text-sm text-center text-gray-500">
            Secure access panel
          </p>

          {/* ERROR */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 mb-4 border rounded-xl focus:ring-2 focus:ring-[#FE8521]"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative mb-6">

            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full p-4 pr-12 border rounded-xl focus:ring-2 focus:ring-[#FE8521]"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute text-gray-500 -translate-y-1/2 right-4 top-1/2"
            >
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>

          </div>

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
            {loading ? "Logging in..." : "Login"}
          </button>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;