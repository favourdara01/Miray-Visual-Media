import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CreateGallery() {
  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    title: "",
    clientId: "",
  });

  const token =
    sessionStorage.getItem("accessToken") || "";

  useEffect(() => {
    api
      .get("/client", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      .then((res) => setClients(res.data))

      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/gallery/create",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Gallery created!");

      setForm({
        title: "",
        clientId: "",
      });

    } catch (err) {
      alert("Error creating gallery");
    }
  };

  return (
    <div className="flex justify-center p-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white shadow rounded-xl"
      >
        <h2 className="mb-4 text-xl font-bold">
          Create Gallery
        </h2>

        <input
          placeholder="Gallery Title (e.g Wedding Shoot)"
          className="w-full p-3 mb-4 border rounded"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <select
          className="w-full p-3 mb-4 border rounded"
          value={form.clientId}
          onChange={(e) =>
            setForm({
              ...form,
              clientId: e.target.value,
            })
          }
        >
          <option value="">
            Select Client
          </option>

          {clients.map((c) => (
            <option
              key={c._id}
              value={c._id}
            >
              {c.name} {c.surname}
            </option>
          ))}
        </select>

        <button className="w-full p-3 text-white bg-black rounded">
          Create Gallery
        </button>
      </form>
    </div>
  );
}

