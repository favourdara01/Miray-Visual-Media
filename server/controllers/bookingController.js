import Booking from "../models/Booking.js";
// ✅ Double-check that this path accurately goes to your file containing the mailer functions!
import { sendBookingEmail } from "../utils/sendEmail.js"; 

// ==========================
// CREATE BOOKING + REALTIME + EMAIL
// ==========================
export const createBooking = async (req, res) => {
  try {
    // ✅ ADDED: "phone" destructured safely from frontend payload parameters
    const { name, email, phone, service, date, message } = req.body;

    if (!name || !email || !service || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await Booking.create({
      name,
      email,
      phone: phone || "", // ✅ ADDED: Saved to your MongoDB database pipeline instance
      service,
      date,
      message: message || "",
      status: "pending",
    });

    // 🔥 REAL-TIME
    if (req.io) {
      req.io.emit("new-booking", booking);
    }

    // 🔥 EMAIL TO CLIENT (Pending acknowledgment notification)
    sendBookingEmail(booking).catch(console.error);

    res.status(201).json(booking);
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// GET BOOKINGS
// ==========================
export const getBookings = async (req, res) => {
  try {
    const { status, date, client } = req.query;
    let query = {};

    if (status) query.status = status;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }

    if (client) {
      query.name = { $regex: client, $options: "i" };
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// UPDATE STATUS + EMAIL
// ==========================
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔥 EMAIL WHEN CONFIRMED WITH GOOGLE CALENDAR EMBED
    if (req.body.status === "confirmed") {
      try {
        // Formats database date to structural ISO requirements (stretching out dashes/colons)
        const calendarDate = new Date(booking.date)
          .toISOString()
          .replace(/-|:|\.\d\d\d/g, "")
          .split("T")[0];

        // Compiles your template URL safely with string parameters
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          "Miray Visual Photography Shoot: " + booking.service
        )}&dates=${calendarDate}/${calendarDate}&details=${encodeURIComponent(
          "Your professional studio production session with Miray Visual is confirmed! Location: Lagos, Nigeria."
        )}`;

        // Attaches calendar link directly to the booking document temporarily before it hits your mail file
        booking.googleCalendarUrl = googleCalendarUrl;
        
        await sendBookingEmail(booking);
      } catch (emailErr) {
        console.error("Email generation or transmission failure:", emailErr.message);
      }
    }

    // 🔥 REAL-TIME UPDATE
    if (req.io) {
      req.io.emit("booking-updated", booking);
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// DELETE
// ==========================
export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};