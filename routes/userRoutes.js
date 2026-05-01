const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New User Registered",
      text: `
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone}
Interest: ${user.interest}
`
    })
    .then(() => console.log("Email sent"))
    .catch(err => console.log("Email error:", err));

    res.json({ message: "User saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;