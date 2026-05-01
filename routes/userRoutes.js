const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ✅ Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Save user + send email
router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // 📧 Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "🚀 New User Registered",
      text: `
New User Details:

Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone}
Interest: ${user.interest}
      `
    });

    res.json({ message: "User saved + Email sent ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;