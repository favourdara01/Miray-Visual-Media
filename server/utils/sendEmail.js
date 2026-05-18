import nodemailer from "nodemailer";

// ================= TRANSPORTER =================
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // ✅ Fix Render / IPv6 issues
  family: 4,

  // ✅ Prevent hanging requests
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// ================= VERIFY TRANSPORTER =================
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ EMAIL SERVER ERROR:");
    console.error(error);
  } else {
    console.log("✅ Email server ready");
  }
});

// ================= GENERIC EMAIL =================
export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    console.log("📧 Sending email to:", to);

    const info = await transporter.sendMail({
      from: `"Miray Visual Media" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);

    return info;

  } catch (err) {
    console.error("❌ EMAIL FAILED:");
    console.error(err);

    throw err;
  }
};

// ================= BOOKING EMAIL =================
export const sendBookingEmail = async (
  booking
) => {
  try {
    console.log(
      "📧 Sending booking email to:",
      booking.email
    );

    const info = await transporter.sendMail({
      from: `"Miray Visual Media" <${process.env.EMAIL_USER}>`,
      to: booking.email,

      subject: "Booking Received 🎉",

      html: `
        <div style="font-family:Arial;background:#f9f9f9;padding:30px;">

          <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:12px;">

            <h2 style="color:#015103;">
              Hello ${booking.name},
            </h2>

            <p>
              Your booking has been received successfully 🎉
            </p>

            <div style="margin:20px 0;padding:15px;background:#f1f1f1;border-radius:8px;">

              <p>
                <strong>Service:</strong>
                ${booking.service}
              </p>

              <p>
                <strong>Date:</strong>
                ${booking.date}
              </p>

              <p>
                <strong>Message:</strong>
                ${booking.message || "N/A"}
              </p>

            </div>

            <p>
              We will contact you shortly.
            </p>

            <p style="margin-top:30px;color:#888;">
              — Miray Visual Media
            </p>

          </div>

        </div>
      `,
    });

    console.log(
      "✅ Booking email sent:",
      info.response
    );

    return info;

  } catch (err) {
    console.error(
      "❌ BOOKING EMAIL FAILED:"
    );

    console.error(err);

    throw err;
  }
};