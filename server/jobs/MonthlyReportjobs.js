import cron from "node-cron";
import Booking from "../models/Booking.js";
import Media from "../models/Media.js";
import Client from "../models/Client.js";
import transporter from "../config/email.js";

// ===============================
// MONTHLY ADMIN REPORT JOB
// ===============================
const sendMonthlyReport = async () => {
  try {
    console.log("📊 Generating monthly report...");

    // ================= BOOKINGS =================
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "Pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "Confirmed" });
    const cancelledBookings = await Booking.countDocuments({ status: "Cancelled" });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // ================= MEDIA =================
    const totalMedia = await Media.countDocuments();
    const portfolioMedia = await Media.countDocuments({ isPortfolio: true });
    const clientMedia = await Media.countDocuments({ isPortfolio: false });

    // ================= CLIENTS =================
    const totalClients = await Client.countDocuments();

    // ================= EMAIL CONTENT =================
    const html = `
      <div style="font-family:Arial; padding:20px;">
        <h2 style="color:#015103;">📊 Miray Visual Monthly Report</h2>

        <h3>📅 Bookings</h3>
        <ul>
          <li>Total: ${totalBookings}</li>
          <li>Pending: ${pendingBookings}</li>
          <li>Confirmed: ${confirmedBookings}</li>
          <li>Cancelled: ${cancelledBookings}</li>
        </ul>

        <h3>📸 Media</h3>
        <ul>
          <li>Total Media: ${totalMedia}</li>
          <li>Portfolio: ${portfolioMedia}</li>
          <li>Client Media: ${clientMedia}</li>
        </ul>

        <h3>👥 Clients</h3>
        <p>Total Clients: ${totalClients}</p>

        <h3>🕒 Recent Bookings</h3>
        <ul>
          ${recentBookings
            .map(
              (b) =>
                `<li>${b.name} - ${b.service} (${b.status})</li>`
            )
            .join("")}
        </ul>

        <p style="margin-top:20px;color:#888;">
          Generated automatically by Miray Visual System
        </p>
      </div>
    `;

    // ================= SEND EMAIL =================
    await transporter.sendMail({
      from: `"Miray Visual System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // 🔥 IMPORTANT
      subject: "📊 Monthly Studio Report",
      html,
    });

    console.log("✅ Monthly report sent successfully");
  } catch (err) {
    console.error("❌ Monthly report error:", err);
  }
};

// ===============================
// CRON JOB (RUNS EVERY 1ST DAY)
// ===============================
export const startMonthlyReportJob = () => {
  cron.schedule("0 9 1 * *", async () => {
    // Runs: 1st day of every month at 9AM
    await sendMonthlyReport();
  });

  console.log("📅 Monthly report job scheduled");
};