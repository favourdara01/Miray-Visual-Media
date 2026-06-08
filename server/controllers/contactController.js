import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/sendEmail.js";

export const sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ✅ Save to DB
    const contact = await Contact.create({
      name,
      email,
      message,
    });

    // ✅ Send email WITHOUT blocking response
    sendEmail({
      to: process.env.ADMIN_EMAIL, 
      subject: `🚨 New Contact Message from ${name}`,
      html: `
        <div style="font-family:Arial;background:#f4f4f4;padding:20px;">
          <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:8px;border-top:4px solid #015103;">
            <h2 style="color:#015103;margin-top:0;">New Contact Inquiry</h2>
            <hr style="border:none;border-top:1px solid #eee;margin:15px 0;" />
            <p style="font-size:14px;color:#555;"><strong>Name:</strong> ${name}</p>
            <p style="font-size:14px;color:#555;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#015103;">${email}</a></p>
            <div style="margin-top:20px;padding:15px;background:#f9f9f9;border-left:4px solid #015103;border-radius:4px;">
              <p style="margin:0;font-weight:bold;color:#333;margin-bottom:8px;">Message:</p>
              <p style="margin:0;color:#555;line-height:1.5;white-space:pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `,
    }).catch((err) => {
      console.error("CONTACT EMAIL FAILED:", err.message);
    });

    // ✅ Instant response
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contact,
    });

  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};