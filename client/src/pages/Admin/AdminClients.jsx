import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminClients = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
       const token = sessionStorage.getItem("accessToken") || "";

        const res = await api.get("api/client", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setClients(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="h-full p-4 overflow-y-auto bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-lg font-bold">Clients</h2>

      {clients.map((client) => (
        <div
          key={client._id}
          onClick={() => onSelectClient(client)}
          className="p-3 mb-2 transition border rounded-lg cursor-pointer hover:bg-gray-100"
        >
          <p className="font-semibold">
            {client.name} {client.surname}
          </p>
          <p className="text-sm text-gray-500">{client.email}</p>

          <p className="text-xs text-gray-400">
            Created: {new Date(client.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminClients;