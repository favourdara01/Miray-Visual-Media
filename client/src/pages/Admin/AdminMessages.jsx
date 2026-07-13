import { useEffect, useState } from "react";
import api from "../../api/axios";
import { io } from "socket.io-client";

export default function AdminMessages() {
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState("contacts"); 
  const [loading, setLoading] = useState(true);

  // ================= 1. FETCH PREVIOUS LOG HISTORY =================
  const fetchHistoryLogs = async () => {
    try {
      setLoading(true);
      // Fetch existing entries from your database endpoints
      const [contactRes, subRes] = await Promise.all([
        api.get("/contact"),
        api.get("/newsletter")
      ]);
      
      setContacts(contactRes.data?.data || contactRes.data || []);
      setSubscribers(subRes.data?.data || subRes.data || []);
    } catch (err) {
      console.error("Failed to load historical data logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= 2. LIVE SOCKET.IO SYSTEM REAL-TIME CONNECTION =================
  useEffect(() => {
    // Run history fetch first
    fetchHistoryLogs();

    // Pull your backend URL out of axios config defaults or fallback to your server URL
    const socketUrl = api.defaults.baseURL?.replace("/api", "") || "https://miray-visual-media-1.onrender.com";
    
    // Establish connection to socket network
    const socket = io(socketUrl, {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("token") // Pass auth token if required by server guards
      }
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to Miray live stream mesh");
    });

    // Listen for live new contact actions
    socket.on("newContact", (newContactData) => {
      setContacts((prev) => [newContactData, ...prev]);
    });

    // Listen for live new newsletter subscriber arrivals
    socket.on("newSubscriber", (newSubData) => {
      setSubscribers((prev) => [newSubData, ...prev]);
    });

    // Cleanup workspace connection on component layout dismantle
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="max-w-6xl space-y-6 duration-200 select-none animate-in fade-in">
      
      {/* HEADER SECTION TITLE */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[#FE8521] text-[10px] font-black tracking-widest uppercase">Live Inbound Streams</span>
          <h2 className="text-3xl font-black text-[#015103] tracking-tight">Communications Desk</h2>
          <div className="w-12 h-[3px] bg-[#FE8521] rounded-full mt-1" />
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl text-[9px] font-bold text-emerald-600 uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          Socket Sync Active
        </div>
      </div>

      {/* TABS CONTROLLERS */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
            activeTab === "contacts"
              ? "text-[#FE8521] font-black"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Inquiries ({contacts.length})
          {activeTab === "contacts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE8521]" />}
        </button>
        <button
          onClick={() => setActiveTab("newsletter")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
            activeTab === "newsletter"
              ? "text-[#FE8521] font-black"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Subscribers ({subscribers.length})
          {activeTab === "newsletter" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE8521]" />}
        </button>
      </div>

      {/* MATRIX LOG CONTENT CANVAS */}
      {loading ? (
        <div className="py-24 space-y-3 text-center">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-[#FE8521] rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Syncing Server History Arrays...</p>
        </div>
      ) : activeTab === "contacts" ? (
        
        contacts.length === 0 ? (
          <p className="py-16 text-sm font-medium text-center text-gray-400">No contact messages received yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map((msg) => (
              <div key={msg._id || msg.id} className="p-5 space-y-3 transition duration-300 bg-white border shadow-xs border-black/5 rounded-2xl hover:shadow-md animate-in slide-in-from-top-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{msg.name}</h4>
                    <p className="text-[11px] font-semibold text-[#FE8521] break-all">{msg.email}</p>
                  </div>
                  <span className="text-[9px] font-black tracking-wider text-gray-400 bg-gray-50/80 px-2.5 py-1 rounded-lg border border-gray-100 whitespace-nowrap uppercase">
                    {new Date(msg.createdAt || msg.date || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })}
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
          <div className="overflow-hidden duration-300 bg-white border shadow-xs border-black/5 rounded-2xl animate-in fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="p-4 pl-6">Subscriber Email</th>
                  <th className="p-4 pr-6 text-right">Join Timestamp Date</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-gray-600 divide-y divide-gray-100/60">
                {subscribers.map((sub) => (
                  <tr key={sub._id || sub.id} className="transition duration-150 hover:bg-gray-50/30">
                    <td className="p-4 pl-6 font-bold text-gray-800">{sub.email}</td>
                    <td className="p-4 pr-6 font-medium text-right text-gray-400">
                      {new Date(sub.createdAt || sub.date || Date.now()).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
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