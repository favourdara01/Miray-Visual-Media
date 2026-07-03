import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/sendEmail.js";

export const sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All form variables are required." });
    }

    // ✅ Save to DB
    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
    });

    // ⚡ REAL-TIME WEBSOCKET NOTIFICATION DISPATCH
    // Emits instantly to anyone connected on the administrative panel socket line
    if (req.io) {
      req.io.emit("new-contact-message", {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        createdAt: contact.createdAt
      });
    }

    // ✅ Send email WITHOUT blocking response
    sendEmail({
      to: process.env.ADMIN_EMAIL, 
      subject: `🚨 New Contact Message from ${name}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f8faf8; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 24px; border: 1px solid #eef6ee; text-align: left; box-shadow: 0 4px 20px rgba(0,7,0,0.02);">
            <span style="background: #fff3e8; color: #FE8521; font-size: 10px; tracking-all: 2px; font-weight: bold; uppercase; px: 2.5px; py: 1px; rounded: 20px; display: inline-block; margin-bottom: 12px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px;">
              Inbound Lead Link
            </span>
            <h2 style="color: #015103; font-size: 22px; font-weight: 800; margin: 0 0 16px 0;">New Contact Inquiry</h2>
            
            <div style="background: #fdfdfd; padding: 16px; border: 1px solid #f3f5f3; border-radius: 16px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #555555;"><strong style="color: #111111;">Name:</strong> ${name}</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #555555;"><strong style="color: #111111;">Email:</strong> <a href="mailto:${email}" style="color: #FE8521; text-decoration: none; font-weight: bold;">${email}</a></p>
            </div>
            
            <div style="padding: 20px; background: #fdfdfd; border-left: 4px solid #FE8521; border-radius: 4px; margin-bottom: 28px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #999999; font-weight: bold; tracking: 0.5px;">Message Brief</p>
              <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-weight: 500;">${message}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="mailto:${email}?subject=RE: Miray Visual Inquiry" style="display: inline-block; padding: 14px 28px; background-color: #015103; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 12px; tracking-wide: 0.5px; box-shadow: 0 4px 14px rgba(1, 81, 3, 0.15);">
                Reply via Mail Client ✉️
              </a>
            </div>
          </div>
        </div>
      `,
    }).catch((err) => {
      console.error("CONTACT EMAIL FAILED:", err.message);
    });

    return res.status(201).json({
      success: true,
      message: "Message processed and streamed successfully",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email
      }
    });

  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal message processing failure",
    });
  }
};