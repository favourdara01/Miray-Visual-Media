import cron from "node-cron";
import Booking from "../models/Booking.js";
import Media from "../models/Media.js";
import Client from "../models/Client.js";
import Contact from "../models/Contact.js"; // ✅ ADDED: Reference to look up contact metrics
import { sendEmail } from "../utils/sendEmail.js";

const sendMonthlyReport = async () => {
  try {
    console.log("📊 Generating premium monthly studio layout report...");

    // ================= BOOKINGS =================
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const completedBookings = await Booking.countDocuments({ status: "completed" });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // ================= MEDIA =================
    const totalMedia = await Media.countDocuments();
    const portfolioMedia = await Media.countDocuments({ isPortfolio: true });
    const clientMedia = await Media.countDocuments({ isPortfolio: false });

    // ================= TRACKED SYSTEM METRICS =================
    const totalClients = await Client.countDocuments();
    const totalInquiries = await Contact.countDocuments(); // ✅ ADDED: Count aggregate for report logs

    // ================= PREMIUM COMPACT REPORT UI TEMPLATE =================
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f4f6f4; padding: 4px; text-align: center;">
        <div style="max-w: 600px; margin: 40px auto; background: #ffffff; padding: 40px; border-radius: 28px; border: 1px solid #eef2ee; text-align: left; box-shadow: 0 10px 30px rgba(0,10,0,0.03);">
          
          <div style="border-bottom: 2px solid #f6f9f6; padding-bottom: 20px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 10px; font-weight: 900; color: #FE8521; uppercase; tracking-widest: 3px; text-transform: uppercase;">System Automated Metrics</p>
            <h2 style="color: #015103; font-size: 24px; font-weight: 900; margin: 4px 0 0 0; tracking: -0.5px;">Studio Performance Matrix</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #a0a0a0; font-weight: 500;">Compiled operational report logs for the active billing cycle.</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #015103; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">📊 Core Ingest Totals</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="background: #fafbfa;">
                <td style="padding: 12px; color: #555555; font-weight: 600; border-radius: 8px 0 0 8px;">Registered User Slots</td>
                <td style="padding: 12px; text-align: right; color: #015103; font-weight: 800; border-radius: 0 8px 8px 0; font-family: monospace;">${totalClients} Accounts</td>
              </tr>
              <tr>
                <td style="padding: 12px; color: #555555; font-weight: 600;">Form Inquiries Captured</td>
                <td style="padding: 12px; text-align: right; color: #015103; font-weight: 800; font-family: monospace;">${totalInquiries} Messages</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 30px; background: #fafbfa; padding: 20px; border-radius: 20px; border: 1px solid #f1f4f1;">
            <h3 style="color: #015103; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 14px 0;">📅 Operational Sessions (${totalBookings} Total)</h3>
            <div style="display: flex; gap: 10px; text-align: center; margin-bottom: 10px;">
              <div style="flex: 1; background: #fff; padding: 10px; border-radius: 12px; border: 1px solid #edf0ed;">
                <p style="margin: 0; font-size: 10px; color: #999; font-weight: bold; text-transform: uppercase;">Pending</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; color: #FE8521; font-weight: 900; font-family: monospace;">${pendingBookings}</p>
              </div>
              <div style="flex: 1; background: #fff; padding: 10px; border-radius: 12px; border: 1px solid #edf0ed;">
                <p style="margin: 0; font-size: 10px; color: #999; font-weight: bold; text-transform: uppercase;">Confirmed</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; color: #22c55e; font-weight: 900; font-family: monospace;">${confirmedBookings}</p>
              </div>
              <div style="flex: 1; background: #fff; padding: 10px; border-radius: 12px; border: 1px solid #edf0ed;">
                <p style="margin: 0; font-size: 10px; color: #999; font-weight: bold; text-transform: uppercase;">Completed</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; color: #015103; font-weight: 900; font-family: monospace;">${completedBookings}</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 35px;">
            <h3 style="color: #015103; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">📸 Cloud Asset Storage Allocation</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Global Tracked Media Vault Items</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: monospace;">${totalMedia} Elements</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; padding-left: 12px; border-left: 2px solid #edf0ed;">• Dispatched Portfolio Context</td>
                <td style="padding: 8px 0; text-align: right; color: #555; font-family: monospace;">${portfolioMedia} Files</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; padding-left: 12px; border-left: 2px solid #edf0ed;">• Isolated Client Space Assets</td>
                <td style="padding: 8px 0; text-align: right; color: #555; font-family: monospace;">${clientMedia} Files</td>
              </tr>
            </table>
          </div>

          <div style="border-top: 2px solid #f6f9f6; pt: 20px; padding-top: 20px;">
            <h3 style="color: #015103; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">🕒 Latest Scheduling Queues</h3>
            <div style="background: #fafbfa; border-radius: 16px; border: 1px solid #f1f4f1; overflow: hidden;">
              ${recentBookings.length === 0 
                ? `<p style="padding: 16px; margin: 0; font-size: 13px; color: #888; text-align: center;">No activity updates recorded this sequence window.</p>`
                : recentBookings.map((b) => `
                    <div style="padding: 12px 16px; border-bottom: 1px solid #f1f4f1; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <strong style="color: #222;">${b.name}</strong>
                        <span style="color: #777; margin-left: 6px;">— ${b.service}</span>
                      </div>
                      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: ${b.status === "confirmed" ? "#22c55e" : b.status === "pending" ? "#FE8521" : "#777"}">${b.status}</span>
                    </div>
                  `).join("").replace(/border-bottom: 1px solid #f1f4f1; font-size: 13px; display: flex; justify-content: space-between; align-items: center;(?=[^]*$)/, "padding: 12px 16px; font-size: 13px; display: flex; justify-content: space-between; align-items: center;")}
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #f6f9f6; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #b0b0b0; font-weight: 500;">
              This compilation data package was securely broadcast via the Miray Visual Architecture Core.
            </p>
          </div>
          
        </div>
      </div>
    `;

    // ================= SEND EMAIL =================
    await sendEmail({
      to: process.env.ADMIN_EMAIL, 
      subject: `📊 Monthly Studio Report — ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}`,
      html,
    });

    console.log("✅ Monthly report metrics generated and dispatched successfully");
  } catch (err) {
    console.error("❌ Monthly report exception intercepted:", err);
  }
};

export const startMonthlyReportJob = () => {
  cron.schedule("0 9 1 * *", async () => {
    await sendMonthlyReport();
  });
  console.log("📅 Monthly premium statistics reporting lifecycle active");
};