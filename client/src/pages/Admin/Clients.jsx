import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const token = sessionStorage.getItem("accessToken") || "";

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

  useEffect(() => {
    fetchClients();
  }, []);

  // ================= DELETE CLIENT =================
  const deleteClient = async (id) => {
    if (!window.confirm("Delete this client?")) return;

    try {
      await api.delete(`/client/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClients((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete client");
    }
  };

  // ================= FILTER =================
  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50" style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}>

      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-[#015103]">
            Clients
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({clients.length})
            </span>
          </h2>

          <p className="text-sm text-gray-500">
            Manage all photography clients
          </p>
        </div>

        <input
          placeholder="Search name or email..."
          className="w-full p-3 border rounded-xl md:w-80 focus:outline-none focus:ring-2 focus:ring-[#FE8521]"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* EMPTY STATE */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 mt-10 text-center bg-white shadow rounded-2xl">
          <div className="mb-3 text-5xl">📂</div>

          <h3 className="text-lg font-semibold text-[#015103]">
            No clients yet
          </h3>

          <p className="text-sm text-gray-500">
            Create your first client to get started
          </p>

          <button
            onClick={() => navigate("/admin/create-client")}
            className="px-5 py-2 mt-4 text-white bg-[#FE8521] rounded-lg hover:bg-orange-600 transition"
          >
            Create Client
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center bg-white shadow rounded-2xl">
          <p className="text-gray-500">
            No results found for "{search}"
          </p>
        </div>
      ) : (
        /* CLIENT GRID */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {filtered.map((client) => {
            const initials = `${client.name?.[0] || ""}${
              client.surname?.[0] || ""
            }`.toUpperCase();

            return (
              <div
                key={client._id}
                onClick={() => navigate(`/admin/client/${client._id}`)}
                className="relative p-5 transition bg-white shadow-md cursor-pointer rounded-2xl hover:shadow-xl hover:-translate-y-1 border-l-4 border-[#FE8521]"
              >

                {/* TOP */}
                <div className="flex items-center gap-3 mb-4">

                  <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded-full bg-[#015103]">
                    {initials}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#015103]">
                      {client.name} {client.surname}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {client.email}
                    </p>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-700">
                      Phone:
                    </span>{" "}
                    {client.phone || "Not provided"}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Joined:
                    </span>{" "}
                    {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between mt-5">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteClient(client._id);
                    }}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/client/${client._id}`);
                    }}
                    className="px-3 py-1 text-xs text-white bg-[#FE8521] rounded-md hover:bg-orange-600"
                  >
                    View
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}