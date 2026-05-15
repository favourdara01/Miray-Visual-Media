
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

  const token =
    sessionStorage.getItem("accessToken") || "";

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

      setSuccess(
        "Client created successfully 🎉"
      );

      setForm({
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
      });

      console.log(
        "CLIENT CREATED:",
        res.data
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create client"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 bg-gray-50"
      style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl border-t-4 border-[#FE8521]"
      >
        {/* HEADER */}
        <h2 className="mb-1 text-2xl font-bold text-[#015103]">
          Create Client
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          Add a new photography client
          to your system
        </p>

        {/* ERROR */}
        {error && (
          <div className="p-2 mb-3 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="p-2 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}

        {/* INPUTS */}
        <input
          name="name"
          placeholder="First Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
        />

        <input
          name="surname"
          placeholder="Last Name"
          value={form.surname}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 mb-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
        />

        {/* BUTTON */}
        <button
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#FE8521] hover:bg-orange-600"
          }`}
        >
          {loading
            ? "Creating..."
            : "Create Client"}
        </button>
      </form>
    </div>
  );
}

