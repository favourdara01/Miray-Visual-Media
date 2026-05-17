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
      subject: "New Contact Message",
      html: `
        <h2>New Contact Message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Message:</strong></p>
        <p>${message}</p>
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