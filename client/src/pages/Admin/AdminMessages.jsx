import { useEffect, useState } from "react";
import api from "../../api/axios";
import { io } from "socket.io-client";

export default function AdminMessages() {
  // 💾 Initialize state directly from localStorage if it exists so things stay visible instantly
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem("miray_contacts_archive");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [subscribers, setSubscribers] = useState(() => {
    const saved = localStorage.getItem("miray_subscribers_archive");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState("contacts"); 
  const [loading, setLoading] = useState(false);

  // ================= 1. SYNC & FETCH DATABASE RECORDS =================
  const fetchHistoryLogs = async () => {
    try {
      setLoading(true);
      const [contactRes, subRes] = await Promise.all([
        api.get("/contact"),
        api.get("/newsletter")
      ]);
      
      const rawContacts = contactRes.data?.data || contactRes.data?.contacts || contactRes.data || [];
      const rawSubs = subRes.data?.data || subRes.data?.subscribers || subRes.data || [];

      // Combine database records with local records to ensure zero loss
      setContacts((prev) => {
        const merged = Array.isArray(rawContacts) ? [...rawContacts] : [];
        // Keep any unsaved local socket items that might not be in the database response yet
        prev.forEach(item => {
          if (!merged.some(m => (m.id || m._id) === (item.id || item._id))) {
            merged.push(item);
          }
        });
        localStorage.setItem("miray_contacts_archive", JSON.stringify(merged));
        return merged;
      });

      setSubscribers((prev) => {
        const merged = Array.isArray(rawSubs) ? [...rawSubs] : [];
        prev.forEach(item => {
          if (!merged.some(m => (m.id || m._id) === (item.id || item._id))) {
            merged.push(item);
          }
        });
        localStorage.setItem("miray_subscribers_archive", JSON.stringify(merged));
        return merged;
      });

    } catch (err) {
      console.warn("Database sync offline, running on persistent local storage backup logs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= 2. LIVE REAL-TIME SOCKET STREAMS =================
  useEffect(() => {
    fetchHistoryLogs();

    const socketUrl = api.defaults.baseURL?.replace("/api", "") || "https://miray-visual-media-1.onrender.com";
    
    const socket = io(socketUrl, {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to live message stream network");
    });

    // Listen to real-time additions and save to cache immediately
    socket.on("new-contact-message", (newContactData) => {
      if (newContactData) {
        setContacts((prev) => {
          // Prevent duplicates
          if (prev.some(item => (item.id || item._id) === (newContactData.id || newContactData._id))) return prev;
          const updated = [newContactData, ...prev];
          localStorage.setItem("miray_contacts_archive", JSON.stringify(updated));
          return updated;
        });
      }
    });

    socket.on("newSubscriber", (newSubData) => {
      if (newSubData) {
        setSubscribers((prev) => {
          if (prev.some(item => (item.id || item._id) === (newSubData.id || newSubData._id))) return prev;
          const updated = [newSubData, ...prev];
          localStorage.setItem("miray_subscribers_archive", JSON.stringify(updated));
          return updated;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="max-w-6xl space-y-6 duration-200 select-none animate-in fade-in">
      
      {/* HEADER BAR ROW */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[#FE8521] text-[10px] font-black tracking-widest uppercase">Permanent Studio Records</span>
          <h2 className="text-3xl font-black text-[#015103] tracking-tight">Communications Desk</h2>
          <div className="w-12 h-[3px] bg-[#FE8521] rounded-full mt-1" />
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl text-[9px] font-bold text-emerald-600 uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          Archive Vault Engaged
        </div>
      </div>

      {/* TABS CONTROLLERS */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
            activeTab === "contacts" ? "text-[#FE8521] font-black" : "text-gray-400"
          }`}
        >
          Inquiries ({contacts.length})
          {activeTab === "contacts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE8521]" />}
        </button>
        <button
          onClick={() => setActiveTab("newsletter")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
            activeTab === "newsletter" ? "text-[#FE8521] font-black" : "text-gray-400"
          }`}
        >
          Subscribers ({subscribers.length})
          {activeTab === "newsletter" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE8521]" />}
        </button>
      </div>

      {/* ARRAYS RENDERING VISUALIZER CANVAS */}
      {loading && contacts.length === 0 && subscribers.length === 0 ? (
        <div className="py-24 space-y-3 text-center">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-[#FE8521] rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Verifying Archive Databases...</p>
        </div>
      ) : activeTab === "contacts" ? (
        contacts.length === 0 ? (
          <p className="py-16 text-sm font-medium text-center text-gray-400">No contact messages received yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map((msg) => (
              <div key={msg.id || msg._id || Math.random().toString()} className="p-5 space-y-3 transition duration-300 bg-white border shadow-sm border-black/5 rounded-2xl hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{msg.name}</h4>
                    <p className="text-[11px] font-semibold text-[#FE8521] break-all">{msg.email}</p>
                  </div>
                  <span className="text-[9px] font-black tracking-wider text-gray-400 bg-gray-50/80 px-2.5 py-1 rounded-lg border border-gray-100 whitespace-nowrap uppercase">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Saved"}
                  </span>
                </div>
                <div className="w-full h-px bg-gray-100/60" />
                <p className="text-xs font-medium leading-relaxed text-gray-500 whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )
      ) : (
        subscribers.length === 0 ? (
          <p className="py-16 text-sm font-medium text-center text-gray-400">No newsletter subscriptions logged.</p>
        ) : (
          <div className="overflow-hidden bg-white border shadow-xs border-black/5 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="p-4 pl-6">Subscriber Email</th>
                  <th className="p-4 pr-6 text-right">Join Timestamp Date</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-gray-600 divide-y divide-gray-100/60">
                {subscribers.map((sub) => (
                  <tr key={sub.id || sub._id || Math.random().toString()} className="transition hover:bg-gray-50/30">
                    <td className="p-4 pl-6 font-bold text-gray-800">{sub.email}</td>
                    <td className="p-4 pr-6 font-medium text-right text-gray-400">
                      {new Date(sub.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}