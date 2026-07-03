import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Premium modal intercept state tracker instead of default alert windows
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  // ================= SECURE MOUNT GUARD =================
  useEffect(() => {
    // 🛡️ SECURITY FIX: Instantly redirects unauthenticated sessions before API fires
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchClients();
  }, [token]);

  // ================= FETCH CLIENTS =================
  const fetchClients = async () => {
    try {
      const res = await api.get("/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      console.error("FETCH CLIENTS ERROR:", err);
    }
  };

  // ================= DELETE CLIENT =================
  const confirmDeleteClient = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/client/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClients((prev) => prev.filter((c) => c._id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete client record");
      setDeleteTarget(null);
    }
  };

  // ================= FILTER =================
  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      className="min-h-screen p-6 pb-24 space-y-8 md:p-8" 
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}
    >
      {/* ================= HEADER CONTROL BAR ================= */}
      <div className="flex flex-col gap-5 p-5 mx-auto border border-gray-100 shadow-xs max-w-7xl md:flex-row md:items-center md:justify-between bg-white/70 backdrop-blur-md rounded-2xl">
        <div>
          <span className="bg-orange-50 text-[#FE8521] border border-orange-100 text-[9px] tracking-widest font-extrabold uppercase px-3 py-1 rounded-full mb-2 inline-block">
            Directory Space
          </span>
          <h2 className="text-2xl font-black text-[#015103] tracking-tight flex items-center gap-2">
            Active Client Accounts
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full">
              {clients.length} Registered
            </span>
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Monitor secure partitioned credentials and access pipelines.
          </p>
        </div>

        <div className="flex items-center w-full gap-3 md:w-auto">
          <input
            placeholder="Search credentials name or email..."
            className="w-full md:w-72 p-3 text-xs font-semibold border border-gray-200 bg-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE8521]/30 text-gray-700 placeholder-gray-400 shadow-2xs"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => navigate("/admin/create-client")}
            className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl shadow-md transition whitespace-nowrap"
          >
            Add Client +
          </button>
        </div>
      </div>

      {/* ================= MAIN MONITOR SWITCHBOARD ================= */}
      <div className="mx-auto max-w-7xl">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-md p-12 mx-auto text-center border border-gray-200 border-dashed bg-white/50 backdrop-blur-md rounded-2xl">
            <div className="mb-2 text-4xl opacity-70">📁</div>
            <h3 className="text-base font-bold text-[#015103] tracking-tight">
              No Client Partitions Allocated
            </h3>
            <p className="max-w-xs mt-1 text-xs font-medium leading-relaxed text-gray-400">
              Deploy your first isolated workspace partition to track custom portfolios.
            </p>
            <button
              onClick={() => navigate("/admin/create-client")}
              className="px-4 py-2 mt-5 text-xs font-bold uppercase tracking-wider text-white bg-[#FE8521] hover:bg-[#e6761d] rounded-xl shadow-sm transition"
            >
              Initialize Profile Now
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="max-w-sm p-12 mx-auto text-center border border-gray-100 bg-white/40 rounded-2xl">
            <span className="block mb-1 text-xl opacity-60">🔍</span>
            <p className="text-xs font-semibold text-gray-500">
              No results match "{search}"
            </p>
          </div>
        ) : (
          /* PREMIUM PIXIEST ACCOUNT CARDS MATRIX GRID */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((client) => {
              const initials = `${client.name?.[0] || ""}${client.surname?.[0] || ""}`.toUpperCase();

              return (
                <div
                  key={client._id}
                  className="group relative p-5 bg-white/90 backdrop-blur-md border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[190px] border-l-4 border-l-[#FE8521]"
                >
                  {/* 🛡️ FIX: Click handlers bound to nested blocks to stop bubble overlaps */}
                  <div 
                    onClick={() => navigate(`/admin/client/${client._id}`)}
                    className="flex items-start gap-3.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-11 h-11 font-black text-xs text-white rounded-full bg-[#015103] shadow-inner font-mono shrink-0">
                      {initials}
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-gray-800 tracking-tight truncate group-hover:text-[#015103] transition">
                        {client.name} {client.surname}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                        {client.email}
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => navigate(`/admin/client/${client._id}`)}
                    className="space-y-1.5 text-xs text-gray-500 font-medium mt-4 pt-3 border-t border-gray-50/80 cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone Link:</span>
                      <span className="font-semibold text-gray-700">{client.phone || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deployment Date:</span>
                      <span className="font-semibold text-gray-700">{new Date(client.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>

                  {/* BOTTOM ACTION NAVIGATION ROW CONTROLS */}
                  <div className="flex items-center justify-between pt-2 mt-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(client._id);
                      }}
                      className="text-xs font-bold text-red-500 transition hover:text-red-700"
                    >
                      Purge Record
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/client/${client._id}`);
                      }}
                      className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#015103] hover:bg-[#083b09] rounded-lg shadow-xs transition"
                    >
                      Open Workspace
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= PREMIUM DELETION OVERLAY MODAL INTERCEPT ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-2xl border-red-50 animate-scaleUp">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full h-14 w-14 bg-red-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-red-700">Purge Client Profile?</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500">
              This action is permanent. Purging this profile removes all secure system configurations, dashboard parameters, and links to any associated asset vault storage containers.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteClient}
                className="w-1/2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md"
              >
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}