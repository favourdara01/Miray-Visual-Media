import { useEffect, useState } from "react";
import api from "../../api/axios";
import { io } from "socket.io-client";

export default function AdminMessages() {
  // 💾 Loads backup instantly on mount so your records NEVER disappear
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

  // ================= 1. FETCH & SAFE-APPEND DATABASE HISTORY =================
  const fetchHistoryLogs = async () => {
    try {
      setLoading(true);
      const [contactRes, subRes] = await Promise.all([
        api.get("/contact").catch(() => ({ data: [] })),
        api.get("/newsletter").catch(() => ({ data: [] }))
      ]);
      
      const rawContacts = contactRes.data?.data || contactRes.data?.contacts || contactRes.data || [];
      const rawSubs = subRes.data?.data || subRes.data?.subscribers || subRes.data || [];

      // ✅ FIX: Instead of letting an empty backend response wipe out your logs,
      // we only merge items if the backend actually returns data objects.
      setContacts((prev) => {
        const existingItems = [...prev];
        if (Array.isArray(rawContacts)) {
          rawContacts.forEach(item => {
            const itemId = item.id || item._id;
            if (itemId && !existingItems.some(m => (m.id || m._id) === itemId)) {
              existingItems.push(item);
            }
          });
        }
        localStorage.setItem("miray_contacts_archive", JSON.stringify(existingItems));
        return existingItems;
      });

      setSubscribers((prev) => {
        const existingSubs = [...prev];
        if (Array.isArray(rawSubs)) {
          rawSubs.forEach(item => {
            const itemId = item.id || item._id;
            if (itemId && !existingSubs.some(m => (m.id || m._id) === itemId)) {
              existingSubs.push(item);
            }
          });
        }
        localStorage.setItem("miray_subscribers_archive", JSON.stringify(existingSubs));
        return existingSubs;
      });

    } catch (err) {
      console.warn("Database sync offline, operating on local system cache layers:", err.message);
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

    // Listen to real-time additions and save to local storage immediately
    socket.on("new-contact-message", (newContactData) => {
      if (newContactData) {
        setContacts((prev) => {
          const itemId = newContactData.id || newContactData._id || Math.random().toString();
          // Ensure it's uniquely tracking properties
          const finalizedData = { ...newContactData, id: itemId, createdAt: newContactData.createdAt || new Date().toISOString() };
          
          if (prev.some(item => (item.id || item._id) === itemId)) return prev;
          
          const updated = [finalizedData, ...prev];
          localStorage.setItem("miray_contacts_archive", JSON.stringify(updated));
          return updated;
        });
      }
    });

    socket.on("newSubscriber", (newSubData) => {
      if (newSubData) {
        setSubscribers((prev) => {
          const itemId = newSubData.id || newSubData._id || Math.random().toString();
          const finalizedData = { ...newSubData, id: itemId, createdAt: newSubData.createdAt || new Date().toISOString() };

          if (prev.some(item => (item.id || item._id) === itemId)) return prev;
          
          const updated = [finalizedData, ...prev];
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
      
      {/* HEADER ROW BAR */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[#FE8521] text-[10px] font-black tracking-widest uppercase">Permanent Record Matrix</span>
          <h2 className="text-3xl font-black text-[#015103] tracking-tight">Communications Desk</h2>
          <div className="w-12 h-[3px] bg-[#FE8521] rounded-full mt-1" />
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl text-[9px] font-bold text-emerald-600 uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          Archive Lock Active
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

      {/* DATA CANVAS GRAPH VIEW */}
      {activeTab === "contacts" ? (
        contacts.length === 0 ? (
          <p className="py-16 text-sm font-medium text-center text-gray-400">No contact messages received yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map((msg) => (
              <div key={msg.id || msg._id} className="p-5 space-y-3 transition duration-300 bg-white border shadow-sm border-black/5 rounded-2xl hover:shadow-md">
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
                  <tr key={sub.id || sub._id} className="transition hover:bg-gray-50/30">
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