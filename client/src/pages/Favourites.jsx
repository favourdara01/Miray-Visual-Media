import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Favorites() {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    api
      .get("/media/favorites")
      .then((res) => setMedia(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Your Favorites ❤️</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {media.map((m) => (
          <img key={m._id} src={m.url} className="rounded-lg" />
        ))}
      </div>
    </div>
  );
}