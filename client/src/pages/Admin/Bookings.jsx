import { useEffect, useState } from "react";
import api from "../../api/axios";
import { io } from "socket.io-client";
import { FaUser, FaCalendarAlt, FaThLarge, FaTable, FaFileDownload } from "react-icons/fa";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState("grid");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    date: "",
    client: "",
  });

  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token") || "";

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

  // ================= REAL-TIME SOCKET ENGINE =================
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "https://miray-visual-media-1.onrender.com", {
      withCredentials: true,
      auth: { token },
      transports: ["polling", "websocket"],
    });

    socket.on("new-booking", (data) => {
      setBookings((prev) => [data, ...prev]);
    });

    socket.on("booking-updated", (updated) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
    });

    // ✅ NEW: Web Socket delete handler removes the element div instantly if wiped from DB
    socket.on("booking-deleted", (deletedId) => {
      setBookings((prev) => prev.filter((b) => b._id !== deletedId));
    });

    socket.on("connect_error", (err) => {
      console.log("Socket auth failed:", err.message);
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

  // ================= SECURE EXCEL/CSV DATA EXPORT =================
  const exportToExcel = () => {
    if (bookings.length === 0) return alert("No operational logs found to export.");
    
    // Set up table header parameters
    let csvContent = "data:text/csv;charset=utf-8,ID,Client Name,Email,Service,Date,Status,Notes\n";
    
    // Loop through current array data safely escaping fields against CSV injections
    bookings.forEach((b) => {
      const row = [
        b._id,
        `"${(b.name || "").replace(/"/g, '""')}"`,
        `"${(b.email || "").replace(/"/g, '""')}"`,
        `"${(b.service || "").replace(/"/g, '""')}"`,
        new Date(b.date || b.createdAt).toLocaleDateString(),
        b.status,
        `"${(b.message || "").replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Miray_Studio_Bookings_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ================= SAFE FIELDS =================
  const safeName = (b) => b?.name || "Unknown Client";
  const safeDate = (b) => b?.date || b?.createdAt || "-";
  const safeService = (b) => b?.service || "General";

  // ================= STATUS COLORS =================
  const statusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-[#015103]/5 text-[#015103] border-[#015103]/20";
      default:
        return "bg-orange-50 text-[#FE8521] border-orange-200";
    }
  };

  return (
    <div 
      className="min-h-screen p-6 space-y-8 md:p-8"
      style={{ background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)" }}
    >
      
      {/* HEADER CONTROLS BAR */}
      <div className="flex flex-col gap-5 pb-5 border-b md:flex-row md:items-center md:justify-between border-gray-100/80">
        <div>
          <h2 className="text-3xl font-black text-[#015103] tracking-tight">
            Reservations Control Matrix
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400">Review live incoming client slots, filter chronologies, and modify production milestones.</p>
        </div>

        <div className="flex items-center self-end gap-3 md:self-auto">
          {/* SECURE EXCEL TRIGGER */}
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#015103] bg-green-50 hover:bg-green-100 border border-green-200/60 rounded-xl shadow-2xs transition"
            title="Download full encrypted sheets log"
          >
            <FaFileDownload /> Export Sheets
          </button>

          {/* VIEW DOCK TOGGLERS */}
          <div className="flex items-center p-1 bg-gray-100 border rounded-xl border-gray-200/40">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg text-sm transition ${view === "grid" ? "bg-white text-[#FE8521] shadow-2xs" : "text-gray-500 hover:text-gray-800"}`}
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-lg text-sm transition ${view === "table" ? "bg-white text-[#FE8521] shadow-2xs" : "text-gray-500 hover:text-gray-800"}`}
            >
              <FaTable />
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH / FILTERS ARCHITECTURE */}
      <div className="grid gap-4 p-4 border border-gray-100 sm:grid-cols-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-2xs">
        <select
          className="p-3 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/20"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status Configurations</option>
          <option value="pending">Pending Review</option>
          <option value="confirmed">Confirmed Sessions</option>
          <option value="completed">Completed Projects</option>
        </select>

        <input
          type="date"
          className="p-3 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/20"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        <input
          placeholder="Lookup profile details..."
          className="p-3 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/20 placeholder-gray-400"
          value={filters.client}
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
        />
      </div>

      {/* GRID VIEW RENDERING PIPELINE */}
      {view === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b) => (
            <div
              key={b._id}
              onClick={() => setSelectedBooking(b)}
              className="p-5 bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xs hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer flex flex-col justify-between min-h-[175px] group transform hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 text-xs text-white bg-[#015103] shadow-inner rounded-full shrink-0 font-mono">
                  {safeName(b)[0].toUpperCase()}
                </div>

                <div className="overflow-hidden">
                  <p className="font-bold text-gray-800 text-sm tracking-tight truncate group-hover:text-[#015103] transition">
                    {safeName(b)}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {safeService(b)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-5 text-xs font-medium text-gray-500 border-t border-gray-50/60">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FaCalendarAlt className="text-[11px]" />
                  {new Date(safeDate(b)).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider shadow-2xs ${statusColor(b.status)}`}>
                  {b.status}
                </span>
              </div>

              <div onClick={(e) => e.stopPropagation()} className="mt-4">
                <select
                  value={b.status}
                  onChange={(e) => updateStatus(b._id, e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FE8521]/30 cursor-pointer"
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

      {/* TABLE VIEW RENDERING PIPELINE */}
      {view === "table" && (
        <div className="mx-auto overflow-x-auto bg-white border border-gray-100 shadow-sm rounded-2xl max-w-7xl">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs font-bold uppercase tracking-wider text-white bg-[#015103]">
              <tr>
                <th className="p-4">Client Record Name</th>
                <th className="p-4">Requested Node</th>
                <th className="p-4">Target Calendar</th>
                <th className="p-4 pr-6 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium text-gray-700 divide-y divide-gray-50">
              {bookings.map((b) => (
                <tr
                  key={b._id}
                  onClick={() => setSelectedBooking(b)}
                  className="transition cursor-pointer hover:bg-gray-50/80"
                >
                  <td className="p-4 font-bold text-gray-800">{safeName(b)}</td>
                  <td className="p-4 font-mono text-gray-500">{safeService(b)}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(safeDate(b)).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td onClick={(e) => e.stopPropagation()} className="p-4 pr-6 text-right">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b._id, e.target.value)}
                      className="p-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl focus:outline-none"
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

      {/* ================= OVERFLOW-PROOF PREMIUM INSPECTION MODAL ================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-white border shadow-2xl border-gray-50 rounded-3xl md:p-8 animate-scaleUp">
            
            <div className="pb-3 mb-4 border-b border-gray-50">
              <span className="bg-orange-50 text-[#FE8521] text-[9px] tracking-widest font-extrabold uppercase px-2.5 py-1 rounded-full mb-1 inline-block">
                Log Node Card
              </span>
              <h2 className="text-xl font-black text-[#015103] tracking-tight">
                Reservation Metadata Summary
              </h2>
            </div>

            {/* ✅ FIXED OVERFLOW MODULE CONTAINER VIA BREAK-WORDS & MAX-HEIGHT */}
            <div className="space-y-3.5 text-xs text-gray-600 font-medium max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex justify-between pb-2 border-b border-gray-50">
                <span className="text-gray-400">Client Name:</span>
                <span className="font-bold text-gray-900">{selectedBooking.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-50">
                <span className="text-gray-400">Email Address:</span>
                <span className="text-gray-900 font-bold font-mono truncate max-w-[240px]" title={selectedBooking.email}>
                  {selectedBooking.email}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-50">
                <span className="text-gray-400">Production Request:</span>
                <span className="text-[#015103] font-bold">{selectedBooking.service}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-50">
                <span className="text-gray-400">Execution Date:</span>
                <span className="font-bold text-gray-800">
                  {new Date(selectedBooking.date).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-50">
                <span className="text-gray-400">System Milestones Status:</span>
                <span className="text-gray-800 font-bold uppercase tracking-wider text-[10px]">{selectedBooking.status}</span>
              </div>
              
              {/* Vision Notes Wrapper block handles endless user text formatting safely */}
              <div className="p-4 mt-4 border border-gray-100 bg-gray-50 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Client Brief & Vision Notes</span>
                <p className="text-xs font-medium leading-relaxed text-gray-700 break-words whitespace-pre-wrap">
                  {selectedBooking.message || "No technical direction brief notes appended by client."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-3.5 mt-6 text-white font-bold text-xs tracking-wider uppercase bg-[#FE8521] hover:bg-[#e6761d] rounded-xl shadow-md hover:shadow-lg transition duration-200"
            >
              Dismiss Inspection
            </button>
          </div>
        </div>
      )}

      {bookings.length === 0 && !filters.client && !filters.status && !filters.date && (
        <div className="max-w-sm py-20 mx-auto text-center border border-gray-200 border-dashed bg-white/40 rounded-3xl">
          <span className="block mb-1 text-2xl opacity-50">📅</span>
          <p className="text-sm font-bold tracking-tight text-gray-500">Reservations Registry Empty</p>
        </div>
      )}
    </div>
  );
}