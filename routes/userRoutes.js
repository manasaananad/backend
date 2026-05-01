const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ✅ FIX 1: Create transporter INSIDE the route (or inside a function)
// so it reads env vars AFTER dotenv.config() has run in server.js.
// Creating it at the top of the file means EMAIL_USER/PASS are undefined.

router.post("/register", async (req, res) => {
  try {
    // Save user to MongoDB
    const user = new User(req.body);
    await user.save();

    // ✅ FIX 2: Create transporter here, not at module load time
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ FIX 3: await the email so errors are caught by the try/catch
    // Previously .then/.catch meant errors were silently lost and
    // the response was sent before the email attempt completed.
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🚀 New User Registered",
      text: `
New User Details:

Name:     ${user.name}
Email:    ${user.email}
Phone:    ${user.phone}
Interest: ${user.interest}
Time:     ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
      `,
    });

    console.log("✅ User saved and email sent to", process.env.EMAIL_USER);
    res.json({ message: "User saved + Email sent ✅" });

  } catch (err) {
    // This now catches BOTH MongoDB save errors AND email errors
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;