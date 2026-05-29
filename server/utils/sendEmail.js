import { Resend } from "resend";

// ================= INITIALIZE API =================
// This automatically pulls your API key from Render's environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= GENERIC EMAIL =================
export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    console.log("📧 Sending API email to:", to);

    const { data, error } = await resend.emails.send({
      // ⚠️ NOTE: On Resend's free tier, you must use this 'from' address 
      // until you verify a custom domain inside your Resend dashboard.
      from: "Miray Visual Media <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    console.log("✅ Email sent via API:", data.id);
    return data;

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
      "📧 Sending booking email via API to:",
      booking.email
    );

    const { data, error } = await resend.emails.send({
      from: "Miray Visual Media <onboarding@resend.dev>",
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

    if (error) {
      throw error;
    }

    console.log(
      "✅ Booking email sent via API:",
      data.id
    );

    return data;

  } catch (err) {
    console.error(
      "❌ BOOKING EMAIL FAILED:"
    );
    console.error(err);
    throw err;
  }
};