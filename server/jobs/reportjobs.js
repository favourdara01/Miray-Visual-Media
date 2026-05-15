import cron from "node-cron";
import Booking from "../models/Booking.js";
import Media from "../models/Media.js";
import Client from "../models/Client.js";
import transporter from "../config/email.js";

// ===============================
// SAFE REPORT GENERATOR
// ===============================
const generateReport = async (rangeLabel) => {
  try {
    // ================= BOOKINGS =================
    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({
      status: "Pending",
    });

    const confirmedBookings = await Booking.countDocuments({
      status: "Confirmed",
    });

    const cancelledBookings = await Booking.countDocuments({
      status: "Cancelled",
    });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ================= MEDIA =================
    const totalMedia = await Media.countDocuments();

    const portfolioMedia = await Media.countDocuments({
      isPortfolio: true,
    });

    const clientMedia = await Media.countDocuments({
      isPortfolio: false,
    });

    // ================= CLIENTS =================
    const totalClients = await Client.countDocuments();

    // ================= HTML =================
    return `
      <div style="font-family:Arial;padding:20px;background:#f5f5f5;">
        
        <div style="max-width:700px;margin:auto;background:white;padding:30px;border-radius:12px;">

          <h1 style="color:#015103;margin-bottom:10px;">
            📊 Miray Visual ${rangeLabel} Report
          </h1>

          <p style="color:#666;">
            Automatically generated system analytics report.
          </p>

          <hr style="margin:25px 0;" />

          <!-- BOOKINGS -->
          <h2 style="color:#FE8521;">📅 Bookings</h2>

          <ul style="line-height:1.9;">
            <li><strong>Total:</strong> ${totalBookings}</li>
            <li><strong>Pending:</strong> ${pendingBookings}</li>
            <li><strong>Confirmed:</strong> ${confirmedBookings}</li>
            <li><strong>Cancelled:</strong> ${cancelledBookings}</li>
          </ul>

          <!-- MEDIA -->
          <h2 style="color:#FE8521;margin-top:30px;">📸 Media</h2>

          <ul style="line-height:1.9;">
            <li><strong>Total Media:</strong> ${totalMedia}</li>
            <li><strong>Portfolio Media:</strong> ${portfolioMedia}</li>
            <li><strong>Client Media:</strong> ${clientMedia}</li>
          </ul>

          <!-- CLIENTS -->
          <h2 style="color:#FE8521;margin-top:30px;">👥 Clients</h2>

          <p>
            <strong>Total Clients:</strong> ${totalClients}
          </p>

          <!-- RECENT BOOKINGS -->
          <h2 style="color:#FE8521;margin-top:30px;">
            🕒 Recent Bookings
          </h2>

          ${
            recentBookings.length > 0
              ? `
                <ul style="line-height:1.9;">
                  ${recentBookings
                    .map(
                      (b) => `
                        <li>
                          <strong>${b.name || "Unknown"}</strong>
                          — ${b.service || "No Service"}
                          (${b.status || "Pending"})
                        </li>
                      `
                    )
                    .join("")}
                </ul>
              `
              : `<p>No recent bookings found.</p>`
          }

          <hr style="margin:30px 0;" />

          <p style="color:#888;font-size:13px;">
            Generated automatically by Miray Visual System
          </p>

        </div>

      </div>
    `;
  } catch (err) {
    console.error("❌ Report generation error:", err);
    return null;
  }
};

// ===============================
// SAFE EMAIL SENDER
// ===============================
const sendReportEmail = async (label, subject) => {
  try {
    // ENV VALIDATION
    if (!process.env.EMAIL_USER) {
      console.error("❌ EMAIL_USER missing");
      return;
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error("❌ ADMIN_EMAIL missing");
      return;
    }

    const html = await generateReport(label);

    if (!html) {
      console.error("❌ Failed to generate report HTML");
      return;
    }

    await transporter.sendMail({
      from: `"Miray Visual System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    });

    console.log(`✅ ${label} report sent`);
  } catch (err) {
    console.error(`❌ ${label} report error:`, err);
  }
};

// ===============================
// WEEKLY REPORT
// Every Monday at 9AM
// ===============================
export const startWeeklyReportJob = () => {
  cron.schedule(
    "0 9 * * 1",
    async () => {
      console.log("📊 Weekly report running...");

      await sendReportEmail(
        "Weekly",
        "📊 Weekly Studio Report"
      );
    },
    {
      timezone: "Africa/Lagos",
    }
  );

  console.log("📅 Weekly report job scheduled");
};

// ===============================
// MONTHLY REPORT
// 1st day of month at 9AM
// ===============================
export const startMonthlyReportJob = () => {
  cron.schedule(
    "0 9 1 * *",
    async () => {
      console.log("📊 Monthly report running...");

      await sendReportEmail(
        "Monthly",
        "📊 Monthly Studio Report"
      );
    },
    {
      timezone: "Africa/Lagos",
    }
  );

  console.log("📅 Monthly report job scheduled");
};