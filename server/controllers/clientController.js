import bcrypt from "bcryptjs";
import crypto from "crypto";
import Client from "../models/Client.js";
import transporter from "../config/email.js";

// ========================================================
// 1. CREATE CLIENT (ADMIN AUTH REQUIRED VIA ROUTER MIDDLEWARE)
// ========================================================
export const createClient = async (req, res) => {
  try {
    const { name, surname, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Missing vital profile configuration attributes" });
    }

    const cleanedEmail = email.toLowerCase().trim();
    const cleanedPhone = phone ? phone.trim() : "";

    // Query database metrics using an aggregate optimization framework array block
    const existing = await Client.findOne({
      $or: [
        { email: cleanedEmail },
        ...(cleanedPhone ? [{ phone: cleanedPhone }] : [])
      ],
    });

    if (existing) {
      if (existing.email === cleanedEmail) {
        return res.status(400).json({ message: "Email parameter already exists in database registry" });
      }
      if (cleanedPhone && existing.phone === cleanedPhone) {
        return res.status(400).json({ message: "Phone signature already exists in database registry" });
      }
    }

    // Auto-generate premium local password sequences securely via Node crypto engine
    const plainPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 12); // Hardened computational rounds limit

    const client = await Client.create({
      name: name.trim(),
      surname: surname ? surname.trim() : "",
      email: cleanedEmail,
      phone: cleanedPhone,
      password: hashedPassword,
      role: "client",
    });

    // Dynamic verification link target based on live deployment environment setting configurations
    const frontendUrl = process.env.FRONTEND_URL || "https://miray-visual-media-2.onrender.com";

    // Dispatch automated layout credentials alert using your studio branding layout theme rules
    await transporter.sendMail({
      to: client.email,
      subject: "Your Private Studio Vault Account is Ready 📸",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f8faf8; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 24px; border: 1px solid #eef6ee; text-align: left; box-shadow: 0 4px 20px rgba(0,7,0,0.02);">
            
            <h2 style="color: #015103; font-size: 22px; font-weight: 800; margin: 0 0 6px 0;">Welcome to Miray Visual, ${client.name}!</h2>
            <p style="font-size: 14px; color: #555555; line-height: 1.5; margin: 0 0 24px 0;">A private data vault partition has been configured for your photography galleries.</p>
            
            <div style="background: #fdfdfd; padding: 20px; border: 1px solid #f3f5f3; border-radius: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #666666;"><strong style="color: #111111;">Access Email:</strong> ${client.email}</p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #666666;"><strong style="color: #111111;">Temp Password:</strong> <code style="background: #fff3e8; color: #FE8521; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace;">${plainPassword}</code></p>
            </div>

            <p style="font-size: 13px; color: #666666; line-height: 1.5;">Use the validation button below to enter your secure workspace board dashboard and view active assets:</p>
            
            <div style="text-align: center; margin: 28px 0;">
              <a href="${frontendUrl}/#/client/login" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #FE8521; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 12px; tracking-wide: 0.5px; box-shadow: 0 4px 14px rgba(254, 133, 33, 0.25);">
                Access Vault Gallery 🔑
              </a>
            </div>

            <p style="margin: 24px 0 0 0; font-size: 12px; color: #999999; border-t: 1px solid #f8faf8; pt: 12px; text-align: center;">
              Upon initial platform connection, please adjust your security values inside your preference tab.
            </p>
          </div>
        </div>
      `,
    });

    // 🛡️ SECURITY FIX: Strip explicit structural variables out before sending response back over network layers
    return res.status(201).json({
      message: "Client account deployed safely",
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        role: client.role
      },
    });

  } catch (error) {
    console.error("CREATE CLIENT TRANSACTION CRASH:", error);
    return res.status(500).json({ message: "Profile compilation service exception" });
  }
};

// ========================================================
// 2. GET ALL CLIENTS (ADMIN ONLY)
// ========================================================
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ role: "client" })
      .select("-password") // Ensure data security boundaries are upheld
      .sort({ createdAt: -1 });
    return res.json(clients);
  } catch (err) {
    console.error("GET CLIENTS BULK FAULT:", err);
    return res.status(500).json({ message: "Error isolating directory lists" });
  }
};

// ========================================================
// 3. GET SINGLE CLIENT LOOKUP (PROTECTED MOUNT)
// ========================================================
export const getSingleClient = async (req, res) => {
  try {
    const targetId = req.params.id;

    // 🛡️ SECURITY FIX: Prevent Horizontal Privilege Escalations (IDOR attacks)
    // If a request isn't an admin, block them from scraping someone else's ID profile information data logs
    if (req.user.role !== "admin" && req.user.id !== targetId) {
      return res.status(403).json({ message: "Access violation constraint triggered" });
    }

    const client = await Client.findById(targetId).select("-password");
    if (!client) {
      return res.status(404).json({ message: "Target database entity missing" });
    }

    return res.json(client);
  } catch (error) {
    console.error("GET SINGLE CLIENT FAULT:", error.message);
    return res.status(500).json({ message: "Entity retrieval internal pipeline variance" });
  }
};

// ========================================================
// 4. DELETE CLIENT (ADMIN ONLY)
// ========================================================
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Deletion execution target missing" });
    }
    return res.json({ message: "Client record partition dropped from server arrays" });
  } catch (err) {
    console.error("DELETE OPERATION TRANSACTION FAULT:", err);
    return res.status(500).json({ message: "Database cascade process failure execution" });
  }
};