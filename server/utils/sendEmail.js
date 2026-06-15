import { Resend } from "resend";

// ================= INITIALIZE API =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= GENERIC EMAIL =================
export const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📧 Sending API email to:", to);

    const { data, error } = await resend.emails.send({
      from: "Miray Visual Media <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) throw error;

    console.log("✅ Email sent via API:", data.id);
    return data;
  } catch (err) {
    console.error("❌ EMAIL FAILED:", err);
    throw err;
  }
};

// ================= BOOKING EMAIL PIPELINE ENGINE =================
export const sendBookingEmail = async (booking) => {
  try {
    console.log(`📧 Dispatching ${booking.status} notification via API to:`, booking.email);

    // Dynamic configuration variables based on status state parameters
    const isConfirmed = booking.status === "confirmed";
    const subjectLine = isConfirmed ? "Your Shoot is Confirmed! 📸" : "Booking Received 🎉";
    const headerTitle = isConfirmed ? "Reservation Confirmed!" : "Hello " + booking.name + ",";
    const statusText = isConfirmed 
      ? "Your professional studio session request has passed dashboard validation parameters and is fully locked into our calendar pipeline."
      : "Your booking request has been received successfully. Our production team will review the details shortly.";

    const { data, error } = await resend.emails.send({
      from: "Miray Visual Media <onboarding@resend.dev>",
      to: booking.email,
      subject: subjectLine,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f8faf8; padding: 40px 20px; text-align: center;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 24px; border: 1px solid #eef6ee; text-align: left; box-shadow: 0 4px 20px rgba(0, 7, 0, 0.02);">
            
            {/* BRAND HEADER BADGE ACCENT */}
            <div style="margin-bottom: 24px;">
              <span style="background: ${isConfirmed ? "#eef6ee" : "#fff3e8"}; color: ${isConfirmed ? "#015103" : "#FE8521"}; border: 1px solid ${isConfirmed ? "#d2ebd3" : "#ffdcb7"}; font-size: 10px; tracking-wide: 1px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 99px; display: inline-block;">
                ${booking.status} node
              </span>
            </div>

            <h2 style="color: #015103; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; tracking-tight: -0.5px;">
              ${headerTitle}
            </h2>

            <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 24px 0;">
              ${statusText}
            </p>

            {/* STRUCTURAL RECORD MATRIX CARD */}
            <div style="margin: 24px 0; padding: 20px; background: #fdfdfd; border: 1px solid #f3f5f3; border-radius: 16px;">
              <p style="margin: 0; font-size: 13px; color: #666666;"><strong style="color: #111111;">Service Node:</strong> ${booking.service}</p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #666666;"><strong style="color: #111111;">Shoot Date:</strong> ${new Date(booking.date).toDateString()}</p>
              ${booking.phone ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #666666;"><strong style="color: #111111;">Phone Link:</strong> ${booking.phone}</p>` : ""}
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #666666; line-height: 1.5;"><strong style="color: #111111;">Vision Notes:</strong> ${booking.message || "None appended"}</p>
            </div>

            {/* ✅ DYNAMIC CALENDAR BUTTON RENDER FOR THE CONFIRMED STATE */}
            ${isConfirmed && booking.googleCalendarUrl ? `
              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="${booking.googleCalendarUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #FE8521; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 12px; letter-spacing: 0.5px; box-shadow: 0 6px 16px rgba(254, 133, 33, 0.25);">
                  PIN TO GOOGLE CALENDAR 📅
                </a>
              </div>
            ` : ""}

            <p style="margin: 24px 0 0 0; font-size: 13px; color: #888888; border-top: 1px solid #f8faf8; pt: 16px;">
              Best regards,<br />
              <span style="color: #015103; font-weight: bold;">Miray Visual Media Team</span>
            </p>

          </div>
        </div>
      `,
    });

    if (error) throw error;

    console.log(`✅ ${booking.status} notification successfully processed:`, data.id);
    return data;
  } catch (err) {
    console.error("❌ BOOKING EMAIL STATE MACHINE CRASHED:", err);
    throw err;
  }
};