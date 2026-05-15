
// import bcrypt from "bcryptjs";
import bcrypt from "bcryptjs";
import crypto from "crypto";



// CREATE CLIENT (ADMIN)
import jwt from "jsonwebtoken";

import Client from "../models/Client.js"; // IMPORTANT
import transporter from "../config/email.js";

export const createClient = async (req, res) => {
  try {
    const { name, surname, email, phone } = req.body;

    const existing = await Client.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing?.email === email) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (existing?.phone === phone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // 🔥 AUTO-GENERATE PASSWORD
    const plainPassword = crypto.randomBytes(4).toString("hex");

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const client = await Client.create({
      name,
      surname,
      email,
      phone,
      password: hashedPassword,
      role: "client",
    });

    // 🔥 EMAIL CLIENT LOGIN DETAILS
    await transporter.sendMail({
      to: email,
      subject: "Your Gallery Account is Ready 🎉",
      html: `
        <div style="font-family:Arial">
          <h2>Hello ${name},</h2>

          <p>Your photo gallery account has been created.</p>

          <p><b>Login Details:</b></p>

          <p>Email: ${email}</p>
          <p>Password: ${plainPassword}</p>

          <br/>

          <a href="http://localhost:5173/client/login">
            Click here to login
          </a>

          <br/><br/>
          <p>Once your gallery is published, you will receive another email with your photos.</p>
        </div>
      `,
    });

    res.status(201).json({
      message: "Client created successfully",
      client,
    });

  } catch (error) {
    console.log("CREATE CLIENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
// ==========================
// LOGIN CLIENT
// ==========================
export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const client = await Client.findOne({
      email,
    }).select("+password");

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const isMatch = await client.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (client.role !== "client") {
      return res.status(403).json({
        message: "Not a client account",
      });
    }

    client.lastLogin = new Date();
    await client.save();

    const token = jwt.sign(
      {
        id: client._id,
        role: client.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      accessToken: token,
      user: {
        id: client._id,
        name: client.name,
        surname: client.surname,
        email: client.email,
        role: client.role,
      },
    });

  } catch (error) {
    console.log("CLIENT LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// GET ALL CLIENTS (ADMIN ONLY)
// ==========================
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ role: "client" }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching clients" });
  }
};

// ==========================
// DELETE CLIENT (ADMIN ONLY)
// ==========================
export const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ msg: "Client deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting client" });
  }
};

// GET SINGLE CLIENT
export const getSingleClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    console.log("GET CLIENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
