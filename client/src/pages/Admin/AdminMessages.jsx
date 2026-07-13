import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminMessages() {
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState("contacts"); // 'contacts' or 'newsletter'
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data from your backend APIs simultaneously
      const [contactRes, subRes] = await Promise.all([
        api.get("/contact"),
        api.get("/newsletter")
      ]);
      setContacts(contactRes.data?.data || contactRes.data || []);
      setSubscribers(subRes.data?.data || subRes.data || []);
    } catch (err) {
      console.error("Failed to compile dashboard items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-6xl space-y-6 select-none">
      
      {/* SECTION BANNER HEADLINE */}
      <div>
        <span className="text-[#FE8521] text-[10px] font-black tracking-widest uppercase">Communication Studio Feed</span>
        <h2 className="text-3xl font-black text-[#015103] tracking-tight">Inbound Channels</h2>
        <div className="w-12 h-[3px] bg-[#FE8521] rounded-full mt-2" />
      </div>

      {/* TOGGLE WORKSPACE SELECTORS */}
      <div className="flex gap-2 pb-px border-b border-gray-200">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "contacts"
              ? "border-b-2 border-[#FE8521] text-[#FE8521]"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Contact Messages ({contacts.length})
        </button>
        <button
          onClick={() => setActiveTab("newsletter")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "newsletter"
              ? "border-b-2 border-[#FE8521] text-[#FE8521]"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Newsletter Subscribers ({subscribers.length})
        </button>
      </div>

      {/* CONTENT LOG MATRIX LAYERS */}
      {loading ? (
        <div className="py-20 space-y-2 text-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#FE8521] rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Fetching Feed Arrays...</p>
        </div>
      ) : activeTab === "contacts" ? (
        
        // ================= CONTACT MESSAGES RENDER MESH =================
        contacts.length === 0 ? (
          <p className="py-10 text-sm font-medium text-center text-gray-400">No contact messages received yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((msg) => (
              <div key={msg._id} className="relative p-5 space-y-3 overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-gray-800">{msg.name}</h4>
                    <p className="text-xs font-semibold text-[#FE8521]">{msg.email}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    {new Date(msg.createdAt || msg.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="w-full h-px bg-gray-100/80" />
                <p className="text-xs font-medium leading-relaxed text-gray-500 whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )
      ) : (
        
        // ================= NEWSLETTER SUBSCRIBERS TABLE LIST =================
        subscribers.length === 0 ? (
          <p className="py-10 text-sm font-medium text-center text-gray-400">No newsletter subscriptions logged.</p>
        ) : (
          <div className="overflow-hidden bg-white border shadow-sm border-black/5 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="p-4 pl-6">Subscriber Email</th>
                  <th className="p-4 pr-6 text-right">Join Timestamp Date</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-gray-600 divide-y divide-gray-100/60">
                {subscribers.map((sub) => (
                  <tr key={sub._id} className="transition hover:bg-gray-50/40">
                    <td className="p-4 pl-6 font-bold text-gray-800">{sub.email}</td>
                    <td className="p-4 pr-6 text-right text-gray-400">
                      {new Date(sub.createdAt || sub.date).toLocaleString("en-US", {
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