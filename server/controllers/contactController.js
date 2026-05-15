import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/sendEmail.js"; // ✅ correct import

export const sendContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    // ✅ Send email properly
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Contact Message",
      html: `
        <h2>New Message</h2>
        <p><b>Name:</b> ${req.body.name}</p>
        <p><b>Email:</b> ${req.body.email}</p>
        <p>${req.body.message}</p>
      `,
    });

    res.json({ message: "Message sent" });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};