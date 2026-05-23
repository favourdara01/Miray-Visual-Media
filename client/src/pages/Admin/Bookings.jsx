import { useEffect, useState } from "react";
import api from "../../api/axios";
import { io } from "socket.io-client";
import { FaUser, FaCalendarAlt } from "react-icons/fa";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState("grid");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    date: "",
    client: "",
  });

  const token = sessionStorage.getItem("accessToken") || "";

  // ================= FETCH =================
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings", {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });

      setBookings(res.data);
    } catch (err) {
      console.error("BOOKINGS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  // ================= SOCKET =================
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

    socket.on("new-booking", (data) => {
      setBookings((prev) => [data, ...prev]);
    });

    socket.on("booking-updated", (updated) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
    });

    return () => socket.disconnect();
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(
        `/bookings/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? res.data : b))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SAFE FIELDS =================
  const safeName = (b) => b?.name || "Unknown Client";
  const safeDate = (b) => b?.date || b?.createdAt || "-";
  const safeService = (b) => b?.service || "General";

  // ================= STATUS COLORS =================
  const statusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-300";
      case "completed":
        return "bg-[#015103]/10 text-[#015103] border-[#015103]";
      default:
        return "bg-orange-100 text-[#FE8521] border-orange-300";
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">

      {/* HEADER */}
      <h2 className="text-3xl font-bold text-[#015103]">
        Bookings Dashboard
      </h2>

      {/* VIEW TOGGLE */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setView("grid")}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === "grid"
              ? "bg-[#FE8521] text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Grid
        </button>

        <button
          onClick={() => setView("table")}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === "table"
              ? "bg-[#FE8521] text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Table
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid gap-3 mt-6 md:grid-cols-3">
        <select
          className="p-3 text-black bg-white border rounded-lg"
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
        </select>

        <input
          type="date"
          className="p-3 bg-white border rounded-lg"
          onChange={(e) =>
            setFilters({ ...filters, date: e.target.value })
          }
        />

        <input
          placeholder="Search client..."
          className="p-3 text-black bg-white border rounded-lg"
          onChange={(e) =>
            setFilters({ ...filters, client: e.target.value })
          }
        />
      </div>

      {/* GRID VIEW */}
      {view === "grid" && (
        <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">

          {bookings.map((b) => (
            <div
              key={b._id}
              onClick={() => setSelectedBooking(b)}
              className="p-4 transition bg-white border cursor-pointer rounded-xl hover:shadow-lg"
            >

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 text-white bg-[#015103] rounded-full">
                  <FaUser />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {safeName(b)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {safeService(b)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt />
                  {new Date(safeDate(b)).toLocaleDateString()}
                </span>

                <span
                  className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColor(
                    b.status
                  )}`}
                >
                  {b.status}
                </span>
              </div>

              {/* ================= OPTIONS (NO MODAL TRIGGER) ================= */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3"
              >
                <select
                  value={b.status}
                  onChange={(e) =>
                    updateStatus(b._id, e.target.value)
                  }
                  className="w-full p-2 text-sm text-black bg-white border rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* TABLE VIEW */}
      {view === "table" && (
        <div className="mt-6 overflow-x-auto bg-white border rounded-xl">

          <table className="w-full text-left">

            <thead className="text-sm text-white bg-[#015103]">
              <tr>
                <th className="p-3">Client</th>
                <th className="p-3">Service</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b._id}
                  onClick={() => setSelectedBooking(b)}
                  className="border-b cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {safeName(b)}
                  </td>

                  <td className="p-3 text-gray-600">
                    {safeService(b)}
                  </td>

                  <td className="p-3 text-gray-600">
                    {new Date(safeDate(b)).toLocaleDateString()}
                  </td>

                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="p-3"
                  >
                    <select
                      value={b.status}
                      onChange={(e) =>
                        updateStatus(b._id, e.target.value)
                      }
                      className="p-2 text-sm border rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-lg p-6 bg-white rounded-xl">

            <h2 className="text-xl font-bold text-[#015103]">
              Booking Details
            </h2>

            <div className="mt-4 space-y-2 text-gray-700">
              <p><b>Name:</b> {selectedBooking.name}</p>
              <p><b>Email:</b> {selectedBooking.email}</p>
              <p><b>Service:</b> {selectedBooking.service}</p>
              <p><b>Date:</b> {selectedBooking.date}</p>
              <p><b>Status:</b> {selectedBooking.status}</p>
              <p><b>Message:</b> {selectedBooking.message || "N/A"}</p>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2 mt-6 text-white rounded-lg bg-[#FE8521]"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}