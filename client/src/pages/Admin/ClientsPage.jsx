// CLEANER + PREMIUM GRID

<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {filtered.map((client) => {
    const initials = `${client.name?.[0] || ""}${
      client.surname?.[0] || ""
    }`.toUpperCase();

    return (
      <div
        key={client._id}
        onClick={() => navigate(`/admin/client/${client._id}`)}
        className="relative overflow-hidden bg-white shadow-lg cursor-pointer rounded-2xl group"
          style={{
        background:
          "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #eef6ee 100%)",
      }}>
        {/* GRADIENT TOP */}
        <div className="h-24 bg-gradient-to-r from-black to-gray-800"></div>

        {/* PROFILE */}
        <div className="p-5 -mt-10">
          <div className="flex items-center justify-center w-16 h-16 mx-auto text-xl font-bold text-white bg-black border-4 border-white rounded-full shadow">
            {initials}
          </div>

          <div className="mt-3 text-center">
            <h3 className="text-lg font-semibold">
              {client.name} {client.surname}
            </h3>
            <p className="text-sm text-gray-500">{client.email}</p>
          </div>

          <div className="flex items-center justify-between mt-5 text-xs text-gray-400">
            <span>
              {new Date(client.createdAt).toLocaleDateString()}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteClient(client._id);
              }}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        {/* HOVER */}
        <div className="absolute inset-0 transition opacity-0 bg-black/10 group-hover:opacity-100"></div>
      </div>
    );
  })}
</div>