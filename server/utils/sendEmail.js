import nodemailer from "nodemailer";

// ✅ ONE shared transporter (Render-safe)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // force IPv4 (fix ENETUNREACH)
});

// ================= GENERIC EMAIL =================
export const sendEmail = async ({ to, subject, html }) => {
  try {
    return await transporter.sendMail({
      from: `"Miray Visual Media" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("EMAIL FAILED:", err.message);
  }
};

// ================= BOOKING EMAIL =================
export const sendBookingEmail = async (booking) => {
  try {
    console.log("📧 Sending booking email to:", booking.email);

    return await transporter.sendMail({
      from: `"Miray Visuals" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: "Booking Received 🎉",
      html: `
        <div style="font-family: Arial; background:#f9f9f9; padding:30px;">
          <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:10px;">
            
            <h2 style="color:#015103;">Hello ${booking.name},</h2>

            <p>Your booking has been received successfully 🎉</p>

            <div style="margin:20px 0;padding:15px;background:#f1f1f1;border-radius:8px;">
              <p><strong>Service:</strong> ${booking.service}</p>
              <p><strong>Date:</strong> ${booking.date}</p>
              <p><strong>Message:</strong> ${booking.message || "N/A"}</p>
            </div>

            <p style="margin-top:20px;">
              We will contact you shortly.
            </p>

            <p style="margin-top:30px;color:#888;">
              — Miray Visual Media
            </p>

          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("BOOKING EMAIL FAILED:", err.message);
  }
};